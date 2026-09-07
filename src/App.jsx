import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthDashboard from './components/AuthDashboard'
import ItemCrud from './components/ItemCrud'
import TestApi from './components/TestApi'
import Home from './Home'
import Login from './Login'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />}>
          <Route index element={<AuthDashboard />} />
          <Route path="item" element={<ItemCrud />} />
          <Route path="test_api" element={<TestApi />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
