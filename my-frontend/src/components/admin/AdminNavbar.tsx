import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import { ToastContext } from '../../context/ToastContext';

const DRAWER_WIDTH = 280;

interface AdminNavbarProps {
  adminName?: string;
}

const AdminNavbar = ({ adminName = 'Admin' }: AdminNavbarProps) => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'success');
    navigate('/admin');
  };

  const handleGoToMainSite = () => {
    navigate('/home');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        background: 'white',
        color: 'text.primary',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
          AgriConnect Admin
        </Typography>

        <Chip
          label="ADMIN MODE"
          color="error"
          size="small"
          sx={{ mr: 2, fontWeight: 'bold' }}
        />

        <IconButton onClick={handleGoToMainSite} sx={{ mr: 1 }} title="Go to Main Site">
          <HomeIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
            <AccountCircleIcon />
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {adminName}
          </Typography>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleLogout}>
            <ExitToAppIcon sx={{ mr: 1 }} fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;