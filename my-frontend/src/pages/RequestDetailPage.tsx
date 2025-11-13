/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';
import axios from 'axios';

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
  images?: string[];
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
  const { showToast } = useContext(ToastContext);

  const [request, setRequest] = useState<CropRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Officer response form state
  const [recommendedCrops, setRecommendedCrops] = useState<RecommendedCrop[]>([
    { cropName: '', reason: '', plantingTips: '', expectedYield: '', marketValue: '' }
  ]);
  const [officerNotes, setOfficerNotes] = useState('');

  // Get current user
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isOfficer = currentUser?.role === 'Extension Officer' || currentUser?.role === 'officer' || currentUser?.role === 'admin';

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/crop-requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('✅ Request details:', response.data);
      setRequest(response.data);
    } catch (err: any) {
      console.error('Error fetching request:', err);
      setError('Failed to load request details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCrop = () => {
    setRecommendedCrops([
      ...recommendedCrops,
      { cropName: '', reason: '', plantingTips: '', expectedYield: '', marketValue: '' }
    ]);
  };

  const handleRemoveCrop = (index: number) => {
    if (recommendedCrops.length > 1) {
      setRecommendedCrops(recommendedCrops.filter((_, i) => i !== index));
    }
  };

  const handleCropChange = (index: number, field: keyof RecommendedCrop, value: string) => {
    const updated = [...recommendedCrops];
    updated[index][field] = value;
    setRecommendedCrops(updated);
  };

  const handleSubmitRecommendation = async () => {
    try {
      // Validation
      const validCrops = recommendedCrops.filter(crop => crop.cropName.trim());
      if (validCrops.length === 0) {
        showToast('Please add at least one crop recommendation', 'error');
        return;
      }

      setSubmitting(true);
      const token = localStorage.getItem('token');

      await axios.post(
        `/api/crop-requests/${id}/respond`,
        {
          recommendedCrops: validCrops,
          officerNotes
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast('Recommendation submitted successfully!', 'success');
      fetchRequestDetails(); // Refresh to show updated status
    } catch (err: any) {
      console.error('❌ Error submitting recommendation:', err);
      showToast('Failed to submit recommendation', 'error');
    } finally {
      setSubmitting(false);
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
      <>
        <Navbar />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f8f9fa'
        }}>
          <CircularProgress size={60} sx={{ color: '#2e7d32' }} />
        </Box>
      </>
    );
  }

  if (error || !request) {
    return (
      <>
        <Navbar />
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="lg">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ mb: 2 }}
            >
              BACK TO REQUESTS
            </Button>
            <Alert severity="error">{error || 'Request not found'}</Alert>
          </Container>
        </Box>
      </>
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
            onClick={() => navigate(-1)}
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
                  🌾 Farm Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Farmer Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ color: '#2e7d32' }} />
                  <Typography variant="h6" fontWeight="bold">
                    {request.farmer.name}
                  </Typography>
                </Box>

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
                      🚨 Challenges
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1, mt: 1 }}>
                      <Typography variant="body1">
                        {request.challenges}
                      </Typography>
                    </Box>
                  </Box>

                  {request.additionalInfo && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        ℹ️ Additional Information
                      </Typography>
                      <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, mt: 1 }}>
                        <Typography variant="body1">
                          {request.additionalInfo}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Contact Info */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contact Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📧 {request.farmer.email}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Field Photos */}
              {request.images && request.images.length > 0 && (
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                    📷 Field Photos ({request.images.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {request.images.map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <CardMedia
                          component="img"
                          image={image}
                          alt={`Field photo ${index + 1}`}
                          sx={{
                            height: 150,
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
                </Paper>
              )}

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

            {/* Right Column - Officer Response/Recommendations */}
            <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
              {/* FARMER VIEW - Show waiting or recommendations */}
              {!isOfficer ? (
                <>
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
                          ✅ Recommended Crops
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
                </>
              ) : (
                /* OFFICER VIEW - Show response form or submitted recommendations */
                <>
                  {request.status === 'pending' ? (
                    <Paper elevation={2} sx={{ p: 3 }}>
                      {/* Officer Response Form */}
                      <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 2 }}>
                        📝 Provide Recommendations
                      </Typography>

                      <Stack spacing={3}>
                        {/* Crop Recommendations */}
                        {recommendedCrops.map((crop, index) => (
                          <Card key={index} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Crop {index + 1}
                              </Typography>
                              {recommendedCrops.length > 1 && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveCrop(index)}
                                  sx={{ color: 'red' }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>

                            <TextField
                              fullWidth
                              label="Crop Name"
                              value={crop.cropName}
                              onChange={(e) => handleCropChange(index, 'cropName', e.target.value)}
                              sx={{ mb: 2 }}
                              required
                            />

                            <TextField
                              fullWidth
                              label="Why this crop?"
                              value={crop.reason}
                              onChange={(e) => handleCropChange(index, 'reason', e.target.value)}
                              multiline
                              rows={2}
                              sx={{ mb: 2 }}
                            />

                            <TextField
                              fullWidth
                              label="Planting Tips"
                              value={crop.plantingTips}
                              onChange={(e) => handleCropChange(index, 'plantingTips', e.target.value)}
                              multiline
                              rows={2}
                              sx={{ mb: 2 }}
                            />

                            <TextField
                              fullWidth
                              label="Expected Yield"
                              value={crop.expectedYield}
                              onChange={(e) => handleCropChange(index, 'expectedYield', e.target.value)}
                              sx={{ mb: 2 }}
                            />

                            <TextField
                              fullWidth
                              label="Market Value/Price"
                              value={crop.marketValue}
                              onChange={(e) => handleCropChange(index, 'marketValue', e.target.value)}
                            />
                          </Card>
                        ))}

                        <Button
                          startIcon={<AddIcon />}
                          onClick={handleAddCrop}
                          variant="outlined"
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          Add Another Crop
                        </Button>

                        {/* Officer Notes */}
                        <TextField
                          fullWidth
                          label="Additional Notes (Optional)"
                          value={officerNotes}
                          onChange={(e) => setOfficerNotes(e.target.value)}
                          multiline
                          rows={3}
                          placeholder="Any additional advice or notes for the farmer..."
                        />

                        {/* Submit Button */}
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<SaveIcon />}
                          onClick={handleSubmitRecommendation}
                          disabled={submitting}
                          sx={{
                            backgroundColor: '#2e7d32',
                            '&:hover': { backgroundColor: '#1b5e20' }
                          }}
                        >
                          {submitting ? <CircularProgress size={20} /> : 'Submit Recommendations'}
                        </Button>
                      </Stack>
                    </Paper>
                  ) : (
                    /* Officer view of submitted recommendations */
                    <Stack spacing={3}>
                      <Paper elevation={2} sx={{ p: 3, backgroundColor: '#e8f5e9' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                          ✅ Your Recommendations (Submitted)
                        </Typography>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          Recommendations submitted successfully!
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.respondedAt && formatDate(request.respondedAt)}
                        </Typography>
                      </Paper>

                      {/* Show submitted recommendations */}
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

                                <Stack spacing={1}>
                                  {crop.reason && (
                                    <Typography variant="body2">
                                      <strong>Why:</strong> {crop.reason}
                                    </Typography>
                                  )}
                                  {crop.plantingTips && (
                                    <Typography variant="body2">
                                      <strong>Tips:</strong> {crop.plantingTips}
                                    </Typography>
                                  )}
                                  {crop.expectedYield && (
                                    <Typography variant="body2">
                                      <strong>Expected Yield:</strong> {crop.expectedYield}
                                    </Typography>
                                  )}
                                  {crop.marketValue && (
                                    <Typography variant="body2">
                                      <strong>Market Value:</strong> {crop.marketValue}
                                    </Typography>
                                  )}
                                </Stack>
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      </Paper>

                      {request.officerNotes && (
                        <Paper elevation={2} sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                            Your Additional Notes
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body1">
                            {request.officerNotes}
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default RequestDetailPage;
