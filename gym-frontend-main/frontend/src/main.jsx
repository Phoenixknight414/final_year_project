import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import AppComponents from './AppComponents.jsx'

// You can switch between the original App (using gymeye.jsx) 
// and AppComponents (using individual components) by commenting/uncommenting below

createRoot(document.getElementById('root')).render(
    <App />
)
