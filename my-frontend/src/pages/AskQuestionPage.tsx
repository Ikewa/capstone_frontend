/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useContext } from 'react'
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
  Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { ToastContext } from '../context/ToastContext'

function AskQuestionPage() {
  const navigate = useNavigate()
  const { showToast } = useContext(ToastContext)  // FIXED: Moved inside component
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  })
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Common tag suggestions
  const suggestedTags = [
    'Maize', 'Rice', 'Groundnut', 'Sorghum', 'Cowpea', 'Cassava',
    'Pest Control', 'Irrigation', 'Fertilizer', 'Soil Preparation',
    'Harvesting', 'Planting', 'Weed Control', 'Disease Control',
    'Dry Season', 'Rainy Season', 'Organic Farming'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = localStorage.getItem('token')
    
    if (!token) {
      showToast('Please login to ask a question', 'error')  // ADDED TOAST
      navigate('/login')
      return
    }

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title')
      showToast('Please enter a title', 'warning')  // ADDED TOAST
      return
    }

    if (formData.title.length < 10) {
      setError('Title must be at least 10 characters')
      showToast('Title must be at least 10 characters', 'warning')  // ADDED TOAST
      return
    }

    if (!formData.description.trim()) {
      setError('Please enter a description')
      showToast('Please enter a description', 'warning')  // ADDED TOAST
      return
    }

    if (formData.description.length < 20) {
      setError('Description must be at least 20 characters')
      showToast('Description must be at least 20 characters', 'warning')  // ADDED TOAST
      return
    }

    if (tags.length === 0) {
      setError('Please add at least one tag')
      showToast('Please add at least one tag', 'warning')  // ADDED TOAST
      return
    }

    try {
      setSubmitting(true)
      setError('')

      console.log('📝 Submitting question:', { ...formData, tags })

      const response = await axios.post(
        'http://localhost:5000/api/questions',
        {
          title: formData.title,
          description: formData.description,
          tags: tags,
          image_url: formData.image_url || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      console.log('✅ Question created:', response.data)

      // ADDED: Success toast
      showToast('✅ Question posted successfully!', 'success')

      // Navigate to the new question
      navigate(`/questions/${response.data.question_id}`)

    } catch (err: any) {
      console.error('💥 Error creating question:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        const errorMsg = 'Please login to ask a question'
        setError(errorMsg)
        showToast(errorMsg, 'error')  // ADDED TOAST
        setTimeout(() => navigate('/login'), 2000)
      } else {
        const errorMsg = err.response?.data?.message || 'Failed to create question. Please try again.'
        setError(errorMsg)
        showToast(errorMsg, 'error')  // ADDED TOAST
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">

          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/home')}
            sx={{ mb: 3 }}
          >
            Back to Home
          </Button>

          {/* Header */}
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            Ask a Question
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Get help from farmers and extension officers across Northern Nigeria
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Form Card */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                
                {/* Title Field */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Title
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Be specific and imagine you're asking a question to another person
                  </Typography>
                  <TextField
                    fullWidth
                    name="title"
                    placeholder="e.g., How to control armyworm in maize during rainy season?"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    helperText={`${formData.title.length} / 10 minimum characters`}
                  />
                </Box>

                {/* Description Field */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Include all the information someone would need to answer your question
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    name="description"
                    placeholder="Describe your problem in detail. What have you tried? What are the symptoms?"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    helperText={`${formData.description.length} / 20 minimum characters`}
                  />
                </Box>

                {/* Image URL Field (Optional) */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Image URL (Optional)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add an image to help explain your problem
                  </Typography>
                  <TextField
                    fullWidth
                    name="image_url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={handleChange}
                  />
                </Box>

                {/* Tags Field */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Tags
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add up to 5 tags to help others find your question
                  </Typography>

                  {/* Current Tags */}
                  {tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          deleteIcon={<CloseIcon />}
                          sx={{ 
                            bgcolor: 'secondary.main',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Add Tag Input */}
                  {tags.length < 5 && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter a tag and press Enter"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag(currentTag)
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => handleAddTag(currentTag)}
                        disabled={!currentTag.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                  )}

                  {/* Suggested Tags */}
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Suggested Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {suggestedTags
                      .filter(tag => !tags.includes(tag))
                      .map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onClick={() => handleAddTag(tag)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'secondary.light',
                              color: 'white'
                            }
                          }}
                        />
                      ))}
                  </Box>
                </Box>

                {/* Guidelines */}
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Tips for asking a good question:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Be specific and clear in your title</li>
                    <li>Provide context and details in the description</li>
                    <li>Include what you've already tried</li>
                    <li>Add relevant tags to help others find your question</li>
                    <li>Include images if they help explain the problem</li>
                  </ul>
                </Alert>

                {/* Submit Button */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    sx={{
                      flex: 1,
                      backgroundColor: 'secondary.main',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      }
                    }}
                  >
                    {submitting ? 'Posting Question...' : 'Post Your Question'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/forum')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

        </Container>
      </Box>
    </>
  )
}

export default AskQuestionPage