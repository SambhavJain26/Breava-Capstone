// src/pages/About.js
import React from 'react';
import { Container, Box, Grid, Typography, CardMedia } from '@mui/material';
import womanImage from '../assets/woman.png'; // your image path

export default function About() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Hero / Banner */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          mb: 6,
          borderRadius: 2,
          boxShadow: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" gutterBottom color="primary">
          About Breava Software
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 800, mx: 'auto', textAlign:'justify' }}>
          Our breast cancer detection platform combines advanced machine learning model
          with medical expertise to provide accurate and reliable screening assistance.
          We utilize powerful algorithm:
          <br />
          <strong>Naive Bayes</strong>, which has been trained to extract features from Fine needle Aspiration(FNA) cytology data.
          Breava caters effectively to approximately 70-80% (in developing countries) of early breast cancer diagnostic cases, where FNA procedures are typically used to assess tumor malignancy.

        </Typography>
      </Box>

      {/* Image + Features */}
      <Grid container spacing={4} alignItems="center">
        {/* Left: Illustration */}
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={womanImage}
            alt="Platform illustration"
            sx={{
              width: '60%'
            }}
          />
        </Grid>

        {/* Right: Highlights */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                Reliable
              </Typography>
              <Typography variant="body1" color="textSecondary">
                High accuracy rates with multiple model validation.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                Intelligent
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Advanced ML algorithms for precise detection.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                Fast
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Quick results without compromising accuracy.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}