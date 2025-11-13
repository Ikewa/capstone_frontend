/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import Navbar from '../components/Navbar';
import axios from 'axios';

interface CropRequest {
  _id: string;
  location: string;
  soilType: string;
  season: string;
  landSize: number;
  landSizeUnit: string;
  challenges: string;
  images?: string[];
  status: 'pending' | 'reviewed' | 'responded';
  officer?: {
    name: string;
    email: string;
  };
  createdAt: string;
  respondedAt?: string;
}

const MyCropRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CropRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CropRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, sortBy, requests]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/crop-requests/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ My requests:', response.data);
      setRequests(response.data.requests || []);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.challenges.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.soilType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'responded':
        filtered.sort((a, b) => {
          if (a.status === 'responded' && b.status !== 'responded') return -1;
          if (a.status !== 'responded' && b.status === 'responded') return 1;
          return 0;
        });
        break;
    }

    setFilteredRequests(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'responded': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <PendingIcon fontSize="small" />;
      case 'responded': return <CheckCircleIcon fontSize="small" />;
      default: return <PendingIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress size={60} sx={{ color: '#2e7d32' }} />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#2e7d32', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AgricultureIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    My Crop Recommendations
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, opacity: 0.9 }}>
                    Track your requests and view recommendations from extension officers
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/crop-recommendations')}
                sx={{
                  backgroundColor: 'white',
                  color: '#2e7d32',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                New Request
              </Button>
            </Box>
          </Paper>

          {/* Search and Filters */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Stack spacing={2}>
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search by location, challenges, or soil type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#2e7d32' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#2e7d32',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2e7d32',
                    },
                  },
                }}
              />

              {/* Filters Row */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FilterListIcon sx={{ color: '#2e7d32' }} />

                {/* Status Filter */}
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Filter by Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="reviewed">Reviewed</MenuItem>
                    <MenuItem value="responded">Responded</MenuItem>
                  </Select>
                </FormControl>

                {/* Sort By */}
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="responded">Responded First</MenuItem>
                  </Select>
                </FormControl>

                {/* Results Count */}
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                  Showing {filteredRequests.length} of {requests.length} requests
                </Typography>
              </Box>

              {/* Active Filters Display */}
              {(searchQuery || statusFilter !== 'all') && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Active filters:
                  </Typography>
                  {searchQuery && (
                    <Chip
                      label={`Search: "${searchQuery}"`}
                      onDelete={() => setSearchQuery('')}
                      size="small"
                      color="primary"
                    />
                  )}
                  {statusFilter !== 'all' && (
                    <Chip
                      label={`Status: ${statusFilter}`}
                      onDelete={() => setStatusFilter('all')}
                      size="small"
                      color="primary"
                    />
                  )}
                  <Button
                    size="small"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSortBy('newest');
                    }}
                  >
                    Clear All
                  </Button>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
              <AgricultureIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery || statusFilter !== 'all' 
                  ? 'No requests match your filters'
                  : 'No crop requests yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Request expert advice on the best crops for your farm'}
              </Typography>
              {(searchQuery || statusFilter !== 'all') ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  sx={{ color: '#2e7d32', borderColor: '#2e7d32' }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/crop-recommendations')}
                  sx={{
                    backgroundColor: '#2e7d32',
                    '&:hover': { backgroundColor: '#1b5e20' }
                  }}
                >
                  Create First Request
                </Button>
              )}
            </Paper>
          ) : (
            <Stack spacing={2}>
              {filteredRequests.map((request) => (
                <Card
                  key={request._id}
                  elevation={2}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 },
                    transition: 'box-shadow 0.3s',
                    borderLeft: request.status === 'responded' ? '4px solid #2e7d32' : '4px solid #ed6c02'
                  }}
                  onClick={() => navigate(`/crop-requests/${request._id}`)}
                >
                  <CardContent>
                    <Grid container spacing={3}>
                      {/* Left: Request Details */}
                      <Grid item xs={12} md={request.images && request.images.length > 0 ? 8 : 12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationOnIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                              <Typography variant="h6" fontWeight="bold">
                                {request.location}
                              </Typography>
                              <Chip
                                icon={getStatusIcon(request.status)}
                                label={request.status.toUpperCase()}
                                color={getStatusColor(request.status) as any}
                                size="small"
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {request.challenges}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                              <Chip
                                label={`${request.soilType} Soil`}
                                size="small"
                                sx={{ backgroundColor: '#e8f5e9' }}
                              />
                              <Chip
                                label={request.season}
                                size="small"
                                sx={{ backgroundColor: '#e3f2fd' }}
                              />
                              <Chip
                                label={`${request.landSize} ${request.landSizeUnit}`}
                                size="small"
                                sx={{ backgroundColor: '#fff3e0' }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Submitted: {formatDate(request.createdAt)}
                            </Typography>
                          </Box>
                          
                          {request.status === 'responded' && request.officer && (
                            <Typography variant="caption" color="success.main" fontWeight="medium">
                              ✓ Responded by {request.officer.name}
                            </Typography>
                          )}
                          
                          {request.status === 'pending' && (
                            <Typography variant="caption" color="warning.main" fontWeight="medium">
                              ⏳ Awaiting officer response
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      {/* Right: Images */}
                      {request.images && request.images.length > 0 && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            📷 Field Photos ({request.images.length})
                          </Typography>
                          <Grid container spacing={1}>
                            {request.images.slice(0, 4).map((image, index) => (
                              <Grid item xs={6} key={index}>
                                <CardMedia
                                  component="img"
                                  image={image}
                                  alt={`Field photo ${index + 1}`}
                                  sx={{
                                    height: 100,
                                    borderRadius: 1,
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(image, '_blank');
                                  }}
                                />
                              </Grid>
                            ))}
                          </Grid>
                          {request.images.length > 4 && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              +{request.images.length - 4} more photos
                            </Typography>
                          )}
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Container>
      </Box>
    </>
  );
};

export default MyCropRequestsPage;
