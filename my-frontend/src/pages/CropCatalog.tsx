/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Checkbox,
  Fab,
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GrassIcon from '@mui/icons-material/Grass';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Crop {
  id: number;
  name: string;
  scientific_name: string;
  category: string;
  season: string;
  description: string;
  growing_duration: number;
  water_requirement: string;
  difficulty_level: string;
  average_yield: string;
  market_value: string;
  image_url: string;
}

const CropCatalog = () => {
  const navigate = useNavigate();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');

  const [recommendations, setRecommendations] = useState<Crop[]>([]);
  const [userLocation, setUserLocation] = useState('');

  // NEW: Comparison state
  const [selectedCrops, setSelectedCrops] = useState<number[]>([]);

  useEffect(() => {
    fetchCrops();
    
    // Get user location from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserLocation(user.location || '');
  }, []);

  useEffect(() => {
    if (crops.length > 0) {
      generateRecommendations();
    }
  }, [crops]);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('/api/crop-catalog', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Crops loaded:', response.data);
      setCrops(response.data.crops || []);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading crops:', err);
      setError('Failed to load crop catalog');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = () => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    // Determine current season based on month (Nigeria)
    let currentSeason = '';
    if (currentMonth >= 4 && currentMonth <= 10) {
      currentSeason = 'Wet Season';
    } else {
      currentSeason = 'Dry Season';
    }

    console.log('🌟 Generating recommendations for season:', currentSeason);

    // Filter crops by current season
    const seasonalCrops = crops.filter(crop => 
      crop.season === currentSeason || crop.season === 'All Year'
    );

    // Prioritize easy crops for beginners
    const recommended = seasonalCrops
      .sort((a, b) => {
        // Sort by difficulty (Easy first)
        if (a.difficulty_level === 'Easy' && b.difficulty_level !== 'Easy') return -1;
        if (a.difficulty_level !== 'Easy' && b.difficulty_level === 'Easy') return 1;
        return 0;
      })
      .slice(0, 3);

    console.log('✅ Recommendations:', recommended);
    setRecommendations(recommended);
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         crop.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || crop.category === categoryFilter;
    const matchesSeason = !seasonFilter || crop.season === seasonFilter;

    return matchesSearch && matchesCategory && matchesSeason;
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'Wet Season': return 'info';
      case 'Dry Season': return 'warning';
      case 'All Year': return 'success';
      default: return 'default';
    }
  };

  // NEW: Handle crop selection for comparison
  const handleSelectCrop = (cropId: number) => {
    setSelectedCrops(prev => {
      if (prev.includes(cropId)) {
        return prev.filter(id => id !== cropId);
      } else {
        if (prev.length >= 4) {
          alert('You can compare up to 4 crops at a time');
          return prev;
        }
        return [...prev, cropId];
      }
    });
  };

  // NEW: Navigate to comparison page
  const handleCompare = () => {
    if (selectedCrops.length < 2) {
      alert('Please select at least 2 crops to compare');
      return;
    }
    navigate(`/crop-comparison?ids=${selectedCrops.join(',')}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <>
    <Navbar />
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          🌾 Crop Catalog
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse crops suitable for your region and season
        </Typography>
      </Box>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <Card 
          sx={{ 
            mb: 4, 
            bgcolor: 'success.light', 
            borderLeft: 6, 
            borderColor: 'success.main',
            p: 3
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              🌟 Recommended for You
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on current season {userLocation && `and your location (${userLocation})`}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {recommendations.map((crop) => (
              <Grid item xs={12} sm={6} md={4} key={crop.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { 
                      boxShadow: 6,
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => navigate(`/crop-catalog/${crop.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <GrassIcon color="success" />
                      <Typography variant="h6" fontWeight="bold">
                        {crop.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={crop.season} size="small" color="info" />
                      <Chip label={crop.difficulty_level} size="small" color="success" />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {crop.description.substring(0, 100)}...
                    </Typography>

                    {crop.growing_duration && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {crop.growing_duration} days to harvest
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search crops..."
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
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Cereals">Cereals</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Legumes">Legumes</MenuItem>
                <MenuItem value="Cash Crops">Cash Crops</MenuItem>
                <MenuItem value="Fruits">Fruits</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Season</InputLabel>
              <Select
                value={seasonFilter}
                label="Season"
                onChange={(e) => setSeasonFilter(e.target.value)}
              >
                <MenuItem value="">All Seasons</MenuItem>
                <MenuItem value="Wet Season">Wet Season</MenuItem>
                <MenuItem value="Dry Season">Dry Season</MenuItem>
                <MenuItem value="All Year">All Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Comparison Mode Info */}
      {selectedCrops.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {selectedCrops.length} crop{selectedCrops.length !== 1 ? 's' : ''} selected for comparison. 
          Select at least 2 crops to compare (max 4).
        </Alert>
      )}

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredCrops.length} {filteredCrops.length === 1 ? 'crop' : 'crops'}
        </Typography>
      </Box>

      {/* Crops Grid */}
      <Grid container spacing={3}>
        {filteredCrops.map((crop) => (
          <Grid item xs={12} sm={6} md={4} key={crop.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: selectedCrops.includes(crop.id) ? 2 : 0,
                borderColor: 'primary.main',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-4px)'
                }
              }}
            >
              {/* NEW: Comparison Checkbox */}
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
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                />
              </Box>

              <CardMedia
                component="div"
                sx={{
                  height: 180,
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => navigate(`/crop-catalog/${crop.id}`)}
              >
                {crop.image_url ? (
                  <img src={crop.image_url} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <GrassIcon sx={{ fontSize: 80, color: 'success.dark' }} />
                )}
              </CardMedia>

              <CardContent 
                sx={{ flexGrow: 1 }}
                onClick={() => navigate(`/crop-catalog/${crop.id}`)}
              >
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {crop.name}
                  </Typography>
                  {crop.scientific_name && (
                    <Typography variant="caption" color="text.secondary" fontStyle="italic">
                      {crop.scientific_name}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Chip 
                    label={crop.category} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={crop.season} 
                    size="small" 
                    color={getSeasonColor(crop.season) as any}
                  />
                  <Chip 
                    label={crop.difficulty_level} 
                    size="small" 
                    color={getDifficultyColor(crop.difficulty_level) as any}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {crop.description.substring(0, 100)}...
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {crop.growing_duration && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {crop.growing_duration} days
                      </Typography>
                    </Box>
                  )}
                  {crop.water_requirement && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WaterDropIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {crop.water_requirement} water
                      </Typography>
                    </Box>
                  )}
                  {crop.average_yield && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {crop.average_yield}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Results */}
      {filteredCrops.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <GrassIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No crops found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters
          </Typography>
        </Box>
      )}

      {/* NEW: Floating Compare Button */}
      {selectedCrops.length >= 2 && (
        <Fab
          color="primary"
          variant="extended"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={handleCompare}
        >
          <Badge badgeContent={selectedCrops.length} color="success" sx={{ mr: 1 }}>
            <CompareArrowsIcon />
          </Badge>
          Compare Crops
        </Fab>
      )}
    </Container>
    </>
  );
};

export default CropCatalog;
