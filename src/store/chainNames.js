import axios from "axios"

export const resolveChainName = async (address) => {
  let { data } = await axios.get(`https://testnet.aeternity.art/mdw/name/pointees/${address}`)
  return data.active.account_pubkey?.[0].name
}
