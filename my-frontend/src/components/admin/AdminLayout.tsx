/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';

const DRAWER_WIDTH = 280;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/admin');
          return;
        }

        // Verify admin access
        const response = await axios.get('/protected/Home', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = response.data.user;

        // Check if user is admin
        if (!user.is_admin) {
          console.error('❌ Not an admin');
          navigate('/admin');
          return;
        }

        setAdminName(`${user.first_name} ${user.last_name}`);
        setLoading(false);

      } catch (error) {
        console.error('❌ Admin verification failed:', error);
        localStorage.removeItem('token');
        navigate('/admin');
      }
    };

    verifyAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px` }}>
        <AdminNavbar adminName={adminName} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8, // Space for navbar
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
