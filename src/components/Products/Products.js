import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  IconButton,
  Container,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../api/api';
import PropTypes from 'prop-types';
import { attemptWithTokens } from '../../utils/tokenManager';

// Restore Styled components definitions
const TruncatedTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  height: '48px', // Approximately 2 lines of text
});

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({ // Assuming ToggleButton is used here
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
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({ // Assuming ToggleButtonGroup is used here
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

// Sort options
const SORT_OPTIONS = {
  DEFAULT: 'Default',
  PRICE_HIGH_TO_LOW: 'Price: High to Low',
  PRICE_LOW_TO_HIGH: 'Price: Low to High',
  NEWEST: 'Newest',
};

function Products({ searchKeyword, user }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.DEFAULT);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch products function
  const fetchProducts = async () => {
    try {
      const apiCall = (token) => api.get('/products', {
        headers: { 'x-auth-token': token }
      });
      const response = await attemptWithTokens(apiCall);

      // Log the first product's data structure to inspect keys
      if (response.data && response.data.length > 0) {
        console.log('First product data structure:', response.data[0]);
      }

      setProducts(response.data);
      setFilteredProducts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Updated category fetching
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/products/categories');
        // Prepend "ALL" to the categories list
        setCategories(['ALL', ...response.data]);
        setError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Updated filtering effect with safe checks
  useEffect(() => {
    if (!user?.isLoggedIn) {
      navigate('/login');
      return;
    }

    // First filter by category
    let filtered = selectedCategory === 'ALL'
      ? [...products]
      : products.filter(product => product.category === selectedCategory);

    // Then filter by search keyword with safe checks
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(product => {
        const title = product.title || '';
        const description = product.description || '';
        return (
          title.toLowerCase().includes(keyword) ||
          description.toLowerCase().includes(keyword)
        );
      });
    }

    // Apply sorting
    switch (sortOption) {
      case SORT_OPTIONS.PRICE_HIGH_TO_LOW:
        filtered.sort((a, b) => b.price - a.price);
        break;
      case SORT_OPTIONS.PRICE_LOW_TO_HIGH:
        filtered.sort((a, b) => a.price - b.price);
        break;
      case SORT_OPTIONS.NEWEST:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        filtered.sort((a, b) => a.id - b.id);
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, sortOption, products, navigate, user, searchKeyword]);

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null) {
      setSelectedCategory(newCategory);
    }
  };

  const handleEdit = (productId) => {
    navigate(`/products/modify/${productId}`);
  };

  const handleDeleteClick = (product) => {
    if (user?.role !== 'ADMIN') {
      console.warn('Delete attempted by non-admin user');
      return;
    }
    console.log('Opening delete dialog for product:', {
      id: product._id || product.id,
      name: product.name || product.title
    });
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct || user?.role !== 'ADMIN') return;

    try {
      const productId = selectedProduct._id || selectedProduct.id;
      
      const apiCall = (token) => api.delete(`/products/${productId}`, {
        headers: { 'x-auth-token': token }
      });

      await attemptWithTokens(apiCall, true); // true for admin-required
      
      setSuccessMessage('Product deleted successfully');
      await fetchProducts();
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Delete product error:', error);
      setError(error.response?.status === 401 
        ? 'Unauthorized. Please check admin permissions.' 
        : 'Failed to delete product. Please try again.');
    }
  };

  const handleBuy = (productId) => {
    console.log('Navigating to product:', productId);
    navigate(`/products/${productId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Sort By Dropdown */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography
          component="label"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Sort By:
        </Typography>
        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        >
          <Select
            value={sortOption}
            onChange={handleSortChange}
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                py: 1,
              },
            }}
          >
            {Object.values(SORT_OPTIONS).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Category Toggle Buttons */}
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '48px'
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body1" color="text.secondary">
              Loading categories...
            </Typography>
          </Box>
        ) : (
          <StyledToggleButtonGroup
            value={selectedCategory}
            exclusive
            onChange={handleCategoryChange}
            aria-label="product categories"
          >
            {categories.map((category) => (
              <StyledToggleButton 
                key={category} 
                value={category}
              >
                {category}
              </StyledToggleButton>
            ))}
          </StyledToggleButtonGroup>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Box sx={{ 
          textAlign: 'center', 
          my: 4, 
          p: 2, 
          bgcolor: 'error.light',
          borderRadius: 1
        }}>
          <Typography color="error.dark">{error}</Typography>
        </Box>
      )}

      {/* Products Grid */}
      <Grid container spacing={3}>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%',
            mt: 4 
          }}>
            <CircularProgress />
          </Box>
        ) : (
          filteredProducts.map((product) => {
            // Log each product to confirm data
            // console.log('Rendering Product:', product);

            // Check if product.name exists and use it, otherwise fallback to product.title
            const productName = product.name || product.title || 'Unnamed Product';

            return (
              <Grid item key={product.id || product._id} xs={12} sm={6} md={4}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl || 'default-image.jpg'} // Add fallback image?
                    alt={productName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Display the derived product name */}
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                      {productName}
                    </Typography>
                    <TruncatedTypography variant="body2" color="text.secondary">
                      {product.description}
                    </TruncatedTypography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      ₹ {product.price?.toFixed(2)}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 2
                    }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          const productId = product.id || product._id; // Use correct ID
                          if (productId) {
                            handleBuy(productId);
                          } else {
                            console.error('Product ID missing:', product);
                          }
                        }}
                        sx={{
                          textTransform: 'none',
                          px: 3,
                          borderRadius: '8px',
                        }}
                      >
                        BUY
                      </Button>
                      
                      {user?.role === 'ADMIN' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                               const productId = product.id || product._id; // Use correct ID
                               if (productId) {
                                 handleEdit(productId);
                               } else {
                                 console.error('Product ID missing for edit:', product);
                               }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(product)} // Pass the whole product
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm deletion of product!
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete the product?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            CANCEL
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={3000}
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
      )}
    </Container>
  );
}

Products.propTypes = {
  searchKeyword: PropTypes.string.isRequired,
  user: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
    role: PropTypes.string,
  }),
};

export default Products; 