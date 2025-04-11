import React from 'react';
import PropTypes from 'prop-types';
import { Link /*, useNavigate */ } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  InputBase,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

// Styled components with enhanced styling
const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 5),
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  [theme.breakpoints.up('sm')]: {
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.common.white, 0.8),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'white',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
    },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'white',
  marginLeft: theme.spacing(1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
}));

function Navbar({ searchKeyword, setSearchKeyword, user, onLogout }) {
  // const navigate = useNavigate(); // Remove if not needed elsewhere

  const handleSearch = (event) => {
    setSearchKeyword(event.target.value);
  };

  // Renamed handler to avoid conflict and call the prop
  const handleLogoutClick = () => {
    if (setSearchKeyword) { // Check if setSearchKeyword exists before calling
       setSearchKeyword(''); // Clear search input
    }
    onLogout(); // Call the function passed from App.js
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
      <StyledToolbar>
        {/* Left Section */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <ShoppingCartIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={Link}
            to={user?.isLoggedIn ? '/products' : '/'}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 600,
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
            }}
          >
            upGrad E-Shop
          </Typography>
        </Box>

        {/* Center Section - Search (conditionally rendered) */}
        {user?.isLoggedIn && setSearchKeyword && (
           <Box sx={{ 
             flex: { xs: 2, sm: 3, md: 4 },
             display: 'flex', 
             justifyContent: 'center',
             px: 2,
           }}>
            <Search sx={{ width: '100%', maxWidth: '400px' }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                value={searchKeyword || ''}
                onChange={handleSearch}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
           </Box>
        )}
        {/* Spacer if logged out or no search */}
         {(!user?.isLoggedIn || !setSearchKeyword) && (
           <Box sx={{ flex: { xs: 2, sm: 3, md: 4 }, px: 2 }} />
         )}

        {/* Right Section */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: { xs: 0.5, sm: 1 }
        }}>
          {user?.isLoggedIn ? (
            <>
              <NavButton
                component={Link}
                to="/products"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Home
              </NavButton>

              {user.role === 'ADMIN' && (
                <NavButton
                  component={Link}
                  to="/add-product"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Add Product
                </NavButton>
              )}

              <NavButton
                onClick={handleLogoutClick}
                sx={{
                  backgroundColor: '#ff1493',
                  border: '1px solid #ff1493',
                  '&:hover': {
                    backgroundColor: '#c71585',
                    border: '1px solid #c71585',
                  },
                  whiteSpace: 'nowrap',
                }}
              >
                Logout
              </NavButton>
            </>
          ) : (
            <>
              <NavButton
                component={Link}
                to="/login"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Login
              </NavButton>
              <NavButton
                component={Link}
                to="/signup"
                sx={{
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    border: '1px solid rgba(255,255,255,0.5)',
                    backgroundColor: alpha('#fff', 0.1),
                  },
                  whiteSpace: 'nowrap',
                }}
              >
                Sign Up
              </NavButton>
            </>
          )}
        </Box>
      </StyledToolbar>
    </AppBar>
  );
}

Navbar.propTypes = {
  searchKeyword: PropTypes.string,
  setSearchKeyword: PropTypes.func,
  user: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
    role: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default Navbar; 