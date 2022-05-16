import {
  AmountFormatter,
  BrowserWindowMessageConnection,
  Crypto,
  MemoryAccount,
  Node,
  RpcAepp,
  TxBuilderHelper,
  Universal,
  WalletDetector,
} from '@aeternity/aepp-sdk'

import { reactive, toRefs } from 'vue'
import { COMPILER_URL, NETWORKS } from './configs'
import { Buffer } from "buffer"


export const aeWallet = reactive({
  sdk: null,
  activeWallet: null,
  address: null,
  balance: null,
  walletStatus: null,
  isStatic: false,
  isGa: false,
})

export const aeInitWallet = async () => {
  const { sdk, walletStatus } = toRefs(aeWallet)

  const nodes = []

  for (const { type, url } of NETWORKS) {
    nodes.push({
      name: type,
      instance: await Node({ url }),
    })
  }

  walletStatus.value = 'connecting'

  try {
    const { VUE_APP_WALLET_SECRET_KEY, VUE_APP_WALLET_PUBLIC_KEY } = process.env
    // connect to static Wallet
    if (VUE_APP_WALLET_SECRET_KEY && VUE_APP_WALLET_PUBLIC_KEY) {
      const account = MemoryAccount({
        keypair: { secretKey: VUE_APP_WALLET_SECRET_KEY, publicKey: VUE_APP_WALLET_PUBLIC_KEY },
      })

      const client = await Universal({
        compilerUrl: COMPILER_URL,
        nodes,
        accounts: [account],
      })
      sdk.value = client

      walletStatus.value = 'connected'
      await aeFetchWalletInfo(client)
    } else {
      // connect to Superhero Wallet
      sdk.value = await RpcAepp({
        name: 'AEPP',
        nodes,
        compilerUrl: COMPILER_URL,
        onNetworkChange (params) {
          this.selectNode(params.networkId)
          aeFetchWalletInfo(sdk.value)
        },
        onAddressChange (addresses) {
          console.info('onAddressChange :: ', addresses)
          aeFetchWalletInfo(sdk.value)
        },
      })
      walletStatus.value = 'connected'

      await aeScanForWallets()
    }
  } catch (error) {
    console.info('aeInitWallet . error: ', error)
    return false
  }
  return true
}


export const aeScanForWallets = async () => {
  const { sdk, walletStatus, activeWallet } = toRefs(aeWallet)

  walletStatus.value = 'scanning'

  const scannerConnection = await BrowserWindowMessageConnection({
    connectionInfo: { id: 'spy' },
  })
  const detector = await WalletDetector({ connection: scannerConnection })

  const handleWallets = async function ({ newWallet }) {
    detector.stopScan()
    if (!sdk.value) return

    activeWallet.value = newWallet

    const connected = await sdk.value.connectToWallet(
      await newWallet.getConnection(),
    )
    sdk.value.selectNode(connected.networkId) // connected.networkId needs to be defined as node in RpcAepp
    await sdk.value.subscribeAddress('subscribe', 'current')

    await aeFetchWalletInfo(sdk.value)
  }

  await detector.scan(handleWallets)

  return Object.values(detector.wallets).length
}


export const aeFetchWalletInfo = async (sdk) => {
  const { address, balance, walletStatus, isGa } = toRefs(aeWallet)

  walletStatus.value = 'fetching_info'

  try {
    address.value = await sdk.address()

    balance.value = await sdk.getBalance(address.value, {
      format: AmountFormatter.AE_AMOUNT_FORMATS.AE,
    })

    const node = await Node({ url: 'https://testnet.aeternity.io' })

    const universal = await Universal({
      nodes: [{ name: 'testnet', instance: node }],
      compilerUrl: 'https://compiler.aepps.com',
    })

    isGa.value = await universal.isGA(address.value)


    walletStatus.value = null
    return true
  } catch (error) {
    walletStatus.value = 'fetching_failed'
    console.info('aeFetchWalletInfo error::', error)
    return false
  }
}

export const buildAuthTxHash = async (rlpTransaction) => {
  const { sdk } = toRefs(aeWallet)

  const decoded = TxBuilderHelper.decode(rlpTransaction, 'tx')
  const networkId = Buffer.from(sdk.value.getNetworkId())

  return new Uint8Array(
    Crypto.hash(
      Buffer.concat([
        networkId,
        decoded
      ]),
    ),
  )
}

