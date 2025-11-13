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
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Bookings loaded:', response.data);
      setBookings(response.data.bookings);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading bookings:', err);
      setError('Failed to load bookings');
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Booking cancelled successfully', 'success');
      fetchBookings();
    } catch (err: any) {
      console.error('❌ Error cancelling booking:', err);
      showToast('Failed to cancel booking', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Declined': return 'error';
      case 'Cancelled': return 'default';
      case 'Completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircleIcon />;
      case 'Pending': return <PendingIcon />;
      case 'Declined': return <CancelIcon />;
      case 'Cancelled': return <CancelIcon />;
      case 'Completed': return <CheckCircleIcon />;
      default: return undefined;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
                My Bookings
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                View and manage your consultation appointments
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/book-consultation')}
              sx={{ 
                backgroundColor: 'secondary.main',
                '&:hover': {
                  backgroundColor: 'secondary.dark'
                }
              }}
            >
              New Booking
            </Button>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No bookings yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/book-consultation')}
                sx={{ 
                  backgroundColor: 'secondary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.dark'
                  }
                }}
              >
                Create Your First Booking
              </Button>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Chip
                          icon={getStatusIcon(booking.status)}
                          label={booking.status}
                          color={getStatusColor(booking.status)}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                      {/* Left Side - Booking Info */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <EventIcon sx={{ color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight="bold">
                            {formatDate(booking.booking_date)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <AccessTimeIcon sx={{ color: 'text.secondary' }} />
                          <Typography variant="body1">
                            {formatTime(booking.booking_time)}
                          </Typography>
                        </Box>

                        {booking.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <LocationOnIcon sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {booking.location}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                            Purpose:
                          </Typography>
                          <Typography variant="body2">{booking.purpose}</Typography>
                        </Box>

                        {booking.farmer_notes && (
                          <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                              Your Notes:
                            </Typography>
                            <Typography variant="body2">{booking.farmer_notes}</Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Right Side - Officer Info */}
                      <Box sx={{ flex: 1 }}>
                        {booking.officer_first_name ? (
                          <Box sx={{ p: 3, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <PersonIcon sx={{ color: 'success.main' }} />
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                Assigned Officer
                              </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold">
                              {booking.officer_first_name} {booking.officer_last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {booking.officer_email}
                            </Typography>

                            {booking.officer_notes && (
                              <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
                                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                  Officer Notes:
                                </Typography>
                                <Typography variant="body2">{booking.officer_notes}</Typography>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Box sx={{ p: 3, backgroundColor: '#fff3e0', borderRadius: 2, textAlign: 'center' }}>
                            <PendingIcon sx={{ fontSize: 48, color: '#ff9800', mb: 1 }} />
                            <Typography variant="body1" fontWeight="bold" color="warning.main">
                              Waiting for Officer Assignment
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              An officer will be assigned to your booking soon
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="caption" color="text.secondary">
                      Booking ID: #{booking.id} • Created: {new Date(booking.created_at).toLocaleDateString()}
                    </Typography>
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

export default MyBookingsPage;
