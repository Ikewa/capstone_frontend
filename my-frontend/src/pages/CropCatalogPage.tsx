/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Grid,
  Checkbox,
  Fab,
  Badge,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import TerrainIcon from '@mui/icons-material/Terrain';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

const CropCatalogPage = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Comparison state
  const [selectedCrops, setSelectedCrops] = useState<number[]>([]);

  const seasons = ['All', 'Wet Season', 'Dry Season', 'All Year'];

  useEffect(() => {
    fetchCrops();
  }, [seasonFilter]);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      if (seasonFilter !== 'All') {
        params.append('season', seasonFilter);
      }

      const response = await axios.get(
        `/api/crop-catalog/recommendations?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Crops loaded:', response.data);
      
      const cropsData = response.data.recommendations || response.data.crops || [];
      setCrops(cropsData);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading crops:', err);
      setError('Failed to load crop recommendations');
      showToast('Failed to load crops', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter((crop) =>
    crop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle crop selection for comparison
  const handleSelectCrop = (cropId: number) => {
    setSelectedCrops(prev => {
      if (prev.includes(cropId)) {
        return prev.filter(id => id !== cropId);
      } else {
        if (prev.length >= 4) {
          showToast('You can compare up to 4 crops at a time', 'warning');
          return prev;
        }
        return [...prev, cropId];
      }
    });
  };

  // Navigate to comparison page
  const handleCompare = () => {
    if (selectedCrops.length < 2) {
      showToast('Please select at least 2 crops to compare', 'warning');
      return;
    }
    navigate(`/crop-comparison?ids=${selectedCrops.join(',')}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 4,
              p: 3,
              backgroundColor: '#2e7d32',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <AgricultureIcon sx={{ fontSize: 48, mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Crop Recommendations Catalog
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                Browse crops suitable for your region and season
              </Typography>
            </Box>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Comparison Mode Info */}
          {selectedCrops.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>{selectedCrops.length} crop{selectedCrops.length !== 1 ? 's' : ''} selected for comparison.</strong>
              {' '}Select at least 2 crops to compare (max 4).
            </Alert>
          )}

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="Search Crops"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Maize, Rice, Tomato"
                />
                <TextField
                  fullWidth
                  select
                  label="Filter by Season"
                  value={seasonFilter}
                  onChange={(e) => setSeasonFilter(e.target.value)}
                >
                  {seasons.map((season) => (
                    <MenuItem key={season} value={season}>
                      {season}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </CardContent>
          </Card>

          {/* Results Count */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} found
          </Typography>

          {/* Crops List */}
          {filteredCrops.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <AgricultureIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No crops found for selected filters
              </Typography>
              <Button
                variant="text"
                onClick={() => {
                  setSeasonFilter('All');
                  setSearchQuery('');
                }}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredCrops.map((crop) => (
                <Grid item xs={12} md={6} key={crop.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      border: selectedCrops.includes(crop.id) ? 3 : 0,
                      borderColor: 'primary.main',
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    {/* Comparison Checkbox */}
                    <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                      <Checkbox
                        checked={selectedCrops.includes(crop.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectCrop(crop.id);
                        }}
                        sx={{ 
                          bgcolor: 'white', 
                          borderRadius: 1,
                          boxShadow: 2,
                          '&:hover': { bgcolor: 'grey.100' }
                        }}
                      />
                    </Box>

                    <CardContent onClick={() => navigate(`/crop-catalog/${crop.id}`)}>
                      {/* Crop Name */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AgricultureIcon sx={{ color: '#2e7d32', mr: 1, fontSize: 32 }} />
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {crop.name}
                        </Typography>
                      </Box>

                      {crop.scientific_name && (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mb: 2 }}>
                          {crop.scientific_name}
                        </Typography>
                      )}

                      <Divider sx={{ mb: 2 }} />

                      {/* Season & Category */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {crop.season && (
                          <Chip
                            icon={<WbSunnyIcon />}
                            label={crop.season}
                            size="small"
                            sx={{ backgroundColor: '#fff3e0', color: '#e65100' }}
                          />
                        )}
                        {crop.category && (
                          <Chip
                            label={crop.category}
                            size="small"
                            color="primary"
                          />
                        )}
                        {crop.difficulty_level && (
                          <Chip
                            label={crop.difficulty_level}
                            size="small"
                            color={
                              crop.difficulty_level === 'Easy' ? 'success' :
                              crop.difficulty_level === 'Medium' ? 'warning' : 'error'
                            }
                          />
                        )}
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {crop.description?.substring(0, 150)}...
                      </Typography>

                      {/* Quick Info */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {crop.soil_type && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TerrainIcon sx={{ color: '#795548', mr: 1, fontSize: 20 }} />
                            <Typography variant="body2">
                              <strong>Soil:</strong> {crop.soil_type}
                            </Typography>
                          </Box>
                        )}

                        {crop.growing_duration && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ color: '#4caf50', mr: 1, fontSize: 20 }} />
                            <Typography variant="body2">
                              <strong>Duration:</strong> {crop.growing_duration} days
                            </Typography>
                          </Box>
                        )}

                        {crop.water_requirement && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WaterDropIcon sx={{ color: '#2196f3', mr: 1, fontSize: 20 }} />
                            <Typography variant="body2">
                              <strong>Water:</strong> {crop.water_requirement}
                            </Typography>
                          </Box>
                        )}

                        {crop.average_yield && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUpIcon sx={{ color: '#4caf50', mr: 1, fontSize: 20 }} />
                            <Typography variant="body2">
                              <strong>Yield:</strong> {crop.average_yield}
                            </Typography>
                          </Box>
                        )}

                        {crop.market_value && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoneyIcon sx={{ color: '#4caf50', mr: 1, fontSize: 20 }} />
                            <Typography variant="body2">
                              <strong>Market Value:</strong> {crop.market_value}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Growing Tips */}
                      {crop.growing_tips && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
                            💡 Growing Tips:
                          </Typography>
                          <Typography variant="body2">
                            {crop.growing_tips.substring(0, 100)}...
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* HOW TO USE COMPARISON GUIDE */}
          <Card sx={{ mt: 6, p: 4, bgcolor: 'info.light', borderLeft: 4, borderColor: 'info.main' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CompareArrowsIcon fontSize="large" />
              How to Compare Crops
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    1
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Select Crops
                    </Typography>
                    <Typography variant="body2">
                      Click the checkbox ☑️ in the top-right corner of any crop card to select it for comparison.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    2
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Choose 2-4 Crops
                    </Typography>
                    <Typography variant="body2">
                      Select at least 2 crops (maximum 4) that you want to compare. Selected crops will have a blue border.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    3
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Click Compare
                    </Typography>
                    <Typography variant="body2">
                      A floating "Compare Crops" button will appear at the bottom-right. Click it to see a detailed comparison table.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>💡 Tip:</strong> Comparing crops helps you decide which ones are best for your farm based on yield, difficulty, water needs, and market value!
              </Typography>
            </Alert>
          </Card>

        </Container>
      </Box>

      {/* Floating Compare Button */}
      {selectedCrops.length >= 2 && (
        <Fab
          color="primary"
          variant="extended"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          onClick={handleCompare}
        >
          <Badge badgeContent={selectedCrops.length} color="success" sx={{ mr: 1 }}>
            <CompareArrowsIcon />
          </Badge>
          Compare Crops
        </Fab>
      )}
    </>
  );
};

export default CropCatalogPage;
