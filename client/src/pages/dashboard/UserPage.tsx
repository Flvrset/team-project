import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import StarIcon from '@mui/icons-material/Star';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Avatar,
    Divider,
    Rating,
    Skeleton,
    alpha,
    useTheme,
    Container,
    Paper,
    Chip,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PetCard from '../../components/PetCard';
import ReportUserModal from '../../components/ReportUserModal';
import { useNotification } from '../../contexts/NotificationContext';
import { User, Pet, IRating } from '../../types';
import { getWithAuth } from '../../utils/auth';

interface UserResponse {
    user: User;
    pets: Pet[];
    ratings: IRating[];
}

const UserPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const [userDetails, setUserDetails] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const { showNotification } = useNotification();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleReportUser = () => {
        handleMenuClose();
        setReportModalOpen(true);
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            try {
                const response = await getWithAuth(`/api/user/${userId}`);

                if (response.ok) {
                    const data = await response.json();
                    setUserDetails(data);
                } else {
                    const error = await response.json();
                    showNotification(error.msg || 'Nie udało się pobrać danych użytkownika', 'error');
                    setUserDetails(null);
                }
            } catch {
                showNotification('Wystąpił błąd podczas ładowania danych użytkownika', 'error');
                setUserDetails(null);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId, showNotification]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, md: 4 },
                        borderRadius: 3,
                        mb: 4
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Skeleton variant="circular" width={100} height={100} sx={{ mr: 3 }} />
                        <Box sx={{ width: '100%' }}>
                            <Skeleton variant="text" height={60} width="60%" />
                            <Skeleton variant="text" height={30} width="40%" />
                        </Box>
                    </Box>
                    <Divider sx={{ my: 3 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rectangular" height={150} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rectangular" height={150} />
                        </Grid>
                    </Grid>
                </Paper>

                <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" height={60} width="40%" />
                </Box>

                <Grid container spacing={3}>
                    {[1, 2, 3].map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item}>
                            <Skeleton variant="rectangular" height={300} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    if (!userDetails) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.error.light, 0.1)
                    }}
                >
                    <Typography variant="h5" color="error">
                        Nie znaleziono użytkownika
                    </Typography>
                </Paper>
            </Container>
        );
    }

    const { user, pets, ratings } = userDetails;

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            <Card
                elevation={4}
                sx={{
                    borderRadius: 4,
                    mb: 4,
                    overflow: 'hidden',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
            >
                <Box
                    sx={{
                        p: { xs: 2, sm: 3 },
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h4" fontWeight="bold">
                        Profil użytkownika
                    </Typography>
                    <IconButton 
                        aria-label="więcej opcji" 
                        onClick={handleMenuClick}
                        sx={{ 
                            color: 'white',
                            '&:hover': { 
                                backgroundColor: alpha('#fff', 0.15)
                            }
                        }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleReportUser} sx={{ color: theme.palette.error.main }}>
                            Zgłoś użytkownika
                        </MenuItem>
                    </Menu>
                </Box>

                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar
                                    src={user.photo}
                                    alt={`${user.name} ${user.surname}`}
                                    sx={{
                                        width: 160,
                                        height: 160,
                                        mb: 2,
                                        border: `4px solid ${theme.palette.primary.main}`,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    <PersonIcon sx={{ fontSize: 80 }} />
                                </Avatar>

                                <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                    {user.name} {user.surname}
                                </Typography>

                                {user.rating && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                                        <Rating
                                            value={user.rating}
                                            precision={0.5}
                                            readOnly
                                            sx={{ mr: 1 }}
                                        />
                                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                            {user.rating.toFixed(1)}
                                        </Typography>
                                    </Box>
                                )}

                                {user.city && user.postal_code && (
                                    <Chip
                                        icon={<LocationOnIcon />}
                                        label={`${user.city}, ${user.postal_code}`}
                                        sx={{
                                            mt: 1,
                                            fontSize: '1rem',
                                            height: 36,
                                            borderRadius: 18,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.dark
                                        }}
                                    />
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Paper
                                elevation={5}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    height: '100%',
                                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 3,
                                    pb: 2,
                                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                }}>
                                    <Avatar sx={{
                                        bgcolor: theme.palette.primary.main,
                                        mr: 2,
                                        width: 48,
                                        height: 48
                                    }}>
                                        <PersonIcon />
                                    </Avatar>
                                    <Typography variant="h5" color="primary" fontWeight="bold">
                                        O mnie
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    flexGrow: 1,
                                    p: 3,
                                    mb: 3,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.primary.light, 0.05),
                                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {user.description && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: 8,
                                                height: '100%',
                                                bgcolor: alpha(theme.palette.primary.main, 0.5),
                                            }}
                                        />
                                    )}
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            whiteSpace: 'pre-wrap',
                                            fontStyle: user.description ? 'normal' : 'italic',
                                            color: user.description ? 'text.primary' : 'text.secondary',
                                            pl: user.description ? 2 : 0
                                        }}
                                    >
                                        {user.description || "Użytkownik nie dodał jeszcze opisu."}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h4"
                    component="h2"
                    fontWeight="bold"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.primary.main,
                        mb: 2
                    }}
                >
                    <PetsIcon sx={{ mr: 1, fontSize: 36 }} />
                    Zwierzęta ({pets?.length || 0})
                </Typography>

                <Divider />
            </Box>

            {pets && pets.length > 0 ? (
                <Grid container spacing={3}>
                    {pets.map((pet) => (
                        <Grid item xs={12} sm={6} md={4} key={pet.pet_id}>
                            <PetCard pet={pet} size="medium" />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper
                    elevation={2}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.info.light, 0.1)
                    }}
                >
                    <PetsIcon sx={{ fontSize: 60, color: theme.palette.info.main, opacity: 0.6, mb: 2 }} />
                    <Typography variant="h6">
                        Ten użytkownik nie posiada jeszcze zwierząt
                    </Typography>
                </Paper>
            )}

            <Box sx={{ mt: 4 }}>
                <Typography
                    variant="h4"
                    component="h2"
                    fontWeight="bold"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.primary.main,
                        mb: 2
                    }}
                >
                    <StarIcon sx={{ mr: 1, fontSize: 36 }} />
                    Opinie ({ratings?.length || 0})
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {ratings && ratings.length > 0 ? (
                    <Grid container spacing={3}>
                        {ratings.map((rating) => (
                            <Grid item xs={12} md={6} key={rating.usr_rating_id}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Rating
                                                value={rating.star_number}
                                                readOnly
                                                precision={0.5}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date().toLocaleDateString('pl-PL')}
                                            </Typography>
                                        </Box>

                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {rating.description || "Brak dodatkowego opisu."}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper
                        elevation={2}
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.info.light, 0.1)
                        }}
                    >
                        <StarIcon sx={{ fontSize: 60, color: theme.palette.info.main, opacity: 0.6, mb: 2 }} />
                        <Typography variant="h6">
                            Ten użytkownik nie ma jeszcze żadnych opinii
                        </Typography>
                    </Paper>
                )}
            </Box>

            <ReportUserModal 
                open={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                userId={userId || ''}
            />
        </Container>
    );
};

export default UserPage;