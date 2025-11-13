import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ForumIcon from '@mui/icons-material/Forum';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const DRAWER_WIDTH = 280;

interface MenuItem {
  label: string;
  path: string;
  icon: JSX.Element;
}

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
    { label: 'Questions', path: '/admin/questions', icon: <ForumIcon /> },
    { label: 'Events', path: '/admin/events', icon: <EventIcon /> },
    { label: 'Discussion Groups', path: '/admin/groups', icon: <GroupIcon /> },
    { label: 'Crop Catalog', path: '/admin/crop-catalog', icon: <AgricultureIcon /> },
    { label: 'Reports', path: '/admin/reports', icon: <BarChartIcon /> },
    { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
    { label: 'Create Admin', path: '/admin/create-admin', icon: <PersonAddIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
          🛡️ Admin Panel
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          AgriConnect Management
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Menu Items */}
      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                  backgroundColor: isActive ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.15)',
                    color: 'white',
                  },
                  transition: 'all 0.3s',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 'bold' : 'normal',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;
