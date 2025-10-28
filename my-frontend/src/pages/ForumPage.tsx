/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
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
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import CommentIcon from '@mui/icons-material/Comment'
import AddIcon from '@mui/icons-material/Add'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import axios from 'axios'
import Navbar from '../components/Navbar'

// Helper function to calculate time ago
function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

interface Question {
  id: number
  title: string
  description: string
  first_name: string
  last_name: string
  user_location: string
  location: string
  tags: string[]
  votes: number
  answer_count: number
  views: number
  created_at: string
  image_url?: string
}

function ForumPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions()
  }, [])

  // Fetch questions from backend
  const fetchQuestions = async (search = '', location = '') => {
    try {
      setLoading(true)
      setError('')

      let url = 'http://localhost:5000/api/questions'
      const params = new URLSearchParams()
      
      if (search) params.append('search', search)
      if (location && location !== 'all') params.append('location', location)
      
      if (params.toString()) url += '?' + params.toString()

      console.log('📡 Fetching questions from:', url)

      const response = await axios.get(url)
      
      console.log('✅ Received', response.data.questions.length, 'questions')
      
      setQuestions(response.data.questions)
      setLoading(false)

    } catch (err: unknown) {
      console.error('💥 Error fetching questions:', err)
      setError('Failed to load questions. Please try again.')
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = () => {
    const locationFilter = selectedFilter !== 'all' && selectedFilter !== 'location' 
      ? selectedFilter 
      : ''
    fetchQuestions(searchQuery, locationFilter)
  }

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    if (filter === 'all') {
      fetchQuestions(searchQuery, '')
    } else if (filter !== 'location') {
      // For now, we'll just set it. In a real app, you'd filter by tag
      setSelectedFilter(filter)
    }
  }

  // Handle vote
  const handleVote = async (questionId: number, voteType: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Please login to vote')
        navigate('/login')
        return
      }

      console.log('🗳️ Voting:', voteType, 'on question', questionId)

      await axios.post(
        'http://localhost:5000/forum/vote',
        {
          votable_type: 'question',
          votable_id: questionId,
          vote_type: voteType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      console.log('✅ Vote recorded')

      // Refresh questions to show updated vote count
      fetchQuestions(searchQuery, selectedFilter !== 'all' ? selectedFilter : '')

    } catch (err: unknown) {
      console.error('💥 Vote error:', err)
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof ((err as any).response) === 'object' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).response !== null &&
        ('status' in (err as any).response)
      ) {
        const status = (err as any).response.status
        if (status === 401 || status === 403) {
          alert('Please login to vote')
          navigate('/login')
        } else {
          alert('Failed to record vote. Please try again.')
        }
      } else {
        alert('Failed to record vote. Please try again.')
      }
    }
  }

  const filterTags = [
    { label: 'All Questions', value: 'all' },
    { label: 'Kano State', value: 'Kano State' },
    { label: 'Kaduna State', value: 'Kaduna State' },
    { label: 'Sokoto State', value: 'Sokoto State' },
    { label: 'Bauchi State', value: 'Bauchi State' },
    { label: 'Katsina State', value: 'Katsina State' },
  ]

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <>
        <Navbar />
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
            
            {/* Header */}
            <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                    Discussion Forum 💬
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Ask questions, share knowledge, and learn from the community
                </Typography>
                </Box>
                <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/forum/ask')}
                sx={{
                    backgroundColor: 'secondary.main',
                    '&:hover': {
                    backgroundColor: 'secondary.dark',
                    }
                }}
                >
                Ask Question
                </Button>
            </Box>
            </Box>

            {/* Error Alert */}
            {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
            </Alert>
            )}

            {/* Search Bar */}
            <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    placeholder="Search questions by topic, location, or crop type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearch()
                    }}
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                    }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleSearch}
                    sx={{ minWidth: 100 }}
                >
                    Search
                </Button>
                </Box>
                
                {/* Filter Tags */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {filterTags.map((filter) => (
                    <Chip
                    key={filter.value}
                    label={filter.label}
                    onClick={() => handleFilterChange(filter.value)}
                    sx={{
                        backgroundColor: selectedFilter === filter.value ? 'secondary.main' : '#e8f5e9',
                        color: selectedFilter === filter.value ? 'white' : 'primary.main',
                        fontWeight: selectedFilter === filter.value ? 'bold' : 'normal',
                        '&:hover': {
                        backgroundColor: selectedFilter === filter.value ? 'secondary.dark' : '#c8e6c9',
                        },
                        cursor: 'pointer',
                    }}
                    />
                ))}
                </Box>
            </CardContent>
            </Card>

            {/* Questions Count */}
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            {questions.length} question{questions.length !== 1 ? 's' : ''} found
            </Typography>

            {/* Questions List */}
            {questions.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No questions found. Be the first to ask!
                </Typography>
                <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/forum/ask')}
                >
                Ask Question
                </Button>
            </Card>
            ) : (
            questions.map((question) => (
                <Card 
                key={question.id}
                sx={{ 
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    }
                }}
                onClick={() => navigate(`/questions/${question.id}`)}
                >
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                    
                    {/* Voting Section */}
                    <Box 
                        sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        minWidth: 80,
                        gap: 1
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <IconButton 
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleVote(question.id, 'up')
                        }}
                        sx={{ 
                            '&:hover': { 
                            backgroundColor: '#e8f5e9',
                            color: 'secondary.main' 
                            }
                        }}
                        >
                        <ThumbUpIcon />
                        </IconButton>
                        
                        <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 'bold',
                            color: 'secondary.main'
                        }}
                        >
                        {question.votes}
                        </Typography>
                        
                        <IconButton 
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleVote(question.id, 'down')
                        }}
                        sx={{ 
                            '&:hover': { 
                            backgroundColor: '#ffebee',
                            color: 'error.main' 
                            }
                        }}
                        >
                        <ThumbDownIcon />
                        </IconButton>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    {/* Question Content */}
                    <Box sx={{ flex: 1 }}>
                        {/* Author Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar 
                            sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: 'primary.main',
                            fontSize: '0.875rem'
                            }}
                        >
                            {question.first_name?.[0]}{question.last_name?.[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {question.first_name} {question.last_name}
                        </Typography>
                        </Box>

                        {/* Question Title */}
                        <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 'bold', 
                            color: 'primary.main',
                            mb: 1,
                            '&:hover': {
                            color: 'secondary.main'
                            }
                        }}
                        >
                        {question.title}
                        </Typography>

                        {/* Question Description */}
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
                        {question.description}
                        </Typography>

                        {/* Tags */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {question.tags?.map((tag: string) => (
                            <Chip 
                            key={tag}
                            label={tag} 
                            size="small"
                            sx={{ 
                                bgcolor: '#e8f5e9',
                                color: 'primary.main',
                                fontSize: '0.75rem'
                            }}
                            />
                        ))}
                        </Box>

                        {/* Meta Information */}
                        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                            {question.location}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                            {timeAgo(question.created_at)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                            {question.answer_count} answer{question.answer_count !== 1 ? 's' : ''}
                            </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                            👁️ {question.views} views
                        </Typography>

                        {question.image_url && (
                            <Chip 
                            label="Has Image" 
                            size="small" 
                            sx={{ 
                                height: 20,
                                fontSize: '0.65rem',
                                bgcolor: '#fff3e0'
                            }}
                            />
                        )}
                        </Box>
                    </Box>
                    </Box>
                </CardContent>
                </Card>
            ))
            )}

        </Container>
        </Box>
    </>
  )
}

export default ForumPage