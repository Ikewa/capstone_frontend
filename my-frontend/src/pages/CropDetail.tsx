/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GrassIcon from '@mui/icons-material/Grass';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LandscapeIcon from '@mui/icons-material/Landscape';
import BugReportIcon from '@mui/icons-material/BugReport';
import ShieldIcon from '@mui/icons-material/Shield';
import SpaIcon from '@mui/icons-material/Spa';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Crop {
  id: number;
  name: string;
  scientific_name: string;
  category: string;
  season: string;
  climate_type: string;
  soil_type: string;
  water_requirement: string;
  planting_time: string;
  growing_duration: number;
  harvest_season: string;
  spacing: string;
  common_pests: string;
  pest_control: string;
  average_yield: string;
  market_value: string;
  description: string;
  growing_tips: string;
  suitable_for_region: string;
  difficulty_level: string;
  image_url: string;
}

const CropDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCropDetail();
  }, [id]);

  const fetchCropDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`http://localhost:5000/api/crop-catalog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Crop detail loaded:', response.data);
      setCrop(response.data.crop);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading crop:', err);
      setError('Failed to load crop details');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !crop) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Crop not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/crop-catalog')}>
          Back to Catalog
        </Button>
      </Container>
    );
  }

  return (
    <>
    <Navbar />
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/crop-catalog')}
        >
          Back to Catalog
        </Button>
        
        <Button 
          variant="contained" 
          color="success"
          startIcon={<MenuBookIcon />}
          onClick={() => navigate(`/crop-catalog/${id}/growing-guide`)}
        >
          View Growing Guide
        </Button>
        
        <Button 
          variant="outlined"
          startIcon={<CalendarTodayIcon />}
          onClick={() => navigate('/planting-calendar')}
        >
          View Planting Calendar
        </Button>
      </Box>

      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64 }}>
                  <GrassIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {crop.name}
                  </Typography>
                  {crop.scientific_name && (
                    <Typography variant="body1" color="text.secondary" fontStyle="italic">
                      {crop.scientific_name}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={crop.category} color="primary" />
                <Chip label={crop.season} color={getSeasonColor(crop.season) as any} />
                <Chip label={crop.difficulty_level} color={getDifficultyColor(crop.difficulty_level) as any} />
                {crop.suitable_for_region && (
                  <Chip label={crop.suitable_for_region} variant="outlined" />
                )}
              </Box>

              <Typography variant="body1" paragraph>
                {crop.description}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  height: 250,
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                {crop.image_url ? (
                  <img 
                    src={crop.image_url} 
                    alt={crop.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} 
                  />
                ) : (
                  <GrassIcon sx={{ fontSize: 100, color: 'success.dark' }} />
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Growing Requirements */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🌱 Growing Requirements
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {crop.climate_type && (
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WbSunnyIcon color="warning" />
                  <Typography variant="subtitle2" fontWeight="bold">Climate</Typography>
                </Box>
                <Typography variant="body2">{crop.climate_type}</Typography>
              </Grid>
            )}

            {crop.soil_type && (
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LandscapeIcon color="action" />
                  <Typography variant="subtitle2" fontWeight="bold">Soil Type</Typography>
                </Box>
                <Typography variant="body2">{crop.soil_type}</Typography>
              </Grid>
            )}

            {crop.water_requirement && (
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WaterDropIcon color="info" />
                  <Typography variant="subtitle2" fontWeight="bold">Water Needs</Typography>
                </Box>
                <Typography variant="body2">{crop.water_requirement}</Typography>
              </Grid>
            )}

            {crop.spacing && (
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SpaIcon color="success" />
                  <Typography variant="subtitle2" fontWeight="bold">Spacing</Typography>
                </Box>
                <Typography variant="body2">{crop.spacing}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Planting & Harvest Timeline */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📅 Planting & Harvest Timeline
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {crop.planting_time && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarTodayIcon color="primary" />
                  <Typography variant="subtitle2" fontWeight="bold">Planting Time</Typography>
                </Box>
                <Typography variant="body2">{crop.planting_time}</Typography>
              </Grid>
            )}

            {crop.growing_duration && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccessTimeIcon color="action" />
                  <Typography variant="subtitle2" fontWeight="bold">Growing Duration</Typography>
                </Box>
                <Typography variant="body2">{crop.growing_duration} days</Typography>
              </Grid>
            )}

            {crop.harvest_season && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <GrassIcon color="success" />
                  <Typography variant="subtitle2" fontWeight="bold">Harvest Season</Typography>
                </Box>
                <Typography variant="body2">{crop.harvest_season}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Economic Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            💰 Economic Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {crop.average_yield && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="subtitle2" fontWeight="bold">Average Yield</Typography>
                </Box>
                <Typography variant="body2">{crop.average_yield}</Typography>
              </Grid>
            )}

            {crop.market_value && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoneyIcon color="primary" />
                  <Typography variant="subtitle2" fontWeight="bold">Market Value</Typography>
                </Box>
                <Typography variant="body2">{crop.market_value}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Pest Management */}
      {(crop.common_pests || crop.pest_control) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              🐛 Pest Management
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {crop.common_pests && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BugReportIcon color="error" />
                    <Typography variant="subtitle2" fontWeight="bold">Common Pests</Typography>
                  </Box>
                  <Typography variant="body2">{crop.common_pests}</Typography>
                </Grid>
              )}

              {crop.pest_control && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ShieldIcon color="success" />
                    <Typography variant="subtitle2" fontWeight="bold">Pest Control</Typography>
                  </Box>
                  <Typography variant="body2">{crop.pest_control}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Growing Tips */}
      {crop.growing_tips && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              💡 Growing Tips
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body1">{crop.growing_tips}</Typography>
          </CardContent>
        </Card>
      )}
    </Container>
    </>
  );
};

export default CropDetail;