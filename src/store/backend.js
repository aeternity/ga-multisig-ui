import axios from "axios";

const backendUrl = "https://ga-multisig-backend.dev.aepps.com";

export const getSignerContracts = async (signerAddress) => {
  try {
    const { data } = await axios.get(
      `${backendUrl}/${signerAddress}?fromHeight=618542`
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

export const storeTransaction = async (tx, txHash) => {
  try {
    await axios.post(`${backendUrl}/tx`, { hash: txHash, data: tx });
  } catch (e) {
    console.error(e);
  }
};

export const getTransactionByHash = async (txHash) => {
  try {
    const { data } = await axios.get(`${backendUrl}/tx/${txHash}`);
    return data?.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};
