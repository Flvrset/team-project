import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import PetsIcon from '@mui/icons-material/Pets';
import {
    Box,
    Typography,
    Grid,
    Paper,
    useTheme,
    alpha,
    Button,
    Card,
    CardContent,
    Badge,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthProvider';
import { getWithAuth } from '../utils/auth';

const DashboardPage = () => {
    const auth = useAuth();
    const theme = useTheme();
    const [applicationCount, setApplicationCount] = useState(0);

    useEffect(() => {
        const fetchApplicationCount = async () => {
            try {
                const response = await getWithAuth('/api/getApplicationsCount');
                const data = await response.json();
                setApplicationCount(data.active_applications_cnt);
            } catch (error) {
                console.error('Error fetching application count:', error);
            }
        };

        fetchApplicationCount();
    }, []);

    return (
        <>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 2
                    }}
                >
                    Witaj w PetBuddies, {auth.userData?.name}!
                </Typography>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ maxWidth: 600, mx: 'auto' }}
                >
                    Co chcesz dziś zrobić?
                </Typography>
            </Box>

            <Grid
                container
                spacing={4}
                justifyContent="center"
                sx={{ mt: 2 }}
            >
                {/* Create Post Button Card */}
                <Grid item xs={12} md={6}>
                    <Paper
                        component={Link}
                        to='/dashboard/create-post'
                        sx={{
                            p: 5,
                            height: '100%',
                            borderRadius: 4,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            textDecorationLine: 'none',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -100,
                                right: -100,
                                width: 200,
                                height: 200,
                                borderRadius: '50%',
                                backgroundColor: alpha('#fff', 0.1),
                            }
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -20,
                                left: -20,
                                opacity: 0.1,
                                transform: 'rotate(-15deg)',
                            }}
                        >
                            <PetsIcon sx={{ fontSize: 120 }} />
                        </Box>

                        <AddCircleOutlineIcon sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Dodaj ogłoszenie
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, textAlign: 'center', mb: 3 }}>
                            Stwórz nowe ogłoszenie dla swojego pupila
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            sx={{
                                mt: 2,
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                '&:hover': {
                                    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                                }
                            }}
                        >
                            Stwórz ogłoszenie
                        </Button>
                    </Paper>
                </Grid>

                {/* Search Posts Button Card */}
                <Grid item xs={12} md={6}>
                    <Paper
                        component={Link}
                        to='/dashboard/search-posts'
                        sx={{
                            p: 5,
                            height: '100%',
                            borderRadius: 4,
                            background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            textDecorationLine: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.4)}`,
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -100,
                                right: -100,
                                width: 200,
                                height: 200,
                                borderRadius: '50%',
                                backgroundColor: alpha('#fff', 0.1),
                            }
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -20,
                                left: -20,
                                opacity: 0.1,
                                transform: 'rotate(-15deg)',
                            }}
                        >
                            <PetsIcon sx={{ fontSize: 120 }} />
                        </Box>

                        <LocationSearchingIcon sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Szukaj ogłoszeń
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, textAlign: 'center', mb: 3 }}>
                            Znajdź ogłoszenia w Twojej okolicy
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{
                                mt: 2,
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                backgroundColor: '#fff',
                                color: theme.palette.secondary.main,
                                '&:hover': {
                                    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                                    backgroundColor: '#fff',
                                }
                            }}
                        >
                            Wyszukaj
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Action cards section */}
            <Typography
                variant="h6"
                sx={{
                    mt: 6,
                    mb: 3,
                    fontWeight: 500,
                    textAlign: 'center',
                    color: 'text.secondary'
                }}
            >
                Zarządzaj swoimi aktywnościami
            </Typography>

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                justifyContent: 'center',
                mb: 4
            }}>
                {/* My Posts Card */}
                <Card
                    sx={{
                        width: { xs: '100%', sm: 'calc(50% - 12px)', md: 340 },
                        borderRadius: 3,
                        overflow: 'hidden',
                        backgroundColor: alpha(theme.palette.warning.light, 0.1),
                        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        '&:hover': {
                            boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                            transform: 'translateY(-4px)',
                            borderColor: alpha(theme.palette.warning.main, 0.5),
                        },
                        textDecorationLine: 'none',
                    }}
                    component={Link}
                    to='/dashboard/my-posts'
                >
                    <CardContent sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2.5,
                        '&:last-child': { pb: 2.5 }
                    }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 48,
                                width: 48,
                                borderRadius: '50%',
                                backgroundColor: alpha(theme.palette.warning.main, 0.15),
                                mr: 2.5
                            }}
                        >
                            <Badge
                                badgeContent={applicationCount}
                                color="error"
                                invisible={applicationCount === 0}
                                sx={{ '.MuiBadge-badge': { fontWeight: 'bold' } }}
                            >
                                <ListAltIcon sx={{
                                    fontSize: 24,
                                    color: theme.palette.warning.dark
                                }} />
                            </Badge>
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="600" color="text.primary">
                                Twoje ogłoszenia
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {applicationCount > 0
                                    ? `Masz ${applicationCount} ${applicationCount === 1 ? 'nowe zgłoszenie' : 'nowych zgłoszeń'}`
                                    : 'Zarządzaj swoimi ogłoszeniami'}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* My Applications Card */}
                <Card
                    sx={{
                        width: { xs: '100%', sm: 'calc(50% - 12px)', md: 340 },
                        borderRadius: 3,
                        overflow: 'hidden',
                        backgroundColor: alpha(theme.palette.info.light, 0.1),
                        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        '&:hover': {
                            boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                            transform: 'translateY(-4px)',
                            borderColor: alpha(theme.palette.info.main, 0.5),
                        },
                        textDecorationLine: 'none',
                    }}
                    component={Link}
                    to='/dashboard/my-applications'
                >
                    <CardContent sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2.5,
                        '&:last-child': { pb: 2.5 }
                    }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 48,
                                width: 48,
                                borderRadius: '50%',
                                backgroundColor: alpha(theme.palette.info.main, 0.15),
                                mr: 2.5
                            }}
                        >
                            <AssignmentIcon sx={{
                                fontSize: 24,
                                color: theme.palette.info.dark
                            }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="600" color="text.primary">
                                Twoje zgłoszenia
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sprawdź status swoich zgłoszeń
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Pet registration card */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 2,
                    mb: 2
                }}
            >
                <Card
                    sx={{
                        maxWidth: 450,
                        borderRadius: 3,
                        overflow: 'hidden',
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        boxShadow: '0 6px 20px rgba(0,0,0,0.09)',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        '&:hover': {
                            boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                            transform: 'translateY(-4px)',
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                        },
                        textDecorationLine: 'none',
                    }}
                    component={Link}
                    to='/dashboard/pets'
                >
                    <CardContent sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2.5,
                        '&:last-child': { pb: 2.5 }
                    }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 48,
                                width: 48,
                                borderRadius: '50%',
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                mr: 2.5
                            }}
                        >
                            <PetsIcon sx={{
                                fontSize: 24,
                                color: theme.palette.primary.main
                            }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="600" color="text.primary">
                                Dodaj swojego pupila
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Zarejestruj swoje zwierzę, aby korzystać ze wszystkich funkcji aplikacji
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
};

export default DashboardPage;