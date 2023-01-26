import axios from "axios";

const backendUrl = (networkId) =>
  `https://ga-multisig-backend-${
    networkId === "ae_mainnet" ? "mainnet" : "testnet"
  }.prd.aepps.com`;

export const getSignerContracts = async (networkId, signerAddress) => {
  try {
    const { data } = await axios.get(
      `${backendUrl(networkId)}/${signerAddress}?fromHeight=618542`
    );
    return data.reduce((acc, { contractId, gaAccountId, height }) => {
      acc[contractId] = { gaAccountId, height };
      return acc;
    }, {});
  } catch (e) {
    console.error(e);
    return {};
  }
};

export const storeTransaction = async (networkId, tx, txHash) => {
  try {
    await axios.post(`${backendUrl(networkId)}/tx`, { hash: txHash, tx });
  } catch (e) {
    console.error(e);
  }
};

export const getTransactionByHash = async (networkId, txHash) => {
  try {
    const { data } = await axios.get(`${backendUrl(networkId)}/tx/${txHash}`);
    return data?.tx;
  } catch (e) {
    console.error(e);
    return null;
  }
};
