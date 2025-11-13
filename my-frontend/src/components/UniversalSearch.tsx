/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SearchResult {
  type: 'question' | 'event' | 'crop_request';
  id: string;
  title: string;
  description: string;
  location?: string;
  date?: string;
}

const UniversalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [allData, setAllData] = useState<{
    questions: any[];
    events: any[];
    cropRequests: any[];
  }>({ questions: [], events: [], cropRequests: [] });
  const [results, setResults] = useState<SearchResult[]>([]);
//   const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load all data once on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [questionsRes, eventsRes, cropRequestsRes] = await Promise.all([
        axios.get('/api/questions', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { questions: [] } })),
        
        axios.get('/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { events: [] } })),
        
        axios.get('/api/crop-requests/my-requests', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { requests: [] } }))
      ]);

      setAllData({
        questions: questionsRes.data.questions || [],
        events: eventsRes.data.events || [],
        cropRequests: cropRequestsRes.data.requests || []
      });
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setDataLoaded(true);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setShowResults(true);
    const searchLower = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search questions
    allData.questions
      .filter((q: any) => 
        q.title?.toLowerCase().includes(searchLower) ||
        q.description?.toLowerCase().includes(searchLower) ||
        q.location?.toLowerCase().includes(searchLower) ||
        q.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
      .slice(0, 5)
      .forEach((q: any) => {
        searchResults.push({
          type: 'question',
          id: q._id,
          title: q.title,
          description: q.description,
          location: q.location
        });
      });

    // Search events
    allData.events
      .filter((e: any) => 
        e.title?.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower) ||
        e.location?.toLowerCase().includes(searchLower) ||
        e.event_type?.toLowerCase().includes(searchLower)
      )
      .slice(0, 5)
      .forEach((e: any) => {
        searchResults.push({
          type: 'event',
          id: e._id,
          title: e.title,
          description: e.description,
          location: e.location,
          date: e.event_date
        });
      });

    // Search crop requests
    allData.cropRequests
      .filter((r: any) => 
        r.location?.toLowerCase().includes(searchLower) ||
        r.challenges?.toLowerCase().includes(searchLower) ||
        r.soilType?.toLowerCase().includes(searchLower)
      )
      .slice(0, 5)
      .forEach((r: any) => {
        searchResults.push({
          type: 'crop_request',
          id: r._id,
          title: `Crop Request - ${r.location}`,
          description: r.challenges,
          location: r.location
        });
      });

    setResults(searchResults);
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery('');

    switch (result.type) {
      case 'question':
        navigate(`/questions/${result.id}`);
        break;
      case 'event':
        navigate(`/events/${result.id}`);
        break;
      case 'crop_request':
        navigate(`/crop-requests/${result.id}`);
        break;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'question': return '#1976d2';
      case 'event': return '#ed6c02';
      case 'crop_request': return '#2e7d32';
      default: return '#666';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'question': return 'Question';
      case 'event': return 'Event';
      case 'crop_request': return 'Crop Request';
      default: return type;
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        placeholder="Search questions, events, crop requests..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#2e7d32' }} />
            </InputAdornment>
          ),
          endAdornment: !dataLoaded && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
        sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#2e7d32',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2e7d32',
            },
          },
        }}
      />

      {/* Search Results Dropdown */}
      {showResults && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1000
          }}
        >
          {results.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {searchQuery.length < 2 
                  ? 'Type at least 2 characters to search' 
                  : !dataLoaded 
                  ? 'Loading data...'
                  : 'No results found'}
              </Typography>
            </Box>
          ) : (
            <List>
              {results.map((result, index) => (
                <React.Fragment key={result.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleResultClick(result)}
                      sx={{
                        '&:hover': { backgroundColor: '#f5f5f5' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip
                              label={getTypeLabel(result.type)}
                              size="small"
                              sx={{
                                backgroundColor: getTypeColor(result.type),
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                            <Typography variant="body1" fontWeight="medium">
                              {result.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {result.description?.substring(0, 80)}
                              {result.description?.length > 80 && '...'}
                            </Typography>
                            {result.location && (
                              <Typography variant="caption" color="text.secondary">
                                📍 {result.location}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < results.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default UniversalSearch;
