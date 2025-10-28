/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PeopleIcon from '@mui/icons-material/People'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import axios from 'axios'
import Navbar from '../components/Navbar'

function EventsPage() {
  const navigate = useNavigate()
  
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const nigerianStates = [
    'All Locations',
    'Kano State',
    'Kaduna State',
    'Katsina State',
    'Sokoto State',
    'Zamfara State',
    'Jigawa State',
    'Kebbi State',
    'Bauchi State',
    'Borno State',
    'Gombe State',
    'Yobe State',
    'Adamawa State',
    'Taraba State',
    'Plateau State',
    'Nasarawa State',
    'Niger State',
    'Benue State',
    'Kogi State',
    'Kwara State',
    'FCT Abuja',
  ]

  const eventTypes = [
    'All Types',
    'Workshop',
    'Training',
    'Seminar',
    'Field Visit',
    'Meeting',
    'Other'
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      let url = 'http://localhost:5000/api/events'
      const params = new URLSearchParams()
      
      if (search) params.append('search', search)
      if (locationFilter && locationFilter !== 'all') params.append('location', locationFilter)
      if (typeFilter && typeFilter !== 'all') params.append('event_type', typeFilter)
      
      if (params.toString()) url += '?' + params.toString()

      const response = await axios.get(url)
      console.log('✅ Events loaded:', response.data)
      setEvents(response.data.events)
      setError('')
    } catch (err) {
      console.error('❌ Error fetching events:', err)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchEvents()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return 'No time'
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
      'Field Visit': '#d32f2f',
      'Meeting': '#9c27b0',
      'Other': '#616161'
    }
    return colors[type] || '#616161'
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">

          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{ mb: 3, color: 'primary.main' }}
          >
            Back to Home
          </Button>

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
              📅 Agricultural Events
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover workshops, training sessions, and networking opportunities
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Search and Filters */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                {/* Search */}
                <TextField
                  fullWidth
                  placeholder="Search events by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Location Filter */}
                <TextField
                  select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {nigerianStates.map((state) => (
                    <MenuItem key={state} value={state === 'All Locations' ? 'all' : state}>
                      {state}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Type Filter */}
                <TextField
                  select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type === 'All Types' ? 'all' : type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Search Button */}
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{ minWidth: 100 }}
                >
                  Search
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Loading */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Events List */}
          {!loading && (
            <>
              <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                {events.length} event{events.length !== 1 ? 's' : ''} found
              </Typography>

              {events.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      No events found. Try adjusting your filters.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 3,
                  }}
                >
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
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
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: 'primary.main',
                            mb: 2
                          }}
                        >
                          {event.title}
                        </Typography>

                        {/* Description */}
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {event.description}
                        </Typography>

                        {/* Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarMonthIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(event.event_date)} at {formatTime(event.event_time)}
                          </Typography>
                        </Box>

                        {/* Location */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.venue ? `${event.venue}, ${event.location}` : event.location}
                          </Typography>
                        </Box>

                        {/* Attendees */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PeopleIcon fontSize="small" sx={{ color: 'success.main' }} />
                          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            {event.attendee_count || 0} attending
                            {event.max_attendees && ` / ${event.max_attendees} max`}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </>
          )}

        </Container>
      </Box>
    </>
  )
}

export default EventsPage