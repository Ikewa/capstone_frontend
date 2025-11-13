/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  TextField,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import Translate from '../components/Translate';
import { useTranslate } from '../hooks/useTranslate';
import { useLanguage } from '../context/LanguageContext';
import NotesButton from '../components/NotesButton';

const GroupDiscussionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { socket } = useSocket();
  const { translate } = useLanguage();

  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [sending, setSending] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Drawer states
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  // Menu states
  const [messageMenuAnchor, setMessageMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // Edit group dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedGroup, setEditedGroup] = useState({
    name: '',
    description: '',
    icon: '',
    topic: '',
    location: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Translate labels
  const labels = [
    'members',
    'No messages yet',
    'Be the first to start the discussion!',
    'Type your message...',
    'Replying to',
    'Cancel',
    'Reply',
    'Delete Message',
    'Members',
    'messages',
    'Admin',
    'Make Admin',
    'Group Settings',
    'Edit Group Details',
    'Leave Group',
    'Delete Group',
    'Edit Group',
    'Group Name',
    'Description',
    'Save Changes',
    'Group not found',
    'Just now',
    'ago'
  ];
  const { translated: translatedLabels } = useTranslate(labels);

  // Translate time units
  const timeUnits = ['m', 'h', 'd'];
  const { translated: translatedTime } = useTranslate(timeUnits);

  useEffect(() => {
    // Get current user ID
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(userData.id);
    }

    fetchGroupData();

    // Join group room via socket
    if (socket && id) {
      console.log(`🔌 Joining group ${id} room`);
      socket.emit('join_group', id);
    }

    // Setup socket listeners
    if (socket) {
      // New message received
      socket.on('new_group_message', (message: any) => {
        console.log('📨 New group message received:', message);
        // Only add if not already in messages (avoid duplicates)
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();
      });

      // Message reaction updated
      socket.on('message_reaction', (data: any) => {
        console.log('👍 Message reaction:', data);
        setMessages(prev =>
          prev.map(msg => {
            if (msg.id === data.message_id) {
              const newCount = data.action === 'added' 
                ? msg.reaction_count + 1 
                : msg.reaction_count - 1;
              return {
                ...msg,
                reaction_count: Math.max(0, newCount)
              };
            }
            return msg;
          })
        );
      });

      // Someone is typing
      socket.on('user_typing_in_group', (data: any) => {
        if (data.user_id !== currentUserId) {
          console.log('⌨️ User typing:', data.user_name);
          // You can show a typing indicator here
        }
      });

      // Someone stopped typing
      socket.on('user_stop_typing_in_group', (data: any) => {
        console.log('⌨️ User stopped typing');
        // Hide typing indicator
      });
    }

    return () => {
      // Leave group room when component unmounts
      if (socket && id) {
        console.log(`👋 Leaving group ${id} room`);
        socket.emit('leave_group', id);
      }

      // Clean up listeners
      if (socket) {
        socket.off('new_group_message');
        socket.off('message_reaction');
        socket.off('user_typing_in_group');
        socket.off('user_stop_typing_in_group');
      }
    };
  }, [id, socket, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchGroup(),
        fetchMessages(),
        fetchMembers()
      ]);
      setError('');
    } catch (err) {
      console.error('❌ Error loading group data:', err);
      setError('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroup = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `/api/discussion-groups/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Group loaded:', response.data);
    setGroup(response.data.group);
    setEditedGroup({
      name: response.data.group.name,
      description: response.data.group.description || '',
      icon: response.data.group.icon,
      topic: response.data.group.topic,
      location: response.data.group.location
    });
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `/api/discussion-groups/${id}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Messages loaded:', response.data);
    setMessages(response.data.messages);
  };

  const fetchMembers = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `/api/discussion-groups/${id}/members`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Members loaded:', response.data);
    setMembers(response.data.members);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `/api/discussion-groups/${id}/messages`,
        {
          content: newMessage.trim(),
          parent_message_id: replyingTo?.id || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Message sent:', response.data);

      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      setReplyingTo(null);

      // Emit via socket
      if (socket) {
        socket.emit('send_group_message', {
          group_id: id,
          message: response.data.message
        });
      }

      scrollToBottom();
    } catch (err: any) {
      console.error('❌ Error sending message:', err);
      const errorMsg = err.response?.data?.message || await translate('Failed to send message');
      showToast(errorMsg, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleReactToMessage = async (messageId: number) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `/api/discussion-groups/messages/${messageId}/react`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Reaction:', response.data);

      // Update message in state
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id === messageId) {
            const newReactionCount = response.data.action === 'added' 
              ? msg.reaction_count + 1 
              : msg.reaction_count - 1;
            return {
              ...msg,
              reaction_count: newReactionCount,
              user_has_reacted: response.data.action === 'added' ? 1 : 0
            };
          }
          return msg;
        })
      );

      // Emit via socket
      if (socket) {
        socket.emit('message_reaction', {
          group_id: id,
          message_id: messageId,
          action: response.data.action
        });
      }
    } catch (err) {
      console.error('❌ Error reacting:', err);
      const errorMsg = await translate('Failed to react to message');
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    const confirmMsg = await translate('Are you sure you want to delete this message?');
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `/api/discussion-groups/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const successMsg = await translate('Message deleted');
      showToast(successMsg, 'success');
      setMessages(prev => prev.filter(msg => msg.id !== messageId && msg.parent_message_id !== messageId));
      setMessageMenuAnchor(null);
    } catch (err: any) {
      console.error('❌ Error deleting message:', err);
      const errorMsg = err.response?.data?.message || await translate('Failed to delete message');
      showToast(errorMsg, 'error');
    }
  };

  const handleLeaveGroup = async () => {
    const confirmMsg = await translate('Are you sure you want to leave this group?');
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `/api/discussion-groups/${id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const successMsg = await translate('Left group successfully');
      showToast(successMsg, 'success');
      navigate('/discussion-groups');
    } catch (err: any) {
      console.error('❌ Error leaving group:', err);
      const errorMsg = err.response?.data?.message || await translate('Failed to leave group');
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteGroup = async () => {
    const confirmMsg = await translate('Are you sure you want to delete this group? This action cannot be undone.');
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `/api/discussion-groups/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const successMsg = await translate('Group deleted successfully');
      showToast(successMsg, 'success');
      navigate('/discussion-groups');
    } catch (err: any) {
      console.error('❌ Error deleting group:', err);
      const errorMsg = err.response?.data?.message || await translate('Failed to delete group');
      showToast(errorMsg, 'error');
    }
  };

  const handleUpdateGroup = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `/api/discussion-groups/${id}`,
        editedGroup,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const successMsg = await translate('Group updated successfully');
      showToast(successMsg, 'success');
      setEditDialogOpen(false);
      fetchGroup();
    } catch (err: any) {
      console.error('❌ Error updating group:', err);
      const errorMsg = err.response?.data?.message || await translate('Failed to update group');
      showToast(errorMsg, 'error');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    const confirmMsg = await translate('Are you sure you want to remove this member?');
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `/api/discussion-groups/${id}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const successMsg = await translate('Member removed');
      showToast(successMsg, 'success');
      fetchMembers();
    } catch (err: any) {
      console.error('❌ Error removing member:', err);
      const errorMsg = err.response?.data?.message || await translate('Failed to remove member');
      showToast(errorMsg, 'error');
    }
  };

  const handleMakeAdmin = async (memberId: number) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `/api/discussion-groups/${id}/members/${memberId}/make-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const successMsg = await translate('Member promoted to admin');
      showToast(successMsg, 'success');
      fetchMembers();
    } catch (err: any) {
      console.error('❌ Error making admin:', err);
      const errorMsg = err.response?.data?.message || await translate('Failed to promote member');
      showToast(errorMsg, 'error');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return translatedLabels[21] || 'Just now';
    if (minutes < 60) return `${minutes}${translatedTime[0] || 'm'} ${translatedLabels[22] || 'ago'}`;
    if (hours < 24) return `${hours}${translatedTime[1] || 'h'} ${translatedLabels[22] || 'ago'}`;
    if (days === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (days < 7) return `${days}${translatedTime[2] || 'd'} ${translatedLabels[22] || 'ago'}`;
    return date.toLocaleDateString();
  };

  // Organize messages into threads
  const topLevelMessages = messages.filter(msg => !msg.parent_message_id);
  const getReplies = (parentId: number) => messages.filter(msg => msg.parent_message_id === parentId);

  const MessageCard = ({ message, isReply = false }: { message: any; isReply?: boolean }) => {
    const replies = getReplies(message.id);
    const isOwnMessage = message.user_id === currentUserId;
    const canDelete = isOwnMessage || group?.is_admin;

    return (
      <Box sx={{ ml: isReply ? 4 : 0, mb: 2 }}>
        <Card sx={{ backgroundColor: isReply ? '#f9f9f9' : 'white' }}>
          <Box sx={{ p: 2 }}>
            {/* Message Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flex: 1 }}>
                <Avatar
                  src={message.avatar_url}
                  sx={{ width: 40, height: 40, cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${message.user_id}`)}
                >
                  {message.first_name[0]}{message.last_name[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${message.user_id}`)}
                    >
                      {message.first_name} {message.last_name}
                    </Typography>
                    <Chip
                      label={message.role}
                      size="small"
                      color={message.role === 'Extension Officer' ? 'primary' : 'default'}
                      sx={{ height: 18, fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(message.created_at)}
                  </Typography>
                </Box>
              </Box>
              {canDelete && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setMessageMenuAnchor(e.currentTarget);
                    setSelectedMessage(message);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Message Content - Don't translate user messages */}
            <Typography variant="body1" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>

            {/* Message Actions */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                size="small"
                startIcon={message.user_has_reacted ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                onClick={() => handleReactToMessage(message.id)}
                sx={{ minWidth: 'auto' }}
              >
                {message.reaction_count || 0}
              </Button>
              <Button
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => setReplyingTo(message)}
              >
                {translatedLabels[6]} {replies.length > 0 && `(${replies.length})`}
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Render Replies */}
        {replies.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {replies.map((reply) => (
              <MessageCard key={reply.id} message={reply} isReply={true} />
            ))}
          </Box>
        )}
      </Box>
    );
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

  if (error || !group) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error || translatedLabels[20]}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', py: 2 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/discussion-groups')}>
                <ArrowBackIcon />
              </IconButton>
              <Avatar sx={{ width: 48, height: 48, fontSize: '1.5rem', bgcolor: 'primary.light' }}>
                {group.icon}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {group.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label={group.topic} size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {group.member_count} {translatedLabels[0]}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setMembersDrawerOpen(true)}>
                <PeopleIcon />
              </IconButton>
              {group.is_admin && (
                <IconButton onClick={() => setSettingsDrawerOpen(true)}>
                  <SettingsIcon />
                </IconButton>
              )}
            </Box>
          </Container>
        </Box>

        {/* Messages Area */}
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {topLevelMessages.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {translatedLabels[1]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {translatedLabels[2]}
              </Typography>
            </Card>
          ) : (
            <Box>
              {topLevelMessages.map((message) => (
                <MessageCard key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Container>

        {/* Message Input */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
            py: 2
          }}
        >
          <Container maxWidth="lg">
            {replyingTo && (
              <Box sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {translatedLabels[4]} {replyingTo.first_name} {replyingTo.last_name}
                </Typography>
                <Button size="small" onClick={() => setReplyingTo(null)}>
                  {translatedLabels[5]}
                </Button>
              </Box>
            )}
            <form onSubmit={handleSendMessage}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder={translatedLabels[3]}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!newMessage.trim() || sending}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' },
                    '&:disabled': { backgroundColor: 'grey.300' }
                  }}
                >
                  {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </IconButton>
              </Box>
            </form>
          </Container>
        </Box>

        {/* Message Menu */}
        <Menu
          anchorEl={messageMenuAnchor}
          open={Boolean(messageMenuAnchor)}
          onClose={() => setMessageMenuAnchor(null)}
        >
          <MenuItem onClick={() => handleDeleteMessage(selectedMessage?.id)}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            {translatedLabels[7]}
          </MenuItem>
        </Menu>

        {/* Members Drawer */}
        <Drawer
          anchor="right"
          open={membersDrawerOpen}
          onClose={() => setMembersDrawerOpen(false)}
        >
          <Box sx={{ width: 350, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {translatedLabels[8]} ({members.length})
            </Typography>
            <List>
              {members.map((member) => (
                <ListItem
                  key={member.id}
                  secondaryAction={
                    group.is_admin && member.user_id !== currentUserId && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMember(member.user_id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={member.avatar_url}>
                      {member.first_name[0]}{member.last_name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {member.first_name} {member.last_name}
                        </Typography>
                        {member.is_admin && (
                          <Chip label={translatedLabels[10]} size="small" color="primary" sx={{ height: 18 }} />
                        )}
                      </Box>
                    }
                    secondary={`${member.message_count} ${translatedLabels[9]}`}
                  />
                  {group.is_admin && member.user_id !== currentUserId && !member.is_admin && (
                    <Button
                      size="small"
                      onClick={() => handleMakeAdmin(member.user_id)}
                    >
                      {translatedLabels[11]}
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Settings Drawer */}
        <Drawer
          anchor="right"
          open={settingsDrawerOpen}
          onClose={() => setSettingsDrawerOpen(false)}
        >
          <Box sx={{ width: 350, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {translatedLabels[12]}
            </Typography>
            <List>
              <ListItemButton onClick={() => {
                setSettingsDrawerOpen(false);
                setEditDialogOpen(true);
              }}>
                <EditIcon sx={{ mr: 2 }} />
                <ListItemText primary={translatedLabels[13]} />
              </ListItemButton>
              <ListItemButton onClick={handleLeaveGroup}>
                <ExitToAppIcon sx={{ mr: 2 }} />
                <ListItemText primary={translatedLabels[14]} />
              </ListItemButton>
              {group.is_admin && (
                <ListItemButton onClick={handleDeleteGroup} sx={{ color: 'error.main' }}>
                  <DeleteIcon sx={{ mr: 2 }} />
                  <ListItemText primary={translatedLabels[15]} />
                </ListItemButton>
              )}
            </List>
          </Box>
        </Drawer>

        {/* Edit Group Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{translatedLabels[16]}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label={translatedLabels[17]}
                fullWidth
                value={editedGroup.name}
                onChange={(e) => setEditedGroup({ ...editedGroup, name: e.target.value })}
              />
              <TextField
                label={translatedLabels[18]}
                fullWidth
                multiline
                rows={3}
                value={editedGroup.description}
                onChange={(e) => setEditedGroup({ ...editedGroup, description: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>{translatedLabels[5]}</Button>
            <Button variant="contained" onClick={handleUpdateGroup}>
              {translatedLabels[19]}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {(() => {
      console.log('🔍 Debug NotesButton:', { 
        hasGroup: !!group, 
        id: id,
        groupName: group?.name,
        parsedId: id ? parseInt(id) : null
      });
      
      return group && id && group.name ? (
        <NotesButton 
          groupId={parseInt(id)}
          groupName={group.name}
        />
      ) : null;
    })()}
    </>
  );
};

export default GroupDiscussionPage;
