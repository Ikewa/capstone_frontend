/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Crop {
  id: number;
  name: string;
  category: string;
  season: string;
  difficulty_level: string;
  growing_duration: number;
  water_requirement: string;
  soil_type: string;
  average_yield: string;
  market_value: string;
  common_pests: string;
  description: string;
}

const CropComparison = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const ids = searchParams.get('ids')?.split(',') || [];
      
      if (ids.length < 2) {
        return;
      }

      const token = localStorage.getItem('token');
      const cropPromises = ids.map(id => 
        axios.get(`http://localhost:5000/api/crop-catalog/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      const responses = await Promise.all(cropPromises);
      const cropsData = responses.map(res => res.data.crop);
      
      setCrops(cropsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading crops:', err);
      setLoading(false);
    }
  };

  if (crops.length < 2) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please select at least 2 crops to compare
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/crop-catalog')}
          sx={{ mt: 2 }}
        >
          Back to Catalog
        </Button>
      </Container>
    );
  }

  return (
    <>
    <Navbar />
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/crop-catalog')}
        sx={{ mb: 3 }}
      >
        Back to Catalog
      </Button>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        🔍 Crop Comparison
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell><strong>Feature</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  <Typography variant="h6" fontWeight="bold">
                    {crop.name}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Category</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  <Chip label={crop.category} color="primary" size="small" />
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell><strong>Season</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  {crop.season}
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell><strong>Difficulty</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  <Chip 
                    label={crop.difficulty_level} 
                    color={
                      crop.difficulty_level === 'Easy' ? 'success' :
                      crop.difficulty_level === 'Medium' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell><strong>Growing Duration</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  {crop.growing_duration} days
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell><strong>Water Requirement</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  {crop.water_requirement || '-'}
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell><strong>Soil Type</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  {crop.soil_type || '-'}
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell><strong>Average Yield</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  {crop.average_yield || '-'}
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell><strong>Market Value</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  {crop.market_value || '-'}
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell><strong>Common Pests</strong></TableCell>
              {crops.map(crop => (
                <TableCell key={crop.id} align="center">
                  {crop.common_pests || '-'}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        {crops.map(crop => (
          <Button
            key={crop.id}
            variant="outlined"
            onClick={() => navigate(`/crop-catalog/${crop.id}`)}
          >
            View {crop.name} Details
          </Button>
        ))}
      </Box>
    </Container>
    </>
  );
};

export default CropComparison;