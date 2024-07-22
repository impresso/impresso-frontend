import { useNotificationsStore } from '@/stores/notifications'
import type { Application } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'

// e.g io api base is http://localhost
// and path is  something like /path/to/socket.io defined in the backend
// const SocketBasePath =
//   import.meta.env.NODE_ENV === 'development' ? '' : import.meta.env.VITE_MIDDLELAYER_API
const BasePath = import.meta.env.VITE_USE_PROXY_MIDDLEWARE
  ? ''
  : import.meta.env.VITE_MIDDLELAYER_API
const Timeout = import.meta.env.VITE_MIDDLELAYER_API_SOCKET_TIMEOUT ?? 10000

export const configureSocketIoTransport = (app: Application) => {
  const socket = io(BasePath, {
    path: import.meta.env.VITE_MIDDLELAYER_API_SOCKET_PATH,
    timeout: Timeout
  })

  app.configure(socketio(socket))

  socket.on('disconnect', reason => {
    console.error('[transport] Socket disconnected:', reason)
  })
  socket.on('connect', () => {
    console.info('[transport] Socket connected!')
    const notificationsStore = useNotificationsStore()
    notificationsStore.displayConnectivityStatus(true)
    notificationsStore.lockScreen(false)
  })
  socket.on('reconnect', () => {
    console.info('[transport] Socket @reconnect connected!')
    app.reAuthenticate(false)
    const notificationsStore = useNotificationsStore()
    notificationsStore.displayConnectivityStatus(true)
  }) // https://github.com/feathersjs/feathers-authentication/issues/272#issuecomment-240937322

  socket.on('connect_error', err => {
    err.message = `Could not connect to the API: ${err.message}`
    console.error(err)
    const notificationsStore = useNotificationsStore()
    notificationsStore.displayConnectivityStatus(false)
    notificationsStore.lockScreen(false)
  })
}

export const configureRestTransport = (app: Application) => {
  // Connect to a different URL
  const restClient = rest(import.meta.env.VITE_MIDDLELAYER_API_BASE_URL ?? BasePath)

  // Configure an AJAX library (see below) with that client
  app.configure(restClient.fetch(window.fetch.bind(window)))
}
