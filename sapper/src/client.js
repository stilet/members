import * as sapper from '@sapper/app';

import createStore from './stores'

import 'src/style/main.scss'

sapper.start({
  target: document.querySelector('#sapper'),
  store: data => createStore({
    ...data,
    server: false, // ugly    
    graphqlUri: process.env.GRAPHQL_URI
  })
});