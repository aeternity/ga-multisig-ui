import axios from "axios"

const backendUrl = "http://localhost:3000"

export const getSignerContracts = async (signerAddress) => {
  try {
    const { data } = await axios.get(`${backendUrl}/${signerAddress}?fromHeight=618542`)
    return data.reduce((acc, {contractId, gaAccountId}) => {
      acc[contractId]=gaAccountId
      return acc
    },{});

  } catch (e) {
    console.error(e)
  }
}

export const storeTransaction = async (tx, txHash) => {
  try {
    await axios.post(`${backendUrl}/tx`, {hash: txHash, data: tx})
  } catch (e) {
    console.error(e)
  }
}

export const getTransactionByHash = async (txHash) => {
  try {
    const { data } = await axios.get(`${backendUrl}/tx/${txHash}`)
    return data?.data;
  } catch (e) {
    console.error(e)
    return null;
  }
}
