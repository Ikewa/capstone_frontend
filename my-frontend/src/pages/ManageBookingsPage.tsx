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
  TextField,
  Tab,
  Tabs,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
// import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ManageBookingsPage = () => {
  const { showToast } = useContext(ToastContext);
  const [tabValue, setTabValue] = useState(0);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [officerNotes, setOfficerNotes] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [pendingRes, appointmentsRes] = await Promise.all([
        axios.get('/api/bookings/pending', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/bookings/my-appointments', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPendingBookings(pendingRes.data.bookings);
      setMyAppointments(appointmentsRes.data.appointments);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading data:', err);
      setError('Failed to load bookings');
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `/api/bookings/${bookingId}/accept`,
        { officer_notes: officerNotes[bookingId] || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Booking accepted successfully! ✅', 'success');
      fetchData();
      setOfficerNotes({ ...officerNotes, [bookingId]: '' });
    } catch (err: any) {
      console.error('❌ Error accepting booking:', err);
      showToast('Failed to accept booking', 'error');
    }
  };

  const handleDeclineBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to decline this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `/api/bookings/${bookingId}/decline`,
        { officer_notes: officerNotes[bookingId] || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Booking declined', 'info');
      fetchData();
      setOfficerNotes({ ...officerNotes, [bookingId]: '' });
    } catch (err: any) {
      console.error('❌ Error declining booking:', err);
      showToast('Failed to decline booking', 'error');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Declined': return 'error';
      case 'Cancelled': return 'default';
      case 'Completed': return 'info';
      default: return 'default';
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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Manage Bookings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Review and manage farmer consultation requests
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab 
                label={`Pending Requests (${pendingBookings.length})`} 
                icon={<PendingIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`My Appointments (${myAppointments.length})`} 
                icon={<CheckCircleIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Pending Bookings Tab */}
          <TabPanel value={tabValue} index={0}>
            {pendingBookings.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <PendingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No pending booking requests
                </Typography>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {pendingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent>
                      <Chip
                        icon={<PendingIcon />}
                        label="Pending"
                        color="warning"
                        sx={{ fontWeight: 'bold', mb: 2 }}
                      />

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        {/* Left - Farmer Info */}
                        <Box sx={{ flex: 1, p: 3, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PersonIcon sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              Farmer Information
                            </Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="bold">
                            {booking.farmer_first_name} {booking.farmer_last_name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {booking.farmer_email}
                            </Typography>
                          </Box>

                          {booking.farmer_location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {booking.farmer_location}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Right - Booking Details */}
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
                            <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                Farmer Notes:
                              </Typography>
                              <Typography variant="body2">{booking.farmer_notes}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      {/* Officer Response */}
                      <Box>
                        <TextField
                          fullWidth
                          label="Your Notes (Optional)"
                          multiline
                          rows={2}
                          value={officerNotes[booking.id] || ''}
                          onChange={(e) => setOfficerNotes({ ...officerNotes, [booking.id]: e.target.value })}
                          placeholder="Add any notes or instructions for the farmer..."
                          sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleAcceptBooking(booking.id)}
                            sx={{ flex: 1 }}
                          >
                            Accept Booking
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleDeclineBooking(booking.id)}
                            sx={{ flex: 1 }}
                          >
                            Decline
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </TabPanel>

          {/* My Appointments Tab */}
          <TabPanel value={tabValue} index={1}>
            {myAppointments.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No appointments yet
                </Typography>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {myAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        sx={{ fontWeight: 'bold', mb: 2 }}
                      />

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        {/* Farmer Info */}
                        <Box sx={{ flex: 1, p: 3, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                          <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                            {appointment.farmer_first_name} {appointment.farmer_last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📧 {appointment.farmer_email}
                          </Typography>
                          
                          {appointment.farmer_location && (
                            <Typography variant="body2" color="text.secondary">
                              📍 {appointment.farmer_location}
                            </Typography>
                          )}
                        </Box>

                        {/* Appointment Details */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                            📅 {formatDate(appointment.booking_date)}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            🕐 {formatTime(appointment.booking_time)}
                          </Typography>
                          {appointment.location && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              📍 {appointment.location}
                            </Typography>
                          )}

                          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                              Purpose:
                            </Typography>
                            <Typography variant="body2">{appointment.purpose}</Typography>
                          </Box>

                          {appointment.officer_notes && (
                            <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                Your Notes:
                              </Typography>
                              <Typography variant="body2">{appointment.officer_notes}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </TabPanel>
        </Container>
      </Box>
    </>
  );
};

export default ManageBookingsPage;
