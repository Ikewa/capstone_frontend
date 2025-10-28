/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Button,
} from '@mui/material';
// import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import EventIcon from '@mui/icons-material/Event';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/profile/${id}`);
      console.log('✅ Profile loaded:', response.data);
      setProfile(response.data);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    return role === 'Extension Officer' ? 'primary' : 'success';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress size={60} />
        </Box>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Profile not found'}</Alert>
        </Container>
      </>
    );
  }

  const { user, questions, answers, events, stats } = profile;

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 3 }}
          >
            Back
          </Button>

          {/* Profile Header Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Avatar */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    src={user.avatar_url}
                    sx={{
                      width: 150,
                      height: 150,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      mb: 2
                    }}
                  >
                    {!user.avatar_url && `${user.first_name[0]}${user.last_name[0]}`}
                  </Avatar>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                {/* User Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    {user.first_name} {user.last_name}
                  </Typography>

                  {user.bio && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {user.bio}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {user.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                    )}

                    {user.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2">{user.phone}</Typography>
                      </Box>
                    )}

                    {user.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2">{user.location}</Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2">
                        Joined {formatDate(user.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Statistics */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200 }}>
                  <Card sx={{ backgroundColor: '#e3f2fd' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <QuestionAnswerIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total_questions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Questions Asked
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ backgroundColor: '#e8f5e9' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <QuestionAnswerIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total_answers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Answers Given
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ backgroundColor: '#fff3e0' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <ThumbUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {stats.question_upvotes + stats.answer_upvotes}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Upvotes
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                <Tab label={`Questions (${questions.length})`} />
                <Tab label={`Answers (${answers.length})`} />
                {user.role === 'Extension Officer' && events.length > 0 && (
                  <Tab label={`Events (${events.length})`} />
                )}
              </Tabs>
            </Box>

            {/* Questions Tab */}
            <TabPanel value={tabValue} index={0}>
              {questions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No questions asked yet
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {questions.map((question: any) => (
                    <Card
                      key={question.id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 }
                      }}
                      onClick={() => navigate(`/forum/${question.id}`)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip label={question.category} size="small" color="primary" />
                          <Chip
                            icon={<QuestionAnswerIcon />}
                            label={`${question.answer_count} answers`}
                            size="small"
                          />
                          <Chip
                            icon={<ThumbUpIcon />}
                            label={`${question.vote_count} upvotes`}
                            size="small"
                          />
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                          {question.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {question.description.substring(0, 150)}...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(question.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </TabPanel>

            {/* Answers Tab */}
            <TabPanel value={tabValue} index={1}>
              {answers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No answers given yet
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {answers.map((answer: any) => (
                    <Card
                      key={answer.id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 }
                      }}
                      onClick={() => navigate(`/forum/${answer.question_id}`)}
                    >
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Answer to: <strong>{answer.question_title}</strong>
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {answer.content.substring(0, 200)}...
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            icon={<ThumbUpIcon />}
                            label={`${answer.vote_count} upvotes`}
                            size="small"
                            color="success"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(answer.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </TabPanel>

            {/* Events Tab (Officers only) */}
            {user.role === 'Extension Officer' && events.length > 0 && (
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {events.map((event: any) => (
                    <Card
                      key={event.id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 }
                      }}
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                          {event.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {new Date(event.event_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">{event.location}</Typography>
                          </Box>
                          <Chip
                            label={`${event.registration_count} registered`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </TabPanel>
            )}
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default ProfilePage;