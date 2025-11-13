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
  Grid,
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
import Translate from '../components/Translate'
import { useTranslate } from '../hooks/useTranslate'
import { useLanguage } from '../context/LanguageContext'

interface Answer {
  id: number
  content: string
  first_name: string
  last_name: string
  votes: number
  is_accepted: boolean
  created_at: string
  image_url?: string
  images?: string[]  // ← ADD THIS
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
  images?: string[]  // ← ADD THIS
  answers: Answer[]
  user_id: number
}

function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useContext(ToastContext)
  const { translate } = useLanguage()
  
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answerContent, setAnswerContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  // Translate labels
  const labels = [
    'views',
    'Asked',
    'Answer',
    'Answers',
    'Answered',
    'Accept this answer',
    'Accepted',
    'No answers yet. Be the first to help!',
    'Your Answer',
    'Share your knowledge and help the community...',
    'Posting...',
    'Post Answer',
    'Question not found',
    'just now',
    'minute',
    'minutes',
    'hour',
    'hours',
    'day',
    'days',
    'month',
    'months',
    'ago'
  ];
  const { translated: translatedLabels } = useTranslate(labels);

  // Helper function to calculate time ago with translations
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return translatedLabels[13] || 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} ${minutes > 1 ? translatedLabels[15] : translatedLabels[14]} ${translatedLabels[22]}`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ${hours > 1 ? translatedLabels[17] : translatedLabels[16]} ${translatedLabels[22]}`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} ${days > 1 ? translatedLabels[19] : translatedLabels[18]} ${translatedLabels[22]}`
    const months = Math.floor(days / 30)
    return `${months} ${months > 1 ? translatedLabels[21] : translatedLabels[20]} ${translatedLabels[22]}`
  }

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

      const response = await axios.get(`/api/questions/${id}`)
      console.log('📦 Question data:', response.data.question)
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
        const msg = await translate('Please login to vote')
        showToast(msg, 'warning')
        navigate('/login')
        return
      }

      await axios.post(
        '/api/vote',
        {
          votable_type: 'question',
          votable_id: parseInt(id!),
          vote_type: voteType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const successMsg = await translate(voteType === 'up' ? 'Vote 👍 recorded!' : 'Vote 👎 recorded!')
      showToast(successMsg, 'success')
      fetchQuestion()

    } catch (err: any) {
      console.error('💥 Vote error:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        const msg = await translate('Please login to vote')
        showToast(msg, 'warning')
        navigate('/login')
      } else {
        const msg = await translate('Failed to record vote')
        showToast(msg, 'error')
      }
    }
  }

  // Handle vote on answer
  const handleVoteAnswer = async (answerId: number, voteType: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        const msg = await translate('Please login to vote')
        showToast(msg, 'warning')
        navigate('/login')
        return
      }

      await axios.post(
        '/api/vote',
        {
          votable_type: 'answer',
          votable_id: answerId,
          vote_type: voteType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const successMsg = await translate(voteType === 'up' ? 'Vote 👍 recorded!' : 'Vote 👎 recorded!')
      showToast(successMsg, 'success')
      fetchQuestion()

    } catch (err: any) {
      console.error('💥 Vote error:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        const msg = await translate('Please login to vote')
        showToast(msg, 'warning')
        navigate('/login')
      } else {
        const msg = await translate('Failed to record vote')
        showToast(msg, 'error')
      }
    }
  }

  // Handle accept answer
  const handleAcceptAnswer = async (answerId: number) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        const msg = await translate('Please login to accept answers')
        showToast(msg, 'warning')
        navigate('/login')
        return
      }

      await axios.post(
        '/api/accept-answer',
        { answer_id: answerId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const successMsg = await translate('Answer accepted! ✅')
      showToast(successMsg, 'success')
      fetchQuestion()

    } catch (err: any) {
      console.error('💥 Accept answer error:', err)
      if (err.response?.status === 403) {
        const msg = await translate('Only the question author can accept answers')
        showToast(msg, 'error')
      } else {
        const msg = await translate('Failed to accept answer')
        showToast(msg, 'error')
      }
    }
  }

  // Handle submit answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = localStorage.getItem('token')
    
    if (!token) {
      const msg = await translate('Please login to answer')
      showToast(msg, 'warning')
      navigate('/login')
      return
    }

    if (!answerContent.trim()) {
      const msg = await translate('Please enter an answer')
      showToast(msg, 'warning')
      return
    }

    try {
      setSubmitting(true)

      await axios.post(
        '/api/answers',
        {
          question_id: parseInt(id!),
          content: answerContent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const successMsg = await translate('Answer posted successfully! 🎉')
      showToast(successMsg, 'success')
      setAnswerContent('')
      fetchQuestion()

    } catch (err: any) {
      console.error('💥 Submit answer error:', err)
      const errorMsg = await translate('Failed to submit answer. Please try again.')
      showToast(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress size={60} />
        </Box>
      </>
    )
  }

  if (error || !question) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || translatedLabels[12]}
          </Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')}>
            <Translate text="Back to Home" />
          </Button>
        </Container>
      </>
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
            <Translate text="Back to Home" />
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
                    👁️ {question.views} {translatedLabels[0]}
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
                        <Typography
                            variant="body1"
                            onClick={() => navigate(`/profile/${question.user_id}`)}
                            sx={{
                                cursor: 'pointer',
                                color: 'primary.main',
                                fontWeight: 'bold',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                            >
                            {question.first_name} {question.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {translatedLabels[1]} {timeAgo(question.created_at)}
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

                  {/* ✅ DISPLAY QUESTION IMAGES */}
                  {question.images && question.images.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                        📷 Attached Images ({question.images.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {question.images.map((imageUrl: string, index: number) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              component="img"
                              src={imageUrl}
                              alt={`Question image ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: 200,
                                objectFit: 'cover',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  opacity: 0.9,
                                  transform: 'scale(1.02)',
                                  boxShadow: 3,
                                },
                              }}
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Old single image support (keep for backwards compatibility) */}
                  {question.image_url && !question.images && (
                    <Box 
                      component="img"
                      src={question.image_url}
                      alt="Question"
                      sx={{ 
                        maxWidth: '100%',
                        maxHeight: 400,
                        borderRadius: 2,
                        mb: 3,
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(question.image_url, '_blank')}
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
            {question.answers?.length || 0} {question.answers?.length === 1 ? translatedLabels[2] : translatedLabels[3]}
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

                    {/* Accept Answer Button */}
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
                        title={translatedLabels[5]}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}

                    {/* Accepted Badge */}
                    {answer.is_accepted && (
                      <Chip 
                        icon={<CheckCircleIcon />}
                        label={translatedLabels[6]}
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
                        <Typography
                            variant="body1"
                            onClick={() => navigate(`/profile/${answer.user_id}`)}
                            sx={{
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                color: 'primary.main',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                            >
                            {answer.first_name} {answer.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {translatedLabels[4]} {timeAgo(answer.created_at)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Content */}
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                        mb: 2
                      }}
                    >
                      {answer.content}
                    </Typography>

                    {/* ✅ DISPLAY ANSWER IMAGES */}
                    {answer.images && answer.images.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          📷 Attached Images
                        </Typography>
                        <Grid container spacing={2}>
                          {answer.images.map((imageUrl: string, index: number) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Box
                                component="img"
                                src={imageUrl}
                                alt={`Answer image ${index + 1}`}
                                sx={{
                                  width: '100%',
                                  height: 150,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  border: '1px solid #e0e0e0',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    opacity: 0.9,
                                    transform: 'scale(1.02)',
                                  },
                                }}
                                onClick={() => window.open(imageUrl, '_blank')}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Old single image support (keep for backwards compatibility) */}
                    {answer.image_url && !answer.images && (
                      <Box 
                        component="img"
                        src={answer.image_url}
                        alt="Answer"
                        sx={{ 
                          maxWidth: '100%',
                          maxHeight: 300,
                          borderRadius: 2,
                          mt: 2,
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(answer.image_url, '_blank')}
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
                {translatedLabels[7]}
              </Typography>
            </Card>
          )}

          {/* Add Answer Form */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {translatedLabels[8]}
              </Typography>
              
              <form onSubmit={handleSubmitAnswer}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder={translatedLabels[9]}
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
                  {submitting ? translatedLabels[10] : translatedLabels[11]}
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
