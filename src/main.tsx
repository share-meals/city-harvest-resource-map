import App from './App.tsx'
import {
    ChakraProvider,
    theme
} from '@chakra-ui/react';
import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
	<ChakraProvider theme={theme}>
	    <App />
	</ChakraProvider>
  </React.StrictMode>,
)
