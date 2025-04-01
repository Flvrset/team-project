import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Rating,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useNotification } from '../../contexts/NotificationContext';
import { Applicant, PostDetails } from '../../types';
import { getWithAuth, putWithAuth } from '../../utils/auth';
import UserRatingModal from '../UserRatingModal';

import ApplicantsModal from './ApplicantsModal';
import PostDetailsSummary from './PostDetailsSummary';

interface PostOwnerViewProps {
    postDetails: PostDetails;
    postId: string | undefined;
}

const PostOwnerView = ({
    postDetails,
    postId,
}: PostOwnerViewProps) => {
    const theme = useTheme();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [applicantsLoading, setApplicantsLoading] = useState<boolean>(false);
    const [applicationsModalOpen, setApplicationsModalOpen] = useState<boolean>(false);
    const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);

    const menuOpen = Boolean(menuAnchorEl);

    useEffect(() => {
        const fetchApplicants = async () => {
            if (!postId || postDetails?.status !== "own") return;
    
            setApplicantsLoading(true);
            try {
                const response = await getWithAuth(`/api/getPost/${postId}/applications`);
                if (response.ok) {
                    const data = await response.json();
                    setApplicants(data.users);
                } else {
                    const errorData = await response.json();
                    showNotification(errorData.msg || 'Błąd podczas pobierania aplikacji', 'error');
                }
            } catch (error) {
                console.error('Error fetching applicants:', error);
                showNotification('Nie udało się pobrać aplikacji', 'error');
            } finally {
                setApplicantsLoading(false);
            }
        };
    
        if (postDetails?.status === "own") {
            fetchApplicants();
        }
    }, [postDetails?.status, postId, showNotification]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleEditPost = () => {
        handleMenuClose();
        // This will be implemented in the future
        showNotification('Edit functionality will be implemented soon!', 'info');
    };

    const handleDeletePostClick = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };

    const handleDeletePost = async () => {
        if (!postId) return;

        setDeleteLoading(true);
        try {
            const response = await putWithAuth(`/api/getPost/${postId}/delete`, {});

            if (response.ok) {
                const data = await response.json();
                showNotification(data.msg, 'success');
                navigate('/dashboard/my-posts');
            } else {
                const errorData = await response.json();
                showNotification(errorData.msg || 'Wystąpił błąd podczas usuwania ogłoszenia', 'error');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showNotification('Nie udało się usunąć ogłoszenia', 'error');
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleOpenApplicationsModal = () => {
        setApplicationsModalOpen(true);
    };

    const handleCloseApplicationsModal = () => {
        setApplicationsModalOpen(false);
    };

    const handleApplicantAccepted = (userId: number) => {
        // Since accepting makes the post inactive, update post details
        if (postDetails) {
            setApplicants(prev => prev.map(applicant =>
                applicant.user_id === userId
                    ? { ...applicant, status: "Accepted" }
                    : { ...applicant, status: "Declined" }
            ));
        }
        setApplicationsModalOpen(false);
    };

    const handleApplicantDeclined = (userId: number) => {
        setApplicants(prev => prev.map(applicant =>
            applicant.user_id === userId
                ? { ...applicant, status: "Declined" }
                : applicant
        ));
    };

    const renderApplicationsSection = () => {
        const pendingCount = applicants.filter(app => app.status !== "Declined" && app.status !== "Accepted").length;

        return (
            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Aplikacje
                </Typography>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                }}>
                    <Typography>
                        {pendingCount === 0 ?
                            'Brak aplikacji do przejrzenia' :
                            `Masz ${pendingCount} ${pendingCount === 1 ? 'aplikację' : pendingCount < 5 ? 'aplikacje' : 'aplikacji'} do przejrzenia`}
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenApplicationsModal}
                        disabled={applicantsLoading || applicants.length === 0}
                        startIcon={applicantsLoading ? <CircularProgress size={20} color="inherit" /> : <NotificationsActiveIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            width: { xs: '100%', sm: 'auto' },
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                            }
                        }}
                    >
                        {applicantsLoading ? 'Ładowanie...' : applicants.length === 0 ? 'Brak aplikacji' : 'Przeglądaj'}
                        {pendingCount > 0 && !applicantsLoading && (
                            <Badge
                                badgeContent={pendingCount}
                                color="error"
                                sx={{ position: 'static', }}
                            />
                        )}
                    </Button>
                </Box>
            </Paper>
        );
    };

    const renderAcceptedApplicantCard = () => {
        if (postDetails?.status !== "own" || !postDetails) return null;

        const acceptedApplicant = applicants.find(app => app.status === "Accepted");
        if (!acceptedApplicant) return null;

        return (
            <Card
                elevation={3}
                sx={{
                    mt: 0,
                    mb: 4,
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        background: `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <CheckCircleOutlineIcon sx={{ color: 'white', mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold" color="white">
                        Zaakceptowany opiekun
                    </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={acceptedApplicant.photo}
                                alt={`${acceptedApplicant.name} ${acceptedApplicant.surname}`}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    border: `4px solid ${theme.palette.background.paper}`,
                                }}
                            >
                                {acceptedApplicant.name[0]}
                            </Avatar>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: -8,
                                    right: -8,
                                    backgroundColor: theme.palette.success.main,
                                    borderRadius: '50%',
                                    width: 30,
                                    height: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    border: `2px solid ${theme.palette.background.paper}`,
                                }}
                            >
                                <CheckCircleOutlineIcon sx={{ color: 'white', fontSize: 18 }} />
                            </Box>
                        </Box>

                        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography variant="h5" fontWeight="bold">
                                {acceptedApplicant.name} {acceptedApplicant.surname}
                            </Typography>

                            {!!acceptedApplicant.rating && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                                    <Rating
                                        value={acceptedApplicant.rating}
                                        precision={0.5}
                                        readOnly
                                        size="small"
                                    />
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        {acceptedApplicant.rating.toFixed(1)}
                                    </Typography>
                                </Box>
                            )}

                            {(!!acceptedApplicant.city && !!acceptedApplicant.postal_code) && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                                    <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography>
                                        {acceptedApplicant.city}, {acceptedApplicant.postal_code}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Button
                            component={Link}
                            to={`/dashboard/users/${acceptedApplicant.user_id}`}
                            variant="outlined"
                            color="success"
                            startIcon={<PersonIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: theme.palette.success.main,
                                color: theme.palette.success.main,
                                alignSelf: { xs: 'stretch', sm: 'center' },
                                '&:hover': {
                                    borderColor: theme.palette.success.dark,
                                    backgroundColor: alpha(theme.palette.success.main, 0.04),
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`,
                                }
                            }}
                        >
                            Profil opiekuna
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    const renderRateApplicantSection = () => {
        if (!postDetails.can_rate || !postDetails?.pets?.length) return null;

        const acceptedApplicant = applicants.find(app => app.status === "Accepted");
        if (!acceptedApplicant) return null;

        return (
            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.1)}, ${alpha(theme.palette.warning.main, 0.1)})`,
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Oceń opiekuna
                </Typography>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                }}>
                    <Typography>
                        Podziel się swoją opinią o opiekunie {acceptedApplicant.name}
                    </Typography>

                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => setRatingModalOpen(true)}
                        startIcon={<StarIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            width: { xs: '100%', sm: 'auto' },
                            boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 6px 16px ${alpha(theme.palette.warning.main, 0.4)}`,
                            }
                        }}
                    >
                        Oceń opiekuna
                    </Button>
                </Box>

                {acceptedApplicant && (
                    <UserRatingModal
                        open={ratingModalOpen}
                        onClose={() => setRatingModalOpen(false)}
                        userId={acceptedApplicant.user_id}
                        postId={postId || ''}
                        userName={`${acceptedApplicant.name} ${acceptedApplicant.surname}`}
                        userPhoto={acceptedApplicant.photo}
                    />
                )}
            </Paper>
        );
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                {postDetails?.status === "own" && postDetails.post.is_active && (
                    <IconButton
                        aria-label="more options"
                        aria-controls="post-menu"
                        aria-haspopup="true"
                        onClick={handleMenuOpen}
                        sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            },
                        }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                )}

                <Menu
                    id="post-menu"
                    anchorEl={menuAnchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    MenuListProps={{
                        'aria-labelledby': 'post-options-button',
                    }}
                >
                    <MenuItem onClick={handleEditPost} sx={{
                        color: theme.palette.primary.main,
                        py: 1.5,
                        minWidth: 180
                    }}>
                        <EditIcon sx={{ mr: 2 }} />
                        Edytuj ogłoszenie
                    </MenuItem>
                    <MenuItem onClick={handleDeletePostClick} sx={{
                        color: theme.palette.error.main,
                        py: 1.5
                    }}>
                        <DeleteIcon sx={{ mr: 2 }} />
                        Usuń ogłoszenie
                    </MenuItem>
                </Menu>
            </Box>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    elevation: 5,
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold' }}>
                    Potwierdzenie usunięcia ogłoszenia
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Czy na pewno chcesz usunąć to ogłoszenie? Ta operacja jest nieodwracalna.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleDeleteDialogClose}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                        disabled={deleteLoading}
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleDeletePost}
                        variant="contained"
                        color="error"
                        autoFocus
                        disabled={deleteLoading}
                        startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                        sx={{
                            borderRadius: 2,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                            '&:hover': {
                                boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
                            }
                        }}
                    >
                        {deleteLoading ? 'Usuwanie...' : 'Usuń'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <PostDetailsSummary
                        post={postDetails.post}
                        pets={postDetails.pets}
                    />
                </Grid>

                <Grid item xs={12} md={5}>
                    {renderRateApplicantSection()}
                    {renderAcceptedApplicantCard()}
                    {renderApplicationsSection()}
                </Grid>
            </Grid>

            <ApplicantsModal
                open={applicationsModalOpen}
                onClose={handleCloseApplicationsModal}
                applicants={applicants}
                loading={applicantsLoading}
                postId={postId}
                onAcceptSuccess={handleApplicantAccepted}
                onDeclineSuccess={handleApplicantDeclined}
            />
        </Box>
    );
};

export default PostOwnerView;