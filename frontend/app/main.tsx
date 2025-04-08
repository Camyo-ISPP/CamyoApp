import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RootLayout from './_layout'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootLayout/>
  </StrictMode>,
)