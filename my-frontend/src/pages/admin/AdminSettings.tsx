import { useState, useContext } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AdminLayout from '../../components/admin/AdminLayout';
import { ToastContext } from '../../context/ToastContext';

const AdminSettings = () => {
  const { showToast } = useContext(ToastContext);

  const [settings, setSettings] = useState({
    siteName: 'AgriConnect',
    siteDescription: 'Agricultural Extension Service Platform',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    maxFileUploadSize: 5,
    sessionTimeout: 7,
  });

  const [announcement, setAnnouncement] = useState({
    enabled: false,
    message: '',
    type: 'info',
  });

  const handleSaveSettings = () => {
    showToast('Settings saved successfully!', 'success');
    console.log('Settings:', settings);
  };

  const handleSaveAnnouncement = () => {
    showToast('Announcement saved successfully!', 'success');
    console.log('Announcement:', announcement);
  };

  return (
    <AdminLayout>
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          ⚙️ System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configure platform settings and preferences
        </Typography>

        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                General Settings
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Site Name"
                  fullWidth
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />

                <TextField
                  label="Site Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                />

                <TextField
                  label="Max File Upload Size (MB)"
                  type="number"
                  fullWidth
                  value={settings.maxFileUploadSize}
                  onChange={(e) => setSettings({ ...settings, maxFileUploadSize: parseInt(e.target.value) })}
                />

                <TextField
                  label="Session Timeout (days)"
                  type="number"
                  fullWidth
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                />

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  fullWidth
                >
                  Save General Settings
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Access Control */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Access Control
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Maintenance Mode
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Restrict access to admins only
                      </Typography>
                    </Box>
                  }
                />

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowRegistration}
                      onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Allow User Registration
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enable new user signups
                      </Typography>
                    </Box>
                  }
                />

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.requireEmailVerification}
                      onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Email Verification Required
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Require email verification for new users
                      </Typography>
                    </Box>
                  }
                />

                {settings.maintenanceMode && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ⚠️ Maintenance mode is active. Only admins can access the platform.
                  </Alert>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Announcements */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Platform Announcement
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={announcement.enabled}
                      onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                    />
                  }
                  label="Display announcement banner"
                />

                <TextField
                  label="Announcement Message"
                  fullWidth
                  multiline
                  rows={4}
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                  placeholder="Enter announcement message to display to all users..."
                  disabled={!announcement.enabled}
                />

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAnnouncement}
                  sx={{ maxWidth: 200 }}
                  disabled={!announcement.enabled}
                >
                  Save Announcement
                </Button>

                {announcement.enabled && announcement.message && (
                  <Alert severity="info">
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                      Preview:
                    </Typography>
                    {announcement.message}
                  </Alert>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Platform Stats */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Platform Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Platform Version
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    v1.0.0
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Database Status
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    Connected
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Server Status
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    Online
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Last Backup
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    Never
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminSettings;
