import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    InputAdornment,
    Divider,
    Snackbar,
    Alert,
    Card,
    CardContent,
    useTheme,
    alpha,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import CitySearchSelect from '../components/CitySearchSelect';
import { useAuth } from '../hooks/AuthProvider';

interface UserFormData {
    city: string;
    postal_code: string;
    street: string;
    house_number: string;
    apartment_number: string;
    phone_number: string;
}

const EditDataPage = () => {
    const theme = useTheme();
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const [formData, setFormData] = useState<UserFormData>({
        city: '',
        postal_code: '',
        street: '',
        house_number: '',
        apartment_number: '',
        phone_number: '',
    });

    useEffect(() => {
        // Fetch current user data when component mounts
        const fetchUserData = async () => {
            try {
                // Here you would typically fetch user data from an API endpoint
                // For now, we'll just use what's in auth.userData
                if (auth.userData) {
                    setFormData(prevState => ({
                        ...prevState,
                        ...auth.userData,
                    }));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [auth.userData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCityChange = (updatedModel: { city: string, postal_code: string }) => {
        setFormData(prev => ({
            ...prev,
            city: updatedModel.city,
            postal_code: updatedModel.postal_code,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        try {
            const response = await fetch('/api/edit_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (response.ok) {
                setNotification({
                    open: true,
                    message: 'Dane zostały zaktualizowane pomyślnie!',
                    severity: 'success',
                });
            } else {
                const data = await response.json();
                setNotification({
                    open: true,
                    message: data.msg || 'Wystąpił błąd podczas aktualizacji danych.',
                    severity: 'error',
                });
            }
        } catch (error) {
            setNotification({
                open: true,
                message: 'Wystąpił błąd podczas komunikacji z serwerem.',
                severity: 'error',
            });
            console.error('Error updating user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <Box sx={{ py: 4, px: 2, maxWidth: 900, mx: 'auto' }}>
            <Card
                elevation={4}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    mb: 4,
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                        color: 'white',
                    }}
                >
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Edycja danych osobowych
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                        Zaktualizuj swoje dane kontaktowe i adresowe
                    </Typography>
                </Box>

                <CardContent sx={{ p: 4 }}>
                    <Box
                        sx={{
                            mb: 3,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.light, 0.1),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <SecurityIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Twoje dane są bezpieczne i chronione zgodnie z polityką prywatności.
                            Dane będą wykorzystywane wyłącznie do celów związanych z realizacją usług.
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                            Dane osobowe
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Twoje dane profilu: {auth.userData?.name} {auth.userData?.surname} ({auth.userData?.login})
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                            Dane adresowe
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <CitySearchSelect
                                    model={formData}
                                    onModelChange={handleCityChange}
                                    fieldName="city"
                                    postalCodeFieldName="postal_code"
                                    label="Miasto"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="street"
                                    name="street"
                                    label="Ulica"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <HomeIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="house_number"
                                    name="house_number"
                                    label="Numer domu"
                                    value={formData.house_number}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <HomeIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="apartment_number"
                                    name="apartment_number"
                                    label="Numer mieszkania"
                                    value={formData.apartment_number}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <HomeIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                                    Dane kontaktowe
                                </Typography>
                                <TextField
                                    fullWidth
                                    id="phone_number"
                                    name="phone_number"
                                    label="Numer telefonu"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneIcon color="primary" sx={{ mr: 0.5 }} />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 'medium',
                                                        color: theme.palette.text.secondary
                                                    }}
                                                >
                                                    +48
                                                </Typography>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                startIcon={<SaveIcon />}
                                sx={{
                                    px: 5,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                    },
                                }}
                            >
                                {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EditDataPage;