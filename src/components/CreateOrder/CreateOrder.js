import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Container,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar
} from '@mui/material';
import api from '../../api/api';
import PropTypes from 'prop-types';
import { attemptWithTokens } from '../../utils/tokenManager';

// Define the steps for the stepper
const steps = ['Items', 'Select Address', 'Confirm Order'];

function CreateOrder({ userInfo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId, quantity: initialQuantity } = location.state || {};

  // Debug logging
  useEffect(() => {
    console.log("User Info passed to CreateOrder:", userInfo);
  }, [userInfo]);

  // State Management
  const [activeStep, setActiveStep] = useState(0);
  const [product, setProduct] = useState(null);
  const [quantity] = useState(initialQuantity || 1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState({
    name: '',
    contactNumber: '',
    street: '',
    city: '',
    state: '',
    landmark: '',
    zipcode: ''
  });

  // Loading & Error States
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [productError, setProductError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [addressFormErrors, setAddressFormErrors] = useState({});

  // Add state for Snackbar message
  const [orderSuccessMessage, setOrderSuccessMessage] = useState('');

  // --- Effects for Data Fetching ---

  // Fetch Product Details
  useEffect(() => {
    if (!productId) {
      setProductError("No product selected. Please go back to the products page.");
      setIsLoadingProduct(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      setProductError(null);
      try {
        console.log(`Fetching product with ID: ${productId}`);
        const apiCall = (token) => api.get(`/products/${productId}`, {
          headers: { 'x-auth-token': token }
        });
        const response = await attemptWithTokens(apiCall, false);
        console.log("Fetched product details:", response.data);
        if (!response.data) {
          throw new Error("Product data not found.");
        }
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setProductError(err.response?.data?.message || err.message || "Failed to load product details.");
        setProduct(null);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Fetch Addresses when moving to Step 2
  useEffect(() => {
    if (activeStep === 1) {
      const fetchAddresses = async () => {
        setIsLoadingAddresses(true);
        setAddressError(null);
        try {
          console.log("Fetching addresses with token:");
          const apiCall = (token) => api.get('/addresses', {
            headers: { 'x-auth-token': token }
          });
          const response = await attemptWithTokens(apiCall, false);
          
          console.log("Addresses response:", response.data);
          
          if (Array.isArray(response.data)) {
            setAddresses(response.data);
          } else {
            console.error("Invalid addresses data format:", response.data);
            setAddresses([]);
          }
        } catch (err) {
          console.error("Error fetching addresses:", err);
          setAddressError(err.response?.data?.message || "Failed to load addresses");
          setAddresses([]);
        } finally {
          setIsLoadingAddresses(false);
        }
      };

      fetchAddresses();
    }
  }, [activeStep]);

  // --- Event Handlers ---

  // Stepper Navigation
  const handleNext = () => {
    setAddressError(null);

    if (activeStep === 1 && !selectedAddressId) {
      setAddressError("Please select an address to continue");
      return;
    }

    if (activeStep === steps.length - 1) {
      console.log("Final step 'Place Order' button clicked.");
      setOrderSuccessMessage("Order placed successfully");
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(`/products/${productId}`);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
      setAddressError(null);
    }
  };

  // New Address Form Input Change
  const handleNewAddressChange = (event) => {
    const { name, value } = event.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Validate address form fields
  const validateAddressForm = () => {
    const errors = {};
    const requiredFields = ['name', 'contactNumber', 'street', 'city', 'state', 'zipcode'];
    
    requiredFields.forEach(field => {
      if (!newAddress[field]?.trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Validate contact number format (10 digits)
    if (newAddress.contactNumber && !/^\d{10}$/.test(newAddress.contactNumber.trim())) {
      errors.contactNumber = 'Contact number must be 10 digits';
    }

    // Validate zipcode (6 digits)
    if (newAddress.zipcode && !/^\d{6}$/.test(newAddress.zipcode.trim())) {
      errors.zipcode = 'Zipcode must be 6 digits';
    }

    setAddressFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reverted save address handler
  const handleSaveAddress = async (event) => {
    event.preventDefault();
    if (!validateAddressForm()) {
      setAddressError("Please fill all required fields correctly");
      return;
    }
    setAddressError(null);
    console.log("Initiating save address..."); // Keep or adjust log as needed

    try {
      const addressData = {
        name: newAddress.name.trim(),
        contactNumber: newAddress.contactNumber.trim(),
        street: newAddress.street.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        zipcode: newAddress.zipcode.trim(),
        landmark: newAddress.landmark?.trim() || ''
      };
      console.log("Saving address data payload:", addressData);

      // --- Restore original code using attemptWithTokens ---
      const apiCall = (token) => api.post('/addresses', addressData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      console.log("Calling attemptWithTokens for saving address...");
      const response = await attemptWithTokens(apiCall, false); // Use attemptWithTokens again
      // --- End Restore ---


      /* --- Temporary code using PRIMARY_USER_TOKEN directly (commented out) ---
      console.warn("TEMPORARY: Bypassing attemptWithTokens, using PRIMARY_USER_TOKEN.");
      const response = await api.post('/addresses', addressData, {
        headers: {
          'x-auth-token': PRIMARY_TOKENS.USER, // Directly use the primary user token
          'Content-Type': 'application/json'
        }
      });
      */ // --- End Temporary code ---


      console.log('Saved new address response:', response.data);

      const newAddrFromServer = response.data;
      setAddresses(prev => [...prev, newAddrFromServer]);
      setSelectedAddressId(newAddrFromServer._id);
      setNewAddress({ // Clear the form
        name: '', contactNumber: '', street: '', city: '', state: '', landmark: '', zipcode: ''
      });
      setAddressFormErrors({});

    } catch (err) {
      // This catch block now handles errors from attemptWithTokens again
      console.error("Error saving address (after token attempts):", err);
      setAddressError(err.response?.data?.message || "Failed to save address.");
       if (err.response) {
          console.error("Full error response during save:", {
              status: err.response.status,
              data: err.response.data,
              headers: err.response.headers,
              config: err.config
          });
       }
    }
  };

  // Helper function to safely get address ID
  const getAddressId = (address) => {
    if (!address) return '';
    const id = address._id || address.id;
    return id ? id.toString() : '';
  };

  // Helper to find selected address with detailed logging
  const findSelectedAddress = () => {
    if (!selectedAddressId || !addresses) {
      console.log('Missing selectedAddressId or addresses array:', { selectedAddressId, addressesLength: addresses?.length });
      return null;
    }

    console.log('Looking for address with ID:', selectedAddressId);
    const found = addresses.find(addr => getAddressId(addr) === selectedAddressId);
    
    if (!found) {
      console.error('Address not found in addresses array:', {
        selectedAddressId,
        availableIds: addresses.map(getAddressId)
      });
    } else {
      console.log('Found matching address:', found);
    }
    
    return found;
  };

  // Updated address selection handler
  const handleAddressChange = (event) => {
    const value = event.target.value;
    console.log('Address selection changed:', value);
    setSelectedAddressId(value || '');
    setAddressError(null);
  };

  // --- Content Rendering Logic ---

  const getStepContent = (step) => {
    switch (step) {
      // --- Step 1: Product Summary ---
      case 0:
        if (isLoadingProduct) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
        if (productError) return <Alert severity="error">{productError}</Alert>;
        if (!product) return <Alert severity="info">Loading product details...</Alert>;
        return (
          <Card sx={{ display: 'flex', mb: 2, p: 2 }}>
            <CardMedia
              component="img"
              sx={{ width: 150, height: 150, objectFit: 'contain', mr: 3 }}
              image={product.imageUrl}
              alt={product.title}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <CardContent sx={{ flex: '1 0 auto', p: 0, '&:last-child': { pb: 0 } }}>
                <Typography component="div" variant="h5">
                  {product.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" component="div">
                  Quantity: {quantity}
                </Typography>
                <Typography variant="h6" color="primary" component="div" sx={{ mt: 1 }}>
                  Total Price: ₹ {(product.price * quantity).toFixed(2)}
                </Typography>
                {product.availableItems < quantity && (
                    <Alert severity="warning" sx={{mt: 1}}>Requested quantity exceeds stock ({product.availableItems}). Order may fail.</Alert>
                )}
                 {product.availableItems === 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>Product is Out of Stock</Alert>
                )}
              </CardContent>
            </Box>
          </Card>
        );

      // --- Step 2: Address Selection ---
      case 1:
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select Address
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }} error={!!addressError}>
              <Select
                value={selectedAddressId}
                onChange={handleAddressChange}
                displayEmpty
                sx={{ mb: 1 }}
                disabled={isLoadingAddresses}
              >
                <MenuItem value="">
                  <em>{isLoadingAddresses ? 'Loading addresses...' : 'Select an address'}</em>
                </MenuItem>
                {(addresses || []).map((address) => {
                  const addressId = getAddressId(address);
                  return (
                    <MenuItem 
                      key={addressId} 
                      value={addressId}
                    >
                      {`${address.name} - ${address.street}, ${address.city}`}
                    </MenuItem>
                  );
                })}
              </Select>
              {addressError && (
                <FormHelperText error>{addressError}</FormHelperText>
              )}
            </FormControl>

            <Typography align="center" sx={{ my: 2 }}>
              -OR-
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Add Address
            </Typography>

            <Box component="form" onSubmit={handleSaveAddress} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                required
                name="name"
                label="Name"
                value={newAddress.name}
                onChange={handleNewAddressChange}
                error={!!addressFormErrors.name}
                helperText={addressFormErrors.name}
                margin="normal"
              />
              
              <TextField
                fullWidth
                required
                name="contactNumber"
                label="Contact Number"
                value={newAddress.contactNumber}
                onChange={handleNewAddressChange}
                error={!!addressFormErrors.contactNumber}
                helperText={addressFormErrors.contactNumber}
                margin="normal"
                inputProps={{ maxLength: 10 }}
              />
              
              <TextField
                fullWidth
                required
                name="street"
                label="Street"
                value={newAddress.street}
                onChange={handleNewAddressChange}
                error={!!addressFormErrors.street}
                helperText={addressFormErrors.street}
                margin="normal"
              />
              
              <TextField
                fullWidth
                required
                name="city"
                label="City"
                value={newAddress.city}
                onChange={handleNewAddressChange}
                error={!!addressFormErrors.city}
                helperText={addressFormErrors.city}
                margin="normal"
              />
              
              <TextField
                fullWidth
                required
                name="state"
                label="State"
                value={newAddress.state}
                onChange={handleNewAddressChange}
                error={!!addressFormErrors.state}
                helperText={addressFormErrors.state}
                margin="normal"
              />
              
              <TextField
                fullWidth
                required
                name="zipcode"
                label="Zipcode"
                value={newAddress.zipcode}
                onChange={handleNewAddressChange}
                error={!!addressFormErrors.zipcode}
                helperText={addressFormErrors.zipcode}
                margin="normal"
                inputProps={{ maxLength: 6 }}
              />
              
              <TextField
                fullWidth
                name="landmark"
                label="Landmark (Optional)"
                value={newAddress.landmark}
                onChange={handleNewAddressChange}
                margin="normal"
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Save Address
              </Button>
            </Box>
          </Box>
        );

      // --- Step 3: Order Confirmation ---
      case 2:
        const selectedAddress = findSelectedAddress();
        console.log('Selected address for confirmation:', selectedAddress);

        if (!product || !selectedAddress) {
          return (
            <Alert severity="error" sx={{ mb: 2 }}>
              {!product ? 'Product details not found.' : 'Please select a delivery address.'}
              <br />
              Please go back and check previous steps.
            </Alert>
          );
        }

        return (
          <>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              p: 2
            }}>
              {/* Left side - Product Details */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom>
                  {product.name || 'Shoes'}
                </Typography>
                
                <Typography sx={{ mt: 2 }}>
                  Quantity: {quantity}
                </Typography>
                
                <Typography sx={{ mt: 1 }}>
                  Category: {product.category || 'Footwear'}
                </Typography>
                
                <Typography sx={{ 
                  mt: 2,
                  fontStyle: 'italic',
                  color: 'text.secondary'
                }}>
                  {product.description}
                </Typography>
                
                <Typography sx={{ 
                  mt: 3,
                  color: 'error.main',
                  fontSize: '1.25rem',
                  fontWeight: 500
                }}>
                  Total Price: ₹ {(product.price * quantity).toFixed(2)}
                </Typography>
              </Box>

              {/* Right side - Address Details */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Address Details:
                </Typography>
                
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {selectedAddress.name}
                </Typography>
                
                <Typography sx={{ mt: 1 }}>
                  Contact Number: {selectedAddress.contactNumber}
                </Typography>
                
                <Typography sx={{ mt: 2 }}>
                  {selectedAddress.street}
                </Typography>
                
                <Typography>
                  {selectedAddress.city}, {selectedAddress.state}
                </Typography>
                
                <Typography>
                  {selectedAddress.zipcode}
                </Typography>
              </Box>
            </Box>
          </>
        );
      default:
        return 'Unknown step';
    }
  };

  // --- Snackbar Close Handler ---
  const handleCloseOrderSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOrderSuccessMessage(''); // Clear message to hide Snackbar
  };

  // --- Main Component Return ---
  const isLoading = isLoadingProduct || (activeStep === 1 && isLoadingAddresses);

  if (isLoadingProduct && !product) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (productError && !product) {
    return <Alert severity="error">{productError}</Alert>;
  }

  if (!product && !isLoadingProduct) {
    return <Alert severity="info">Loading product details...</Alert>;
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Place Order
      </Typography>

      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : getStepContent(activeStep)}
      </Box>

      {/* Show address error above buttons if present */}
      {activeStep === 1 && addressError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            width: '100%'
          }}
        >
          {addressError}
        </Alert>
      )}

      {/* Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: 2,
        mt: 4 
      }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{ 
            minWidth: 100,
            textTransform: 'uppercase'
          }}
          disabled={activeStep === 0 || !!orderSuccessMessage}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={
            (activeStep === 1 && isLoadingAddresses) ||
            (activeStep === 1 && !selectedAddressId && addresses.length > 0) ||
            !!orderSuccessMessage
          }
          sx={{ 
            minWidth: 150,
            bgcolor: '#3f51b5',
            textTransform: 'uppercase',
            '&:hover': {
              bgcolor: '#2c387e'
            }
          }}
        >
          {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
        </Button>
      </Box>

      {/* Add Snackbar for Order Success */}
      <Snackbar
        open={!!orderSuccessMessage}
        autoHideDuration={3000} // Adjust duration as needed
        onClose={handleCloseOrderSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Or desired position
      >
        <Alert
          onClose={handleCloseOrderSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          {orderSuccessMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

CreateOrder.propTypes = {
  userInfo: PropTypes.shape({
    role: PropTypes.string,
    email: PropTypes.string,
    // ... other user info props
  })
};

export default CreateOrder;