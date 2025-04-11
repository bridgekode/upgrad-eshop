import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from '../Navbar/Navbar';
import Login from '../Login/Login';
import Signup from '../Signup/Signup';
import Products from '../Products/Products';
import ProductDetails from '../ProductDetails/ProductDetails';
import ProductsLayout from '../Products/ProductsLayout';
import CreateOrder from '../CreateOrder/CreateOrder';
import ModifyProduct from '../ModifyProduct/ModifyProduct';
import AddProduct from '../AddProduct/AddProduct';
import AdminRoute from '../AdminRoute/AdminRoute';
import './App.css';

function App() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [userInfo, setUserInfo] = useState(() => {
      try {
          const storedUserInfo = localStorage.getItem('userInfo');
          return storedUserInfo ? JSON.parse(storedUserInfo) : null;
      } catch (e) {
          console.error("Failed to parse userInfo from localStorage", e);
          return null;
      }
  });

  const user = useMemo(() => {
    if (!userInfo || !userInfo.roles || !Array.isArray(userInfo.roles)) {
        return { isLoggedIn: !!authToken };
    }
    return {
      isLoggedIn: !!authToken,
      role: userInfo.roles.includes('ADMIN') ? 'ADMIN' : 'USER',
      ...userInfo
    };
  }, [authToken, userInfo]);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setAuthToken(token);
    setUserInfo(userData);
  };

  const handleLogout = () => {
    console.log("Logging out and refreshing...");
    setAuthToken(null);
    setUserInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.reload();
  };

  return (
    <div className="App">
      <Navbar 
        searchKeyword={searchKeyword} 
        setSearchKeyword={setSearchKeyword}
        user={user}
        onLogout={handleLogout}
      />
      <Container>
        <Routes>
          <Route 
            path="/" 
            element={
              user?.isLoggedIn ? (
                <Navigate to="/products" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route path="/products" element={<ProductsLayout />}>
            <Route index element={<Products 
              searchKeyword={searchKeyword}
              user={user}
            />} />
            <Route path=":id" element={<ProductDetails />} />
          </Route>

          <Route 
            path="/login" 
            element={
              user?.isLoggedIn ? <Navigate to="/products" replace /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={user?.isLoggedIn ? <Navigate to="/products" replace /> : <Signup />}
          />
          
          <Route 
            path="/add-product" 
            element={
              <AdminRoute user={user}>
                <AddProduct />
              </AdminRoute>
            } 
          />
          <Route 
            path="/products/modify/:id" 
            element={
              <AdminRoute user={user}>
                <ModifyProduct />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/create-order" 
            element={ user?.isLoggedIn ? <CreateOrder userInfo={userInfo}/> : <Navigate to="/login" replace /> }
          />
          
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Container>
    </div>
  );
}

export default App; 