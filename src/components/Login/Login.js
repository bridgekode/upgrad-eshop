import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../api/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitting login form...", formData);

    setError('');
    setIsLoading(true);

    try {
      console.log("Making API request to /auth/signin...");
      const response = await api.post('/auth/signin', formData);
      
      console.log("API Response:", response);
      
      // Temporary: Use hardcoded token instead of extracting from headers
      const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBkZW1vLmNvbSIsImlhdCI6MTc0NDMwMjcyOSwiZXhwIjoxNzQ0MzExMTI5fQ.GGCV1v3eQ_OrVfO7n1RA60HSMeDKLNBdvnNwccBAFsCYPAQjAf9NmeS3bqpgwSNIFMPSdmppdWhswW0D2X1ZYQ';
      
      // Get user data from response body
      const userData = {
        id: response.data.id,
        email: response.data.email,
        roles: response.data.roles,
      };
      console.log("User data:", userData);
      console.log("Using hardcoded token:", token);

      // Update app state with auth info
      onLogin(token, userData);

      // Navigate to products page
      navigate('/products');
      
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        console.error("API error response:", error.response);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
          }}
        >
          <Typography 
            component="h1" 
            variant="h5" 
            sx={{ 
              mb: 3,
              fontWeight: 600,
              color: '#3f51b5'
            }}
          >
            Sign In
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, width: '100%' }}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            noValidate
            sx={{
              width: '100%',
              mt: 1
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Email Address"
              name="username"
              autoComplete="email"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              error={!!error}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              error={!!error}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !formData.username || !formData.password}
              sx={{
                mt: 1,
                mb: 3,
                py: 1.5,
                backgroundColor: '#3f51b5',
                '&:hover': {
                  backgroundColor: '#2c387e'
                }
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  component={RouterLink} 
                  to="/signup"
                  sx={{
                    color: '#3f51b5',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login; 