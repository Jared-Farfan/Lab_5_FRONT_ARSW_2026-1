import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Game from './tictactoe.jsx'
import "./styles.css";


// createRoot(document.getElementById('root')).render(<Game />)
createRoot(document.getElementById('root')).render(<App />)
