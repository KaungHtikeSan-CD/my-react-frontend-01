import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useContext, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { UserContext } from './context/UserContext'

export default function Home() {
  const navigate = useNavigate()
  const { user, logout, isLoggedIn, isInitializing } = useContext(UserContext)

  useEffect(() => {
    if (!isLoggedIn && !isInitializing) navigate('/login', { replace: true })
  }, [isLoggedIn, isInitializing, navigate])

  if (isInitializing || !isLoggedIn) return null

  async function handleLogout() {
    if (await logout()) navigate('/login', { replace: true })
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1, textAlign: 'left' }}>
            My Frontend 1.0
          </Typography>
          <Typography sx={{ mr: 2 }}>{user?.username || user?.email}</Typography>
          <Button color="inherit" onClick={() => navigate('/item')}>
            Item
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ px: 2, pt: 2 }}>
        <Outlet />
      </Box>
    </div>
  )
}
