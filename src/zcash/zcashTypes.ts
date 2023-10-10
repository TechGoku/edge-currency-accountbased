import {
  asBoolean,
  asCodec,
  asMaybe,
  asNumber,
  asObject,
  asString,
  Cleaner
} from 'cleaners'
import type {
  Addresses,
  BalanceEvent,
  InitializerConfig,
  SpendInfo,
  SpendSuccess,
  StatusEvent,
  TransactionEvent,
  UpdateEvent
} from 'react-native-zcash'
import { Subscriber } from 'yaob'

import { asWalletInfo } from '../common/types'

type ZcashNetworkName = 'mainnet' | 'testnet'

export interface ZcashNetworkInfo {
  rpcNode: {
    networkName: ZcashNetworkName
    defaultHost: string
    defaultPort: number
  }
  defaultNetworkFee: string
  defaultBirthday: number
}

export const asZcashWalletOtherData = asObject({
  isSdkInitializedOnDisk: asMaybe(asBoolean, false)
})

export type ZcashWalletOtherData = ReturnType<typeof asZcashWalletOtherData>

export interface ZcashSynchronizer {
  on: Subscriber<{
    balanceChanged: BalanceEvent
    statusChanged: StatusEvent
    transactionsChanged: TransactionEvent
    update: UpdateEvent
  }>
  start: () => Promise<void>
  stop: () => Promise<void>
  deriveUnifiedAddress: () => Promise<Addresses>
  rescan: () => Promise<string>
  sendToAddress: (arg: SpendInfo) => Promise<SpendSuccess>
}

export type ZcashMakeSynchronizer = () => (
  config: InitializerConfig
) => Promise<ZcashSynchronizer>

export type ZcashBalances = Omit<
  Omit<BalanceEvent, 'availableZatoshi'>,
  'totalZatoshi'
>

export const asZecPublicKey = asObject({
  birthdayHeight: asNumber,
  publicKey: asString
})

export type SafeZcashWalletInfo = ReturnType<typeof asSafeZcashWalletInfo>
export const asSafeZcashWalletInfo = asWalletInfo(asZecPublicKey)

export interface ZcashPrivateKeys {
  mnemonic: string
  birthdayHeight: number
}
export const asZcashPrivateKeys = (
  pluginId: string
): Cleaner<ZcashPrivateKeys> => {
  const asKeys = asObject({
    [`${pluginId}Mnemonic`]: asString,
    [`${pluginId}BirthdayHeight`]: asNumber
  })

  return asCodec(
    raw => {
      const clean = asKeys(raw)
      return {
        mnemonic: clean[`${pluginId}Mnemonic`] as string,
        birthdayHeight: clean[`${pluginId}BirthdayHeight`] as number
      }
    },
    clean => {
      return {
        [`${pluginId}Mnemonic`]: clean.mnemonic,
        [`${pluginId}BirthdayHeight`]: clean.birthdayHeight
      }
    }
  )
}
