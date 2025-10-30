/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  Avatar,
  CircularProgress,
  Alert,
  Badge,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';

const ChatsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { socket } = useSocket();

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Blocked users dialog
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  useEffect(() => {
    fetchConversations();

    // Listen for new messages
    if (socket) {
      socket.on('receive_message', (message: any) => {
        console.log('📨 New message received:', message);
        fetchConversations(); // Refresh conversations
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
      }
    };
  }, [socket]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Conversations loaded:', response.data);
      setConversations(response.data.conversations);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      setLoadingBlocked(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/chat/blocked', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBlockedUsers(response.data.blocked_users);
    } catch (err) {
      console.error('❌ Error loading blocked users:', err);
      showToast('Failed to load blocked users', 'error');
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, conversation: any) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConversation(null);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;

    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      handleMenuClose();
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/chat/conversation/${selectedConversation.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Conversation deleted', 'success');
      fetchConversations();
      handleMenuClose();
    } catch (err) {
      console.error('❌ Error deleting conversation:', err);
      showToast('Failed to delete conversation', 'error');
    }
  };

  const handleBlockUser = async () => {
    if (!selectedConversation) return;

    if (!window.confirm(`Are you sure you want to block ${selectedConversation.other_user_first_name} ${selectedConversation.other_user_last_name}?`)) {
      handleMenuClose();
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:5000/api/chat/block',
        { user_id: selectedConversation.other_user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('User blocked', 'success');
      fetchConversations();
      handleMenuClose();
    } catch (err: any) {
      console.error('❌ Error blocking user:', err);
      showToast(err.response?.data?.message || 'Failed to block user', 'error');
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:5000/api/chat/unblock',
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('User unblocked', 'success');
      fetchBlockedUsers();
    } catch (err) {
      console.error('❌ Error unblocking user:', err);
      showToast('Failed to unblock user', 'error');
    }
  };

  const handleOpenBlockedUsers = () => {
    setBlockedDialogOpen(true);
    fetchBlockedUsers();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/home')}>
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  💬 Messages
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<BlockIcon />}
              onClick={handleOpenBlockedUsers}
            >
              Blocked Users
            </Button>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Conversations List */}
          {conversations.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No conversations yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start chatting by visiting a user's profile and clicking "Contact"
              </Typography>
            </Card>
          ) : (
            <Card>
              <List sx={{ p: 0 }}>
                {conversations.map((conversation, index) => (
                  <Box key={conversation.id}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                        py: 2
                      }}
                      onClick={() => navigate(`/chat/${conversation.id}`)}
                      secondaryAction={
                        <IconButton onClick={(e) => handleMenuOpen(e, conversation)}>
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unread_count}
                          color="error"
                        >
                          <Avatar
                            src={conversation.other_user_avatar}
                            sx={{ width: 56, height: 56 }}
                          >
                            {conversation.other_user_first_name[0]}{conversation.other_user_last_name[0]}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ ml: 2 }}
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                              {conversation.other_user_first_name} {conversation.other_user_last_name}
                            </Typography>
                            <Chip
                              label={conversation.other_user_role}
                              size="small"
                              color={conversation.other_user_role === 'Extension Officer' ? 'primary' : 'success'}
                              sx={{ height: 20 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '300px',
                                fontWeight: conversation.unread_count > 0 ? 'bold' : 'normal'
                              }}
                            >
                              {conversation.last_message || 'No messages yet'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(conversation.last_message_time)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < conversations.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Card>
          )}

          {/* Context Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleBlockUser}>
              <BlockIcon sx={{ mr: 1 }} fontSize="small" />
              Block User
            </MenuItem>
            <MenuItem onClick={handleDeleteConversation} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
              Delete Conversation
            </MenuItem>
          </Menu>

          {/* Blocked Users Dialog */}
          <Dialog
            open={blockedDialogOpen}
            onClose={() => setBlockedDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Blocked Users</DialogTitle>
            <DialogContent>
              {loadingBlocked ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : blockedUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No blocked users
                  </Typography>
                </Box>
              ) : (
                <List>
                  {blockedUsers.map((user, index) => (
                    <Box key={user.id}>
                      <ListItem
                        secondaryAction={
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleUnblockUser(user.user_id)}
                          >
                            Unblock
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar src={user.avatar_url}>
                            {user.first_name[0]}{user.last_name[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${user.first_name} ${user.last_name}`}
                          secondary={user.role}
                        />
                      </ListItem>
                      {index < blockedUsers.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBlockedDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
};

export default ChatsPage;