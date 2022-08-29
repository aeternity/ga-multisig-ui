import {
  AeSdkAepp,
  Node,
  BrowserWindowMessageConnection,
  AE_AMOUNT_FORMATS,
  AeSdk,
  walletDetector,
  MemoryAccount,
} from "@aeternity/aepp-sdk";

import { reactive, toRefs } from "vue";
import { COMPILER_URL, NETWORKS } from "./configs";

export let sdk = null;

export const wallet = reactive({
  activeWallet: null,
  address: null,
  balance: null,
  walletStatus: null,
  isStatic: false,
  networkId: null,
});

export const initWallet = async () => {
  const { walletStatus } = toRefs(wallet);

  const nodes = [];

  for (const { name, url } of NETWORKS) {
    nodes.push({
      name,
      instance: new Node(url),
    });
  }
  walletStatus.value = "connecting";

  try {
    const { VUE_APP_WALLET_SECRET_KEY, VUE_APP_WALLET_PUBLIC_KEY } =
      process.env;
    // connect to static Wallet
    if (VUE_APP_WALLET_SECRET_KEY && VUE_APP_WALLET_PUBLIC_KEY) {
      const account = new MemoryAccount({
        keypair: {
          secretKey: VUE_APP_WALLET_SECRET_KEY,
          publicKey: VUE_APP_WALLET_PUBLIC_KEY,
        },
      });

      const client = new AeSdk({
        compilerUrl: COMPILER_URL,
        nodes: [
          {
            name: "ae_uat",
            instance: new Node("https://testnet.aeternity.io"),
          },
          //{ name: 'ae_mainnet', instance: new Node('https://mainnet.aeternity.io') }
        ],
        accounts: [account],
      });
      sdk = client;

      walletStatus.value = "connected";
      await fetchWalletInfo();
    } else {
      // connect to Superhero Wallet
      sdk = new AeSdkAepp({
        name: "AEPP",
        nodes: [
          // todo fix nodes
          {
            name: "ae_uat",
            instance: new Node("https://testnet.aeternity.io"),
          },
          //{ name: 'ae_mainnet', instance: new Node('https://mainnet.aeternity.io') }
        ],
        compilerUrl: COMPILER_URL,
        onNetworkChange: async ({ networkId }) => {
          await connectToNode(networkId);
        },
        onAddressChange: async (addresses) => {
          console.info("onAddressChange :: ", addresses);
          await fetchWalletInfo();
        },
      });
      await scanForWallets();
    }
  } catch (error) {
    console.info("initWallet . error: ", error);
    return false;
  }
  return true;
};

export const scanForWallets = async () => {
  const { walletStatus, activeWallet } = toRefs(wallet);

  walletStatus.value = "scanning";

  return new Promise((resolve) => {
    const handleWallets = async ({ wallets, newWallet }) => {
      newWallet = newWallet || Object.values(wallets)[0];
      stopScan();
      if (!sdk) return;

      activeWallet.value = newWallet;

      const { networkId } = await sdk.connectToWallet(
        newWallet.getConnection()
      );
      await sdk.subscribeAddress("subscribe", "current");

      await connectToNode(networkId);

      resolve();
    };
    const scannerConnection = new BrowserWindowMessageConnection();
    const stopScan = walletDetector(scannerConnection, handleWallets);
  });
};

export const fetchWalletInfo = async () => {
  const { address, balance, walletStatus } = toRefs(wallet);

  walletStatus.value = "fetching info";

  try {
    address.value = await sdk.address();
    balance.value = await sdk.getBalance(address.value, {
      format: AE_AMOUNT_FORMATS.AE,
    });
    walletStatus.value = "connected";
    return true;
  } catch (error) {
    walletStatus.value = "fetching failed";
    console.info("fetchWalletInfo error::", error);
    return false;
  }
};

export const connectToNode = async (selectedNetworkId) => {
  const { networkId } = toRefs(wallet);
  networkId.value = selectedNetworkId;
  try {
    sdk.selectNode(selectedNetworkId);
  } catch (e) {
    alert(
      `Currently only testnet wallets are supported, please select testnet as network in your wallet.`
    );
    throw e;
  }

  await fetchWalletInfo();
};

export const getUniversalStamp = async () => {
  // todo maybe move to client?

  return new AeSdk({
    nodes: [
      { name: "ae_uat", instance: new Node("https://testnet.aeternity.io") },
      //{ name: 'ae_mainnet', instance: new Node('https://mainnet.aeternity.io') }
    ],
    compilerUrl: COMPILER_URL,
  });
};
