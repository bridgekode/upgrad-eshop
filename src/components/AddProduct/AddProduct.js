import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import api from '../../api/api';
import { attemptWithTokens } from '../../utils/tokenManager';

// Primary admin token
const PRIMARY_ADMIN_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBkZW1vLmNvbSIsImlhdCI6MTc0NDM4MjQxNSwiZXhwIjoxNzQ0MzkwODE1fQ.2lJ0KmlMv8k3rQ_234CtFu5d7afYRXVowJXmHoLEwDzWa-jEfIDjGEy7FvCiV1yW11AXeKmHV1qJoK6pMFSQzg';

// Category options
const CATEGORIES = ['Apparel', 'Electronics', 'Personal Care', 'Furniture'];

function AddProduct() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    availableItems: '',
    price: '',
    imageUrl: '',
    description: ''
  });

  // UI state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.manufacturer?.trim()) errors.manufacturer = 'Manufacturer is required';
    if (!formData.availableItems || formData.availableItems < 0) errors.availableItems = 'Available items must be 0 or greater';
    if (!formData.price || formData.price < 0) errors.price = 'Price must be 0 or greater';
    
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors).join('\n'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError(null);

      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        manufacturer: formData.manufacturer.trim(),
        availableItems: parseInt(formData.availableItems),
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl?.trim() || '',
        description: formData.description?.trim() || ''
      };

      const apiCall = (token) => api.post('/products', productData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      const response = await attemptWithTokens(apiCall, true); // true for admin-required
      
      setSuccess(`Product ${formData.name} added successfully`);
      setTimeout(() => navigate('/products'), 2000);

    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.response?.status === 401 
        ? 'Unauthorized. Please check admin permissions.' 
        : 'Failed to add product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ mb: 4 }}
        >
          Add Product
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            variant="outlined"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />
          
          <FormControl 
            fullWidth 
            required 
            margin="normal"
          >
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              name="category"
              label="Category"
              onChange={handleChange}
            >
              {CATEGORIES.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            required
            fullWidth
            variant="outlined"
            label="Manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            margin="normal"
          />
          
          <TextField
            required
            fullWidth
            variant="outlined"
            type="number"
            label="Available Items"
            name="availableItems"
            value={formData.availableItems}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          
          <TextField
            required
            fullWidth
            variant="outlined"
            type="number"
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          
          <TextField
            fullWidth
            variant="outlined"
            label="Image URL"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            margin="normal"
          />
          
          <TextField
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            label="Product Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              backgroundColor: '#3f51b5',
              '&:hover': {
                backgroundColor: '#2c387e'
              }
            }}
          >
            SAVE PRODUCT
          </Button>
        </form>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={2000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSuccess(null)} 
            severity="success"
            sx={{ width: '100%' }}
          >
            {success}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setError(null)} 
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default AddProduct; 