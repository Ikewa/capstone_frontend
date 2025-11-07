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
import Translate from '../components/Translate'
import { useTranslate } from '../hooks/useTranslate'
import { useLanguage } from '../context/LanguageContext'

function AskQuestionPage() {
  const navigate = useNavigate()
  const { showToast } = useContext(ToastContext)
  const { translate } = useLanguage()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  })
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Translate labels
  const labels = [
    'Title',
    'Be specific and imagine you\'re asking a question to another person',
    'e.g., How to control armyworm in maize during rainy season?',
    'minimum characters',
    'Description',
    'Include all the information someone would need to answer your question',
    'Describe your problem in detail. What have you tried? What are the symptoms?',
    'Image URL (Optional)',
    'Add an image to help explain your problem',
    'Tags',
    'Add up to 5 tags to help others find your question',
    'Enter a tag and press Enter',
    'Add',
    'Suggested Tags:',
    'Tips for asking a good question:',
    'Be specific and clear in your title',
    'Provide context and details in the description',
    'Include what you\'ve already tried',
    'Add relevant tags to help others find your question',
    'Include images if they help explain the problem',
    'Posting Question...',
    'Post Your Question',
    'Cancel'
  ];
  const { translated: translatedLabels } = useTranslate(labels);

  // Common tag suggestions - Don't translate (they're standard terms)
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
      const msg = await translate('Please login to ask a question')
      showToast(msg, 'error')
      navigate('/login')
      return
    }

    // Validation
    if (!formData.title.trim()) {
      const msg = await translate('Please enter a title')
      setError(msg)
      showToast(msg, 'warning')
      return
    }

    if (formData.title.length < 10) {
      const msg = await translate('Title must be at least 10 characters')
      setError(msg)
      showToast(msg, 'warning')
      return
    }

    if (!formData.description.trim()) {
      const msg = await translate('Please enter a description')
      setError(msg)
      showToast(msg, 'warning')
      return
    }

    if (formData.description.length < 20) {
      const msg = await translate('Description must be at least 20 characters')
      setError(msg)
      showToast(msg, 'warning')
      return
    }

    if (tags.length === 0) {
      const msg = await translate('Please add at least one tag')
      setError(msg)
      showToast(msg, 'warning')
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

      const successMsg = await translate('✅ Question posted successfully!')
      showToast(successMsg, 'success')

      // Navigate to the new question
      navigate(`/questions/${response.data.question_id}`)

    } catch (err: any) {
      console.error('💥 Error creating question:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        const errorMsg = await translate('Please login to ask a question')
        setError(errorMsg)
        showToast(errorMsg, 'error')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        const errorMsg = err.response?.data?.message || await translate('Failed to create question. Please try again.')
        setError(errorMsg)
        showToast(errorMsg, 'error')
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
            <Translate text="Back to Home" />
          </Button>

          {/* Header */}
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            <Translate text="Ask a Question" />
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            <Translate text="Get help from farmers and extension officers across Northern Nigeria" />
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
                    {translatedLabels[0]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {translatedLabels[1]}
                  </Typography>
                  <TextField
                    fullWidth
                    name="title"
                    placeholder={translatedLabels[2]}
                    value={formData.title}
                    onChange={handleChange}
                    required
                    helperText={`${formData.title.length} / 10 ${translatedLabels[3]}`}
                  />
                </Box>

                {/* Description Field */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {translatedLabels[4]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {translatedLabels[5]}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    name="description"
                    placeholder={translatedLabels[6]}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    helperText={`${formData.description.length} / 20 ${translatedLabels[3]}`}
                  />
                </Box>

                {/* Image URL Field (Optional) */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {translatedLabels[7]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {translatedLabels[8]}
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
                    {translatedLabels[9]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {translatedLabels[10]}
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
                        placeholder={translatedLabels[11]}
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
                        {translatedLabels[12]}
                      </Button>
                    </Box>
                  )}

                  {/* Suggested Tags */}
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {translatedLabels[13]}
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
                    {translatedLabels[14]}
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>{translatedLabels[15]}</li>
                    <li>{translatedLabels[16]}</li>
                    <li>{translatedLabels[17]}</li>
                    <li>{translatedLabels[18]}</li>
                    <li>{translatedLabels[19]}</li>
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
                    {submitting ? translatedLabels[20] : translatedLabels[21]}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/forum')}
                    disabled={submitting}
                  >
                    {translatedLabels[22]}
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