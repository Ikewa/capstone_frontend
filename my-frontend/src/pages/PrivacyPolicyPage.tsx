/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Container, Typography, Paper, Divider } from '@mui/material'
import Navbar from '../components/Navbar'
import SecurityIcon from '@mui/icons-material/Security'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import LockIcon from '@mui/icons-material/Lock'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudIcon from '@mui/icons-material/Cloud'
import ChildCareIcon from '@mui/icons-material/ChildCare'

function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          
          {/* Header */}
          <Paper sx={{ p: 4, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <SecurityIcon sx={{ fontSize: 48 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                Privacy Policy
              </Typography>
            </Box>
            <Typography variant="body1">
              Your privacy and data security are our top priorities. This policy explains how we collect, use, and protect your information.
            </Typography>
            <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.9 }}>
              Last Updated: November 2025
            </Typography>
          </Paper>

          {/* Section 1: Information We Collect */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <VerifiedUserIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                1. INFORMATION WE COLLECT
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
              Essential Information:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 3 }}>
              <li>Name and phone number (minimum requirement for account creation)</li>
              <li>Farm location (region/state level only, not precise GPS)</li>
              <li>Crop types you cultivate</li>
              <li>Language preference</li>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
              Optional Information:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>Detailed farm size and yield data</li>
              <li>Agricultural equipment owned</li>
              <li>Years of farming experience</li>
              <li>Educational background</li>
            </Box>
          </Paper>

          {/* Section 2: How We Use Your Information */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
              2. HOW WE USE YOUR INFORMATION
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
              Primary Uses:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 3 }}>
              <li>Connect you with relevant agricultural advice</li>
              <li>Match you with buyers/sellers in the marketplace</li>
              <li>Send critical weather and pest alerts for your region</li>
              <li>Improve platform features based on usage patterns</li>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main' }}>
              We DO NOT:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>Sell your data to third parties</li>
              <li>Share individual farm yields with competitors</li>
              <li>Use your data for purposes unrelated to agricultural improvement</li>
            </Box>
          </Paper>

          {/* Section 3: Data Minimization */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              3. DATA MINIMIZATION PRINCIPLE
            </Typography>
            <Typography variant="body1">
              We only collect data necessary for platform functionality. You can use many features 
              (browsing forums, reading advice) without providing personal information.
            </Typography>
          </Paper>

          {/* Section 4: Data Storage & Security */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <LockIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                4. DATA STORAGE & SECURITY
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
              Security Measures:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 3 }}>
              <li>All passwords encrypted using bcrypt hashing</li>
              <li>JWT tokens expire after 24 hours</li>
              <li>HTTPS encryption for all data transmission</li>
              <li>Regular security audits and penetration testing</li>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
              Data Location:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>Primary servers hosted on Railway platform</li>
              <li>Backup data stored in encrypted format</li>
              <li>No data stored on foreign servers without user consent</li>
            </Box>
          </Paper>

          {/* Section 5: Your Rights */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              5. YOUR RIGHTS
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You have the right to:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li><strong>Access:</strong> Request a copy of your data in JSON or CSV format</li>
              <li><strong>Correction:</strong> Update inaccurate information through your profile</li>
              <li><strong>Deletion:</strong> Request account and data deletion (except legally required records)</li>
              <li><strong>Portability:</strong> Export your farming records and forum contributions</li>
              <li><strong>Anonymity:</strong> Post in forums anonymously when discussing sensitive topics</li>
            </Box>
          </Paper>

          {/* Section 6: Data Retention */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <CloudIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                6. DATA RETENTION
              </Typography>
            </Box>
            <Box component="ul" sx={{ pl: 3 }}>
              <li><strong>Active account data:</strong> Maintained while account is active</li>
              <li><strong>Inactive accounts:</strong> Archived after 2 years, deleted after 5 years</li>
              <li><strong>Agricultural advice posts:</strong> Permanently retained for community benefit (can be anonymized)</li>
              <li><strong>Transaction records:</strong> 7 years per Nigerian financial regulations</li>
            </Box>
          </Paper>

          {/* Section 7: Vulnerable Users */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <ChildCareIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                7. SPECIAL PROVISIONS FOR VULNERABLE USERS
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
              For Low-Literacy Users:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 3 }}>
              <li>Visual consent process using icons and images</li>
              <li>Voice confirmation option for critical privacy choices</li>
              <li>Simplified privacy dashboard with pictographic representations</li>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
              For Minors:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>Users under 18 require parental/guardian consent</li>
              <li>Limited data collection for users under 18</li>
              <li>No marketplace access for minors</li>
            </Box>
          </Paper>

          {/* Section 8: Third-Party Services */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              8. THIRD-PARTY SERVICES
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li><strong>Weather data:</strong> Integrated from Nigerian Meteorological Agency</li>
              <li><strong>Payment processing:</strong> Partners comply with CBN regulations</li>
              <li><strong>SMS services:</strong> Used only for critical alerts with explicit opt-in</li>
            </Box>
          </Paper>

          {/* Section 9: Consent Management */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              9. CONSENT MANAGEMENT
            </Typography>
            <Typography variant="body1">
              All data collection beyond essential functions requires explicit opt-in consent. 
              You can modify your consent preferences at any time through Settings &gt; Privacy Controls.
            </Typography>
          </Paper>

          <Divider sx={{ my: 4 }} />

          {/* Contact Section */}
          <Paper sx={{ p: 4, backgroundColor: '#e8f5e9' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Questions or Concerns?
            </Typography>
            <Typography variant="body1">
              If you have any questions about this privacy policy or how we handle your data, 
              please contact us at: <strong>ikewa28@gmail.com</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              You can also reach us through the Contact Support option in your profile settings.
            </Typography>
          </Paper>

        </Container>
      </Box>
    </>
  )
}

export default PrivacyPolicyPage