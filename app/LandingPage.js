// LandingPage.js
'use client';

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Container, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom'; // Ensure react-router-dom is installed

const theme = createTheme({
  // Define your theme here
});

export default function LandingPage() {
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          <Button color="inherit" component={Link} to="/home">
            Get Started
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ backgroundColor: "#e3f2fd", minHeight: "100vh", py: 6 }}>
        <Container>
          <Grid container spacing={4} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" align="center" gutterBottom>
                Welcome to My App
              </Typography>
              <Typography variant="body1" align="center" paragraph>
                Discover the easiest way to manage your pantry items and generate recipes based on what you have.
                Our application helps you keep track of your inventory and provides creative recipes for your
                ingredients.
              </Typography>
              <Box textAlign="center" mt={4}>
                <Button variant="contained" color="primary" size="large" component={Link} to="/home">
                  Get Started
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h2" gutterBottom>
                    Features
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Manage Inventory:</strong> Add, update, and delete pantry items with ease.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Recipe Generation:</strong> Get creative recipes based on your current ingredients.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Search Functionality:</strong> Quickly find items in your inventory.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
