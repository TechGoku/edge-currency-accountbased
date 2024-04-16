import { EdgeCurrencyInfo, EdgeTokenMap } from 'edge-core-js/types'

import { makeOuterPlugin } from '../../common/innerPlugin'
import { makeMetaTokens } from '../../common/tokenHelpers'
import type { EthereumTools } from '../EthereumTools'
import type { EthereumFees, EthereumNetworkInfo } from '../ethereumTypes'
import { evmCustomFeeTemplate, evmMemoOptions } from './ethereumCommonInfo'

const builtinTokens: EdgeTokenMap = {
  '493257fd37edb34451f62edf8d2a0c418852ba4c': {
    currencyCode: 'USDT',
    displayName: 'USDT',
    denominations: [{ name: 'USDT', multiplier: '1000000' }],
    networkLocation: {
      contractAddress: '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C'
    }
  },
  '4b9eb6c0b6ea15176bbf62841c6b2a8a398cb656': {
    currencyCode: 'DAI',
    displayName: 'DAI',
    denominations: [{ name: 'DAI', multiplier: '1000000000000000000' }],
    networkLocation: {
      contractAddress: '0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656'
    }
  },
  '3355df6d4c9c3035724fd0e3914de96a5a83aaf4': {
    currencyCode: 'USDC',
    displayName: 'USD Coin',
    denominations: [{ name: 'USDC', multiplier: '1000000' }],
    networkLocation: {
      contractAddress: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'
    }
  }
}

// Fees are in Wei
const defaultNetworkFees: EthereumFees = {
  default: {
    baseFee: undefined,
    baseFeeMultiplier: {
      lowFee: '1',
      standardFeeLow: '1.25',
      standardFeeHigh: '1.5',
      highFee: '1.75'
    },
    gasLimit: undefined, // Limits must always be estimated by eth_estimateGas
    gasPrice: {
      lowFee: '1000000001',
      standardFeeLow: '40000000001',
      standardFeeHigh: '300000000001',
      standardFeeLowAmount: '100000000000000000',
      standardFeeHighAmount: '10000000000000000000',
      highFee: '40000000001',
      minGasPrice: '10000000'
    },
    minPriorityFee: '2000000000'
  }
}

const networkInfo: EthereumNetworkInfo = {
  networkAdapterConfigs: [
    {
      type: 'rpc',
      servers: ['https://mainnet.era.zksync.io']
    },
    {
      type: 'evmscan',
      servers: ['https://block-explorer-api.mainnet.zksync.io']
    }
  ],
  uriNetworks: ['zksync'],
  ercTokenStandard: 'ERC20',
  chainParams: {
    chainId: 324,
    name: 'zkSync'
  },
  hdPathCoinType: 60,
  amberDataBlockchainId: '',
  pluginMnemonicKeyName: 'zksyncMnemonic',
  pluginRegularKeyName: 'zksyncKey',
  ethGasStationUrl: null,
  defaultNetworkFees
}

const currencyInfo: EdgeCurrencyInfo = {
  canReplaceByFee: true,
  currencyCode: 'ETH',
  customFeeTemplate: evmCustomFeeTemplate,
  displayName: 'zkSync',
  memoOptions: evmMemoOptions,
  pluginId: 'zksync',
  walletType: 'wallet:zksync',

  // Explorers:
  addressExplorer: 'https://explorer.zksync.io/address/%s',
  transactionExplorer: 'https://explorer.zksync.io/tx/%s',

  denominations: [
    {
      name: 'ETH',
      multiplier: '1000000000000000000',
      symbol: 'Ξ'
    }
  ],

  // Deprecated:
  defaultSettings: {
    customFeeSettings: ['gasLimit', 'gasPrice'],
    otherSettings: {
      chainParams: networkInfo.chainParams,
      ercTokenStandard: networkInfo.ercTokenStandard
      // Skip networkAdapterConfigs
    }
  },
  metaTokens: makeMetaTokens(builtinTokens)
}

export const zksync = makeOuterPlugin<EthereumNetworkInfo, EthereumTools>({
  builtinTokens,
  currencyInfo,
  networkInfo,

  async getInnerPlugin() {
    return await import('../EthereumTools')
  }
})
