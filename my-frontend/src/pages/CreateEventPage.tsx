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
  MenuItem,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import EventIcon from '@mui/icons-material/Event';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    max_attendees: '',
    event_type: 'Workshop'
  });

  const eventTypes = ['Workshop', 'Training', 'Seminar', 'Field Visit', 'Meeting', 'Other'];

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
    if (!formData.title || !formData.description || !formData.event_date || !formData.event_time || !formData.location) {
      const msg = 'Please fill in all required fields';
      setError(msg);
      showToast(msg, 'warning');
      setLoading(false);
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.event_date);
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

      const payload = {
        ...formData,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
      };

      await axios.post(
        'http://localhost:5000/api/events',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const successMsg = 'Event created successfully! 🎉';
      setSuccess(successMsg);
      showToast(successMsg, 'success');

      // Reset form
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        max_attendees: '',
        event_type: 'Workshop'
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/my-events');
      }, 2000);

    } catch (err: any) {
      console.error('Error creating event:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create event';
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
            onClick={() => navigate('/my-events')}
            sx={{ mb: 2 }}
          >
            BACK TO MY EVENTS
          </Button>

          {/* Header */}
          <Paper elevation={2} sx={{ p: 4, mb: 3, backgroundColor: '#1976d2', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EventIcon sx={{ fontSize: 48, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Create New Event
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                  Organize workshops, training sessions, and field visits for farmers
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
                {/* Title */}
                <TextField
                  fullWidth
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Modern Rice Farming Techniques Workshop"
                  helperText="Give your event a clear, descriptive title"
                />

                {/* Event Type */}
                <TextField
                  select
                  fullWidth
                  label="Event Type"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  required
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Description */}
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  multiline
                  rows={5}
                  placeholder="Describe what the event is about, what participants will learn, and any requirements"
                  helperText="Provide detailed information about the event"
                />

                {/* Date and Time */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0]
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Time"
                    name="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>

                {/* Location */}
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Kano Agricultural Extension Office, Sabon Gari"
                  helperText="Specify the exact location where the event will take place"
                />

                {/* Max Participants */}
                <TextField
                  fullWidth
                  label="Maximum Participants (Optional)"
                  name="max_attendees"
                  type="number"
                  value={formData.max_attendees}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  helperText="Set a limit if venue has capacity restrictions"
                  inputProps={{ min: 1 }}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#115293' },
                    py: 1.5
                  }}
                >
                  {loading ? 'Creating Event...' : 'Create Event'}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default CreateEventPage;