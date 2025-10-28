import { Box, Container, Typography } from '@mui/material'

function Footer() {
  return (
    // Box = like <div> but with MUI styling powers
    <Box 
      component="footer"  // Renders as <footer> HTML tag
      sx={{
        backgroundColor: '#1a2f0d',  // Dark green background
        color: 'white',              // White text
        py: 4,                       // padding-top & padding-bottom: 32px
        mt: 'auto'                   // Push footer to bottom
      }}
    >
      {/* Container = centers content with max width */}
      <Container maxWidth="lg">  {/* lg = large screens max width */}
        
        {/* Main title */}
        <Typography 
          variant="h6"        // Medium heading size
          align="center"      // Center the text
          gutterBottom        // Adds margin-bottom automatically
        >
          <strong>AgriFuture</strong> - Agricultural Extension in the Digital Age
        </Typography>
        
        {/* Subtitle */}
        <Typography 
          variant="body2"     // Small body text
          align="center" 
          sx={{ opacity: 0.8, mb: 1 }}  // Slightly transparent, margin-bottom
        >
          Empowering farmers across Northern Nigeria
        </Typography>
        
        {/* Copyright */}
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ opacity: 0.8 }}
        >
          &copy; 2025 AgriFuture. Building stronger farming communities.
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer