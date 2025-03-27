import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PetsIcon from '@mui/icons-material/Pets';
import SearchIcon from '@mui/icons-material/Search';
import StraightenIcon from '@mui/icons-material/Straighten';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActionArea,
    Grid,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    Chip,
    useTheme,
    alpha,
    Stack,
    InputAdornment,
    Snackbar
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import CitySearchSelect from '../components/CitySearchSelect';
import { getWithAuth } from '../utils/auth';
import { formatTimeWithoutSeconds } from '../utils/utils';
import { validateNumber } from '../utils/validation';

interface SearchModel {
    city: string;
    postal_code: string;
    kms: number;
}

interface Post {
    post_id: number;
    user_id: number;
    city: string;
    postal_code: string;
    name: string;
    surname: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    cost: number;
    pet_count: number;
}

const SearchPostsPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchModel, setSearchModel] = useState<SearchModel>({
        city: searchParams.get('city') || '',
        postal_code: searchParams.get('postal_code') || '',
        kms: parseInt(searchParams.get('kilometers') || '0') || 0
    });

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [kilometersError, setKilometersError] = useState<string | null>(null);
    const [cityError, setCityError] = useState<string | null>(null);
    
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'error' as 'success' | 'error',
    });

    useEffect(() => {
        if (searchParams.has('city') && searchParams.has('postal_code')) {
            fetchPosts();
        } else {
            fetchUserData();
        }
    }, []);

    const handleModelChange = (updatedModel: SearchModel) => {
        if (updatedModel.city && updatedModel.postal_code) {
            setCityError(null);
        }
        setSearchModel(updatedModel);
    };

    const fetchUserData = async () => {
        try {
            const response = await getWithAuth('/api/edit_user');
            
            if (response.ok) {
                const userData = await response.json();
                
                if (userData.city && userData.postal_code) {
                    setSearchModel(prev => ({
                        ...prev,
                        city: userData.city,
                        postal_code: userData.postal_code,
                        kms: prev.kms || 0
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleKilometersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '') {
            setKilometersError(null);
            setSearchModel({
                ...searchModel,
                kms: 0
            });
            return;
        }

        const isNotValid = validateNumber(value, 'Odległość');
        if (isNotValid) {
            setKilometersError(isNotValid);
            return;
        }

        const numValue = parseInt(value);

        if (numValue > 100) {
            setKilometersError('Maksymalna odległość to 100 km');
            return;
        }

        setKilometersError(null);
        setCityError(null);
        setSearchModel({
            ...searchModel,
            kms: numValue
        });
    };

    const fetchPosts = async () => {
        if (!searchModel.city || !searchModel.postal_code) {
            setCityError('Proszę najpierw wybrać miasto');
            return;
        }

        if (searchModel.kms < 0) {
            setKilometersError('Odległość nie może być mniejsza niż 0');
            return;
        }

        if (kilometersError) {
            return;
        }

        setLoading(true);

        try {
            const queryParams = new URLSearchParams({
                city: searchModel.city,
                postal_code: searchModel.postal_code,
                kilometers: searchModel.kms.toString()
            });

            setSearchParams(queryParams);

            const response = await getWithAuth(`/api/getDashboardPost?${queryParams}`);

            if (!response.ok) {
                throw new Error('Nie udało się pobrać ogłoszeń');
            }

            const data = await response.json();
            setPosts(data);
            
        } catch (err) {
            setNotification({
                open: true,
                message: 'Nie udało się pobrać ogłoszeń. Spróbuj ponownie.',
                severity: 'error'
            });
            console.error('Błąd podczas pobierania ogłoszeń:', err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchPosts();
    };

    const handleCardClick = (postId: number) => {
        navigate(`/dashboard/post/${postId}`);
    };
    
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const inputStyle = {
        '& .MuiInputBase-root': {
            borderRadius: '18px',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            '& fieldset': {
                borderWidth: '2px',
                transition: theme.transitions.create(['border-color', 'box-shadow']),
            },
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
                borderWidth: '2px',
            }
        },
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                    color: 'white',
                }}
            >
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Wyszukaj ogłoszenia
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                    Znajdź zwierzaki, którymi możesz się zaopiekować
                </Typography>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<ArrowBackIcon />}
                    component={Link}
                    to='/dashboard'
                    sx={{
                        borderRadius: '18px',
                        py: 1,
                        px: 2.5,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        },
                    }}
                >
                    Powrót
                </Button>
            </Box>

            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    borderRadius: '24px',
                    mb: 4,
                    background: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)'
                }}
            >
                <Grid container spacing={3} alignItems="flex-start">
                    <Grid item xs={12} md={9}>
                        <Box sx={inputStyle}>
                            <CitySearchSelect
                                model={searchModel}
                                onModelChange={handleModelChange}
                                label="Miasto"
                                placeholder="Wpisz nazwę miasta (min. 3 znaki)"
                                error={cityError ?? ''}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Odległość"
                            type="tel"
                            value={searchModel.kms}
                            onChange={handleKilometersChange}
                            error={Boolean(kilometersError)}
                            helperText={kilometersError}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <StraightenIcon color="primary" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        km
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: '18px',
                                    '&.MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderWidth: '2px',
                                            transition: theme.transitions.create(['border-color', 'box-shadow']),
                                        },
                                        '&:hover fieldset': {
                                            borderColor: theme.palette.primary.main,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderWidth: '2px',
                                        },
                                    }
                                }
                            }}
                            sx={{
                                ...inputStyle,
                                '& .MuiInputBase-input': {
                                    pr: 2
                                }
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={handleSearch}
                            startIcon={<SearchIcon />}
                            sx={{
                                px: 5,
                                py: 1.5,
                                borderRadius: '24px',
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                boxShadow: '0 8px 20px 0 rgba(0, 0, 0, 0.2)',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 10px 25px 0 rgba(0, 0, 0, 0.25)',
                                }
                            }}
                        >
                            Szukaj zwierzaków
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <>
                    {searchParams.has('city') && (
                        <Box sx={{ mb: 4 }}>
                            {posts.length > 0 ? (
                                <Typography variant="h5" component="h3" gutterBottom>
                                    Znaleziono {posts.length} {posts.length === 1 ? 'ogłoszenie' :
                                        posts.length < 5 ? 'ogłoszenia' : 'ogłoszeń'}
                                </Typography>
                            ) : (
                                <Paper
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        borderRadius: '24px',
                                        backgroundColor: alpha(theme.palette.background.paper, 0.7)
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Nie znaleziono ogłoszeń
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Spróbuj zmienić parametry wyszukiwania lub zwiększyć promień
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    )}

                    {posts.length > 0 && (
                        <Grid container spacing={3}>
                            {posts.map((post) => (
                                <Grid item xs={12} sm={6} md={4} key={post.post_id}>
                                    <Card
                                        elevation={2}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: '20px',
                                            transition: 'all 0.3s ease',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                transform: 'translateY(-6px)',
                                                boxShadow: 6
                                            }
                                        }}
                                    >
                                        <CardActionArea
                                            onClick={() => handleCardClick(post.post_id)}
                                            sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                                        >
                                            <Box
                                                sx={{
                                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                    p: 2,
                                                    pb: 1
                                                }}
                                            >
                                                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                                                    {post.name} {post.surname}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LocationOnIcon color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {post.city}, {post.postal_code}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                                <Stack spacing={2}>
                                                    <Stack spacing={1.5}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <CalendarTodayIcon color="action" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                                            <Typography variant="body2">
                                                                {post.start_date} do {post.end_date}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <AccessTimeIcon color="action" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                                            <Typography variant="body2">
                                                                {formatTimeWithoutSeconds(post.start_time)} - {formatTimeWithoutSeconds(post.end_time)}
                                                            </Typography>
                                                        </Box>
                                                        <Divider sx={{ my: 1 }} />
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <PetsIcon color="action" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                                            <Typography variant="body2">
                                                                Liczba zwierząt: {post.pet_count}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <MonetizationOnIcon color="action" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {post.cost} PLN/h
                                                            </Typography>
                                                        </Box>
                                                    </Stack>

                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Chip
                                                            label="Zobacz szczegóły"
                                                            color="primary"
                                                            size="small"
                                                            sx={{ fontWeight: 500, borderRadius: '16px' }}
                                                        />
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}
            
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

export default SearchPostsPage;