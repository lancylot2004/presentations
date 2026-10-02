// Serves the built decks, plus a WebSocket relay for presenter mode.
//
// A deck built by `slidev build` has no server, so Slidev's own sync degrades
// to BroadcastChannel/localStorage and only reaches windows of one browser
// (see @slidev/client/state/syncState.ts). Each deck opens a socket on
// /__sync instead, and one Durable Object per deck fans every patch out to the
// other clients, which is what gives cross-device control.
import { DurableObject } from 'cloudflare:workers'

export class SyncRoom extends DurableObject {
  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket')
      return new Response('expected websocket', { status: 426 })

    const [client, server] = Object.values(new WebSocketPair())
    this.ctx.acceptWebSocket(server)

    // Replay the latest patch of each channel so a window opened mid-talk
    // lands on the slide everyone else is on.
    for (const [key, data] of await this.ctx.storage.list({ prefix: 'ch:' }))
      server.send(JSON.stringify({ k: key.slice(3), d: data }))

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(sender, message) {
    const { k, d } = JSON.parse(message)
    await this.ctx.storage.put(`ch:${k}`, d)
    for (const socket of this.ctx.getWebSockets())
      if (socket !== sender)
        socket.send(message)
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/__sync') {
      const deck = url.searchParams.get('deck') || 'root'
      return env.SYNC.get(env.SYNC.idFromName(deck)).fetch(request)
    }
    return env.ASSETS.fetch(request)
  },
}
