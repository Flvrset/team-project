import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import RateReviewIcon from '@mui/icons-material/RateReview';
import {
    Avatar,
    Box,
    Button,
    Divider,
    Paper,
    Rating,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { User } from '../../types';

interface PostOwnerSummaryProps {
    user: User;
}

const PostOwnerSummary = ({ user }: PostOwnerSummaryProps) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 3,
                mb: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        src={user.photo}
                        alt={`${user.name} ${user.surname}`}
                        sx={{
                            width: 80,
                            height: 80,
                            mr: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: `3px solid ${theme.palette.background.paper}`,
                        }}
                    >
                        {user.name[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            {user.name} {user.surname}
                        </Typography>
                        {user.rating && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Rating
                                    value={user.rating}
                                    precision={0.5}
                                    readOnly
                                    size="small"
                                />
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                    {user.rating.toFixed(1)}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
                <Button
                    component={RouterLink}
                    to={`/dashboard/users/${user.user_id}`}
                    variant="outlined"
                    size="small"
                    startIcon={<PersonIcon />}
                    sx={{
                        borderRadius: 2,
                        ml: 1,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }
                    }}
                >
                    Profil
                </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <LocationOnIcon color="primary" sx={{ mt: 0.3, mr: 1.5 }} />
                <Typography>
                    {user.city}, {user.postal_code}
                </Typography>
            </Box>

            {user.description && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <RateReviewIcon color="primary" sx={{ mt: 0.3, mr: 1.5 }} />
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                O mnie
                            </Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                {user.description}
                            </Typography>
                        </Box>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default PostOwnerSummary;