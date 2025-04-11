import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../../api/api';
import { attemptWithTokens } from '../../utils/tokenManager';

function ModifyProduct() {
  const { id } = useParams();
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
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch product details on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoadingProduct(true);
        setError(null);
        
        const apiCall = (token) => api.get(`/products/${id}`, {
          headers: { 'x-auth-token': token }
        });

        const response = await attemptWithTokens(apiCall);
        
        console.log('Product details response:', response.data);

        setFormData({
          name: response.data.name || '',
          category: response.data.category || '',
          manufacturer: response.data.manufacturer || '',
          availableItems: response.data.availableItems || '',
          price: response.data.price || '',
          imageUrl: response.data.imageUrl || '',
          description: response.data.description || ''
        });
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product details');
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await api.get('/products/categories');
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(prev => prev ? `${prev}\nFailed to fetch categories.` : 'Failed to fetch categories.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.category?.trim()) errors.category = 'Category is required';
    if (!formData.manufacturer?.trim()) errors.manufacturer = 'Manufacturer is required';
    if (!formData.availableItems || formData.availableItems < 0) errors.availableItems = 'Available items must be 0 or greater';
    if (!formData.price || formData.price < 0) errors.price = 'Price must be 0 or greater';
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Add validation check
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError('Please fill all required fields correctly');
      return;
    }
    
    try {
      const apiCall = (token) => api.put(`/products/${id}`, formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      await attemptWithTokens(apiCall, true); // true for admin-required
      
      setSuccess('Product updated successfully');

      // Add navigation back after a delay to allow Snackbar visibility
      setTimeout(() => {
        navigate('/products');
      }, 2000); // Navigate after 2 seconds

    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.response?.status === 401 
        ? 'Unauthorized. Please check admin permissions.' 
        : 'Failed to update product. Please try again.');
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccess(null); // Clear success message to hide Snackbar
  };

  const isLoading = isLoadingProduct || isLoadingCategories;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Modify Product
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <span style={{ whiteSpace: 'pre-line' }}>{error}</span>
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              required
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            
            <FormControl fullWidth required margin="normal" disabled={isLoadingCategories}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={formData.category}
                label="Category"
                name="category"
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              required
              fullWidth
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              required
              fullWidth
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
              label="Image URL"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
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
              sx={{ mt: 3, mb: 2 }}
            >
              Modify Product
            </Button>
          </form>
        )}
      </Box>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ModifyProduct; 