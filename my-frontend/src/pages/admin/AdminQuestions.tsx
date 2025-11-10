/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { ToastContext } from '../../context/ToastContext';

interface Question {
  id: number;
  title: string;
  user_id: number;
  first_name: string;
  last_name: string;
  role: string;
  location: string;
  tags: string[];
  votes: number;
  answer_count: number;
  created_at: string;
}

const AdminQuestions = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Questions loaded:', response.data);
      setQuestions(response.data.questions || []);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, question: Question) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuestion(question);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuestion(null);
  };

  const handleViewQuestion = () => {
    if (selectedQuestion) {
      navigate(`/questions/${selectedQuestion.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;

    const confirmMsg = `Are you sure you want to delete the question: "${selectedQuestion.title}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/admin/questions/${selectedQuestion.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Question deleted successfully', 'success');
      handleMenuClose();
      fetchQuestions();
    } catch (err: any) {
      console.error('❌ Error deleting question:', err);
      showToast(err.response?.data?.message || 'Failed to delete question', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedQuestions = filteredQuestions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          ❓ Questions Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage all questions in the forum
        </Typography>

        {/* Search */}
        <Card sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search questions by title or author..."
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
        </Card>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ p: 2, flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {questions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Questions
            </Typography>
          </Card>
          <Card sx={{ p: 2, flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {filteredQuestions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filtered Results
            </Typography>
          </Card>
        </Box>

        {/* Questions Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="center">Votes</TableCell>
                  <TableCell align="center">Answers</TableCell>
                  <TableCell>Posted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedQuestions.map((question) => (
                  <TableRow key={question.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {question.title}
                        </Typography>
                        {question.tags && question.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {question.tags.slice(0, 3).map((tag, idx) => (
                              <Chip
                                key={idx}
                                label={tag}
                                size="small"
                                sx={{ height: 18, fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {question.first_name} {question.last_name}
                          </Typography>
                          <Chip
                            label={question.role}
                            size="small"
                            sx={{ height: 16, fontSize: '0.65rem' }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{question.location}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <ThumbUpIcon fontSize="small" color="success" />
                        <Typography variant="body2">{question.votes || 0}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <CommentIcon fontSize="small" color="primary" />
                        <Typography variant="body2">{question.answer_count || 0}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(question.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, question)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredQuestions.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewQuestion}>
            <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
            View Question
          </MenuItem>
          <MenuItem onClick={handleDeleteQuestion} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete Question
          </MenuItem>
        </Menu>
      </Box>
    </AdminLayout>
  );
};

export default AdminQuestions;