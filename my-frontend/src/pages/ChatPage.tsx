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
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ToastContext } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';

const ChatPage = () => {
  const { conversation_id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { socket } = useSocket();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Get current user ID
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(userData.id);
    }

    fetchConversationAndMessages();

    // Setup socket listeners
    if (socket) {
      socket.on('receive_message', (message: any) => {
        if (message.conversation_id == conversation_id) {
          console.log('📨 New message received in this chat');
          setMessages(prev => [...prev, message]);
          scrollToBottom();

          // Mark as read
          socket.emit('mark_read', {
            conversation_id,
            receiver_id: message.sender_id
          });
        }
      });

      socket.on('user_typing', (data: any) => {
        if (data.conversation_id == conversation_id) {
          setIsTyping(true);
          scrollToBottom();
        }
      });

      socket.on('user_stop_typing', (data: any) => {
        if (data.conversation_id == conversation_id) {
          setIsTyping(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      }
    };
  }, [conversation_id, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversationAndMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(atob(token!.split('.')[1]));

      // First, get conversation details
      const convResponse = await axios.get(
        `http://localhost:5000/api/chat/conversations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Conversations:', convResponse.data);

      // Find the current conversation
      const currentConv = convResponse.data.conversations.find(
        (c: any) => c.id == conversation_id
      );

      if (currentConv) {
        setOtherUser({
          id: currentConv.other_user_id,
          first_name: currentConv.other_user_first_name,
          last_name: currentConv.other_user_last_name,
          avatar: currentConv.other_user_avatar,
          role: currentConv.other_user_role
        });
      }

      // Get messages
      const messagesResponse = await axios.get(
        `http://localhost:5000/api/chat/messages/${conversation_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Messages loaded:', messagesResponse.data);
      setMessages(messagesResponse.data.messages);

      setError('');
    } catch (err: any) {
      console.error('❌ Error loading conversation:', err);
      if (err.response?.data?.is_blocked) {
        setError('This conversation is blocked');
        showToast('User is blocked', 'error');
      } else {
        setError('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !otherUser) {
      console.log('❌ Cannot send: message empty or no other user');
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem('token');

      console.log('📤 Sending message to user:', otherUser.id);

      const response = await axios.post(
        'http://localhost:5000/api/chat/messages',
        {
          conversation_id: parseInt(conversation_id!),
          receiver_id: parseInt(otherUser.id),
          content: newMessage.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Message sent:', response.data);

      // Add message to UI
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');

      // Emit via socket
      if (socket) {
        socket.emit('send_message', {
          receiver_id: otherUser.id,
          message: response.data.message
        });

        // Stop typing
        socket.emit('stop_typing', {
          receiver_id: otherUser.id,
          conversation_id
        });
      }

      scrollToBottom();
    } catch (err: any) {
      console.error('❌ Error sending message:', err);
      console.error('Error details:', err.response?.data);
      if (err.response?.data?.is_blocked) {
        showToast('Cannot send message. User is blocked.', 'error');
      } else {
        showToast('Failed to send message', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket || !otherUser) return;

    // Emit typing event
    socket.emit('typing', {
      receiver_id: otherUser.id,
      conversation_id
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', {
        receiver_id: otherUser.id,
        conversation_id
      });
    }, 2000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const shouldShowDateDivider = (currentMsg: any, prevMsg: any) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    
    return currentDate !== prevDate;
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

  if (error) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', py: 2 }}>
          <Container maxWidth="md">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/chats')}>
                <ArrowBackIcon />
              </IconButton>
              {otherUser && (
                <>
                  <Avatar
                    src={otherUser.avatar}
                    sx={{ width: 40, height: 40, cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${otherUser.id}`)}
                  >
                    {otherUser.first_name?.[0]}{otherUser.last_name?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${otherUser.id}`)}
                    >
                      {otherUser.first_name} {otherUser.last_name}
                    </Typography>
                    {isTyping && (
                      <Typography variant="caption" color="primary">
                        typing...
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Container>
        </Box>

        {/* Messages Area */}
        <Container maxWidth="md" sx={{ flex: 1, py: 3, overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          {messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No messages yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start the conversation!
              </Typography>
            </Box>
          ) : (
            <Box>
              {messages.map((message, index) => (
                <Box key={message.id}>
                  {/* Date Divider */}
                  {shouldShowDateDivider(message, messages[index - 1]) && (
                    <Box sx={{ textAlign: 'center', my: 2 }}>
                      <Chip label={formatDate(message.created_at)} size="small" />
                    </Box>
                  )}

                  {/* Message */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender_id === currentUserId ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Card
                      sx={{
                        maxWidth: '70%',
                        backgroundColor: message.sender_id === currentUserId ? '#1976d2' : 'white',
                        color: message.sender_id === currentUserId ? 'white' : 'black',
                        boxShadow: 1
                      }}
                    >
                      <Box sx={{ p: 1.5 }}>
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: 'right',
                            mt: 0.5,
                            opacity: 0.8
                          }}
                        >
                          {formatTime(message.created_at)}
                        </Typography>
                      </Box>
                    </Card>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Container>

        {/* Message Input */}
        <Box sx={{ backgroundColor: 'white', borderTop: '1px solid #e0e0e0', py: 2 }}>
          <Container maxWidth="md">
            <form onSubmit={handleSendMessage}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  disabled={sending || !otherUser}
                  autoFocus
                />
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!newMessage.trim() || sending || !otherUser}
                  sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
                >
                  {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </IconButton>
              </Box>
            </form>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default ChatPage;