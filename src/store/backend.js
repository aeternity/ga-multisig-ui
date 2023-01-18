import axios from "axios";

const backendUrl = "https://ga-multisig-backend.prd.aepps.com";

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
    await axios.post(`${backendUrl}/tx`, { hash: txHash, tx });
  } catch (e) {
    console.error(e);
  }
};

export const getTransactionByHash = async (txHash) => {
  try {
    const { data } = await axios.get(`${backendUrl}/tx/${txHash}`);
    return data?.tx;
  } catch (e) {
    console.error(e);
    return null;
  }
};
