import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PetsIcon from '@mui/icons-material/Pets';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthProvider';
import { postWithAuth } from '../utils/auth';
import { isValidEmail } from '../utils/validation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: ''
  });
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [auth, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (email && !isValidEmail(email)) {
      setFormErrors({ email: 'Podano nieprawidłowy adres email' });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await postWithAuth('/api/login', JSON.stringify({ email, password }));

      if (response.ok) {
        auth.checkAuthStatus();
      } else {
        const data = await response.json();
        setError(data.msg);
      }
    } catch {
      setError('Wystąpił błąd podczas logowania - spróbuj ponownie później');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #e0f7fa 0%, #f3e5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 16px 70px -12.125px rgba(0,0,0,0.3)'
            }
          }}
        >
          <Paper
            sx={{
              p: 4,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <PetsIcon sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              PetBuddies
            </Typography>
            <Typography variant="subtitle1">
              Zaloguj się, aby kontynuować
            </Typography>
          </Paper>

          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
                error={!!formErrors.email}
                helperText={formErrors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Hasło"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  mb: 2,
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px 0 rgba(76, 175, 80, 0.6)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color='inherit' /> : 'Zaloguj się'}
              </Button>

              <Grid container justifyContent="center" sx={{ mt: 3 }}>
                <Grid item>
                  <Divider sx={{ my: 2, width: '100%' }} />
                  <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                    Nie masz jeszcze konta?
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/register"
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(76, 175, 80, 0.08)',
                      }
                    }}
                  >
                    Zarejestruj się
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/"
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: 'primary.main'
                    }
                  }}
                >
                  Powrót do strony głównej
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;