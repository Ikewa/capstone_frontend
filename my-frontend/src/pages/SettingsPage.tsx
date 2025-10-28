/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  Avatar,
  Tabs,
  Tab,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';

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

const SettingsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    location: '',
    bio: '',
    phone: '',
    avatar_url: '',
    role: ''
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Avatar form data
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/profile/me/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ My profile loaded:', response.data);
      setProfileData(response.data.user);
      setAvatarUrl(response.data.user.avatar_url || '');
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading profile:', err);
      setError('Failed to load profile');
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        'http://localhost:5000/api/profile/me/profile',
        {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          location: profileData.location,
          bio: profileData.bio,
          phone: profileData.phone
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const successMsg = 'Profile updated successfully! ✅';
      setSuccess(successMsg);
      showToast(successMsg, 'success');

      // Update localStorage user data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.first_name = profileData.first_name;
      user.last_name = profileData.last_name;
      localStorage.setItem('user', JSON.stringify(user));

    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update profile';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      const msg = 'New passwords do not match';
      setError(msg);
      showToast(msg, 'error');
      setSaving(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setError(msg);
      showToast(msg, 'error');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        'http://localhost:5000/api/profile/me/password',
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const successMsg = 'Password changed successfully! 🔒';
      setSuccess(successMsg);
      showToast(successMsg, 'success');

      // Clear password fields
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

    } catch (err: any) {
      console.error('❌ Error changing password:', err);
      const errorMsg = err.response?.data?.message || 'Failed to change password';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!avatarUrl) {
      const msg = 'Please enter an avatar URL';
      setError(msg);
      showToast(msg, 'warning');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        'http://localhost:5000/api/profile/me/avatar',
        { avatar_url: avatarUrl },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const successMsg = 'Avatar updated successfully! 📸';
      setSuccess(successMsg);
      showToast(successMsg, 'success');

      // Update profile data
      setProfileData({ ...profileData, avatar_url: avatarUrl });

    } catch (err: any) {
      console.error('❌ Error updating avatar:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update avatar';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              src={profileData.avatar_url}
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3
              }}
            >
              {!profileData.avatar_url && `${profileData.first_name[0]}${profileData.last_name[0]}`}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Profile Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your account settings and preferences
              </Typography>
            </Box>
          </Box>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                <Tab icon={<PersonIcon />} label="Profile" />
                <Tab icon={<LockIcon />} label="Password" />
                <Tab icon={<PhotoCameraIcon />} label="Avatar" />
              </Tabs>
            </Box>

            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handleUpdateProfile}>
                <Stack spacing={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleProfileChange}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleProfileChange}
                      required
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    disabled
                    helperText="Email cannot be changed"
                  />

                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={profileData.location || ''}
                    onChange={handleProfileChange}
                    placeholder="e.g., Kano State, Nigeria"
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={profileData.phone || ''}
                    onChange={handleProfileChange}
                    placeholder="e.g., +234 xxx xxx xxxx"
                  />

                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={profileData.bio || ''}
                    onChange={handleProfileChange}
                    multiline
                    rows={4}
                    placeholder="Tell us about yourself..."
                    helperText="A brief description about you"
                  />

                  <Divider />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </form>
            </TabPanel>

            {/* Password Tab */}
            <TabPanel value={tabValue} index={1}>
              <form onSubmit={handleChangePassword}>
                <Stack spacing={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Change Password
                  </Typography>

                  <TextField
                    fullWidth
                    label="Current Password"
                    name="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                  />

                  <TextField
                    fullWidth
                    label="New Password"
                    name="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    helperText="Must be at least 6 characters"
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                  />

                  <Divider />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </Button>
                </Stack>
              </form>
            </TabPanel>

            {/* Avatar Tab */}
            <TabPanel value={tabValue} index={2}>
              <form onSubmit={handleUpdateAvatar}>
                <Stack spacing={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Profile Picture
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={avatarUrl || profileData.avatar_url}
                      sx={{
                        width: 150,
                        height: 150,
                        bgcolor: 'primary.main',
                        fontSize: '3rem'
                      }}
                    >
                      {!avatarUrl && !profileData.avatar_url && `${profileData.first_name[0]}${profileData.last_name[0]}`}
                    </Avatar>

                    <Typography variant="body2" color="text.secondary">
                      Current profile picture
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Avatar URL"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/your-avatar.jpg"
                    helperText="Enter a URL to an image (e.g., from Imgur, Gravatar, etc.)"
                  />

                  <Divider />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {saving ? 'Updating...' : 'Update Avatar'}
                  </Button>
                </Stack>
              </form>
            </TabPanel>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default SettingsPage;