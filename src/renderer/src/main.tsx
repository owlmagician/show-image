import './assets/main.css'
import '@mantine/core/styles.css';

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createTheme, MantineProvider } from '@mantine/core';
const theme = createTheme({
  /** Put your mantine theme override here */
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  
  <React.StrictMode>
        <MantineProvider theme={theme}>
        <App />
        </MantineProvider>
  </React.StrictMode>
)
