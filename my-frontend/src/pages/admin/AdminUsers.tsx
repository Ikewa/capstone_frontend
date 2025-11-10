/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { ToastContext } from '../../context/ToastContext';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  location: string;
  is_admin: boolean;
  created_at: string;
  question_count: number;
  answer_count: number;
  group_count: number;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedUser, setEditedUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    location: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      params.append('page', String(page + 1));
      params.append('limit', String(rowsPerPage));

      const response = await axios.get(
        `http://localhost:5000/api/admin/users?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Users loaded:', response.data);
      setUsers(response.data.users);
      setTotalUsers(response.data.pagination.totalUsers);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEditUser = () => {
    if (selectedUser) {
      setEditedUser({
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email,
        role: selectedUser.role,
        location: selectedUser.location
      });
      setEditDialogOpen(true);
      handleMenuClose();
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:5000/api/admin/users/${selectedUser.id}`,
        editedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('User updated successfully', 'success');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('❌ Error updating user:', err);
      showToast(err.response?.data?.message || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const confirmMsg = `Are you sure you want to delete ${selectedUser.first_name} ${selectedUser.last_name}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/admin/users/${selectedUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('User deleted successfully', 'success');
      handleMenuClose();
      fetchUsers();
    } catch (err: any) {
      console.error('❌ Error deleting user:', err);
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const handleMakeAdmin = async () => {
    if (!selectedUser) return;

    const confirmMsg = `Make ${selectedUser.first_name} ${selectedUser.last_name} an admin?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `http://localhost:5000/api/admin/users/${selectedUser.id}/make-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('User promoted to admin', 'success');
      handleMenuClose();
      fetchUsers();
    } catch (err: any) {
      console.error('❌ Error making admin:', err);
      showToast(err.response?.data?.message || 'Failed to promote user', 'error');
    }
  };

  const handleRemoveAdmin = async () => {
    if (!selectedUser) return;

    const confirmMsg = `Remove admin status from ${selectedUser.first_name} ${selectedUser.last_name}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `http://localhost:5000/api/admin/users/${selectedUser.id}/remove-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Admin status removed', 'success');
      handleMenuClose();
      fetchUsers();
    } catch (err: any) {
      console.error('❌ Error removing admin:', err);
      showToast(err.response?.data?.message || 'Failed to remove admin', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              👥 User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all users in the system
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/admin/create-admin')}
          >
            Create Admin
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3, p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="Farmer">Farmer</MenuItem>
                  <MenuItem value="Extension Officer">Extension Officer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('');
                }}
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Users Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="center">Questions</TableCell>
                  <TableCell align="center">Answers</TableCell>
                  <TableCell align="center">Groups</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.first_name} {user.last_name}
                          </Typography>
                          {user.is_admin && (
                            <Chip
                              label="ADMIN"
                              size="small"
                              color="error"
                              sx={{ height: 18, fontSize: '0.7rem', mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'Extension Officer' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell align="center">{user.question_count}</TableCell>
                    <TableCell align="center">{user.answer_count}</TableCell>
                    <TableCell align="center">{user.group_count}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditUser}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit User
          </MenuItem>
          {selectedUser && !selectedUser.is_admin ? (
            <MenuItem onClick={handleMakeAdmin}>
              <AdminPanelSettingsIcon sx={{ mr: 1 }} fontSize="small" />
              Make Admin
            </MenuItem>
          ) : selectedUser?.is_admin ? (
            <MenuItem onClick={handleRemoveAdmin}>
              <BlockIcon sx={{ mr: 1 }} fontSize="small" />
              Remove Admin
            </MenuItem>
          ) : null}
          <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete User
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="First Name"
                fullWidth
                value={editedUser.first_name}
                onChange={(e) => setEditedUser({ ...editedUser, first_name: e.target.value })}
              />
              <TextField
                label="Last Name"
                fullWidth
                value={editedUser.last_name}
                onChange={(e) => setEditedUser({ ...editedUser, last_name: e.target.value })}
              />
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editedUser.role}
                  label="Role"
                  onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                >
                  <MenuItem value="Farmer">Farmer</MenuItem>
                  <MenuItem value="Extension Officer">Extension Officer</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Location"
                fullWidth
                value={editedUser.location}
                onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminUsers;