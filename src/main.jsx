import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Game from './tictactoe.jsx'
import "./styles.css";
import P5 from './p5.jsx'


// createRoot(document.getElementById('root')).render(<Game />)
createRoot(document.getElementById('root')).render(<P5 />)
// createRoot(document.getElementById('root')).render(<App />)
