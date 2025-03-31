import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Rating,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { useState } from 'react';

import { useNotification } from '../contexts/NotificationContext';
import { postWithAuth } from '../utils/auth';

interface UserRatingModalProps {
    open: boolean;
    onClose: () => void;
    userId: number;
    postId: string | number;
    userName: string;
    userPhoto?: string;
    onRatingSuccess?: () => void;
}

const UserRatingModal = ({
    open,
    onClose,
    userId,
    postId,
    userName,
    userPhoto,
    onRatingSuccess
}: UserRatingModalProps) => {
    const theme = useTheme();
    const { showNotification } = useNotification();
    
    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!rating) {
            showNotification('Proszę wybrać ocenę', 'warning');
            return;
        }

        setLoading(true);
        try {
            const response = await postWithAuth(
                `/api/post/${postId}/reviewUser/${userId}`,
                {
                    star_number: rating,
                    description: comment
                }
            );

            if (response.ok) {
                const data = await response.json();
                showNotification(data.msg, 'success');
                if (onRatingSuccess) onRatingSuccess();
                handleClose();
            } else {
                const errorData = await response.json();
                showNotification(errorData.msg || 'Wystąpił błąd podczas dodawania oceny', 'error');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            showNotification('Nie udało się dodać oceny', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setComment('');
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={loading ? undefined : handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                elevation: 5,
                sx: { borderRadius: 3, p: 1 }
            }}
        >
            <DialogTitle sx={{ 
                fontWeight: 'bold', 
                pt: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <Avatar 
                    src={userPhoto} 
                    alt={userName}
                    sx={{ width: 56, height: 56 }}
                >
                    {userName?.[0]}
                </Avatar>
                <Box>
                    <Typography variant="h6">Oceń użytkownika</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {userName}
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        mb: 3
                    }}
                >
                    <Rating
                        name="user-rating"
                        value={rating}
                        precision={1}
                        size="large"
                        onChange={(_, newValue) => {
                            setRating(newValue);
                        }}
                        icon={<StarIcon fontSize="inherit" sx={{ fontSize: 40 }} />}
                        emptyIcon={<StarBorderIcon fontSize="inherit" sx={{ fontSize: 40 }} />}
                        sx={{
                            mb: 1,
                            '& .MuiRating-iconFilled': {
                                color: theme.palette.warning.main,
                            }
                        }}
                    />
                    <Typography color="text.secondary">
                        {rating === 0 ? 'Wybierz ocenę' : 
                         rating === 1 ? 'Bardzo słabo' :
                         rating === 2 ? 'Słabo' :
                         rating === 3 ? 'W porządku' :
                         rating === 4 ? 'Dobrze' : 'Świetnie'}
                    </Typography>
                </Box>

                <TextField
                    label="Twój komentarz (opcjonalnie)"
                    multiline
                    rows={4}
                    fullWidth
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Opisz swoje doświadczenie z tym użytkownikiem"
                    variant="outlined"
                    sx={{
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    Anuluj
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || rating === 0}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ 
                        borderRadius: 2,
                        px: 3,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                        }
                    }}
                >
                    {loading ? 'Wysyłanie...' : 'Oceń'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserRatingModal;