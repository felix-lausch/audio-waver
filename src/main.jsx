import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Cube from './Cube.jsx'
import Graph from './Graph.jsx'
import Flying from './Flying.jsx'
import Graph3D from './Graph3D.jsx'
import ShaderTest from './ShaderTest.jsx'
import Canvas from './Canvas.jsx'
import Model from './Model.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    {/* <Cube /> */}
    {/* <Canvas /> */}
    {/* <ShaderTest /> */}
    <Model />
    {/* <Graph /> */}
    {/* <Graph3D /> */}
    {/* <Flying /> */}
  </React.StrictMode>,
)
