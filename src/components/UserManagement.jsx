import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/UserContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function UserManagement() {
  const { user } = useContext(UserContext)
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [password, setPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isAdmin = user?.id === '-1' || user?._id === '-1'

  async function loadUsers() {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/user?page=1`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Unable to load users')
      setUsers(data.users || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin])

  function closeDialog() {
    if (isSaving) return
    setSelectedUser(null)
    setPassword('')
  }

  async function changePassword() {
    setMessage('')
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser._id, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to change password')

      setMessage(`Password changed for ${selectedUser.username}`)
      closeDialog()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAdmin) {
    return <Alert severity="error">Only administrators can manage users.</Alert>
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 960 }}>
      <Box>
        <Typography variant="h4" component="h1">
          User management
        </Typography>
        <Typography color="text.secondary">
          Administrators can reset a user password. Passwords are never displayed.
        </Typography>
      </Box>

      {message && <Alert severity="success" onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress aria-label="Loading users" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((managedUser) => (
                    <TableRow key={managedUser._id}>
                      <TableCell>{managedUser.username}</TableCell>
                      <TableCell>{managedUser.email}</TableCell>
                      <TableCell>{[managedUser.firstname, managedUser.lastname].filter(Boolean).join(' ') || '—'}</TableCell>
                      <TableCell align="right">
                        <Button variant="outlined" onClick={() => setSelectedUser(managedUser)}>
                          Change password
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No users found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedUser)} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>Change password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            Set a new password for {selectedUser?.username}.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="New password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            helperText="At least 6 characters"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={isSaving}>Cancel</Button>
          <Button variant="contained" onClick={changePassword} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Change password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
