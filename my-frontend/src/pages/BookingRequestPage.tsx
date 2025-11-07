/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import EventIcon from '@mui/icons-material/Event';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

const BookingRequestPage = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    purpose: '',
    location: '',
    farmer_notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.booking_date || !formData.booking_time || !formData.purpose) {
      const msg = 'Please fill in all required fields';
      setError(msg);
      showToast(msg, 'warning');
      setLoading(false);
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      const msg = 'Please select a future date';
      setError(msg);
      showToast(msg, 'warning');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:5000/api/bookings',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const successMsg = 'Booking request submitted successfully! 📅';
      setSuccess(successMsg);
      showToast(successMsg, 'success');

      // Reset form
      setFormData({
        booking_date: '',
        booking_time: '',
        purpose: '',
        location: '',
        farmer_notes: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);

    } catch (err: any) {
      console.error('Error submitting booking:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit booking request';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{ mb: 2 }}
          >
            BACK TO HOME
          </Button>

          {/* Header - CHANGED TO GREEN */}
          <Paper elevation={2} sx={{ p: 4, mb: 3, backgroundColor: 'secondary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EventIcon sx={{ fontSize: 48, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Book a Consultation
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                  Schedule an appointment with an extension officer
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Paper elevation={2} sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Date */}
                <TextField
                  fullWidth
                  label="Preferred Date"
                  name="booking_date"
                  type="date"
                  value={formData.booking_date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                  helperText="Select a date for your consultation"
                />

                {/* Time */}
                <TextField
                  fullWidth
                  label="Preferred Time"
                  name="booking_time"
                  type="time"
                  value={formData.booking_time}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Select your preferred time"
                />

                {/* Purpose */}
                <TextField
                  fullWidth
                  label="Purpose of Consultation"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  placeholder="Describe what you need help with (e.g., crop disease identification, soil testing, irrigation advice)"
                  helperText="Please be specific about what you need help with"
                />

                {/* Location */}
                <TextField
                  fullWidth
                  label="Preferred Meeting Location (Optional)"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., My farm in Kano, Extension office, etc."
                  helperText="Where would you like to meet?"
                />

                {/* Additional Notes */}
                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  name="farmer_notes"
                  value={formData.farmer_notes}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Any other information that might be helpful"
                />

                {/* Submit Button - CHANGED TO GREEN */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{
                    backgroundColor: 'secondary.main',
                    '&:hover': { backgroundColor: 'secondary.dark' },
                    py: 1.5
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </Button>

                {/* View My Bookings Link - CHANGED TO GREEN */}
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate('/my-bookings')}
                  sx={{ color: 'secondary.main' }}
                >
                  View My Bookings
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default BookingRequestPage;