/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [registrationsDialogOpen, setRegistrationsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('/api/events/my/events', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ My events loaded:', response.data);
      setEvents(response.data.events);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading events:', err);
      setError('Failed to load your events');
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRegistrations = async (event: any) => {
    setSelectedEvent(event);
    setRegistrationsDialogOpen(true);
    setLoadingRegistrations(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `/api/events/${event.id}/registrations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRegistrations(response.data.registrations);
    } catch (err: any) {
      console.error('❌ Error loading registrations:', err);
      showToast('Failed to load registrations', 'error');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `/api/events/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Event deleted successfully', 'success');
      fetchMyEvents();
    } catch (err: any) {
      console.error('❌ Error deleting event:', err);
      showToast('Failed to delete event', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'No time';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isPastEvent = (dateString: string) => {
    if (!dateString) return false;
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                My Events
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Manage your created events and view registrations
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-event')}
              sx={{ backgroundColor: '#1976d2' }}
            >
              Create Event
            </Button>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Events List */}
          {events.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                You haven't created any events yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-event')}
                sx={{ backgroundColor: '#1976d2' }}
              >
                Create Your First Event
              </Button>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                          {event.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip 
                            label={event.event_type} 
                            size="small" 
                            color="primary"
                          />
                          {isPastEvent(event.event_date) && (
                            <Chip 
                              label="Past Event" 
                              size="small" 
                              color="default"
                            />
                          )}
                          <Chip
                            icon={<PeopleIcon />}
                            label={`${event.registration_count || 0} registered`}
                            size="small"
                            sx={{ backgroundColor: '#e3f2fd' }}
                          />
                          {event.max_attendees && (
                            <Chip
                              label={`Max: ${event.max_attendees}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          color="primary"
                          onClick={() => handleViewRegistrations(event)}
                          title="View Registrations"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Delete Event"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {event.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" fontWeight="bold">
                          {formatDate(event.event_date)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatTime(event.event_time)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {event.location}
                        </Typography>
                      </Box>
                    </Box>

                    {(event.registration_count && event.registration_count > 0) && (
                      <Button
                        variant="outlined"
                        startIcon={<PeopleIcon />}
                        onClick={() => handleViewRegistrations(event)}
                        sx={{ mt: 2 }}
                      >
                        View {event.registration_count} Registration{event.registration_count !== 1 ? 's' : ''}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      {/* Registrations Dialog */}
      <Dialog 
        open={registrationsDialogOpen} 
        onClose={() => setRegistrationsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Event Registrations
          </Typography>
          {selectedEvent && (
            <Typography variant="body2" color="text.secondary">
              {selectedEvent.title}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {loadingRegistrations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : registrations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No registrations yet
              </Typography>
            </Box>
          ) : (
            <List>
              {registrations.map((registration, index) => (
                <Box key={registration.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="bold">
                          {registration.first_name} {registration.last_name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            📧 {registration.email}
                          </Typography>
                          {registration.user_location && (
                            <Typography variant="body2" color="text.secondary">
                              📍 {registration.user_location}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Registered: {new Date(registration.registered_at).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < registrations.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyEventsPage;
