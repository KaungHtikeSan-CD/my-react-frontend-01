import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from './context/UserContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoggedIn, isLogInError, loginErrorMsg, isInitializing } =
    useContext(UserContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoggedIn && !isInitializing) navigate('/', { replace: true })
  }, [isLoggedIn, isInitializing, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    const success = await login(email, password)
    setIsSubmitting(false)
    if (success) navigate('/', { replace: true })
  }

  if (isInitializing) return null

  return (
    <Box className="login-page">
      <Paper component="form" onSubmit={handleSubmit} className="login-card">
        <Typography variant="h4" component="h1">
          Sign in
        </Typography>
        <Typography color="text.secondary">
          Enter your admin or user account credentials.
        </Typography>
        {isLogInError && <Alert severity="error">{loginErrorMsg}</Alert>}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
          autoComplete="username"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          autoComplete="current-password"
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Login'}
        </Button>
      </Paper>
    </Box>
  )
}
