import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from '@apollo/client/react';
import client from './apollo/client.js';

createRoot(document.getElementById('root')).render(
  
  <ApolloProvider client={client}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  </ApolloProvider>
)
