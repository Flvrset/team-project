import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import PetsIcon from '@mui/icons-material/Pets';
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
    Card,
    CardContent,
    useTheme,
    alpha,
    CircularProgress,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import CitySearchSelect from '../../components/CitySearchSelect';
import { useAuth } from '../../contexts/AuthProvider';
import { useNotification } from '../../contexts/NotificationContext';
import { getWithAuth, putWithAuth } from '../../utils/auth';
import { validateChain, validateMaxLength, validateNumber, validatePhoneNumber } from '../../utils/validation';

interface UserFormData {
    city: string;
    postal_code: string;
    street: string;
    house_number: string;
    apartment_number: string;
    phone_number: string;
    photo_deleted?: boolean;
    description?: string;
}

interface FormErrors {
    street?: string;
    house_number?: string;
    apartment_number?: string;
    phone_number?: string;
    photo?: string;
    description?: string;
}

const EditDataPage = () => {
    const theme = useTheme();
    const auth = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState<FormErrors>({});
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<UserFormData>({
        city: '',
        postal_code: '',
        street: '',
        house_number: '',
        apartment_number: '',
        phone_number: '',
        description: '',
    });

    const setPhotoDeleted = (value: boolean) => {
        setFormData(prev => ({ ...prev, photo_deleted: value }));
    }

    useEffect(() => {
        const fetchUserData = async () => {
            setLoadingData(true);
            try {
                const response = await getWithAuth('/api/edit_user');

                if (response.ok) {
                    const userData = await response.json();
                    setFormData({
                        city: userData.city || '',
                        postal_code: userData.postal_code || '',
                        street: userData.street || '',
                        house_number: userData.house_number || '',
                        apartment_number: userData.apartment_number || '',
                        phone_number: userData.phone_number || '',
                        description: userData.description || '',
                    });

                    if (userData.file_link) {
                        setPhotoPreview(userData.file_link);
                    }
                } else {
                    console.error('Failed to fetch user data');
                    showNotification('Nie udało się pobrać danych użytkownika', 'error');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                showNotification('Wystąpił błąd podczas pobierania danych', 'error');
            } finally {
                setLoadingData(false);
            }
        };

        fetchUserData();
    }, [showNotification]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024 * 2) {
            setErrors(prev => ({
                ...prev,
                photo: 'Zdjęcie musi być mniejsze niż 2MB'
            }));
            return;
        }

        setErrors(prev => ({
            ...prev,
            photo: undefined
        }));

        setPhotoFile(file);
        setPhotoDeleted(false);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview('');
        setPhotoDeleted(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        const newErrors = { ...errors };

        if (name === 'phone_number') {
            newErrors.phone_number = validatePhoneNumber(value);
        } else if (name === 'street') {
            newErrors.street = validateMaxLength(value, 'Ulica', 100);
        } else if (name === 'house_number') {
            newErrors.house_number = validateMaxLength(value, 'Numer domu', 10);
        } else if (name === 'apartment_number') {
            if (value.trim() === '') {
                newErrors.apartment_number = undefined;
            } else {
                newErrors.apartment_number = validateChain(validateMaxLength(value, 'Numer mieszkania', 10), validateNumber(value, 'Numer mieszkania'));
            }
        } else if (name === 'description') {
            newErrors.description = validateMaxLength(value || '', 'Opis', 500);
        }
        setErrors(newErrors);
    };

    const handleCityChange = (updatedModel: { city: string, postal_code: string }) => {
        setFormData(prev => ({
            ...prev,
            city: updatedModel.city,
            postal_code: updatedModel.postal_code,
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        newErrors.phone_number = validatePhoneNumber(formData.phone_number);
        newErrors.street = validateMaxLength(formData.street, 'Ulica', 100);
        newErrors.house_number = validateMaxLength(formData.house_number, 'Numer domu', 10);

        if (formData.apartment_number.trim() !== '') {
            newErrors.apartment_number = validateChain(validateMaxLength(formData.apartment_number, 'Numer mieszkania', 10), validateNumber(formData.apartment_number, 'Numer mieszkania'));
        }

        newErrors.description = validateMaxLength(formData.description || '', 'Opis', 500);
        setErrors(newErrors);

        return !Object.values(newErrors).some(error => error !== undefined);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showNotification('Formularz zawiera błędy. Sprawdź dane i spróbuj ponownie.', 'error');
            return;
        }

        setLoading(true);
        try {
            const formDataToSend = new FormData();

            formDataToSend.append('json', JSON.stringify(formData));

            if (photoFile) {
                formDataToSend.append('photo', photoFile);
            }

            const response = await putWithAuth('/api/edit_user', formDataToSend);

            if (response.ok) {
                showNotification('Dane zostały zaktualizowane pomyślnie!', 'success');
            } else {
                const data = await response.json();
                showNotification(data.msg || 'Wystąpił błąd podczas aktualizacji danych.', 'error');
            }
        } catch (error) {
            showNotification('Wystąpił błąd podczas komunikacji z serwerem.', 'error');
            console.error('Error updating user data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 }, maxWidth: 900, mx: 'auto' }}>
            <Card
                elevation={4}
                sx={{
                    borderRadius: { xs: 2, sm: 4 },
                    overflow: 'hidden',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    mb: { xs: 2, sm: 4 },
                }}
            >
                <Box
                    sx={{
                        p: { xs: 2, sm: 3 },
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

                <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
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

                    {loadingData ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>

                    ) : (
                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                                Dane osobowe
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Twoje dane profilu: {auth.userData?.name} {auth.userData?.surname} ({auth.userData?.login})
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 3,
                                mt: 2
                            }}>
                                <Typography
                                    variant="subtitle1"
                                    color="text.secondary"
                                    align="center"
                                    sx={{ mb: 2 }}
                                >
                                    Zdjęcie profilowe
                                </Typography>

                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: 150,
                                        height: 150,
                                        mb: 1
                                    }}
                                >
                                    {photoPreview ? (
                                        <Box
                                            component="img"
                                            src={photoPreview}
                                            alt="Zdjęcie profilowe"
                                            onError={() => {
                                                setPhotoPreview('');
                                            }}
                                            sx={{
                                                width: 150,
                                                height: 150,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: `3px solid ${theme.palette.primary.main}`,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                                }
                                            }}
                                            onClick={handlePhotoClick}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: 150,
                                                height: 150,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: alpha(theme.palette.primary.light, 0.1),
                                                border: `2px dashed ${theme.palette.primary.main}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.light, 0.2),
                                                    transform: 'scale(1.05)',
                                                }
                                            }}
                                            onClick={handlePhotoClick}
                                        >
                                            <AccountCircleIcon
                                                sx={{
                                                    fontSize: 80,
                                                    color: theme.palette.primary.main,
                                                    opacity: 0.7
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handlePhotoChange}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handlePhotoClick}
                                        startIcon={<AddAPhotoIcon />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {photoPreview ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'}
                                    </Button>

                                    {photoPreview && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            onClick={handleRemovePhoto}
                                            startIcon={<DeleteIcon />}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Usuń
                                        </Button>
                                    )}
                                </Box>

                                {errors.photo && (
                                    <Typography
                                        variant="caption"
                                        color="error"
                                        sx={{ mt: 1 }}
                                    >
                                        {errors.photo}
                                    </Typography>
                                )}

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 1, textAlign: 'center' }}
                                >
                                    Dodaj zdjęcie profilowe (maks. 2MB)
                                </Typography>
                            </Box>

                            <Divider sx={{ my: { xs: 2, sm: 3 } }} />

                            <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: { xs: 1, sm: 2 } }}>
                                Dane adresowe
                            </Typography>

                            <Grid container spacing={{ xs: 2, sm: 3 }}>
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
                                        error={!!errors.street}
                                        helperText={errors.street}
                                        slotProps={{
                                            htmlInput: { maxLength: 100 },
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <HomeIcon color="primary" />
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
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="house_number"
                                        name="house_number"
                                        label="Numer domu"
                                        value={formData.house_number}
                                        onChange={handleInputChange}
                                        error={!!errors.house_number}
                                        helperText={errors.house_number}
                                        slotProps={{
                                            htmlInput: { maxLength: 10 },
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <HomeIcon color="primary" />
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
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="apartment_number"
                                        name="apartment_number"
                                        label="Numer mieszkania (opcjonalnie)"
                                        value={formData.apartment_number}
                                        onChange={handleInputChange}
                                        error={!!errors.apartment_number}
                                        helperText={errors.apartment_number}
                                        slotProps={{
                                            htmlInput: { maxLength: 10 },
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <HomeIcon color="primary" />
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
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: { xs: 1, sm: 2 } }} />
                                    <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: { xs: 1, sm: 2 } }}>
                                        Dane kontaktowe
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        id="phone_number"
                                        name="phone_number"
                                        label="Numer telefonu"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                        error={!!errors.phone_number}
                                        helperText={errors.phone_number || "Wprowadź 9 cyfr bez kierunkowego"}
                                        slotProps={{
                                            htmlInput: { maxLength: 9 },
                                            input: {
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
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: { xs: 1, sm: 2 } }} />
                                    <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: { xs: 1, sm: 2 } }}>
                                        O tobie
                                    </Typography>
                                    <Box
                                        sx={{
                                            p: { xs: 1.5, sm: 2 },
                                            mb: { xs: 1, sm: 2 },
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.info.light, 0.1),
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Dodaj krótki opis swojego profilu. Może on być widoczny dla innych użytkowników aplikacji.
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        id="description"
                                        name="description"
                                        label="Opis profilu (opcjonalny)"
                                        value={formData.description || ''}
                                        onChange={handleInputChange}
                                        error={!!errors.description}
                                        helperText={errors.description || "Możesz dodać krótki opis o sobie (maksymalnie 500 znaków)"}
                                        multiline
                                        rows={4}
                                        slotProps={{
                                            htmlInput: { maxLength: 500 },
                                            input: { sx: { borderRadius: 2 } }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {(formData.description?.length || 0)}/500
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Box sx={{
                                mt: { xs: 2, sm: 4 },
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: { xs: 1, sm: 2 }
                            }}>
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
                                        width: { xs: '100%', sm: 'auto' },
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
                                <Button
                                    variant="outlined"
                                    size="large"
                                    component={Link}
                                    to='/dashboard/pets'
                                    startIcon={<PetsIcon />}
                                    sx={{
                                        px: 5,
                                        py: 1.5,
                                        borderRadius: 3,
                                        width: { xs: '100%', sm: 'auto' },
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                        },
                                    }}
                                >
                                    Twoje zwierzaki
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    component={Link}
                                    to='/dashboard'
                                    startIcon={<ArrowBackIcon />}
                                    color="secondary"
                                    sx={{
                                        px: 5,
                                        py: 1.5,
                                        borderRadius: 3,
                                        width: { xs: '100%', sm: 'auto' },
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                        },
                                    }}
                                >
                                    Powrót do panelu
                                </Button>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default EditDataPage;