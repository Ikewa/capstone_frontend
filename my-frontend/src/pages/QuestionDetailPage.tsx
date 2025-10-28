/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Avatar,
  Chip,
  Divider,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { ToastContext } from '../context/ToastContext'

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

interface Answer {
  id: number
  content: string
  first_name: string
  last_name: string
  votes: number
  is_accepted: boolean
  created_at: string
  image_url?: string
  user_id: number
}

interface Question {
  id: number
  title: string
  description: string
  first_name: string
  last_name: string
  location: string
  tags: string[]
  votes: number
  views: number
  created_at: string
  image_url?: string
  answers: Answer[]
  user_id: number
}

function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useContext(ToastContext)
  
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answerContent, setAnswerContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  // Get current user info
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUserId(payload.id)
      } catch (err) {
        console.error('Error decoding token:', err)
      }
    }
  }, [])

  // Fetch question on mount
  useEffect(() => {
    if (id) {
      fetchQuestion()
    }
  }, [id])

  // Fetch question from backend
  const fetchQuestion = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await axios.get(`http://localhost:5000/api/questions/${id}`)
      setQuestion(response.data.question)
      setLoading(false)

    } catch (err: any) {
      console.error('💥 Error fetching question:', err)
      setError('Failed to load question. Please try again.')
      setLoading(false)
    }
  }

  // Handle vote on question
  const handleVoteQuestion = async (voteType: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        showToast('Please login to vote', 'warning')
        navigate('/login')
        return
      }

      await axios.post(
        'http://localhost:5000/api/vote',
        {
          votable_type: 'question',
          votable_id: parseInt(id!),
          vote_type: voteType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      showToast(`Vote ${voteType === 'up' ? '👍' : '👎'} recorded!`, 'success')
      fetchQuestion()

    } catch (err: any) {
      console.error('💥 Vote error:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        showToast('Please login to vote', 'warning')
        navigate('/login')
      } else {
        showToast('Failed to record vote', 'error')
      }
    }
  }

  // Handle vote on answer
  const handleVoteAnswer = async (answerId: number, voteType: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        showToast('Please login to vote', 'warning')
        navigate('/login')
        return
      }

      await axios.post(
        'http://localhost:5000/api/vote',
        {
          votable_type: 'answer',
          votable_id: answerId,
          vote_type: voteType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      showToast(`Vote ${voteType === 'up' ? '👍' : '👎'} recorded!`, 'success')
      fetchQuestion()

    } catch (err: any) {
      console.error('💥 Vote error:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        showToast('Please login to vote', 'warning')
        navigate('/login')
      } else {
        showToast('Failed to record vote', 'error')
      }
    }
  }

  // Handle accept answer
  const handleAcceptAnswer = async (answerId: number) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        showToast('Please login to accept answers', 'warning')
        navigate('/login')
        return
      }

      await axios.post(
        'http://localhost:5000/api/accept-answer',
        { answer_id: answerId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      showToast('Answer accepted! ✅', 'success')
      fetchQuestion()

    } catch (err: any) {
      console.error('💥 Accept answer error:', err)
      if (err.response?.status === 403) {
        showToast('Only the question author can accept answers', 'error')
      } else {
        showToast('Failed to accept answer', 'error')
      }
    }
  }

  // Handle submit answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = localStorage.getItem('token')
    
    if (!token) {
      showToast('Please login to answer', 'warning')
      navigate('/login')
      return
    }

    if (!answerContent.trim()) {
      showToast('Please enter an answer', 'warning')
      return
    }

    try {
      setSubmitting(true)

      await axios.post(
        'http://localhost:5000/api/answers',
        {
          question_id: parseInt(id!),
          content: answerContent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      showToast('Answer posted successfully! 🎉', 'success')
      setAnswerContent('')
      fetchQuestion()

    } catch (err: any) {
      console.error('💥 Submit answer error:', err)
      showToast('Failed to submit answer. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error || !question) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Question not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')}>
          Back to Home
        </Button>
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
            onClick={() => navigate('/home')}
            sx={{ mb: 3 }}
          >
            Back to Home
          </Button>

          {/* Question Card */}
          <Card sx={{ mb: 3 }}>
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
                >
                  <IconButton 
                    size="large"
                    onClick={() => handleVoteQuestion('up')}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#e8f5e9',
                        color: 'secondary.main' 
                      }
                    }}
                  >
                    <ThumbUpIcon fontSize="large" />
                  </IconButton>
                  
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: 'secondary.main'
                    }}
                  >
                    {question.votes}
                  </Typography>
                  
                  <IconButton 
                    size="large"
                    onClick={() => handleVoteQuestion('down')}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#ffebee',
                        color: 'error.main' 
                      }
                    }}
                  >
                    <ThumbDownIcon fontSize="large" />
                  </IconButton>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                    👁️ {question.views} views
                  </Typography>
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Question Content */}
                <Box sx={{ flex: 1 }}>
                  {/* Title */}
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main',
                      mb: 2
                    }}
                  >
                    {question.title}
                  </Typography>

                  {/* Author and Meta */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: 'primary.main'
                        }}
                      >
                        {question.first_name?.[0]}{question.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {question.first_name} {question.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Asked {timeAgo(question.created_at)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {question.location}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3,
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {question.description}
                  </Typography>

                  {/* Image if exists */}
                  {question.image_url && (
                    <Box 
                      component="img"
                      src={question.image_url}
                      alt="Question"
                      sx={{ 
                        maxWidth: '100%',
                        maxHeight: 400,
                        borderRadius: 2,
                        mb: 3
                      }}
                    />
                  )}

                  {/* Tags */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {question.tags?.map((tag: string) => (
                      <Chip 
                        key={tag}
                        label={tag} 
                        sx={{ 
                          bgcolor: '#e8f5e9',
                          color: 'primary.main',
                          fontWeight: 'bold'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Answers Section */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            {question.answers?.length || 0} Answer{question.answers?.length !== 1 ? 's' : ''}
          </Typography>

          {/* Answers List */}
          {question.answers?.map((answer: Answer) => (
            <Card key={answer.id} sx={{ mb: 2 }}>
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
                  >
                    <IconButton 
                      onClick={() => handleVoteAnswer(answer.id, 'up')}
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
                        color: answer.is_accepted ? 'success.main' : 'secondary.main'
                      }}
                    >
                      {answer.votes}
                    </Typography>
                    
                    <IconButton 
                      onClick={() => handleVoteAnswer(answer.id, 'down')}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: '#ffebee',
                          color: 'error.main' 
                        }
                      }}
                    >
                      <ThumbDownIcon />
                    </IconButton>

                    {/* Accept Answer Button (only for question author) */}
                    {currentUserId === question.user_id && !answer.is_accepted && (
                      <IconButton 
                        onClick={() => handleAcceptAnswer(answer.id)}
                        sx={{ 
                          mt: 2,
                          color: 'success.main',
                          '&:hover': { 
                            backgroundColor: '#e8f5e9'
                          }
                        }}
                        title="Accept this answer"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}

                    {/* Accepted Badge */}
                    {answer.is_accepted && (
                      <Chip 
                        icon={<CheckCircleIcon />}
                        label="Accepted"
                        size="small"
                        sx={{ 
                          mt: 2,
                          bgcolor: 'success.main',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* Answer Content */}
                  <Box sx={{ flex: 1 }}>
                    {/* Author */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: answer.is_accepted ? 'success.main' : 'primary.main'
                        }}
                      >
                        {answer.first_name?.[0]}{answer.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {answer.first_name} {answer.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Answered {timeAgo(answer.created_at)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Content */}
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {answer.content}
                    </Typography>

                    {/* Image if exists */}
                    {answer.image_url && (
                      <Box 
                        component="img"
                        src={answer.image_url}
                        alt="Answer"
                        sx={{ 
                          maxWidth: '100%',
                          maxHeight: 300,
                          borderRadius: 2,
                          mt: 2
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* No Answers Yet */}
          {(!question.answers || question.answers.length === 0) && (
            <Card sx={{ textAlign: 'center', py: 4, mb: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No answers yet. Be the first to help!
              </Typography>
            </Card>
          )}

          {/* Add Answer Form */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Your Answer
              </Typography>
              
              <form onSubmit={handleSubmitAnswer}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Share your knowledge and help the community..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={<SendIcon />}
                  disabled={submitting || !answerContent.trim()}
                  sx={{
                    backgroundColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    }
                  }}
                >
                  {submitting ? 'Posting...' : 'Post Answer'}
                </Button>
              </form>
            </CardContent>
          </Card>

        </Container>
      </Box>
    </>
  )
}

export default QuestionDetailPage