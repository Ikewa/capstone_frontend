/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
// import EventIcon from '@mui/icons-material/Event';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

interface Stats {
  users: {
    total: number;
    farmers: number;
    officers: number;
  };
  content: {
    questions: number;
    answers: number;
    events: number;
    groups: number;
    notes: number;
  };
  activity: {
    today: number;
    week: number;
    month: number;
  };
}

const AdminReports = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Stats loaded:', response.data);
      setStats(response.data.stats);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!stats) return;

    const csvContent = `AgriConnect Platform Report
Generated: ${new Date().toLocaleString()}

USERS
Total Users,${stats.users.total}
Farmers,${stats.users.farmers}
Extension Officers,${stats.users.officers}

CONTENT
Questions,${stats.content.questions}
Answers,${stats.content.answers}
Events,${stats.content.events}
Discussion Groups,${stats.content.groups}
Notes,${stats.content.notes}

ACTIVITY
Active Today,${stats.activity.today}
Active This Week,${stats.activity.week}
Active This Month,${stats.activity.month}
`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agriconnect-report-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert severity="error">{error}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              📊 Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Detailed platform statistics and insights
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
          >
            Export Report
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* User Stats */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h5" fontWeight="bold">
                  User Statistics
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {stats?.users.total || 0}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {stats?.users.farmers || 0}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Farmers
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                      {stats?.users.officers || 0}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Extension Officers
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Content Stats */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <QuestionAnswerIcon color="secondary" sx={{ fontSize: 40 }} />
                <Typography variant="h5" fontWeight="bold">
                  Content Statistics
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={6} md={2.4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="info.main">
                      {stats?.content.questions || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Questions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2.4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="secondary.main">
                      {stats?.content.answers || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Answers
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2.4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="error.main">
                      {stats?.content.events || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Events
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2.4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {stats?.content.groups || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Groups
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2.4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                      {stats?.content.notes || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Activity Stats */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                <Typography variant="h5" fontWeight="bold">
                  Activity Statistics
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {stats?.activity.today || 0}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Active Today
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {stats?.activity.week || 0}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Active This Week
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {stats?.activity.month || 0}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Active This Month
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Engagement Metrics */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Engagement Rate
              </Typography>
              <Typography variant="h2" fontWeight="bold" color="success.main">
                {stats?.users.total && stats?.activity.month 
                  ? ((stats.activity.month / stats.users.total) * 100).toFixed(1)
                  : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monthly active users / Total users
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Content Per User
              </Typography>
              <Typography variant="h2" fontWeight="bold" color="primary">
                {stats?.users.total && stats?.content.questions
                  ? ((stats.content.questions + stats.content.answers) / stats.users.total).toFixed(1)
                  : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average questions + answers per user
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminReports;