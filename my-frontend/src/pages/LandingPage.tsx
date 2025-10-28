import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
} from '@mui/material'

// Import icons
import ForumIcon from '@mui/icons-material/Forum'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import EventIcon from '@mui/icons-material/Event'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import MapIcon from '@mui/icons-material/Map'
import StarIcon from '@mui/icons-material/Star'
import LocationOnIcon from '@mui/icons-material/LocationOn'

function LandingPage() {
  const navigate = useNavigate()

  // Array of features to display
  const features = [
    {
      icon: <ForumIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Discussion Forum',
      description: 'Ask questions, share solutions, and learn from fellow farmers and extension officers. Search by location, crop type, or specific challenges.',
      badge: 'Like Stack Overflow',
      path: '/signup'
    },
    {
      icon: <AgricultureIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Crop Recommendations',
      description: 'Get personalized farming recommendations based on your location, weather conditions, soil type, and challenges.',
      badge: 'Smart Insights',
      path: '/signup'
    },
    {
      icon: <CalendarMonthIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Book Extension Officers',
      description: 'Schedule one-on-one consultations with agricultural extension officers for personalized guidance.',
      badge: 'Direct Support',
      path: '/signup'
    },
    {
      icon: <EventIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Events & Training',
      description: 'Stay updated on agricultural events, workshops, training sessions, and farming demonstrations in your area.',
      badge: 'Community Events',
      path: '/signup'
    },
    {
      icon: <MapIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Interactive Maps',
      description: 'Discover markets, farms, extension officers, and resources near you. Connect with your local farming community.',
      badge: 'Location-Based',
      path: '/signup'
    },
    {
      icon: <StarIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Community Voting',
      description: 'Vote on the most helpful answers. Quality content rises to the top, ensuring you get the best advice.',
      badge: 'Verified Solutions',
      path: '/signup'
    },
  ]

  return (
    <Box>
      {/* HERO SECTION */}
      <Box
        sx={{
          minHeight: '90vh',
          background: 'linear-gradient(135deg, #2d5016 0%, #5a8c2f 50%, #7ba84f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          px: 2,
          py: 8,
        }}
      >
        <Container maxWidth="md">
          {/* Main heading */}
          <Typography 
            variant="h2" 
            component="h1"
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              fontSize: { xs: '2rem', md: '3.5rem' }
            }}
          >
            Agricultural Extension in the Digital Age
          </Typography>

          {/* Subtitle */}
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 1, 
              opacity: 0.95,
              fontSize: { xs: '1.2rem', md: '1.5rem' }
            }}
          >
            A Community-Driven Platform for Farmers in Northern Nigeria
          </Typography>

          {/* Location tag */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 3 }}>
            <LocationOnIcon />
            <Typography variant="h6" sx={{ opacity: 0.85 }}>
              Connecting Farmers & Extension Officers Across Northern Nigeria
            </Typography>
          </Box>

          {/* Description */}
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              opacity: 0.9,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            Bridge the knowledge gap. Share experiences. Grow together. AgriFuture brings farmers and extension officers onto one platform to exchange valuable agricultural information, solve problems, and build a stronger farming community.
          </Typography>

          {/* Call-to-action button */}
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s'
            }}
          >
            Get Started Today
          </Button>
        </Container>
      </Box>

      {/* FEATURES SECTION */}
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          {/* Section title */}
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              color: 'primary.main', 
              fontWeight: 'bold', 
              mb: 2 
            }}
          >
            Explore Our Platform
          </Typography>

          {/* Section subtitle */}
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              color: 'text.secondary',
              mb: 6,
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            Everything you need to succeed in modern agriculture
          </Typography>

          {/* Feature cards using CSS Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',                    // 1 column on mobile (extra small)
                sm: 'repeat(2, 1fr)',         // 2 columns on small screens
                md: 'repeat(3, 1fr)',         // 3 columns on medium+ screens
              },
              gap: 3,  // 24px gap between cards
            }}
          >
            {/* Loop through features array and create a card for each */}
            {features.map((feature, index) => (
              <Card
                key={index}
                onClick={() => navigate(feature.path)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '2px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                    borderColor: 'secondary.main',
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  {/* Icon */}
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>

                  {/* Title */}
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: 'primary.main', 
                      fontWeight: 'bold', 
                      mb: 2 
                    }}
                  >
                    {feature.title}
                  </Typography>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary', 
                      lineHeight: 1.7,
                      mb: 2
                    }}
                  >
                    {feature.description}
                  </Typography>

                  {/* Badge */}
                  <Chip 
                    label={feature.badge} 
                    size="small"
                    sx={{ 
                      backgroundColor: '#e8f5e9', 
                      color: 'primary.main',
                      fontWeight: 'bold'
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* HOW IT WORKS SECTION */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              color: 'primary.main', 
              fontWeight: 'bold', 
              mb: 2 
            }}
          >
            How It Works
          </Typography>

          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              color: 'text.secondary', 
              mb: 6 
            }}
          >
            Join our community in three simple steps
          </Typography>

          {/* Steps using CSS Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',                    // 1 column on mobile
                md: 'repeat(3, 1fr)',         // 3 columns on desktop
              },
              gap: 4,  // 32px gap
            }}
          >
            {/* Step 1 */}
            <Box sx={{ textAlign: 'center' }}>
              {/* Step number circle */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5a8c2f, #7ba84f)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 2rem'
                }}
              >
                1
              </Box>
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
                Sign Up
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                Create your account as a farmer or extension officer. Tell us about your location and farming interests.
              </Typography>
            </Box>

            {/* Step 2 */}
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5a8c2f, #7ba84f)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 2rem'
                }}
              >
                2
              </Box>
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
                Ask or Answer
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                Post your farming challenges or share your expertise. Add images, location details, and specific crop information.
              </Typography>
            </Box>

            {/* Step 3 */}
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5a8c2f, #7ba84f)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 2rem'
                }}
              >
                3
              </Box>
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
                Learn & Grow
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                Get answers from experienced farmers and extension officers. Vote on helpful solutions and build your farming knowledge.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FINAL CTA SECTION */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2d5016 0%, #5a8c2f 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            Ready to Join the Community?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Thousands of farmers and extension officers are already sharing knowledge and growing together
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s'
            }}
          >
            Create Your Free Account
          </Button>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage