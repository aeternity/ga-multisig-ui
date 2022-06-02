import { reactive, toRefs } from "vue"
import { hydrateApp } from "./app"
import { loadContractDetail } from "./contractDetail"

export const webSocket = reactive({
  socket: null,
})


export async function initWebSocket () {
  const { socket } = toRefs(webSocket)

  socket.value = new WebSocket('wss://testnet.aeternity.art/mdw/websocket')
  socket.value.onopen = (e) => {
    console.info('connected')
  }

  socket.value.onmessage = async (e) => {
    const message = JSON.parse(e.data)
    console.log('message', message)
    await hydrateApp()
    await loadContractDetail()
  }
}

export async function subscribeToSocket (address) {
  const { socket } = toRefs(webSocket)
  socket.value.send(`{"op":"Subscribe", "payload":"Object", "target": "${address}" }`)
}
