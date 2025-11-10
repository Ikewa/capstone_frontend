/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Grid,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import Navbar from '../components/Navbar';
import axios from 'axios';

interface CropRequest {
  _id: string;
  location: string;
  soilType: string;
  season: string;
  landSize: number;
  landSizeUnit: string;
  previousCrops: string;
  challenges: string;
  additionalInfo: string;
  images?: string[];
  farmer: {
    name: string;
    email: string;
    phoneNumber: string;
    location: string;
  };
  createdAt: string;
}

const OfficerCropRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CropRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CropRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, requests]);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching pending requests...');

      const response = await axios.get(
        'http://localhost:5000/api/crop-requests/pending/all',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Pending requests:', response.data);
      setRequests(response.data.requests || []);
    } catch (err: any) {
      console.error('❌ Error fetching requests:', err);
      if (err.response?.status === 403) {
        setError('Only Extension Officers can view crop requests');
      } else {
        setError('Failed to load crop requests. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.challenges.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.soilType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.farmer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
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
                    Pending Crop Requests
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, opacity: 0.9 }}>
                    Review and respond to farmer requests
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${requests.length} Pending`}
                sx={{
                  bgcolor: 'white',
                  color: '#2e7d32',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  px: 2,
                  py: 3,
                }}
              />
            </Box>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Search */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by farmer name, location, challenges, or soil type..."
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Showing {filteredRequests.length} of {requests.length} requests
            </Typography>
          </Paper>

          {/* Requests List */}
          {requests.length === 0 ? (
            <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
              <AgricultureIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No crop requests yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Farmer requests will appear here
              </Typography>
            </Paper>
          ) : filteredRequests.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No requests match your search
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={3}>
              {filteredRequests.map((request) => (
                <Card
                  key={request._id}
                  elevation={2}
                  sx={{
                    '&:hover': { boxShadow: 6 },
                    transition: 'box-shadow 0.3s'
                  }}
                >
                  <CardContent>
                    <Grid container spacing={3}>
                      {/* Left: Request Details */}
                      <Grid item xs={12} md={request.images && request.images.length > 0 ? 8 : 12}>
                        {/* Farmer Info */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonIcon sx={{ color: '#2e7d32' }} />
                            <Typography variant="h6" fontWeight="bold">
                              {request.farmer.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<LocationOnIcon />}
                              label={request.location}
                              size="small"
                            />
                            <Chip
                              icon={<AgricultureIcon />}
                              label={request.soilType}
                              size="small"
                              color="secondary"
                            />
                            <Chip
                              icon={<CalendarTodayIcon />}
                              label={request.season}
                              size="small"
                              color="primary"
                            />
                          </Box>
                        </Box>

                        {/* Land Info */}
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Land Size:</strong> {request.landSize} {request.landSizeUnit}
                        </Typography>

                        {request.previousCrops && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Previous Crops:</strong> {request.previousCrops}
                          </Typography>
                        )}

                        {/* Challenges */}
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            🚨 Challenges:
                          </Typography>
                          <Typography variant="body2">{request.challenges}</Typography>
                        </Box>

                        {request.additionalInfo && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              ℹ️ Additional Info:
                            </Typography>
                            <Typography variant="body2">{request.additionalInfo}</Typography>
                          </Box>
                        )}

                        {/* Contact Info */}
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            📧 {request.farmer.email}
                          </Typography>
                          {request.farmer.phoneNumber && (
                            <Typography variant="body2" color="text.secondary">
                              📱 {request.farmer.phoneNumber}
                            </Typography>
                          )}
                        </Box>

                        {/* Submit Date */}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                          Submitted: {formatDate(request.createdAt)}
                        </Typography>
                      </Grid>

                      {/* Right: Images */}
                      {request.images && request.images.length > 0 && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            📷 Field Photos ({request.images.length})
                          </Typography>
                          <Grid container spacing={1}>
                            {request.images.map((image, index) => (
                              <Grid item xs={6} key={index}>
                                <CardMedia
                                  component="img"
                                  image={image}
                                  alt={`Field photo ${index + 1}`}
                                  sx={{
                                    height: 120,
                                    borderRadius: 1,
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 },
                                  }}
                                  onClick={() => window.open(image, '_blank')}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                      )}
                    </Grid>

                    {/* Action Button */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate(`/crop-requests/${request._id}`)}
                        sx={{
                          backgroundColor: '#2e7d32',
                          '&:hover': { backgroundColor: '#1b5e20' }
                        }}
                      >
                        Provide Recommendation →
                      </Button>
                    </Box>
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

export default OfficerCropRequestsPage;