/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { ToastContext } from '../context/ToastContext'

function EventDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useContext(ToastContext)
  
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/events/${id}`)
      setEvent(response.data.event)
      
      // Check if current user is registered
      const token = localStorage.getItem('token')
      if (token) {
        const userData = JSON.parse(atob(token.split('.')[1]))
        const registered = response.data.event.attendees.some(
          (a: any) => a.first_name === userData.first_name && a.last_name === userData.last_name
        )
        setIsRegistered(registered)
      }
      
      setError('')
    } catch (err) {
      console.error('Error fetching event:', err)
      setError('Failed to load event details.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      showToast('Please login to register for events', 'warning')
      navigate('/login')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      await axios.post(
        'http://localhost:5000/api/events/register',
        { event_id: parseInt(id!) },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const successMsg = 'Successfully registered for this event! 🎉'
      setSuccess(successMsg)
      showToast(successMsg, 'success')
      setIsRegistered(true)
      fetchEvent()
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to register for event.'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    const token = localStorage.getItem('token')

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      await axios.post(
        'http://localhost:5000/api/events/cancel',
        { event_id: parseInt(id!) },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const successMsg = 'Registration cancelled successfully.'
      setSuccess(successMsg)
      showToast(successMsg, 'info')
      setIsRegistered(false)
      fetchEvent()
    } catch (err: any) {
      console.error('Cancellation error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to cancel registration.'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getEventTypeColor = (type: string) => {
    const colors: any = {
      'Workshop': '#2e7d32',
      'Training': '#1976d2',
      'Seminar': '#ed6c02',
      'Networking': '#9c27b0',
      'Field Day': '#d32f2f',
      'Other': '#616161'
    }
    return colors[type] || '#616161'
  }

  const isEventFull = () => {
    if (!event?.max_attendees) return false
    return event.attendee_count >= event.max_attendees
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Event not found</Alert>
      </Container>
    )
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/events')}
            sx={{ mb: 3, color: 'primary.main' }}
          >
            Back to Events
          </Button>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Main Event Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {/* Event Type Badge */}
              <Chip 
                label={event.event_type}
                size="small"
                sx={{ 
                  mb: 2,
                  backgroundColor: getEventTypeColor(event.event_type),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />

              {/* Title */}
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  mb: 3
                }}
              >
                {event.title}
              </Typography>

              {/* Event Info Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
                {/* Date & Time */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarMonthIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Date & Time
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {formatDate(event.event_date)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">
                      {formatTime(event.event_time)}
                    </Typography>
                  </Box>
                </Box>

                {/* Location */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOnIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Location
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {event.venue || event.location}
                  </Typography>
                  {event.venue && (
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                About This Event
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                {event.description}
              </Typography>

              {/* Attendee Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PeopleIcon sx={{ color: 'success.main' }} />
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  {event.attendee_count} {event.attendee_count === 1 ? 'person' : 'people'} attending
                  {event.max_attendees && ` (${event.max_attendees} max)`}
                </Typography>
              </Box>

              {/* Registration Button */}
              {isRegistered ? (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={submitting}
                    color="error"
                  >
                    {submitting ? 'Cancelling...' : 'Cancel Registration'}
                  </Button>
                  <Chip 
                    icon={<CheckCircleIcon />}
                    label="You're registered!"
                    color="success"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleRegister}
                  disabled={submitting || isEventFull()}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                  }}
                >
                  {submitting ? 'Registering...' : isEventFull() ? 'Event Full' : 'Register for Event'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Attendees List */}
          {event.attendees && event.attendees.length > 0 && (
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
                  Attendees ({event.attendees.length})
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  {event.attendees.map((attendee: any, index: number) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {attendee.first_name} {attendee.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {attendee.role} • {attendee.location}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

        </Container>
      </Box>
    </>
  )
}

export default EventDetailPage