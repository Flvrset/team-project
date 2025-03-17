import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
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
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { isValidEmail } from '../utils/validation';

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [formErrors, setFormErrors] = useState({
        email: ''
    });

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        // Form validation
        if (email && !isValidEmail(email)) {
            setFormErrors({ email: 'Podano nieprawidłowy adres email' });
            return;
        }

        if (password !== confirmPassword) {
            return; // Already has error message in the UI
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: firstName,
                    surname: lastName,
                    email: email,
                    login: login,
                    password: password,
                }),
            });

            if (response.ok) {
                navigate('/dashboard');
            } else {
                const data = await response.json();
                setError(data.msg || 'Wystąpił błąd podczas rejestracji');
            }
        } catch (err) {
            setError('Wystąpił błąd podczas rejestracji - spróbuj ponownie później');
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
                            Utwórz nowe konto
                        </Typography>
                    </Paper>

                    <CardContent sx={{ p: 4 }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="given-name"
                                        required
                                        fullWidth
                                        id="firstName"
                                        label="Imię"
                                        name="firstName"
                                        autoFocus
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon color="primary" />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="lastName"
                                        label="Nazwisko"
                                        name="lastName"
                                        autoComplete="family-name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon color="primary" />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="login"
                                label="Login"
                                name="login"
                                autoComplete="username"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!formErrors.email}
                                helperText={formErrors.email}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
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
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Potwierdź hasło"
                                type="password"
                                id="confirmPassword"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                                error={password !== confirmPassword && confirmPassword !== ''}
                                helperText={
                                    password !== confirmPassword && confirmPassword !== ''
                                        ? 'Hasła muszą być identyczne'
                                        : ''
                                }
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
                                disabled={loading}
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
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Zarejestruj się'}
                            </Button>

                            <Grid container justifyContent="center" sx={{ mt: 3 }}>
                                <Grid item>
                                    <Divider sx={{ my: 2, width: '100%' }} />
                                    <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                                        Masz już konto?
                                    </Typography>
                                    <Button
                                        component={RouterLink}
                                        to="/login"
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
                                        Zaloguj się
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

export default RegisterPage;