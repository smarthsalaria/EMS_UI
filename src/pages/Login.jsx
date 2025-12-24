import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  IconButton,
  CircularProgress,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccountCircle, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import CompanyLogo from '../assets/company-logo.png';
import CompanyBackground from '../assets/company-background.png';

const Login = () => {
  console.debug('[Login] Component loaded');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogin = () => {
    console.debug('[handleLogin] Invoked');
    console.debug(`[handleLogin] Username: ${username}, Password: ${password}`);

    if (!username || !password) {
      console.warn('[handleLogin] Empty credentials');
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setLoading(true);
    console.debug('[handleLogin] Sending request to backend...');

    setTimeout(() => {
      fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => {
          console.debug('[fetch] Response received');
          if (!response.ok) {
            return response.json().then((err) => {
              console.error('[fetch] Login error response:', err);
              throw new Error(err.message || 'Invalid credentials');
            });
          }
          return response.json();
        })
        .then((data) => {
          console.debug('[fetch] Login success:', data);
          setLoading(false);
          if (data.success) {
            console.info('[Login] Login successful. Redirecting to /dashboard/home...');
            login(data.user, data.token);
            navigate('/dashboard/home');
          } else {
            console.warn('[Login] Login failed:', data.message);
            setError(data.message || 'Login failed');
          }
        })
        .catch((err) => {
          console.error('[Login] Error during fetch:', err);
          setLoading(false);
          setError(err.message || 'Something went wrong. Please try again later.');
        });
    }, 1500);
  };

  const handleClickShowPassword = () => {
    const newValue = !showPassword;
    console.debug(`[handleClickShowPassword] Toggling password visibility to: ${newValue}`);
    setShowPassword(newValue);
  };

  return (
    <div
      className="login-background"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #7f56d9, #4c79f3)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${CompanyBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: isMobile ? '20px' : '0',
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        className="login-container"
      >
        <Paper
          elevation={15}
          sx={{
            padding: isMobile ? 3 : 4,
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: '400px',
          }}
          className="login-paper"
        >
          <Box textAlign="center" mb={2}>
            <img
              src={CompanyLogo}
              alt="Company Logo"
              className="login-logo"
              style={{ width: isMobile ? '120px' : '200px', marginBottom: '10px' }}
            />
            <Typography
              variant="h6"
              color="primary"
              fontWeight="bold"
              sx={{ fontFamily: 'Roboto, sans-serif' }}
              className="login-title"
            >
              Energy Management System
            </Typography>
          </Box>

          {/* Username Field */}
          <TextField
            variant="outlined"
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => {
              console.debug(`[onChange] Username updated to: ${e.target.value}`);
              setUsername(e.target.value);
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.6)',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4c79f3',
              },
            }}
            InputProps={{
              startAdornment: <AccountCircle sx={{ color: '#4c79f3', mr: 1 }} />,
            }}
          />

          {/* Password Field */}
          <TextField
            variant="outlined"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => {
              console.debug(`[onChange] Password updated`);
              setPassword(e.target.value);
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.6)',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4c79f3',
              },
            }}
            InputProps={{
              startAdornment: <Lock sx={{ color: '#4c79f3', mr: 1 }} />,
              endAdornment: (
                <IconButton
                  onClick={handleClickShowPassword}
                  edge="end"
                  sx={{ color: '#4c79f3' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />

          {/* Login Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              marginTop: 2,
              padding: '10px 0',
              borderRadius: 25,
              backgroundColor: '#4c79f3',
              fontSize: isMobile ? '0.9rem' : '1rem',
              '&:hover': {
                backgroundColor: '#1E90FF',
              },
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>

          {/* Error Message */}
          {error && (
            <Typography color="error" align="center" mt={2} fontSize={isMobile ? '0.85rem' : '1rem'}>
              {error}
            </Typography>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default Login;
