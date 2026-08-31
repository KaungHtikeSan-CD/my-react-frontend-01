import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function TestApi() {
  const [message, setMessage] = useState('...Loading...')
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function fetchMessage() {
      try {
        const response = await fetch(`${API_URL}/api/hello`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (!ignore) {
          setMessage(data.message)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message)
        }
      }
    }

    fetchMessage()

    return () => {
      ignore = true
    }
  }, [])

  if (error) {
    return <div role="alert">Error: {error}</div>
  }

  return <div>Message: {message}</div>
}

export default TestApi
