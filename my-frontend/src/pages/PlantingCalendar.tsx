/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GrassIcon from '@mui/icons-material/Grass';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Crop {
  id: number;
  name: string;
  category: string;
  season: string;
  planting_time: string;
  growing_duration: number;
  difficulty_level: string;
}

interface MonthData {
  month: string;
  monthNumber: number;
  season: string;
  cropsToPlant: Crop[];
}

const PlantingCalendar = () => {
  const navigate = useNavigate();
  
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const months: MonthData[] = [
    { month: 'January', monthNumber: 1, season: 'Dry Season', cropsToPlant: [] },
    { month: 'February', monthNumber: 2, season: 'Dry Season', cropsToPlant: [] },
    { month: 'March', monthNumber: 3, season: 'Dry Season', cropsToPlant: [] },
    { month: 'April', monthNumber: 4, season: 'Wet Season', cropsToPlant: [] },
    { month: 'May', monthNumber: 5, season: 'Wet Season', cropsToPlant: [] },
    { month: 'June', monthNumber: 6, season: 'Wet Season', cropsToPlant: [] },
    { month: 'July', monthNumber: 7, season: 'Wet Season', cropsToPlant: [] },
    { month: 'August', monthNumber: 8, season: 'Wet Season', cropsToPlant: [] },
    { month: 'September', monthNumber: 9, season: 'Wet Season', cropsToPlant: [] },
    { month: 'October', monthNumber: 10, season: 'Wet Season', cropsToPlant: [] },
    { month: 'November', monthNumber: 11, season: 'Dry Season', cropsToPlant: [] },
    { month: 'December', monthNumber: 12, season: 'Dry Season', cropsToPlant: [] },
  ];

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('/api/crop-catalog', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCrops(response.data.crops || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading crops:', err);
      setLoading(false);
    }
  };

  const assignCropsToMonths = () => {
    return months.map(monthData => {
      const cropsForMonth = crops.filter(crop => {
        // Parse planting time (e.g., "May-July", "November-December")
        const plantingTime = crop.planting_time?.toLowerCase() || '';
        const monthName = monthData.month.toLowerCase();
        
        // Check if month is mentioned in planting time
        const isPlantingMonth = plantingTime.includes(monthName.substring(0, 3));
        
        // Also check if crop season matches
        const seasonMatches = crop.season === monthData.season || crop.season === 'All Year';
        
        return isPlantingMonth || seasonMatches;
      });

      return {
        ...monthData,
        cropsToPlant: cropsForMonth
      };
    });
  };

  const calendarData = assignCropsToMonths();

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  const getSeasonColor = (season: string) => {
    return season === 'Wet Season' ? 'info' : 'warning';
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
          📅 Planting Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Plan your planting schedule throughout the year
        </Typography>
      </Box>

      {/* Current Month Highlight */}
      <Alert severity="info" icon={<CalendarMonthIcon />} sx={{ mb: 4 }}>
        <Typography variant="body1" fontWeight="bold">
          Current Month: {months[currentMonth - 1].month} ({months[currentMonth - 1].season})
        </Typography>
        <Typography variant="body2">
          {calendarData[currentMonth - 1].cropsToPlant.length} crops recommended for planting now
        </Typography>
      </Alert>

      {/* Calendar Grid */}
      <Grid container spacing={3}>
        {calendarData.map((monthData) => (
          <Grid item xs={12} sm={6} md={4} key={monthData.month}>
            <Card 
              sx={{ 
                height: '100%',
                border: monthData.monthNumber === currentMonth ? 3 : 0,
                borderColor: 'primary.main',
                bgcolor: monthData.monthNumber === currentMonth ? 'primary.light' : 'background.paper'
              }}
            >
              <CardContent>
                {/* Month Header */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {monthData.month}
                  </Typography>
                  <Chip 
                    label={monthData.season} 
                    size="small" 
                    color={getSeasonColor(monthData.season) as any}
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                {/* Crops to Plant */}
                {monthData.cropsToPlant.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {monthData.cropsToPlant.slice(0, 5).map((crop) => (
                      <Paper
                        key={crop.id}
                        sx={{
                          p: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => navigate(`/crop-catalog/${crop.id}`)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GrassIcon fontSize="small" color="success" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {crop.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {crop.category}
                            </Typography>
                          </Box>
                          <Chip 
                            label={crop.difficulty_level} 
                            size="small" 
                            color={getDifficultyColor(crop.difficulty_level) as any}
                          />
                        </Box>
                      </Paper>
                    ))}
                    {monthData.cropsToPlant.length > 5 && (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        +{monthData.cropsToPlant.length - 5} more crops
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No specific crops for this month
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Legend */}
      <Card sx={{ mt: 4, p: 2, bgcolor: 'info.light' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📖 How to Use This Calendar
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            • <strong>Current month</strong> is highlighted with a Green border
          </Typography>
          <Typography variant="body2">
            • <strong>Blue chips</strong> indicate Wet Season (April - October)
          </Typography>
          <Typography variant="body2">
            • <strong>Orange chips</strong> indicate Dry Season (November - March)
          </Typography>
          <Typography variant="body2">
            • Click on any crop to view detailed growing information
          </Typography>
          <Typography variant="body2">
            • Some crops can be planted year-round (marked as "All Year")
          </Typography>
        </Box>
      </Card>
    </Container>
    </>
  );
};

export default PlantingCalendar;
