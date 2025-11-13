/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ForumIcon from '@mui/icons-material/Forum';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Admin stats loaded:', response.data);
      setStats(response.data.stats);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading stats:', err);
      setError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    icon: JSX.Element; 
    color: string;
  }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ color }}>
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
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

  if (error || !stats) {
    return (
      <AdminLayout>
        <Alert severity="error">{error || 'Failed to load dashboard'}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          📊 Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome to AgriConnect Admin Panel
        </Typography>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Users */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.users.total}
              icon={<PeopleIcon sx={{ fontSize: 32 }} />}
              color="#667eea"
            />
          </Grid>

          {/* Farmers */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Farmers"
              value={stats.users.farmers}
              icon={<PeopleIcon sx={{ fontSize: 32 }} />}
              color="#2e7d32"
            />
          </Grid>

          {/* Extension Officers */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Extension Officers"
              value={stats.users.officers}
              icon={<PeopleIcon sx={{ fontSize: 32 }} />}
              color="#f57c00"
            />
          </Grid>

          {/* Total Questions */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Questions"
              value={stats.content.questions}
              icon={<ForumIcon sx={{ fontSize: 32 }} />}
              color="#1976d2"
            />
          </Grid>

          {/* Total Answers */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Answers"
              value={stats.content.answers}
              icon={<ForumIcon sx={{ fontSize: 32 }} />}
              color="#9c27b0"
            />
          </Grid>

          {/* Total Events */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Events"
              value={stats.content.events}
              icon={<EventIcon sx={{ fontSize: 32 }} />}
              color="#d32f2f"
            />
          </Grid>

          {/* Discussion Groups */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Discussion Groups"
              value={stats.content.groups}
              icon={<GroupIcon sx={{ fontSize: 32 }} />}
              color="#00796b"
            />
          </Grid>

          {/* Total Notes */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Notes"
              value={stats.content.notes}
              icon={<ForumIcon sx={{ fontSize: 32 }} />}
              color="#5e35b1"
            />
          </Grid>
        </Grid>

        {/* Activity Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                {stats.activity.today}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Active Today
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                {stats.activity.week}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Active This Week
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                {stats.activity.month}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Active This Month
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
