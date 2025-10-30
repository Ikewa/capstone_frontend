/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Pagination,
  Link,
  CircularProgress,
} from '@mui/material'
import ForumIcon from '@mui/icons-material/Forum'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import CommentIcon from '@mui/icons-material/Comment'
import PersonIcon from '@mui/icons-material/Person'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ChatIcon from '@mui/icons-material/Chat'
// import EventIcon from '@mui/icons-material/Event'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import axios from 'axios'
import Navbar from '../components/Navbar'
import UniversalSearch from '../components/UniversalSearch'

function DashboardPage() {
  const navigate = useNavigate()
  type User = {
    first_name: string
    last_name: string
    location: string
  }
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Discussions state
  const [discussions, setDiscussions] = useState<any[]>([])
  const [discussionsLoading, setDiscussionsLoading] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const discussionsPerPage = 10

  // Quick Actions for left sidebar
  const quickActions = [
     {
        icon: <ForumIcon sx={{ fontSize: 40 }} />,
        title: 'Ask Question',
        description: 'Get help from community',
        path: '/ask-question',  // ← Goes directly to ask question page
        color: '#2e7d32'
    },
    {
      icon: <AgricultureIcon sx={{ fontSize: 40 }} />,
      title: 'Crop Advice',
      description: 'Get recommendations',
      path: '/crop-recommendations',
      color: '#558b2f'
    },
    {
      icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />,
      title: 'Book Officer',
      description: 'Schedule consultation',
      path: '/my-bookings',
      color: '#689f38'
    },
     {
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      title: 'Chat with People',
      description: 'Get instant help',
      path: '/chats',
      color: '#689f38'
    },
  ]

  // MOCK DATA (fallback if no real data)
  const mockDiscussions = [
    {
      id: 1,
      title: 'How to control armyworm in maize?',
      author: 'Musa Ibrahim',
      role: 'Farmer',
      votes: 24,
      answers: 12,
      tags: ['Maize', 'Pest Control'],
      location: 'Kano State',
      timeAgo: '2 hours ago'
    },
    {
      id: 2,
      title: 'Best irrigation for dry season farming?',
      author: 'Fatima Ahmed',
      role: 'Extension Officer',
      votes: 18,
      answers: 8,
      tags: ['Irrigation', 'Dry Season'],
      location: 'Kaduna State',
      timeAgo: '5 hours ago'
    },
    {
      id: 3,
      title: 'Groundnut planting techniques',
      author: 'Abubakar Sani',
      role: 'Farmer',
      votes: 15,
      answers: 6,
      tags: ['Groundnut', 'Planting'],
      location: user?.location || 'Northern Nigeria',
      timeAgo: '1 day ago'
    },
    {
      id: 4,
      title: 'Organic fertilizer recommendations for rice',
      author: 'Hauwa Bello',
      role: 'Extension Officer',
      votes: 22,
      answers: 10,
      tags: ['Rice', 'Fertilizer', 'Organic'],
      location: 'Sokoto State',
      timeAgo: '1 day ago'
    },
    {
      id: 5,
      title: 'How to store harvested grains to prevent weevils?',
      author: 'Yusuf Mohammed',
      role: 'Farmer',
      votes: 19,
      answers: 7,
      tags: ['Storage', 'Pest Control'],
      location: 'Katsina State',
      timeAgo: '2 days ago'
    },
    {
      id: 6,
      title: 'Best time to plant sorghum in Northern Nigeria',
      author: 'Amina Usman',
      role: 'Extension Officer',
      votes: 16,
      answers: 5,
      tags: ['Sorghum', 'Planting'],
      location: 'Jigawa State',
      timeAgo: '2 days ago'
    },
    {
      id: 7,
      title: 'Dealing with soil erosion on sloped farmland',
      author: 'Ibrahim Yakubu',
      role: 'Farmer',
      votes: 14,
      answers: 9,
      tags: ['Soil Management', 'Erosion'],
      location: 'Plateau State',
      timeAgo: '3 days ago'
    },
    {
      id: 8,
      title: 'Cassava disease identification and treatment',
      author: 'Blessing Okon',
      role: 'Extension Officer',
      votes: 20,
      answers: 11,
      tags: ['Cassava', 'Disease'],
      location: 'Benue State',
      timeAgo: '3 days ago'
    },
    {
      id: 9,
      title: 'Improving yield for small-scale poultry farming',
      author: 'Ahmed Lawal',
      role: 'Farmer',
      votes: 17,
      answers: 6,
      tags: ['Poultry', 'Yield'],
      location: 'Bauchi State',
      timeAgo: '4 days ago'
    },
    {
      id: 10,
      title: 'Intercropping maize and beans: best practices',
      author: 'Zainab Abubakar',
      role: 'Extension Officer',
      votes: 21,
      answers: 8,
      tags: ['Maize', 'Beans', 'Intercropping'],
      location: 'Zamfara State',
      timeAgo: '4 days ago'
    },
  ]

  // Sample upcoming events (for right sidebar - compact)
  const upcomingEvents = [
    {
      id: 1,
      title: 'Modern Farming Tools Workshop',
      date: 'Nov 20',
      location: 'Katsina Agric Center',
    },
    {
      id: 2,
      title: 'Organic Pest Control Seminar',
      date: 'Nov 25',
      location: 'Kano State University',
    },
    {
      id: 3,
      title: 'Farmers Market & Networking',
      date: 'Dec 02',
      location: 'Kaduna Trade Center',
    },
    {
      id: 4,
      title: 'Irrigation Systems Training',
      date: 'Dec 08',
      location: 'Sokoto Agric Institute',
    },
  ]

  // Use real discussions if available, otherwise use mock data
  const allDiscussions = discussions.length > 0 ? discussions : mockDiscussions

  // Pagination logic
  const indexOfLastDiscussion = currentPage * discussionsPerPage
  const indexOfFirstDiscussion = indexOfLastDiscussion - discussionsPerPage
  const currentDiscussions = allDiscussions.slice(indexOfFirstDiscussion, indexOfLastDiscussion)
  const totalPages = Math.ceil(allDiscussions.length / discussionsPerPage)

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // HOOK: Check authentication and get user data
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      navigate('/login')
      return
    }

    axios
      .get('http://localhost:5000/protected/Home', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setUser(res.data.user)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Auth failed:', err)
        localStorage.removeItem('token')
        navigate('/login')
      })
  }, [navigate])

  // HOOK: Fetch discussions from backend
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions')
        
        if (response.data.questions && response.data.questions.length > 0) {
          console.log('✅ Fetched questions from database:', response.data.questions.length)
          
          // Format the data to match frontend expectations
          const formattedDiscussions = response.data.questions.map((q: any) => ({
            id: q.id,
            title: q.title,
            author: `${q.first_name} ${q.last_name}`,
            role: q.role || 'Farmer',
            votes: q.votes || 0,
            answers: q.answer_count || 0,
            tags: q.tags || [],
            location: q.user_location || q.location,
            timeAgo: getTimeAgo(q.created_at)
          }))
          
          setDiscussions(formattedDiscussions)
        } else {
          console.log('ℹ️ No questions in database, using mock data')
        }
      } catch (error) {
        console.error('❌ Error fetching questions:', error)
        console.log('ℹ️ Using mock data as fallback')
      } finally {
        setDiscussionsLoading(false)
      }
    }

    fetchDiscussions()
  }, [])
  
  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const created = new Date(dateString)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    )
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">

         {/* Welcome Section */}
<Box sx={{ mb: 4 }}>
  {/* Avatar and Welcome Text Row */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
    <Avatar 
      sx={{ 
        width: 80, 
        height: 80, 
        bgcolor: 'primary.main',
        fontSize: '2rem'
      }}
    >
      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
    </Avatar>
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Welcome back, {user?.first_name}! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary">
        📍 {user?.location} • Here's what's happening in your farming community
      </Typography>
    </Box>
  </Box>

  {/* Search Bar - MOVED OUTSIDE the flex row */}
  <Box sx={{ mt: 3, maxWidth: 800, mx: 'auto' }}>
    <UniversalSearch />
  </Box>
</Box>
        {/* THREE COLUMN LAYOUT */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          
          {/* LEFT SIDEBAR - QUICK ACTIONS */}
          <Box sx={{ width: { xs: '100%', lg: '280px' }, flexShrink: 0 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                mb: 3 
              }}
            >
              Quick Actions
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  onClick={() => navigate(action.path)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '2px solid transparent',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      borderColor: action.color,
                    }
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                    <Box sx={{ color: action.color }}>
                      {action.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.2 }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {action.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* CENTER - TRENDING DISCUSSIONS (MAIN CONTENT) */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 'bold',
                }}
              >
                🔥 Trending Discussions
              </Typography>
              
              {/* Show indicator if using real or mock data */}
              <Chip 
                label={discussions.length > 0 ? 'Live Data' : 'Mock Data'} 
                size="small"
                color={discussions.length > 0 ? 'success' : 'default'}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>

            {discussionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  {currentDiscussions.map((discussion) => (
                    <Card
                      key={discussion.id}
                      onClick={() => navigate(`/questions/${discussion.id}`)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {/* Vote Section */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                            <IconButton size="small" sx={{ color: 'success.main' }}>
                              <ThumbUpIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              {discussion.votes || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              votes
                            </Typography>
                          </Box>

                          <Divider orientation="vertical" flexItem />

                          {/* Content Section */}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {discussion.author || 'Anonymous'}
                              </Typography>
                              <Chip 
                                label={discussion.role || 'Farmer'} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                • {discussion.timeAgo || 'Recently'}
                              </Typography>
                            </Box>

                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold', 
                                color: 'primary.main',
                                mb: 1
                              }}
                            >
                              {discussion.title}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOnIcon fontSize="small" />
                              {discussion.location || 'Northern Nigeria'}
                            </Typography>

                            {discussion.tags && discussion.tags.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                {discussion.tags.map((tag: string, idx: number) => (
                                  <Chip 
                                    key={idx}
                                    label={tag} 
                                    size="small"
                                    sx={{ 
                                      backgroundColor: '#e8f5e9',
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                ))}
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CommentIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {discussion.answers || 0} answers
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                      count={totalPages} 
                      page={currentPage} 
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton 
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* RIGHT SIDEBAR - UPCOMING EVENTS (COMPACT SNIPPETS) */}
          <Box sx={{ width: { xs: '100%', lg: '300px' }, flexShrink: 0 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                mb: 3 
              }}
            >
              📅 Upcoming Events
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  onClick={() => navigate('/events')}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transform: 'translateY(-3px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box 
                        sx={{ 
                          bgcolor: 'secondary.main', 
                          color: 'white', 
                          borderRadius: 1, 
                          p: 1,
                          minWidth: 50,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                          {event.date}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: 'primary.main',
                            fontSize: '0.9rem',
                            lineHeight: 1.3,
                            mb: 0.5
                          }}
                        >
                          {event.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            {event.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* View All Events Link */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link
                onClick={() => navigate('/events')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                View All Events
                <ArrowForwardIcon fontSize="small" />
              </Link>
            </Box>
          </Box>

        </Box>

      </Container>
    </Box>
</>
  )
}

export default DashboardPage