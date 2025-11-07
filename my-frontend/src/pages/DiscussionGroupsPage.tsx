/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import MessageIcon from '@mui/icons-material/Message';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';
import Translate from '../components/Translate';
import { useTranslate } from '../hooks/useTranslate';
import { useLanguage } from '../context/LanguageContext';

const DiscussionGroupsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { translate } = useLanguage();

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Create group dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    icon: '💬',
    topic: '',
    location: 'All States'
  });

  const [userRole, setUserRole] = useState('');

  // Translate labels
  const labels = [
    'All Topics',
    'All Locations',
    'Search groups by name or description...',
    'group',
    'groups',
    'found',
    'member',
    'members',
    'message',
    'messages',
    'Just now',
    'ago',
    'No activity yet',
    'Last message by',
    'Created by'
  ];
  const { translated: translatedLabels } = useTranslate(labels);

  // Translate time units
  const timeUnits = ['m', 'h', 'd'];
  const { translated: translatedTimeUnits } = useTranslate(timeUnits);

  useEffect(() => {
    // Get user role
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(atob(token.split('.')[1]));
      setUserRole(userData.role);
    }

    fetchGroups();
  }, [selectedTopic, selectedLocation]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      if (selectedTopic) params.append('topic', selectedTopic);
      if (selectedLocation) params.append('location', selectedLocation);

      const response = await axios.get(
        `http://localhost:5000/api/discussion-groups?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Groups loaded:', response.data);
      setGroups(response.data.groups);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading groups:', err);
      setError('Failed to load discussion groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchGroups();
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.topic) {
      const msg = await translate('Please fill in required fields');
      showToast(msg, 'error');
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:5000/api/discussion-groups',
        newGroup,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const successMsg = await translate('Group created successfully');
      showToast(successMsg, 'success');
      setCreateDialogOpen(false);
      setNewGroup({
        name: '',
        description: '',
        icon: '💬',
        topic: '',
        location: 'All States'
      });
      fetchGroups();
    } catch (err: any) {
      console.error('❌ Error creating group:', err);
      const errorMsg = err.response?.data?.message || await translate('Failed to create group');
      showToast(errorMsg, 'error');
    } finally {
      setCreating(false);
    }
  };

  const formatLastActivity = (dateString: string) => {
    if (!dateString) return translatedLabels[12] || 'No activity yet';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return translatedLabels[10] || 'Just now';
    if (minutes < 60) return `${minutes}${translatedTimeUnits[0] || 'm'} ${translatedLabels[11] || 'ago'}`;
    if (hours < 24) return `${hours}${translatedTimeUnits[1] || 'h'} ${translatedLabels[11] || 'ago'}`;
    if (days < 7) return `${days}${translatedTimeUnits[2] || 'd'} ${translatedLabels[11] || 'ago'}`;
    return date.toLocaleDateString();
  };

  const topics = [
    'Pest Control',
    'Irrigation',
    'Crop Management',
    'Fertilizers',
    'Market Information',
    'Weather',
    'Soil Management',
    'Equipment'
  ];

  const locations = [
    'All States',
    'Kano State',
    'Kaduna State',
    'Sokoto State',
    'Bauchi State',
    'Katsina State'
  ];

  const icons = ['💬', '🌾', '💧', '🐛', '🌱', '💰', '🌤️', '🌽', '🏞️'];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                💬 <Translate text="Discussion Forum" />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <Translate text="Join groups, share knowledge, and learn from the community" />
              </Typography>
            </Box>
            {userRole === 'Extension Officer' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ height: 'fit-content' }}
              >
                <Translate text="Create Group" />
              </Button>
            )}
          </Box>

          {/* Search and Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={translatedLabels[2] || "Search groups by name or description..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel><Translate text="Topic" /></InputLabel>
                    <Select
                      value={selectedTopic}
                      label={<Translate text="Topic" />}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                      <MenuItem value="">{translatedLabels[0]}</MenuItem>
                      {topics.map((topic) => (
                        <MenuItem key={topic} value={topic}>
                          {topic}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel><Translate text="Location" /></InputLabel>
                    <Select
                      value={selectedLocation}
                      label={<Translate text="Location" />}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <MenuItem value="">{translatedLabels[1]}</MenuItem>
                      {locations.map((location) => (
                        <MenuItem key={location} value={location}>
                          {location}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Groups List */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            {filteredGroups.length} {filteredGroups.length === 1 ? translatedLabels[3] : translatedLabels[4]} {translatedLabels[5]}
          </Typography>

          {filteredGroups.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                <Translate text="No groups found" />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userRole === 'Extension Officer' 
                  ? <Translate text="Be the first to create a discussion group!" />
                  : <Translate text="Check back later for new groups" />}
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredGroups.map((group) => (
                <Grid item xs={12} key={group.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => navigate(`/discussion-groups/${group.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Icon */}
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            fontSize: '2rem',
                            bgcolor: 'primary.light'
                          }}
                        >
                          {group.icon}
                        </Avatar>

                        {/* Content */}
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Box>
                              {/* Don't translate group name - it's user content */}
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {group.name}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={group.topic} size="small" color="primary" />
                                <Chip label={group.location} size="small" variant="outlined" />
                              </Box>
                            </Box>
                          </Box>

                          {/* Don't translate description - it's user content */}
                          {group.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {group.description}
                            </Typography>
                          )}

                          <Divider sx={{ my: 1 }} />

                          {/* Stats */}
                          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PeopleIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {group.member_count} {group.member_count === 1 ? translatedLabels[6] : translatedLabels[7]}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MessageIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {group.message_count} {group.message_count === 1 ? translatedLabels[8] : translatedLabels[9]}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {formatLastActivity(group.last_activity)}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Last Message Preview - Don't translate message content */}
                          {group.last_message && (
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {translatedLabels[13]} {group.last_message_user}:
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {group.last_message.length > 100
                                  ? `${group.last_message.substring(0, 100)}...`
                                  : group.last_message}
                              </Typography>
                            </Box>
                          )}

                          {/* Creator Info - Don't translate names */}
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {translatedLabels[14]} {group.creator_first_name} {group.creator_last_name}
                            </Typography>
                            <Chip
                              label={group.creator_role}
                              size="small"
                              color={group.creator_role === 'Extension Officer' ? 'primary' : 'default'}
                              sx={{ height: 20 }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Create Group Dialog */}
          <Dialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle><Translate text="Create Discussion Group" /></DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label={<Translate text="Group Name *" />}
                  fullWidth
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                />

                <TextField
                  label={<Translate text="Description" />}
                  fullWidth
                  multiline
                  rows={3}
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                />

                <FormControl fullWidth>
                  <InputLabel><Translate text="Topic *" /></InputLabel>
                  <Select
                    value={newGroup.topic}
                    label={<Translate text="Topic *" />}
                    onChange={(e) => setNewGroup({ ...newGroup, topic: e.target.value })}
                  >
                    {topics.map((topic) => (
                      <MenuItem key={topic} value={topic}>
                        {topic}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel><Translate text="Location" /></InputLabel>
                  <Select
                    value={newGroup.location}
                    label={<Translate text="Location" />}
                    onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                  >
                    {locations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <Translate text="Choose an icon:" />
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {icons.map((icon) => (
                      <Button
                        key={icon}
                        variant={newGroup.icon === icon ? 'contained' : 'outlined'}
                        onClick={() => setNewGroup({ ...newGroup, icon })}
                        sx={{ minWidth: 48, fontSize: '1.5rem' }}
                      >
                        {icon}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>
                <Translate text="Cancel" />
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateGroup}
                disabled={creating}
              >
                {creating ? <CircularProgress size={24} /> : <Translate text="Create Group" />}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
};

export default DiscussionGroupsPage;