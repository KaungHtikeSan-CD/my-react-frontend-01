import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const EMPTY_FORM = { name: '', description: '', quantity: 0, price: 0 }

export default function ItemCrud() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/item`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to load items')
      setItems(data.items)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- initial data is loaded from the API
    loadItems()
  }, [loadItems])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function startEdit(item) {
    setEditingId(item._id)
    setForm({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      price: item.price,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function saveItem(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const endpoint = editingId
        ? `${API_URL}/api/item/${editingId}`
        : `${API_URL}/api/item`
      const response = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to save item')

      setNotice(editingId ? 'Item updated successfully' : 'Item created successfully')
      resetForm()
      await loadItems()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteItem) return

    const itemToDelete = deleteItem
    setDeleteItem(null)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/item/${itemToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to delete item')

      setItems((current) => current.filter((item) => item._id !== itemToDelete._id))
      setNotice(`“${itemToDelete.name}” soft-deleted; its database record was preserved.`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <Box className="item-page">
      <Box className="item-heading">
        <div>
          <Typography variant="h4" component="h1">
            Item CRUD
          </Typography>
          <Typography color="text.secondary">
            Deleted items are retained in MongoDB with status DELETED and filtered from this list.
          </Typography>
        </div>
        <Chip label={`${items.length} active item${items.length === 1 ? '' : 's'}`} color="primary" />
      </Box>

      <Paper component="form" onSubmit={saveItem} className="item-form" variant="outlined">
        <Typography variant="h6">{editingId ? 'Update item' : 'Add item'}</Typography>
        <TextField label="Name" name="name" value={form.name} onChange={updateField} required />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={updateField}
        />
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          slotProps={{ htmlInput: { min: 0 } }}
          value={form.quantity}
          onChange={updateField}
          required
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          value={form.price}
          onChange={updateField}
          required
        />
        <Box className="form-actions">
          {editingId && <Button onClick={resetForm}>Cancel</Button>}
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving…' : editingId ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="active items">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading items…</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No active items found.</TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description || '—'}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell><Chip label={item.status || 'ACTIVE'} color="success" size="small" /></TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => startEdit(item)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => setDeleteItem(item)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(deleteItem)} onClose={() => setDeleteItem(null)}>
        <DialogTitle>Soft-delete item?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteItem?.name} will disappear from the active list, but its MongoDB record will remain
            with status DELETED.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItem(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Soft delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={8000}
        onClose={() => setNotice('')}
        message={notice}
      />
    </Box>
  )
}
