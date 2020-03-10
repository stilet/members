import { writable, derived, get, readable } from 'svelte/store'
import ApolloClient from 'apollo-boost'

export const tokenStore = writable(null)

const client = process.browser
  ? new ApolloClient()
  : new ApolloClient({
    fetch: (url, opts) => global.fetch(url, opts),
    uri: process.env.GRAPHQL_URI,
    request: (operation) => {
      const context = operation.getContext()
      const token = context.token || get(tokenStore)

      if (token) {
        operation.setContext({
          headers: {
            authorization: `Bearer ${token}`
          }
        })
      }
    }
  })

if (!process.browser) {
  client.defaultOptions = {
    watchQuery: {
      fetchPolicy: 'no-cache',
      // errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      // errorPolicy: 'all',
    },
  }
}

export function doQuery (options) {
  return client.query(options)
}

class Query {
  constructor({ unpack = v => v, query, ...options }) {
    this.query = query
    this.store = readable(
      { loading: true },
      set => {
        const subscription = client.watchQuery({ query, ...options })
          .subscribe(
            ({ loading, data }) => {
              set({
                loading,
                data: unpack(data)
              })
            },  
            error => {
              set({
                loading: false,
                error
              })
            }
          )
        return () => subscription.unsubscribe()
      }
    )
  }

  subscribe(fn) {
    return this.store.subscribe(fn)
  }
}

export function query (options) {
  return new Query(options)
}

export function mutation({ beforeMutation, ...options }) {
  return async (variables, extraOptions) => {
    try {
      return client.mutate({
        ...options,
        ...extraOptions,
        variables: {
          ...options.variables,
          ...(beforeMutation ? await beforeMutation() : {}),
          ...variables
        }
      })
    } catch (e) {
      console.error("Error in mutation:", e)
    }
  }
}

export async function whenResult(store) {
  let unsubscribe
  return new Promise((resolve, reject) => {
    unsubscribe = store.subscribe(({ loading, data, error }) => {
      if (!loading) {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      }
    })
  }).then(v => {
    unsubscribe()
    return v
  })
}

export async function awaitQueries(stores) {
  // Receives a map of possible stores, awaits all the stores

  await Promise.all(
    Object.values(stores)
      .map(store => {
        if (store instanceof Query) {
          let unsub
          return new Promise((resolve, reject) => {
            unsub = store.subscribe(({ loading }) => {
              if ((loading === undefined) || !loading) {
                resolve()
              }
            })
          }).then(unsub)
        }
      })
  )

  return stores

}