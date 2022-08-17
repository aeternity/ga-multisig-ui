import axios from "axios"

export async function resolveChainName (address) {
  let { data } = await axios.get(`https://testnet.aeternity.io/mdw/name/pointees/${address}`)
  return data.active.account_pubkey?.[0].name
}
