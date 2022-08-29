import { Node, AeSdk } from "@aeternity/aepp-sdk";
import { reactive, toRefs } from "vue";
import { COMPILER_URL, NETWORKS } from "./configs";
import identity from "./contracts/Idenitity.aes";

export let clientSdk = null;

export const client = reactive({
  isConnecting: false,
  isConnected: false,
  isStatic: false,
  networkId: null,

  contract: null,
  contractAddress: null,
});

/**
 * Initialize a static client, mainnet or testnet
 * This client can not sign transactions that require funds (everything except static contract calls)
 * @returns {Promise<boolean>}
 */
export const initClient = async () => {
  const { isConnected, isConnecting, isStatic } = toRefs(client);

  isConnecting.value = true;

  const nodes = [];

  for (const { name, url } of NETWORKS) {
    nodes.push({
      name,
      instance: new Node(url),
    });
  }
  clientSdk = new AeSdk({
    nodes: [
      { name: "ae_uat", instance: new Node("https://testnet.aeternity.io") },
      //{ name: 'ae_mainnet', instance: new Node('https://mainnet.aeternity.io') }
    ],
    compilerUrl: COMPILER_URL,
  });

  isStatic.value = true;
  isConnected.value = true;
  isConnecting.value = false;

  return await initProvider();
};

/**
 * After finding a wallet this function is called to cache
 * basic values from the wallet.
 * @returns {Promise<boolean>}
 */
export const initProvider = async () => {
  const { networkId, contract, contractAddress } = toRefs(client);
  try {
    networkId.value = (await clientSdk.getNodeInfo()).nodeNetworkId;

    if (contractAddress.value) {
      contract.value = await clientSdk.getContractInstance(identity, {
        contractAddress: contractAddress.value,
      });
    }

    return true;
  } catch (error) {
    return false;
  }
};
