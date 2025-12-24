import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button,
  Modal, TextField, Box, IconButton, MenuItem, Checkbox, FormControlLabel,
  Snackbar, Alert, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const roles = ['admin', 'operator', 'viewer'];
const pages = ['dashboard', 'live-metrics', 'user-management', 'settings'];

const modalStyle = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper',
  boxShadow: 24, p: 4, borderRadius: '8px'
};

const getAuthConfig = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    }
  };
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '', password: '', name: '', email: '', role: 'admin', access: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchUsers = async () => {
    try {
      const config = getAuthConfig();
      console.log('Fetching users with headers:', config);
      const res = await axios.get('http://localhost:5000/api/users', getAuthConfig());



      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        console.error('Invalid response format:', res.data);
        showSnackbar('Unexpected data received from server.', 'error');
      }
    } catch (err) {
      console.error('Error fetching users:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      showSnackbar('Failed to fetch users. Please login again or try later.', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = (user = null) => {
    setEditingUser(user);
    setFormData(user || {
      username: '', password: '', name: '', email: '', role: 'admin', access: []
    });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', name: '', email: '', role: 'admin', access: [] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (page) => {
    setFormData(prev => ({
      ...prev,
      access: prev.access.includes(page)
        ? prev.access.filter(p => p !== page)
        : [...prev.access, page]
    }));
  };

  const handleSubmit = async () => {
    const { username, password, name, email } = formData;

    if (!username || (!editingUser && !password) || !name || !email) {
      showSnackbar('All fields (except password during edit) are required.', 'warning');
      return;
    }

    try {
      const config = getAuthConfig();
      if (editingUser) {
        const payload = { ...formData };
        if (!formData.password) delete payload.password;

        await axios.put(
          `http://localhost:5000/api/users/${editingUser.id}`,
          payload,
          config
        );
        showSnackbar('User updated successfully.', 'success');
      } else {
        await axios.post('http://localhost:5000/api/users', formData, config);
        showSnackbar('User created successfully.', 'success');
      }
      handleClose();
      fetchUsers();
    } catch (err) {
      console.error('Save failed:', err.response?.data || err.message);
      showSnackbar('Failed to save user. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, config);
      showSnackbar('User deleted successfully.', 'success');
      fetchUsers();
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
      showSnackbar('Failed to delete user.', 'error');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const csvHeader = ['Name', 'Username', 'Email', 'Role', 'Access'];
    const csvRows = users.map(user => [
      user.name, user.username, user.email, user.role, (user.access || []).join('; ')
    ]);

    const csvContent = [
      csvHeader.join(','),
      ...csvRows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'users.csv';
    a.click();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>User Management</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <Button variant="contained" onClick={() => handleOpen()}>Add New User</Button>
        <div>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ marginRight: 2 }}
          />
          <Button variant="outlined" onClick={handleExportCSV}>Export CSV</Button>
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Access</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">No users found</TableCell>
            </TableRow>
          ) : (
            filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{(user.access || []).join(', ')}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(user)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(user.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal */}
      <Modal open={modalOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
          <TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} margin="normal" />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            placeholder={editingUser ? 'Leave blank to keep existing' : ''}
          />
          <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} margin="normal" />
          <TextField
            fullWidth
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            margin="normal"
          >
            {roles.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </TextField>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Page Access:</strong></p>
            {pages.map(page => (
              <FormControlLabel
                key={page}
                control={
                  <Checkbox
                    checked={formData.access.includes(page)}
                    onChange={() => handleCheckboxChange(page)}
                  />
                }
                label={page}
              />
            ))}
          </div>
          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserManagement;
