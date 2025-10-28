/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface RecommendedCrop {
  cropName: string;
  reason: string;
  plantingTips: string;
  expectedYield: string;
  marketValue: string;
}

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
  status: 'pending' | 'reviewed' | 'responded';
  officer?: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  farmer: {
    _id: string;
    name: string;
    email: string;
  };
  recommendedCrops: RecommendedCrop[];
  officerNotes: string;
  createdAt: string;
  respondedAt?: string;
}

const RequestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<CropRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/crop-requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRequest(response.data);
    } catch (err: any) {
      console.error('Error fetching request:', err);
      setError('Failed to load request details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'responded':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <CircularProgress size={60} sx={{ color: '#2e7d32' }} />
      </Box>
    );
  }

  if (error || !request) {
    return (
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/my-crop-requests')}
            sx={{ mb: 2 }}
          >
            BACK TO REQUESTS
          </Button>
          <Alert severity="error">{error || 'Request not found'}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <>
    <Navbar />
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-crop-requests')}
          sx={{ mb: 2 }}
        >
          BACK TO REQUESTS
        </Button>

        {/* Header with Status */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#2e7d32', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AgricultureIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Crop Recommendation Request
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Request ID: #{String(request._id).padStart(8, '0')}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={request.status === 'responded' ? <CheckCircleIcon /> : <PendingIcon />}
              label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              color={getStatusColor(request.status)}
              sx={{ 
                backgroundColor: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                py: 2.5
              }}
            />
          </Box>
        </Paper>

        {/* Two Column Layout using Flexbox */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left Column - Request Details */}
          <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                Farm Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, color: '#2e7d32' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {request.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Soil Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {request.soilType}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Season
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {request.season}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Land Size
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {request.landSize} {request.landSizeUnit}
                  </Typography>
                </Box>

                {request.previousCrops && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Previous Crops
                    </Typography>
                    <Typography variant="body1">
                      {request.previousCrops}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Challenges
                  </Typography>
                  <Typography variant="body1">
                    {request.challenges}
                  </Typography>
                </Box>

                {request.additionalInfo && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Additional Information
                    </Typography>
                    <Typography variant="body1">
                      {request.additionalInfo}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Request Timeline */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                Request Timeline
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: '#2e7d32' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Submitted
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(request.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {request.respondedAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 1, color: '#4caf50' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Responded
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(request.respondedAt)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>

          {/* Right Column - Officer Response */}
          <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
            {request.status === 'responded' && request.recommendedCrops.length > 0 ? (
              <Stack spacing={3}>
                {/* Officer Info */}
                {request.officer && (
                  <Paper elevation={2} sx={{ p: 3, backgroundColor: '#e8f5e9' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, color: '#2e7d32' }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#2e7d32' }}>
                        Extension Officer
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {request.officer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.officer.email}
                    </Typography>
                    {request.officer.phoneNumber && (
                      <Typography variant="body2" color="text.secondary">
                        {request.officer.phoneNumber}
                      </Typography>
                    )}
                  </Paper>
                )}

                {/* Recommended Crops */}
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                    Recommended Crops
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    {request.recommendedCrops.map((crop, index) => (
                      <Card 
                        key={index} 
                        sx={{ 
                          backgroundColor: '#f1f8f4',
                          border: '2px solid #4caf50'
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                            {crop.cropName}
                          </Typography>

                          <Stack spacing={2}>
                            {crop.reason && (
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Why this crop?
                                </Typography>
                                <Typography variant="body2">
                                  {crop.reason}
                                </Typography>
                              </Box>
                            )}

                            {crop.plantingTips && (
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Planting Tips
                                </Typography>
                                <Typography variant="body2">
                                  {crop.plantingTips}
                                </Typography>
                              </Box>
                            )}

                            {crop.expectedYield && (
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Expected Yield
                                </Typography>
                                <Typography variant="body2">
                                  {crop.expectedYield}
                                </Typography>
                              </Box>
                            )}

                            {crop.marketValue && (
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Market Value
                                </Typography>
                                <Typography variant="body2">
                                  {crop.marketValue}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Paper>

                {/* Officer Notes */}
                {request.officerNotes && (
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                      Additional Notes from Officer
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {request.officerNotes}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            ) : (
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                <PendingIcon sx={{ fontSize: 80, color: '#ffa726', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Waiting for Officer Response
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  An extension officer will review your request and provide recommendations soon.
                  You'll be notified when they respond.
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
    </>
  );
};

export default RequestDetailPage;