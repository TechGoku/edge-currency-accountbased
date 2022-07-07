// @flow

import { add, gt, mul, sub } from 'biggystring'
import {
  type EdgeSpendInfo,
  type EdgeTransaction,
  type EdgeWalletInfo,
  type JsonObject,
  InsufficientFundsError
} from 'edge-core-js/types'

import { CurrencyEngine } from '../common/engine.js'
import { getDenomInfo } from '../common/utils.js'
import { PolkadotPlugin } from './polkadotPlugin.js'
import {
  type PolkadotSettings,
  type SdkBalance,
  type SdkBlockHeight,
  type SubscanResponse,
  type SubscanTx,
  asSubscanResponse,
  asTransactions,
  asTransfer
} from './polkadotTypes.js'
import { ApiPromise } from './polkadotUtils'

const ACCOUNT_POLL_MILLISECONDS = 5000
const BLOCKCHAIN_POLL_MILLISECONDS = 20000
const TRANSACTION_POLL_MILLISECONDS = 3000

export class PolkadotEngine extends CurrencyEngine<PolkadotPlugin> {
  settings: PolkadotSettings
  api: ApiPromise
  nonce: number

  constructor(
    currencyPlugin: PolkadotPlugin,
    walletInfo: EdgeWalletInfo,
    opts: any // EdgeCurrencyEngineOptions,
  ) {
    super(currencyPlugin, walletInfo, opts)
    this.settings = currencyPlugin.currencyInfo.defaultSettings.otherSettings
    this.nonce = 0
  }

  async fetchSubscan(
    endpoint: string,
    body: JsonObject
  ): Promise<SubscanResponse> {
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
    const response = await this.io.fetch(
      this.settings.subscanBaseUrl + endpoint,
      options
    )
    if (!response.ok || response.status === 429) {
      throw new Error(`Subscan ${endpoint} failed with ${response.status}`)
    }
    const out = await response.json()
    return asSubscanResponse(out)
  }

  async queryBalance() {
    try {
      const response: SdkBalance = await this.api.query.system.account(
        this.walletInfo.keys.publicKey
      )
      this.nonce = response.nonce
      this.updateBalance(
        this.currencyInfo.currencyCode,
        response.data.free.toString()
      )
    } catch (e) {
      this.warn('queryBalance failed with error: ', e)
    }
  }

  async queryBlockheight() {
    try {
      const response: SdkBlockHeight = await this.api.rpc.chain.getBlock()
      const height = response.block.header.number
      if (height > this.walletLocalData.blockHeight) {
        this.walletLocalData.blockHeight = height
        this.walletLocalDataDirty = true
        this.currencyEngineCallbacks.onBlockHeightChanged(
          this.walletLocalData.blockHeight
        )
      }
    } catch (e) {
      this.warn('queryBlockheight failed with error: ', e)
    }
  }

  processPolkadotTransaction(tx: SubscanTx) {
    const {
      from,
      to,
      success,
      hash,
      block_num: blockHeight,
      block_timestamp: date,
      module,
      amount, // large denomination
      fee // small denomination
    } = tx

    // Skip unsuccessful and irrelevant transactions
    if (!success || module !== 'balances') return

    const denom = getDenomInfo(
      this.currencyInfo,
      this.currencyInfo.currencyCode
    )
    if (denom == null) return

    const ourReceiveAddresses = []

    let nativeAmount = mul(amount, denom.multiplier)
    if (from === this.walletInfo.keys.publicKey) {
      nativeAmount = `-${add(amount, fee)}`
    } else {
      ourReceiveAddresses.push(to)
    }

    const edgeTransaction: EdgeTransaction = {
      txid: hash,
      date,
      currencyCode: this.currencyInfo.currencyCode,
      blockHeight,
      nativeAmount: nativeAmount,
      networkFee: fee,
      ourReceiveAddresses,
      signedTx: ''
    }
    this.addTransaction(this.currencyInfo.currencyCode, edgeTransaction)
  }

  async queryTransactions() {
    // Skip pages we don't need
    let page = Math.floor(
      this.otherData.txCount / this.settings.subscanQueryLimit
    )
    let numProcessedTxs = this.otherData.txCount

    while (true) {
      const payload = {
        row: this.settings.subscanQueryLimit,
        page,
        address: this.walletInfo.keys.publicKey
      }
      const response = await this.fetchSubscan('/scan/transfers', payload)
      const { count, transfers } = asTransactions(response.data)

      // count is the total number of transactions ever for an account
      // If we've already seen all the transfers we don't need to bother processing or page through older ones
      if (count === this.otherData.txCount) break

      // Instead of an empty array, a null is returned when there are zero transfers
      if (transfers == null) break

      // Process txs (newest first)
      transfers.forEach(tx => {
        try {
          this.processPolkadotTransaction(asTransfer(tx))
        } catch (e) {
          const hash = tx != null && typeof tx.hash === 'string' ? tx.hash : ''
          this.warn(`Ignoring invalid transfer ${hash}`)
        }
        numProcessedTxs++
      })

      // We've reached the end of the query
      if (transfers.length < this.settings.subscanQueryLimit) break

      page++
      this.tokenCheckTransactionsStatus[this.currencyInfo.currencyCode] =
        numProcessedTxs / count
      this.updateOnAddressesChecked()
    }

    if (this.otherData.txCount < numProcessedTxs) {
      this.otherData.txCount = numProcessedTxs
      this.walletLocalDataDirty = true
    }

    this.tokenCheckTransactionsStatus[this.currencyInfo.currencyCode] = 1
    this.updateOnAddressesChecked()

    if (this.transactionsChangedArray.length > 0) {
      this.currencyEngineCallbacks.onTransactionsChanged(
        this.transactionsChangedArray
      )
      this.transactionsChangedArray = []
    }
  }

  initOtherData() {
    if (this.otherData.txCount == null) {
      this.otherData.txCount = 0
    }
  }

  // // ****************************************************************************
  // // Public methods
  // // ****************************************************************************

  async startEngine() {
    this.engineOn = true
    await this.currencyPlugin.connectApi(this.walletId)
    this.api = this.currencyPlugin.polkadotApi
    this.initOtherData()
    this.addToLoop('queryBlockheight', BLOCKCHAIN_POLL_MILLISECONDS)
    this.addToLoop('queryBalance', ACCOUNT_POLL_MILLISECONDS)
    this.addToLoop('queryTransactions', TRANSACTION_POLL_MILLISECONDS)
    super.startEngine()
  }

  async killEngine() {
    await super.killEngine()
    await this.currencyPlugin.disconnectApi(this.walletId)
  }

  async resyncBlockchain(): Promise<void> {
    await this.killEngine()
    await this.clearBlockchainCache()
    await this.startEngine()
  }

  async makeSpend(edgeSpendInfoIn: EdgeSpendInfo): Promise<EdgeTransaction> {
    const { edgeSpendInfo, currencyCode } = super.makeSpend(edgeSpendInfoIn)

    if (edgeSpendInfo.spendTargets.length !== 1) {
      throw new Error('Error: only one output allowed')
    }
    const nativeAmount: string = edgeSpendInfo.spendTargets[0].nativeAmount
    const balance = this.getBalance({
      currencyCode: this.currencyInfo.currencyCode
    })
    const spendableBalance = sub(balance, this.settings.existentialDeposit)

    if (gt(nativeAmount, spendableBalance)) {
      throw new InsufficientFundsError()
    }

    // **********************************
    // Create the unsigned EdgeTransaction
    const edgeTransaction: EdgeTransaction = {
      txid: '',
      date: 0,
      currencyCode,
      blockHeight: 0,
      nativeAmount,
      networkFee: '0',
      ourReceiveAddresses: [],
      signedTx: ''
    }

    return edgeTransaction
  }

  async signTx(edgeTransaction: EdgeTransaction): Promise<EdgeTransaction> {
    throw new Error('Need to implement signTx')
  }

  async broadcastTx(
    edgeTransaction: EdgeTransaction
  ): Promise<EdgeTransaction> {
    throw new Error('Need to implement broadcastTx')
  }

  getDisplayPrivateSeed() {
    if (
      this.walletInfo.keys &&
      this.walletInfo.keys[`${this.currencyPlugin.pluginId}Mnemonic`]
    ) {
      return this.walletInfo.keys[`${this.currencyPlugin.pluginId}Mnemonic`]
    }
    return ''
  }

  getDisplayPublicSeed() {
    if (this.walletInfo.keys && this.walletInfo.keys.publicKey) {
      return this.walletInfo.keys.publicKey
    }
    return ''
  }
}

export { CurrencyEngine }
