/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsIcon from '@mui/icons-material/Directions';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

const MapPage = () => {
  const { showToast } = useContext(ToastContext);
  
  const [locations, setLocations] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected location dialog
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const locationTypes = ['All', 'Supplier', 'Market', 'Aggregator', 'Equipment Rental', 'Other'];

  useEffect(() => {
    fetchLocations();
    fetchStates();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/locations');
      
      console.log('✅ Locations loaded:', response.data);
      setLocations(response.data.locations);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading locations:', err);
      setError('Failed to load locations');
      showToast('Failed to load locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/locations/states');
      setStates(response.data.states);
    } catch (err) {
      console.error('Error loading states:', err);
    }
  };

  const filteredLocations = locations.filter((location) => {
    const matchesType = typeFilter === 'All' || location.type === typeFilter;
    const matchesState = stateFilter === 'All' || location.state === stateFilter;
    const matchesSearch = 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.services?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesState && matchesSearch;
  });

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLocation(null);
  };

  const openInGoogleMaps = (location: any) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`,
      '_blank'
    );
  };

  const getDirections = (location: any) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`,
      '_blank'
    );
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'Supplier': return <StoreIcon />;
      case 'Market': return <ShoppingCartIcon />;
      case 'Aggregator': return <AgricultureIcon />;
      case 'Equipment Rental': return <AgricultureIcon />;
      default: return <LocationOnIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Supplier': return '#2e7d32';
      case 'Market': return '#1976d2';
      case 'Aggregator': return '#ed6c02';
      case 'Equipment Rental': return '#9c27b0';
      default: return '#616161';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <MapIcon sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                Agricultural Locations Directory
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Find nearby suppliers, markets, aggregators, and equipment rentals
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
                  label="Search Locations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Seeds, Market, Kano"
                />
                <TextField
                  select
                  label="Location Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {locationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="State"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="All">All States</MenuItem>
                  {states.map((state) => (
                    <MenuItem key={state.state} value={state.state}>
                      {state.state} ({state.location_count})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                  Categories:
                </Typography>
                {locationTypes.slice(1).map((type) => (
                  <Chip
                    key={type}
                    icon={getLocationIcon(type)}
                    label={type}
                    size="small"
                    sx={{ 
                      backgroundColor: `${getTypeColor(type)}20`,
                      color: getTypeColor(type),
                      fontWeight: 'bold'
                    }}
                  />
                ))}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} found
              </Typography>
            </CardContent>
          </Card>

          {/* Locations List */}
          {filteredLocations.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <MapIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No locations found
              </Typography>
              <Button
                variant="text"
                onClick={() => {
                  setTypeFilter('All');
                  setStateFilter('All');
                  setSearchQuery('');
                }}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredLocations.map((location) => (
                <Card
                  key={location.id}
                  sx={{
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getLocationIcon(location.type)}
                          <Typography variant="h6" fontWeight="bold">
                            {location.name}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={location.type}
                            size="small"
                            sx={{ 
                              backgroundColor: `${getTypeColor(location.type)}20`,
                              color: getTypeColor(location.type),
                              fontWeight: 'bold'
                            }}
                          />
                          {location.category && (
                            <Chip
                              label={location.category}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {location.address}, {location.city}, {location.state}
                          </Typography>
                        </Box>

                        {location.description && (
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {location.description}
                          </Typography>
                        )}

                        {location.services && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                              Services:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {location.services}
                            </Typography>
                          </Box>
                        )}

                        {location.contact_phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <PhoneIcon sx={{ color: 'success.main', fontSize: 18 }} />
                            <Typography variant="body2">
                              {location.contact_phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: { xs: '100%', md: 'auto' } }}>
                        <Button
                          variant="contained"
                          startIcon={<DirectionsIcon />}
                          onClick={() => getDirections(location)}
                          fullWidth
                        >
                          Get Directions
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleLocationClick(location)}
                          fullWidth
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<MapIcon />}
                          onClick={() => openInGoogleMaps(location)}
                          fullWidth
                        >
                          Open in Maps
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      {/* Location Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedLocation && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getLocationIcon(selectedLocation.type)}
                <Typography variant="h5" fontWeight="bold">
                  {selectedLocation.name}
                </Typography>
              </Box>
              <Chip
                label={selectedLocation.type}
                size="small"
                sx={{ 
                  mt: 1,
                  backgroundColor: `${getTypeColor(selectedLocation.type)}20`,
                  color: getTypeColor(selectedLocation.type),
                  fontWeight: 'bold'
                }}
              />
              {selectedLocation.category && (
                <Chip
                  label={selectedLocation.category}
                  size="small"
                  sx={{ mt: 1, ml: 1 }}
                />
              )}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Address */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOnIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Location
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {selectedLocation.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedLocation.city}, {selectedLocation.state}
                  </Typography>
                </Box>

                <Divider />

                {/* Description */}
                {selectedLocation.description && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      About
                    </Typography>
                    <Typography variant="body1">
                      {selectedLocation.description}
                    </Typography>
                  </Box>
                )}

                {/* Services */}
                {selectedLocation.services && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      Services & Products
                    </Typography>
                    <Typography variant="body1">
                      {selectedLocation.services}
                    </Typography>
                  </Box>
                )}

                <Divider />

                {/* Contact Information */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Contact Information
                  </Typography>
                  
                  {selectedLocation.contact_phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhoneIcon sx={{ color: 'success.main' }} />
                      <Typography variant="body1">
                        {selectedLocation.contact_phone}
                      </Typography>
                    </Box>
                  )}

                  {selectedLocation.contact_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmailIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="body1">
                        {selectedLocation.contact_email}
                      </Typography>
                    </Box>
                  )}

                  {selectedLocation.operating_hours && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon sx={{ color: 'warning.main' }} />
                      <Typography variant="body1">
                        {selectedLocation.operating_hours}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<MapIcon />}
                onClick={() => openInGoogleMaps(selectedLocation)}
              >
                Open in Maps
              </Button>
              <Button
                variant="contained"
                startIcon={<DirectionsIcon />}
                onClick={() => getDirections(selectedLocation)}
              >
                Get Directions
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default MapPage;