import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../../api/api';

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: '8px 24px',
  textTransform: 'uppercase',
  color: '#666',
  backgroundColor: '#fff',
  fontSize: '0.875rem',
  fontWeight: 500,
  letterSpacing: '0.5px',
  border: 'none',
  '&.Mui-selected': {
    backgroundColor: '#f5f5f5',
    color: theme.palette.primary.main,
    fontWeight: 600,
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  },
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
  '&.Mui-disabled': {
     border: 'none !important',
     opacity: 0.7,
  }
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    '&:not(:first-of-type)': {
      borderLeft: '1px solid #e0e0e0',
      borderRadius: 0,
    },
    '&:first-of-type': {
      borderRadius: '4px 0 0 4px',
    },
    '&:last-of-type': {
      borderRadius: '0 4px 4px 0',
    },
  },
}));

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoadingProduct(true);
        setError(null);
        
        console.log("Product ID from URL:", id);
        
        const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBkZW1vLmNvbSIsImlhdCI6MTc0NDMwMjcyOSwiZXhwIjoxNzQ0MzExMTI5fQ.GGCV1v3eQ_OrVfO7n1RA60HSMeDKLNBdvnNwccBAFsCYPAQjAf9NmeS3bqpgwSNIFMPSdmppdWhswW0D2X1ZYQ';
        
        const response = await api.get(`/products/${id}`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        console.log("Fetched product:", response.data);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
        const errorMessage = error.response?.data?.message || 
                           'Failed to load product details. Please try again later.';
        setError(errorMessage);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await api.get('/products/categories');
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(prev => prev ? `${prev}\nCould not load categories.` : 'Could not load categories.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0 && value <= (product?.availableItems || 0)) {
      setQuantity(value);
    }
  };

  const handlePlaceOrder = () => {
    navigate('/create-order', {
      state: {
        productId: id,
        quantity: quantity
      }
    });
  };

  const isLoading = isLoadingProduct || isLoadingCategories;

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '80vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          sx={{
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Product not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '48px'
        }}
      >
        {isLoadingCategories ? (
          <CircularProgress size={24} />
        ) : (
          <StyledToggleButtonGroup
            value={product?.category || ''}
            exclusive
            aria-label="product categories"
          >
            {categories.map((category) => (
              <StyledToggleButton
                key={category}
                value={category}
                disabled
                aria-pressed={product?.category === category}
              >
                {category}
              </StyledToggleButton>
            ))}
          </StyledToggleButtonGroup>
        )}
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
            }}
          >
            <CardMedia
              component="img"
              image={product?.imageUrl}
              alt={product?.imageUrl ? product.title : "Product image not available"}
              sx={{
                maxHeight: 400,
                objectFit: 'contain',
                width: '100%',
                p: 2,
              }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ pl: { md: 4 } }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ 
                mb: 2,
                fontWeight: 500,
              }}
            >
              {product?.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{ 
                mb: 3,
                lineHeight: 1.8,
              }}
            >
              {product?.description}
            </Typography>

            <Typography
              variant="h5"
              color="primary"
              sx={{ 
                mb: 3,
                fontWeight: 600,
              }}
            >
              ₹ {product?.price?.toFixed(2)}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Available Items: {product?.availableItems || 0}
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 3,
              mb: 4,
            }}>
              <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                InputProps={{
                  inputProps: { 
                    min: 1, 
                    max: product?.availableItems || 0 
                  }
                }}
                sx={{ width: 100 }}
              />

              <Button
                variant="contained"
                size="large"
                onClick={handlePlaceOrder}
                disabled={!product?.availableItems}
                sx={{
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#3f51b5',
                  '&:hover': {
                    backgroundColor: '#2c387e'
                  }
                }}
              >
                PLACE ORDER
              </Button>
            </Box>

            {!product?.availableItems && (
              <Alert severity="error" sx={{ mt: 2 }}>
                This product is currently out of stock.
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProductDetails;