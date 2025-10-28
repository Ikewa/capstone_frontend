/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
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
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import TerrainIcon from '@mui/icons-material/Terrain';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

const CropCatalogPage = () => {
  const { showToast } = useContext(ToastContext);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const seasons = ['All', 'Rainy Season', 'Dry Season', 'All Year'];

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
        `http://localhost:5000/api/crop-catalog/recommendations?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Crops loaded:', response.data);
      setCrops(response.data.crops);
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
    crop.crop_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {filteredCrops.map((crop) => (
                <Card
                  key={crop.id}
                  sx={{
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                      
                      {/* Left Side - Main Info */}
                      <Box sx={{ flex: 1 }}>
                        {/* Crop Name */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <AgricultureIcon sx={{ color: '#2e7d32', mr: 1, fontSize: 32 }} />
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {crop.crop_name}
                          </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Season */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <WbSunnyIcon sx={{ color: '#ff9800', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Best Season:
                          </Typography>
                          <Chip
                            label={crop.best_seasons}
                            size="small"
                            sx={{ backgroundColor: '#fff3e0', color: '#e65100' }}
                          />
                        </Box>

                        {/* Soil Types */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <TerrainIcon sx={{ color: '#795548', mr: 1, mt: 0.5 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Suitable Soil Types:
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {crop.soil_types}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Expected Yield */}
                        {crop.expected_yield && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TrendingUpIcon sx={{ color: '#4caf50', mr: 1 }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Expected Yield:
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {crop.expected_yield}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Right Side - Tips & Market */}
                      <Box sx={{ flex: 1 }}>
                        {/* Planting Tips */}
                        {crop.planting_tips && (
                          <Box sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="primary"
                              sx={{ mb: 1 }}
                            >
                              🌱 Planting Tips:
                            </Typography>
                            <Typography variant="body2">{crop.planting_tips}</Typography>
                          </Box>
                        )}

                        {/* Market Info */}
                        {crop.market_info && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, backgroundColor: '#f1f8e9', borderRadius: 1 }}>
                            <AttachMoneyIcon sx={{ color: '#4caf50', mr: 1, mt: 0.5 }} />
                            <Box>
                              <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
                                💰 Market Info:
                              </Typography>
                              <Typography variant="body2">{crop.market_info}</Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default CropCatalogPage;