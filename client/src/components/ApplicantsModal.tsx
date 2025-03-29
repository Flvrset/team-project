import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Rating,
    Stack,
    Typography,
    alpha,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useNotification } from '../contexts/NotificationContext';
import { Applicant } from '../types';
import { putWithAuth } from '../utils/auth';

interface ApplicantsModalProps {
    open: boolean;
    onClose: () => void;
    applicants: Applicant[];
    loading: boolean;
    postId: string | undefined;
    onAcceptSuccess?: (userId: number) => void;
    onDeclineSuccess?: (userId: number) => void;
}

const ApplicantsModal = ({
    open,
    onClose,
    applicants,
    loading,
    postId,
    onAcceptSuccess,
    onDeclineSuccess
}: ApplicantsModalProps) => {
    const theme = useTheme();
    const { showNotification } = useNotification();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

    const handleAcceptApplication = async (userId: number) => {
        if (!postId) return;

        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const response = await putWithAuth(`/api/getPost/${postId}/acceptApplication/${userId}`, {});

            if (response.ok) {
                const data = await response.json();
                showNotification(data.msg, 'success');

                if (onAcceptSuccess) {
                    onAcceptSuccess(userId);
                }
            } else {
                const errorData = await response.json();
                showNotification(errorData.msg || 'Wystąpił błąd podczas akceptowania aplikacji', 'error');
            }
        } catch (error) {
            console.error('Error accepting application:', error);
            showNotification('Nie udało się zaakceptować aplikacji', 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleDeclineApplication = async (userId: number) => {
        if (!postId) return;

        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const response = await putWithAuth(`/api/getPost/${postId}/declineApplication/${userId}`, {});

            if (response.ok) {
                const data = await response.json();
                showNotification(data.msg, 'success');

                if (onDeclineSuccess) {
                    onDeclineSuccess(userId);
                }
            } else {
                const errorData = await response.json();
                showNotification(errorData.msg || 'Wystąpił błąd podczas odrzucania aplikacji', 'error');
            }
        } catch (error) {
            console.error('Error declining application:', error);
            showNotification('Nie udało się odrzucić aplikacji', 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Get pending applicants first, then rejected ones
    const sortedApplicants = [...applicants].sort((a, b) => {
        if (a.status === "Declined" && b.status !== "Declined") return 1;
        if (a.status !== "Declined" && b.status === "Declined") return -1;
        return 0;
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            aria-labelledby="aplikacje-dialog-title"
            PaperProps={{
                elevation: 5,
                sx: {
                    borderRadius: isMobile ? 0 : 3,
                    overflow: 'hidden',
                    height: isMobile ? '100%' : 'auto'
                }
            }}
        >
            <Box
                sx={{
                    p: { xs: 2, sm: 3 },
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <DialogTitle id="aplikacje-dialog-title" sx={{ p: 0, fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Aplikanci ({applicants.filter(a => a.status !== "Declined").length} aktywnych)
                    </DialogTitle>
                    <IconButton
                        onClick={onClose}
                        aria-label="zamknij okno"
                        edge="end"
                        sx={{
                            bgcolor: alpha(theme.palette.common.white, 0.8),
                            '&:hover': {
                                bgcolor: theme.palette.common.white,
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                <DialogContent sx={{ p: 0, mt: 1 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : applicants.length === 0 ? (
                        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <InfoIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.primary, 0.2), mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Brak aplikacji
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Na ten moment nikt nie złożył aplikacji na Twoje ogłoszenie.
                            </Typography>
                        </Card>
                    ) : (
                        <Stack spacing={3}>
                            {sortedApplicants.map((applicant) => {
                                const isDeclined = applicant.status === "Declined";

                                return (
                                    <Card
                                        key={applicant.user_id}
                                        elevation={2}
                                        sx={{
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            opacity: isDeclined ? 0.8 : 1,
                                            ...(isDeclined ? {
                                                borderLeft: `4px solid ${theme.palette.error.main}`
                                            } : {
                                                '&:hover': {
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            })
                                        }}
                                    >
                                        <Grid container>
                                            <Grid item xs={12} sm={3} md={2} sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Avatar
                                                        src={applicant.photo}
                                                        alt={`${applicant.name} ${applicant.surname}`}
                                                        sx={{
                                                            width: { xs: 70, sm: 80 },
                                                            height: { xs: 70, sm: 80 },
                                                            mb: 1,
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                            border: `3px solid ${theme.palette.background.paper}`,
                                                            ...(isDeclined && { filter: 'grayscale(0.7)' })
                                                        }}
                                                    >
                                                        {applicant.name[0]}
                                                    </Avatar>

                                                    {/* Status chip for visual feedback */}
                                                    {isDeclined && (
                                                        <Chip
                                                            label="Odrzucony"
                                                            color="error"
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -10,
                                                                right: -20,
                                                                fontWeight: 'bold',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Rating
                                                    value={applicant.rating}
                                                    precision={0.5}
                                                    readOnly
                                                    size="small"
                                                    sx={{ my: 1 }}
                                                />
                                                <Typography variant="body2" fontWeight="medium">
                                                    {applicant.rating.toFixed(1)}/5.0
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={9} md={10}>
                                                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                                            {applicant.name} {applicant.surname}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {applicant.city}, {applicant.postal_code}
                                                        </Typography>
                                                    </Box>

                                                    {applicant.description && (
                                                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                                            {applicant.description}
                                                        </Typography>
                                                    )}

                                                    <Box sx={{
                                                        mt: 3,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        gap: 2
                                                    }}>
                                                        <Button
                                                            component={Link}
                                                            to={`/user/${applicant.user_id}`}
                                                            variant="outlined"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<PersonIcon />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                            }}
                                                        >
                                                            Profil użytkownika
                                                        </Button>

                                                        {!isDeclined && (
                                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    onClick={() => handleDeclineApplication(applicant.user_id)}
                                                                    disabled={!!actionLoading[applicant.user_id]}
                                                                    startIcon={actionLoading[applicant.user_id] ? <CircularProgress size={20} color="inherit" /> : <CloseIcon />}
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        textTransform: 'none'
                                                                    }}
                                                                >
                                                                    Odrzuć
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    onClick={() => handleAcceptApplication(applicant.user_id)}
                                                                    disabled={!!actionLoading[applicant.user_id]}
                                                                    startIcon={actionLoading[applicant.user_id] ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        textTransform: 'none',
                                                                        boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                                                                        '&:hover': {
                                                                            boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`,
                                                                        }
                                                                    }}
                                                                >
                                                                    Zaakceptuj
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}
                </DialogContent>
            </Box>
        </Dialog>
    );
};

export default ApplicantsModal;