import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { AuthContext } from './context/AuthContext';
import SignIn   from './pages/SignIn';
import SignUp   from './pages/SignUp';
import Home     from './pages/Home';
import Diagnose from './pages/Diagnose';
import About    from './pages/About';
import Records  from './pages/Records';
import Result   from './pages/Result';
import ribbon from './assets/ribbon.png'; // adjust path as needed
import breava from './assets/breava.png'; // adjust path as needed


function Layout() {
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = ['/signin', '/signup'].includes(location.pathname);

  return (
    <>
      {!isAuthPage && (
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
  {/* Logo Image */}
  <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: 2 }}>
  <img src={ribbon} alt="Breava Logo" style={{ height: '60px', marginRight: '0px' }} />
  <img src={breava} alt="Breava Logo" style={{ height: '40px', marginLeft: '0px' }} />
  </Box>

  {/* Brand Name */}
  <Typography
    variant="h6"
    component={Link}
    to="/"
    sx={{
      textDecoration: 'none',
      color: 'inherit',
      flexGrow: 1
    }}
  >

  </Typography>

            {/* Welcome: made larger and bolder */}
            {isLoggedIn && (
              <Typography
                variant="subtitle1"
                sx={{
                  mr: 3,
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  whiteSpace: 'nowrap'
                }}
              >
                Welcome, {user.name}!
              </Typography>
            )}

            {/* Nav links: all size large now */}
            <Button
              component={Link}
              to="/diagnose"
              color="primary"
              size="large"
              sx={{ mx: 1 }}
            >
              Diagnose
            </Button>
            <Button
              component={Link}
              to="/about"
              size="large"
              sx={{ mx: 1 }}
            >
              About
            </Button>
            <Button
              component={Link}
              to="/records"
              size="large"
              sx={{ mx: 1 }}
            >
              Records
            </Button>

            {isLoggedIn ? (
              <Button
                onClick={logout}
                size="large"
                sx={{ mx: 1 }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/signin"
                  size="large"
                  sx={{ mx: 1 }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  size="large"
                  sx={{ mx: 1 }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      )}

      <Box component="main">
        <Routes>
          {/* Public */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected */}
          <Route path="/"        element={<ProtectedRoute element={Home} />} />
          <Route path="/diagnose"element={<ProtectedRoute element={Diagnose} />} />
          <Route path="/about"   element={<ProtectedRoute element={About} />} />
          <Route path="/records" element={<ProtectedRoute element={Records} />} />
          <Route path="/result"  element={<ProtectedRoute element={Result} />} />
        </Routes>
      </Box>
    </>
  );
}

function ProtectedRoute({ element: Element }) {
  const { isLoggedIn, loading } = useContext(AuthContext);
  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Loading...</Typography>;
  return isLoggedIn ? <Element /> : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}