import { writable, derived, get } from 'svelte/store'

import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import fetchPonyfill from 'fetch-ponyfill'
// import { WebSocketLink } from 'apollo-link-ws'

export const url = writable()
export const token = writable()
export const role = writable()

export const client = derived([url, token, role], ([$url, $token, $role]) => $url && createClient({
  graphqlUri: $url,
  cacheInit: null,
  connParams: getConnectionParameters($role)
  })
)


function createServerLink(url, connParams = v => v) {
  // Split protocol
  const [, proto, uri] = url.match(/(\w+):\/\/(.*)/ )
  const { fetch } = fetchPonyfill();

  return new HttpLink({
    uri: `${proto}://${uri}`,
    fetch,
    connParams
  })
}
function createBrowserLink(url, connParams = v => v) {
  // Split protocol
  const [, proto, uri] = url.match(/(\w+):\/\/(.*)/ )

  const secure = proto === 'https'

  // Create an http link:
  const httpLink = new HttpLink({
    uri: `${proto}://${uri}`,
    fetch
  })

  return httpLink

  // Create a WebSocket link:
  const wsLink = new WebSocketLink({
    uri: `${secure ? 'wss' : 'ws'}://${uri}`,
    options: {
      reconnect: true,
      connectionParams: connParams
    }
  })

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
  )

  return link
}

function createClient({ graphqlUri, connParams = v => v, cacheInit }) {
  const cache = new InMemoryCache()
  if (cacheInit) {
    console.log("Using cache init", cacheInit)
    cache.restore(cacheInit)
  }
  return new ApolloClient({
    link: (global.WebSocket
      ? createBrowserLink(graphqlUri, connParams)
      : createServerLink(graphqlUri, connParams)
    ),
    cache
  });
}


function getConnectionParameters(roleOverride) {
  const headers = {
    'x-hasura-role': roleOverride || get(role)
  }
  const _token = get(token)
  if (_token) {
    headers.Authorization = `Bearer ${_token}`
  }

  return { headers }
}

export function gqlQuery ({ permission, ...options }) {
  console.log("Doing query", get(url), get(token))
  const _client = get(client)
  if (!_client) throw new Error('No grapqhl client present')
  return _client.query({
    ...options,
    context: getConnectionParameters(options.role)
  })
}
export function gqlMutation ({ permission, ...options }) {
  const _client = get(client)
  if (!_client) throw new Error('No grapqhl client present')
  return _client.mutate({
    ...options,
    context: getConnectionParameters(options.role)
  })
}
export function gqlSubscription (options) {
  const _client = get(client)
  if (!_client) throw new Error('No grapqhl client present')
  return _client.subscribe(options)
}



// constructor (init) {
//   super(init)

//   const { graphqlUri, token } = this.get()
//   if (!this._gqlClient && graphqlUri && token) {
//     this.gqlSetupClient(graphqlUri, token)
//   }

//   this.on('state', ({ changed, current }) => {
//     const { graphqlUri, token } = current

//     if (!(graphqlUri && token)) {
//       console.warn("No token or uri for graphql client.")
//       return
//     }

//     if (!this._gqlClient || changed.graphqlUri || changed.token) {
//       this.gqlSetupClient(graphqlUri, token)
//     }
//   })
// }

// gqlSetupClient (graphqlUri, token) {
//   this._gqlClient = createClient({
//     graphqlUri, token,
//     connParams: this.gqlConnParams.bind(this)
//   })
// }
