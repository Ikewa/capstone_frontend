/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useContext } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import WorkIcon from '@mui/icons-material/Work'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import axios from 'axios'
import { ToastContext } from '../context/ToastContext'

function SignupPage() {
  const navigate = useNavigate()
  const { showToast } = useContext(ToastContext)

  // STATE: Form data with role
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'Farmer',  // Default to Farmer
    location: '',
    password: '',
    confirmPassword: '',
  })

  // STATE: Error, success, and loading states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Northern Nigeria states
  const nigerianStates = [
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

  // FUNCTION: Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  // FUNCTION: Handle role selection change
  const handleRoleChange = (e: any) => {
    setFormData({
      ...formData,
      role: e.target.value
    })
  }

  // FUNCTION: Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // FUNCTION: Validate passwords match
  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      const msg = 'Passwords do not match'
      setError(msg)
      showToast(msg, 'error')
      return false
    }
    if (formData.password.length < 6) {
      const msg = 'Password must be at least 6 characters'
      setError(msg)
      showToast(msg, 'warning')
      return false
    }
    return true
  }

  // FUNCTION: Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email format
    if (!validateEmail(formData.email)) {
      const msg = 'Please enter a valid email address'
      setError(msg)
      showToast(msg, 'warning')
      return
    }

    // Validate passwords before submitting
    if (!validatePasswords()) return

    setLoading(true)
    setError('')

    try {
      // Call the backend API
      const response = await axios.post('http://localhost:5000/users/signup', formData)
      
      console.log("✅ Signup successful:", response.data)
      
      // Show success message
      setSuccess(true)
      showToast('Account created successfully! Redirecting to login... ✅', 'success')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (err: unknown) {
      // Handle errors
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || 'Signup failed. Please try again.'
        setError(errorMsg)
        showToast(errorMsg, 'error')
      } else {
        const errorMsg = 'An unexpected error occurred.'
        setError(errorMsg)
        showToast(errorMsg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f5e9 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AgricultureIcon 
              sx={{ 
                fontSize: 60, 
                color: 'primary.main',
                mb: 2 
              }} 
            />
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold',
                mb: 1 
              }}
            >
              Join AgriConnect
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your account to get started
            </Typography>
          </Box>

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Account created successfully! Redirecting to login...
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            {/* First Name Field */}
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Last Name Field */}
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              helperText="We'll use this for login"
            />

            {/* Role Selection - NEW */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="role-label">I am a</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="I am a"
                onChange={handleRoleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <WorkIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="Farmer">Farmer</MenuItem>
                <MenuItem value="Extension Officer">Extension Officer</MenuItem>
              </Select>
            </FormControl>

            {/* Location Dropdown */}
            <TextField
              fullWidth
              select
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            >
              {nigerianStates.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              helperText="Minimum 6 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || success}
              sx={{
                py: 1.5,
                backgroundColor: 'secondary.main',
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
                mb: 2,
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Login
                </Link>
              </Typography>
            </Box>

            {/* Back to Landing */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component={RouterLink}
                to="/"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                ← Back to Home
              </Link>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}

export default SignupPage