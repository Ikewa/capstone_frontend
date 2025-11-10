/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
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
  Alert,
  CircularProgress,
  Avatar,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import GrassIcon from '@mui/icons-material/Grass';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { ToastContext } from '../../context/ToastContext';

interface Crop {
  id: number;
  name: string;
  category: string;
  season: string;
  description: string;
  image_url: string;
  created_at: string;
}

const AdminCropCatalog = () => {
  const { showToast } = useContext(ToastContext);

  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/crop-catalog', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Crops loaded:', response.data);
      setCrops(response.data.crops || []);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading crops:', err);
      setError('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, crop: Crop) => {
    setAnchorEl(event.currentTarget);
    setSelectedCrop(crop);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCrop(null);
  };

  const handleDeleteCrop = async () => {
    if (!selectedCrop) return;

    const confirmMsg = `Are you sure you want to delete: "${selectedCrop.name}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/admin/crops/${selectedCrop.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Crop deleted successfully', 'success');
      handleMenuClose();
      fetchCrops();
    } catch (err: any) {
      console.error('❌ Error deleting crop:', err);
      showToast(err.response?.data?.message || 'Failed to delete crop', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCrops = crops.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.season.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedCrops = filteredCrops.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
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
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          🌾 Crop Catalog Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage crop information and recommendations
        </Typography>

        <Card sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search crops by name, category, or season..."
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
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ p: 2, flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {crops.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Crops
            </Typography>
          </Card>
          <Card sx={{ p: 2, flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {[...new Set(crops.map(c => c.category))].length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Categories
            </Typography>
          </Card>
        </Box>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Crop</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Season</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Added</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCrops.map((crop) => (
                  <TableRow key={crop.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <GrassIcon />
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">
                          {crop.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={crop.category} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Chip label={crop.season} size="small" color="warning" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {crop.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(crop.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, crop)}>
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
            count={filteredCrops.length}
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

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit Crop
          </MenuItem>
          <MenuItem onClick={handleDeleteCrop} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete Crop
          </MenuItem>
        </Menu>
      </Box>
    </AdminLayout>
  );
};

export default AdminCropCatalog;