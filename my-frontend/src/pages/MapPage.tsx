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
import Translate from '../components/Translate';
import { useTranslate } from '../hooks/useTranslate';
import { useLanguage } from '../context/LanguageContext';

const MapPage = () => {
  const { showToast } = useContext(ToastContext);
  const { translate } = useLanguage();
  
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

  // Translate labels
  const labels = [
    'All',
    'Supplier',
    'Market',
    'Aggregator',
    'Equipment Rental',
    'Other',
    'Search Locations',
    'e.g., Seeds, Market, Kano',
    'Location Type',
    'State',
    'All States',
    'Categories:',
    'location',
    'locations',
    'found',
    'No locations found',
    'Clear Filters',
    'Services:',
    'Directions',
    'Details',
    'Maps',
    'Location',
    'About',
    'Services & Products',
    'Contact Information',
    'Close',
    'Open in Maps',
    'Get Directions',
    'Failed to load locations'
  ];
  const { translated: translatedLabels } = useTranslate(labels);

  const locationTypes = [
    translatedLabels[0] || 'All',
    translatedLabels[1] || 'Supplier',
    translatedLabels[2] || 'Market',
    translatedLabels[3] || 'Aggregator',
    translatedLabels[4] || 'Equipment Rental',
    translatedLabels[5] || 'Other'
  ];

  useEffect(() => {
    fetchLocations();
    fetchStates();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/locations');
      
      console.log('✅ Locations loaded:', response.data);
      setLocations(response.data.locations);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading locations:', err);
      const errorMsg = await translate('Failed to load locations');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await axios.get('/api/locations/states');
      setStates(response.data.states);
    } catch (err) {
      console.error('Error loading states:', err);
    }
  };

  const filteredLocations = locations.filter((location) => {
    const matchesType = typeFilter === (translatedLabels[0] || 'All') || location.type === typeFilter;
    const matchesState = stateFilter === (translatedLabels[0] || 'All') || location.state === stateFilter;
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
                <Translate text="Agricultural Locations Directory" />
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                <Translate text="Find nearby suppliers, markets, aggregators, and equipment rentals" />
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
                  label={translatedLabels[6]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={translatedLabels[7]}
                />
                <TextField
                  select
                  label={translatedLabels[8]}
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
                  label={translatedLabels[9]}
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value={translatedLabels[0] || 'All'}>{translatedLabels[10]}</MenuItem>
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
                  {translatedLabels[11]}
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
                {filteredLocations.length} {filteredLocations.length === 1 ? translatedLabels[12] : translatedLabels[13]} {translatedLabels[14]}
              </Typography>
            </CardContent>
          </Card>

          {/* Locations List - 3 Cards per Row */}
          {filteredLocations.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <MapIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {translatedLabels[15]}
              </Typography>
              <Button
                variant="text"
                onClick={() => {
                  setTypeFilter(translatedLabels[0] || 'All');
                  setStateFilter(translatedLabels[0] || 'All');
                  setSearchQuery('');
                }}
                sx={{ mt: 2 }}
              >
                {translatedLabels[16]}
              </Button>
            </Card>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {filteredLocations.map((location) => (
                <Card
                  key={location.id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header - Don't translate (business name) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ color: getTypeColor(location.type) }}>
                        {getLocationIcon(location.type)}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                        {location.name}
                      </Typography>
                    </Box>

                    {/* Type & Category - Don't translate (business categories) */}
                    <Box sx={{ mb: 1.5 }}>
                      <Chip
                        label={location.type}
                        size="small"
                        sx={{ 
                          backgroundColor: `${getTypeColor(location.type)}20`,
                          color: getTypeColor(location.type),
                          fontWeight: 'bold',
                          height: 22,
                          fontSize: '0.7rem'
                        }}
                      />
                      {location.category && (
                        <Chip
                          label={location.category}
                          size="small"
                          sx={{ ml: 1, height: 22, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>

                    {/* Location - Don't translate (place names) */}
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 0.5, mb: 1 }}>
                      <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 18, mt: 0.2 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {location.city}, {location.state}
                      </Typography>
                    </Box>

                    {/* Description - Don't translate (business description) */}
                    {location.description && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 1.5, 
                          fontSize: '0.85rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {location.description}
                      </Typography>
                    )}

                    {/* Services (truncated) - Don't translate (business services) */}
                    {location.services && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.3 }}>
                          {translatedLabels[17]}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {location.services}
                        </Typography>
                      </Box>
                    )}

                    {/* Phone - Don't translate (phone number) */}
                    {location.contact_phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                        <PhoneIcon sx={{ color: 'success.main', fontSize: 16 }} />
                        <Typography variant="caption">
                          {location.contact_phone}
                        </Typography>
                      </Box>
                    )}

                    {/* Spacer to push buttons to bottom */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<DirectionsIcon />}
                        onClick={() => getDirections(location)}
                        size="small"
                        fullWidth
                      >
                        {translatedLabels[18]}
                      </Button>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => handleLocationClick(location)}
                          size="small"
                          fullWidth
                        >
                          {translatedLabels[19]}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<MapIcon />}
                          onClick={() => openInGoogleMaps(location)}
                          size="small"
                          fullWidth
                        >
                          {translatedLabels[20]}
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
                      {translatedLabels[21]}
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
                      {translatedLabels[22]}
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
                      {translatedLabels[23]}
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
                    {translatedLabels[24]}
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
              <Button onClick={handleCloseDialog}>{translatedLabels[25]}</Button>
              <Button
                variant="outlined"
                startIcon={<MapIcon />}
                onClick={() => openInGoogleMaps(selectedLocation)}
              >
                {translatedLabels[26]}
              </Button>
              <Button
                variant="contained"
                startIcon={<DirectionsIcon />}
                onClick={() => getDirections(selectedLocation)}
              >
                {translatedLabels[27]}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default MapPage;
