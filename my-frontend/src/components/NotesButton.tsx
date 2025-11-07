/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import GroupIcon from '@mui/icons-material/Group';
import axios from 'axios';

interface NotesButtonProps {
  groupId?: number;
  groupName?: string;
}

const NotesButton = ({ groupId, groupName }: NotesButtonProps) => {
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'menu' | 'new' | 'saved' | 'edit' | 'group-notes'>('menu');
  
  const [notes, setNotes] = useState<any[]>([]);
  const [groupNotes, setGroupNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Current note being edited
  const [currentNote, setCurrentNote] = useState<any>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isGroupNote, setIsGroupNote] = useState(false);

  useEffect(() => {
    if (viewMode === 'saved') {
      fetchNotes();
    }
    if (viewMode === 'group-notes' && groupId) {
      fetchGroupNotes();
    }
  }, [viewMode, groupId]);

  const fetchNotes = async () => {
    try {
      setLoadingNotes(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ General notes loaded:', response.data);
      setNotes(response.data.notes);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading notes:', err);
      setError('Failed to load notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchGroupNotes = async () => {
    try {
      setLoadingNotes(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`http://localhost:5000/api/notes?group_id=${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Group notes loaded:', response.data);
      setGroupNotes(response.data.notes);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading group notes:', err);
      setError('Failed to load group notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleOpenMainDialog = () => {
    setMainDialogOpen(true);
    setViewMode('menu');
    setError('');
    setSuccess('');
  };

  const handleCloseMainDialog = () => {
    setMainDialogOpen(false);
    setViewMode('menu');
    setCurrentNote(null);
    setNoteTitle('');
    setNoteContent('');
    setIsGroupNote(false);
    setError('');
    setSuccess('');
  };

  const handleNewNote = (forGroup = false) => {
    setViewMode('new');
    setCurrentNote(null);
    setNoteTitle('');
    setNoteContent('');
    setIsGroupNote(forGroup);
    setError('');
    setSuccess('');
  };

  const handleViewSavedNotes = () => {
    setViewMode('saved');
    setError('');
    setSuccess('');
  };

  const handleViewGroupNotes = () => {
    setViewMode('group-notes');
    setError('');
    setSuccess('');
  };

  const handleEditNote = (note: any, fromGroup = false) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setIsGroupNote(!!note.group_id);
    setViewMode('edit');
    setError('');
    setSuccess('');
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const noteData: any = {
        title: noteTitle,
        content: noteContent
      };

      // Add group_id if it's a group note
      if (isGroupNote && groupId) {
        noteData.group_id = groupId;
      }

      if (currentNote) {
        // Update existing note
        await axios.put(
          `http://localhost:5000/api/notes/${currentNote.id}`,
          noteData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Note updated successfully!');
      } else {
        // Create new note
        await axios.post(
          'http://localhost:5000/api/notes',
          noteData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Note saved successfully!');
      }

      // Clear form
      setNoteTitle('');
      setNoteContent('');
      setCurrentNote(null);
      setIsGroupNote(false);

      // Go back to menu after 1.5 seconds
      setTimeout(() => {
        setViewMode('menu');
        setSuccess('');
      }, 1500);

    } catch (err: any) {
      console.error('❌ Error saving note:', err);
      setError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: number, fromGroup = false) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Note deleted successfully!');
      
      if (fromGroup) {
        fetchGroupNotes();
      } else {
        fetchNotes();
      }

      setTimeout(() => {
        setSuccess('');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error deleting note:', err);
      setError('Failed to delete note');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Floating Notes Button */}
      <Fab
        color="primary"
        aria-label="notes"
        onClick={handleOpenMainDialog}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <EditNoteIcon />
      </Fab>

      {/* Main Dialog */}
      <Dialog
        open={mainDialogOpen}
        onClose={handleCloseMainDialog}
        maxWidth="md"
        fullWidth
      >
        {/* MENU VIEW */}
        {viewMode === 'menu' && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditNoteIcon />
                <Typography variant="h5" fontWeight="bold">
                  My Notes
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<NoteAddIcon />}
                  onClick={() => handleNewNote(false)}
                  sx={{ py: 2 }}
                >
                  Create New Note
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<EditNoteIcon />}
                  onClick={handleViewSavedNotes}
                  sx={{ py: 2 }}
                >
                  My Saved Notes
                </Button>
                {(() => {
                console.log('🔍 NotesButton Props:', { groupId, groupName });
                return groupId && groupName ? (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<GroupIcon />}
                    onClick={handleViewGroupNotes}
                    sx={{ 
                      py: 2,
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                      '&:hover': {
                        borderColor: 'secondary.dark',
                        backgroundColor: 'secondary.light'
                      }
                    }}
                  >
                    Notes for {groupName}
                  </Button>
                ) : null;
              })()}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseMainDialog}>Close</Button>
            </DialogActions>
          </>
        )}

        {/* NEW NOTE VIEW */}
        {viewMode === 'new' && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => setViewMode('menu')}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                  {isGroupNote ? `Create Note for ${groupName}` : 'Create New Note'}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              
              {groupId && !isGroupNote && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  This note will be saved to your general notes. Click below to create a group-specific note instead.
                  <Button 
                    size="small" 
                    onClick={() => setIsGroupNote(true)}
                    sx={{ ml: 2 }}
                  >
                    Make Group Note
                  </Button>
                </Alert>
              )}

              {isGroupNote && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  This note will only appear when viewing {groupName}.
                  <Button 
                    size="small" 
                    onClick={() => setIsGroupNote(false)}
                    sx={{ ml: 2 }}
                  >
                    Make General Note
                  </Button>
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Note Title"
                  fullWidth
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g., Pest Control Reminder"
                />
                <TextField
                  label="Note Content"
                  fullWidth
                  multiline
                  rows={10}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewMode('menu')}>Cancel</Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNote}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Note'}
              </Button>
            </DialogActions>
          </>
        )}

        {/* SAVED NOTES LIST VIEW */}
        {viewMode === 'saved' && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => setViewMode('menu')}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                  My Saved Notes ({notes.length})
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              {loadingNotes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : notes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <EditNoteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No saved notes yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<NoteAddIcon />}
                    onClick={() => handleNewNote(false)}
                    sx={{ mt: 2 }}
                  >
                    Create Your First Note
                  </Button>
                </Box>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {notes.map((note, index) => (
                    <Box key={note.id}>
                      <ListItem
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteNote(note.id, false)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                        disablePadding
                      >
                        <ListItemButton onClick={() => handleEditNote(note, false)}>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="bold">
                                {note.title}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    mb: 0.5
                                  }}
                                >
                                  {note.content}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Last updated: {formatDate(note.updated_at)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < notes.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewMode('menu')}>Back</Button>
            </DialogActions>
          </>
        )}

        {/* GROUP NOTES LIST VIEW */}
        {viewMode === 'group-notes' && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => setViewMode('menu')}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                  Notes for {groupName} ({groupNotes.length})
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              {loadingNotes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : groupNotes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No group notes yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<NoteAddIcon />}
                    onClick={() => handleNewNote(true)}
                    sx={{ mt: 2 }}
                  >
                    Create First Group Note
                  </Button>
                </Box>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {groupNotes.map((note, index) => (
                    <Box key={note.id}>
                      <ListItem
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteNote(note.id, true)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                        disablePadding
                      >
                        <ListItemButton onClick={() => handleEditNote(note, true)}>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="bold">
                                {note.title}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    mb: 0.5
                                  }}
                                >
                                  {note.content}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Last updated: {formatDate(note.updated_at)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < groupNotes.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewMode('menu')}>Back</Button>
            </DialogActions>
          </>
        )}

        {/* EDIT NOTE VIEW */}
        {viewMode === 'edit' && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => setViewMode(isGroupNote ? 'group-notes' : 'saved')}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                  Edit Note
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Note Title"
                  fullWidth
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
                <TextField
                  label="Note Content"
                  fullWidth
                  multiline
                  rows={10}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewMode(isGroupNote ? 'group-notes' : 'saved')}>Cancel</Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNote}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Update Note'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default NotesButton;