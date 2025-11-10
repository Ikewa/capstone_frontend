/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Stack,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

const CropRecommendationRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Image upload states
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    location: '',
    soilType: 'Not Sure',
    season: 'Rainy Season',
    landSize: '',
    landSizeUnit: 'Hectares',
    previousCrops: '',
    challenges: '',
    additionalInfo: ''
  });

  const soilTypes = [
    'Sandy',
    'Clay',
    'Loam',
    'Silt',
    'Peat',
    'Chalk',
    'Not Sure'
  ];

  const seasons = [
    'Dry Season',
    'Rainy Season',
    'All Year'
  ];

  const landSizeUnits = [
    'Hectares',
    'Acres',
    'Square Meters'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedImages.length > 5) {
      showToast('You can upload maximum 5 images', 'warning');
      return;
    }

    // Validate file sizes
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      showToast('Each image must be less than 5MB', 'warning');
      return;
    }

    // Add files and create previews
    setSelectedImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images to server
  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    try {
      setUploadingImages(true);
      const formData = new FormData();
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/crop-requests/upload-images',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      showToast('Failed to upload images', 'error');
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.location.trim()) {
      const msg = 'Please enter your location';
      setError(msg);
      showToast(msg, 'warning');
      setLoading(false);
      return;
    }

    if (!formData.landSize || parseFloat(formData.landSize) <= 0) {
      const msg = 'Please enter a valid land size';
      setError(msg);
      showToast(msg, 'warning');
      setLoading(false);
      return;
    }

    if (!formData.challenges.trim()) {
      const msg = 'Please describe your farming challenges';
      setError(msg);
      showToast(msg, 'warning');
      setLoading(false);
      return;
    }

    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages();

      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/crop-requests',
        {
          ...formData,
          landSize: parseFloat(formData.landSize),
          images: uploadedImageUrls
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const successMsg = 'Request submitted successfully! An officer will review it soon. 🌾';
      setSuccess(successMsg);
      showToast(successMsg, 'success');
      
      // Reset form
      setFormData({
        location: '',
        soilType: 'Not Sure',
        season: 'Rainy Season',
        landSize: '',
        landSizeUnit: 'Hectares',
        previousCrops: '',
        challenges: '',
        additionalInfo: ''
      });
      setSelectedImages([]);
      setImagePreviews([]);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/my-crop-requests');
      }, 2000);

    } catch (err: any) {
      console.error('Error submitting request:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit request. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{ mb: 2 }}
          >
            BACK TO HOME
          </Button>

          {/* Header */}
          <Paper elevation={2} sx={{ p: 4, mb: 3, backgroundColor: '#2e7d32', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AgricultureIcon sx={{ fontSize: 48, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Request Crop Recommendations
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                  Get expert advice from extension officers on the best crops for your farm
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Paper elevation={2} sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Location */}
                <TextField
                  fullWidth
                  label="Location / Region"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Kano State, Kaduna LGA"
                  helperText="Enter your farm location or region"
                />

                {/* Soil Type and Season (Side by Side) */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Soil Type</InputLabel>
                    <Select
                      name="soilType"
                      value={formData.soilType}
                      onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                      label="Soil Type"
                    >
                      {soilTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Planting Season</InputLabel>
                    <Select
                      name="season"
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      label="Planting Season"
                    >
                      {seasons.map((season) => (
                        <MenuItem key={season} value={season}>
                          {season}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Land Size and Unit (Side by Side) */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Land Size"
                    name="landSize"
                    type="number"
                    value={formData.landSize}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0, step: 0.1 }}
                    helperText="Enter the size of your farmland"
                  />

                  <FormControl fullWidth>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      name="landSizeUnit"
                      value={formData.landSizeUnit}
                      onChange={(e) => setFormData({ ...formData, landSizeUnit: e.target.value })}
                      label="Unit"
                    >
                      {landSizeUnits.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Previous Crops */}
                <TextField
                  fullWidth
                  label="Previous Crops (Optional)"
                  name="previousCrops"
                  value={formData.previousCrops}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="e.g., Maize, Rice, Cassava"
                  helperText="What crops have you grown before on this land?"
                />

                {/* Challenges */}
                <TextField
                  fullWidth
                  label="Farming Challenges"
                  name="challenges"
                  value={formData.challenges}
                  onChange={handleChange}
                  required
                  multiline
                  rows={3}
                  placeholder="Describe any challenges you're facing (pests, diseases, poor yields, water shortage, etc.)"
                  helperText="This helps officers provide better recommendations"
                />

                {/* Additional Info */}
                <TextField
                  fullWidth
                  label="Additional Information (Optional)"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Any other information that might help (market access, irrigation, budget, etc.)"
                />

                {/* ✅ NEW: Image Upload Section */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📸 Upload Photos (Optional)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload photos of your crops, farm, or any problems you're facing. This helps officers provide better advice. (Max 5 images, 5MB each)
                  </Typography>

                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="crop-images-upload"
                    type="file"
                    multiple
                    onChange={handleImageSelect}
                  />
                  <label htmlFor="crop-images-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      disabled={selectedImages.length >= 5}
                      fullWidth
                    >
                      {selectedImages.length === 0 ? 'Add Photos' : `Add More Photos (${selectedImages.length}/5)`}
                    </Button>
                  </label>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <ImageList sx={{ mt: 2 }} cols={3} rowHeight={164}>
                      {imagePreviews.map((preview, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            loading="lazy"
                            style={{ objectFit: 'cover', height: '100%' }}
                          />
                          <ImageListItemBar
                            actionIcon={
                              <IconButton
                                sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                onClick={() => handleRemoveImage(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  )}
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading || uploadingImages}
                  endIcon={
                    (loading || uploadingImages) ? 
                    <CircularProgress size={20} color="inherit" /> : 
                    <SendIcon />
                  }
                  sx={{
                    backgroundColor: '#2e7d32',
                    '&:hover': { backgroundColor: '#1b5e20' },
                    py: 1.5
                  }}
                >
                  {uploadingImages ? 'Uploading Images...' : loading ? 'Submitting...' : 'Submit Request'}
                </Button>

                {/* View My Requests Link */}
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate('/my-crop-requests')}
                  sx={{ color: '#2e7d32' }}
                >
                  View My Previous Requests
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default CropRecommendationRequestPage;