import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PetsIcon from '@mui/icons-material/Pets';
import StarIcon from '@mui/icons-material/Star';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Paper,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { useState } from 'react';

import { useNotification } from '../../contexts/NotificationContext';
import { PostDetails } from '../../types';
import { putWithAuth, postWithAuth } from '../../utils/auth';
import UserRatingModal from '../UserRatingModal';

import PostDetailsSummary from './PostDetailsSummary';
import PostOwnerSummary from './PostOwnerSummary';

interface PostApplicantViewProps {
    postDetails: PostDetails;
    postId: string | undefined;
}

const PostApplicantView = ({ postDetails, postId }: PostApplicantViewProps) => {
    const theme = useTheme();
    const { showNotification } = useNotification();

    const [selectedPetIndex, setSelectedPetIndex] = useState<number>(0);
    const [applyLoading, setApplyLoading] = useState<boolean>(false);
    const [cancelLoading, setCancelLoading] = useState<boolean>(false);
    const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);

    const handleNextPet = () => {
        if (postDetails) {
            setSelectedPetIndex((prevIndex) =>
                prevIndex === postDetails.pets.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const handlePrevPet = () => {
        if (postDetails) {
            setSelectedPetIndex((prevIndex) =>
                prevIndex === 0 ? postDetails.pets.length - 1 : prevIndex - 1
            );
        }
    };

    const handleApply = async () => {
        if (!postId) return;

        setApplyLoading(true);
        try {
            const response = await postWithAuth(`/api/applyToPost/${postId}`, {});

            if (response.ok) {
                const data = await response.json();
                showNotification(data.msg, 'success');
                // This would normally update the component state via a parent callback
                // For now, we'll just refresh the page to show the updated status
                window.location.reload();
            } else {
                const errorData = await response.json();
                showNotification(errorData.msg || 'Wystąpił błąd podczas składania aplikacji', 'error');
            }
        } catch (error) {
            console.error('Error applying to post:', error);
            showNotification('Nie udało się złożyć aplikacji', 'error');
        } finally {
            setApplyLoading(false);
        }
    };

    const handleCancelApplication = async () => {
        if (!postId) return;

        setCancelLoading(true);
        try {
            const response = await putWithAuth(`/api/getMyApplications/${postId}/cancel`, {});

            if (response.ok) {
                const data = await response.json();
                showNotification(data.msg, 'success');
                // This would normally update the component state via a parent callback
                // For now, we'll just refresh the page to show the updated status
                window.location.reload();
            } else {
                const errorData = await response.json();
                showNotification(errorData.msg || 'Wystąpił błąd podczas wycofywania aplikacji', 'error');
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            showNotification('Nie udało się wycofać aplikacji', 'error');
        } finally {
            setCancelLoading(false);
        }
    };

    const calculatePetAge = (birthDate: string) => {
        const years = new Date().getFullYear() - new Date(birthDate).getFullYear();
        return `${years} ${years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}`;
    };

    const renderActionButton = () => {
        switch (postDetails?.status) {
            case "declined":
            case "own": return <></>;
            case "applied":
                return (
                    <Button
                        variant="outlined"
                        color="error"
                        size="large"
                        startIcon={cancelLoading ? undefined : <CancelIcon />}
                        onClick={handleCancelApplication}
                        disabled={cancelLoading}
                        sx={{
                            py: 1.5,
                            px: 4,
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.04),
                                transform: 'translateY(-3px)',
                                boxShadow: `0 8px 20px ${alpha(theme.palette.error.main, 0.2)}`,
                            }
                        }}
                    >
                        {cancelLoading ? <CircularProgress size={24} color="inherit" /> : 'Wycofaj aplikację'}
                    </Button>
                );
            case "":
                return (
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={handleApply}
                        disabled={applyLoading || !postDetails.post.is_active}
                        sx={{
                            py: 1.5,
                            px: 4,
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                            '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                            }
                        }}
                    >
                        {applyLoading ? <CircularProgress size={24} color="inherit" /> : 'Aplikuj na to ogłoszenie'}
                    </Button>
                );
        };
    }

    const renderRateOwnerSection = () => {
        if (!postDetails?.can_rate || postDetails?.status !== "applied") return null;
        
        return (
            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    mt: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.1)}, ${alpha(theme.palette.warning.main, 0.1)})`,
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Oceń właściciela
                </Typography>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                }}>
                    <Typography>
                        Podziel się swoją opinią o {postDetails.user.name}
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
                        Oceń właściciela
                    </Button>
                </Box>
                
                <UserRatingModal
                    open={ratingModalOpen}
                    onClose={() => setRatingModalOpen(false)}
                    userId={postDetails.user.user_id}
                    postId={postId || ''}
                    userName={`${postDetails.user.name} ${postDetails.user.surname}`}
                    userPhoto={postDetails.user.photo}
                />
            </Paper>
        );
    };

    const currentPet = postDetails.pets[selectedPetIndex];

    return (
        <Box>
            
            <Box sx={{ width: '100%', mb: 4 }}>
                {renderRateOwnerSection()}
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                    <PostOwnerSummary user={postDetails.user} />

                    <PostDetailsSummary
                        post={postDetails.post}
                        pets={postDetails.pets}
                    />
                </Grid>

                <Grid item xs={12} md={7}>
                    <Card
                        elevation={3}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'relative',
                                height: 350,
                                backgroundColor: alpha(theme.palette.primary.light, 0.08),
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            {currentPet.photo ? (
                                <Box
                                    component="img"
                                    src={currentPet.photo}
                                    alt={currentPet.pet_name}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                    }}
                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <PetsIcon sx={{ fontSize: 120, color: alpha(theme.palette.text.primary, 0.2) }} />
                            )}

                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(to top, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 30%)',
                            }} />

                            <Box sx={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    backdropFilter: 'blur(8px)',
                                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                                    borderRadius: 8,
                                    px: 2,
                                    py: 0.5,
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
                                }}>
                                    <IconButton
                                        onClick={handlePrevPet}
                                        disabled={postDetails.pets.length <= 1}
                                        aria-label="Poprzednie zwierzę"
                                        sx={{ color: theme.palette.primary.main }}
                                    >
                                        <NavigateBeforeIcon />
                                    </IconButton>
                                    <Typography sx={{ display: 'flex', alignItems: 'center', mx: 1, fontWeight: 'medium' }}>
                                        {selectedPetIndex + 1} / {postDetails.pets.length}
                                    </Typography>
                                    <IconButton
                                        onClick={handleNextPet}
                                        disabled={postDetails.pets.length <= 1}
                                        aria-label="Następne zwierzę"
                                        sx={{ color: theme.palette.primary.main }}
                                    >
                                        <NavigateNextIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: 4 }}>
                            <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                                {currentPet.pet_name}
                            </Typography>

                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            height: '100%',
                                            backgroundColor: alpha(theme.palette.primary.light, 0.08),
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.light, 0.12),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Typography variant="subtitle2" color="primary.main" gutterBottom fontWeight="bold">
                                            Gatunek
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                                            {currentPet.type}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            height: '100%',
                                            backgroundColor: alpha(theme.palette.primary.light, 0.08),
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.light, 0.12),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Typography variant="subtitle2" color="primary.main" gutterBottom fontWeight="bold">
                                            Rasa
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                                            {currentPet.race}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            height: '100%',
                                            backgroundColor: alpha(theme.palette.primary.light, 0.08),
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.light, 0.12),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Typography variant="subtitle2" color="primary.main" gutterBottom fontWeight="bold">
                                            Rozmiar
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                                            {currentPet.size}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            height: '100%',
                                            backgroundColor: alpha(theme.palette.primary.light, 0.08),
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.light, 0.12),
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Typography variant="subtitle2" color="primary.main" gutterBottom fontWeight="bold">
                                            Wiek
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                                            {calculatePetAge(currentPet.birth_date)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {currentPet.description && (
                                <Box sx={{ mt: 3 }}>
                                    <Divider sx={{ mb: 3 }} />
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            backgroundColor: alpha(theme.palette.primary.light, 0.05),
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                        }}
                                    >
                                        <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                                            O zwierzaku
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                whiteSpace: 'pre-line',
                                                lineHeight: 1.7,
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word',
                                                width: '100%'
                                            }}
                                        >
                                            {currentPet.description}
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                {renderActionButton()}
            </Box>
        </Box>
    );
};

export default PostApplicantView;