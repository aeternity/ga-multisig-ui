import { reactive, toRefs } from "vue"
import axios from "axios"

export const chainNames = reactive({
  names: [],
})

export const loadChainNAmes = async (cursor) => {
  const { names } = toRefs(chainNames)

  const address = cursor || '/v2/names?limit=10'
  try {
    const { data } = await fetchNames(address)
    names.value = [...names.value, ...data.data]
    await loadChainNAmes(data.next)
  } catch (e) {
    console.log(e)
  }
}

export const fetchNames = async (address) => {
  const url = 'https://testnet.aeternity.io/mdw'
  return await axios.get(url + address)
}
