import { useState } from 'react'
import FacialExpression from "./components/FacialExpression"
import './App.css'
import MoodSongs from './components/Songs'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
function App() {
 const [ Songs, setSongs ] = useState([])


  return (
    <>
    <BrowserRouter>
    <Routes>
     <Route path='/' element={<FacialExpression setSongs={setSongs} />} />
     <Route path ='/Songs' element ={<MoodSongs Songs={Songs}/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
