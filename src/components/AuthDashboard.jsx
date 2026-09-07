import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useContext } from 'react'
import { UserContext } from '../context/UserContext'

export default function AuthDashboard() {
  const { user } = useContext(UserContext)

  return (
    <Card sx={{ maxWidth: 560 }}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom>
          Authentication successful
        </Typography>
        <Typography color="text.secondary">
          You are signed in with a JWT stored in an HttpOnly cookie.
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Signed in as: {user?.username || user?.email}
        </Typography>
      </CardContent>
    </Card>
  )
}
