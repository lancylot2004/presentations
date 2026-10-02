import { addSyncMethod } from '@slidev/client'
import { defineAppSetup } from '@slidev/types'

// Cross-device presenter sync for the built deck. The dev server already does
// this over its own socket, so this only registers in the static build, where
// Slidev falls back to BroadcastChannel and never leaves the browser.
export default defineAppSetup(() => {
  if (!import.meta.env.PROD)
    return

  const url = new URL('/__sync', location.origin)
  url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('deck', location.pathname.split('/')[1] || 'root')

  const handlers = new Map<string, (data: unknown) => void>()
  const latest = new Map<string, unknown>()
  const replayed = new Set<string>()
  let socket: WebSocket

  function connect() {
    socket = new WebSocket(url)
    socket.addEventListener('message', (event) => {
      const { k, d } = JSON.parse(event.data)
      latest.set(k, d)
      handlers.get(k)?.(d)
      // A window opened mid-talk gets the relay's replay before Vue has
      // mounted a slide, and Slidev drops patches until then. Re-apply the
      // newest value once so the window lands on the live slide.
      if (!replayed.has(k)) {
        replayed.add(k)
        setTimeout(() => handlers.get(k)?.(latest.get(k)), 1200)
      }
    })
    // ponytail: reconnects forever at a flat 1s. A talk is an hour and the tab
    // is in front of you; add backoff if this ever runs unattended.
    socket.addEventListener('close', () => setTimeout(connect, 1000))
  }
  connect()

  addSyncMethod({
    init(channelKey, onUpdate) {
      handlers.set(channelKey, onUpdate as (data: unknown) => void)
      return (state, updating) => {
        if (!updating && socket.readyState === WebSocket.OPEN)
          socket.send(JSON.stringify({ k: channelKey, d: state }))
      }
    },
  })
})
