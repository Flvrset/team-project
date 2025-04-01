import SearchIcon from '@mui/icons-material/Search';
import { Box, Typography, Grid, CircularProgress, Paper, alpha, useTheme, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import BackButton from '../components/BackButton';
import PostCard from '../components/PostCard';
import { useNotification } from '../contexts/NotificationContext';
import { MyPostsResponse, Post } from '../types';
import { getWithAuth } from '../utils/auth';
import { convertBackendPosts } from '../utils/postUtils';

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const theme = useTheme();

    useEffect(() => {
        const fetchUserApplications = async () => {
            setLoading(true);
            try {
                const response = await getWithAuth('/api/getMyApplications');

                if (response.ok) {
                    const data = await response.json() as MyPostsResponse;
                    setApplications(convertBackendPosts(data.post_lst));
                } else {
                    throw new Error('Failed to fetch user applications');
                }
            } catch (error) {
                console.error('Error fetching user applications:', error);
                showNotification('Nie udało się załadować Twoich aplikacji', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchUserApplications();
    }, [showNotification]);


    const handlePostClick = (postId: number) => {
        navigate(`/dashboard/posts/${postId}`);
    };

    const handleSearchPosts = () => {
        navigate('/dashboard/search-posts');
    };

    const renderPostWithStatus = (post: Post) => {
        let color: 'success' | 'error' | 'primary';
        let displayStatus: string;

        switch (post.status) {
            case 'accepted':
                color = 'success';
                displayStatus = 'Zaakceptowana';
                break;
            case 'declined':
                color = 'error';
                displayStatus = 'Odrzucona';
                break;
            case 'cancelled':
                color = 'error';
                displayStatus = 'Anulowana';
                break;
            case 'waiting':
            default:
                color = 'primary';
                displayStatus = 'Oczekująca';
        }

        return (
            <PostCard
                post={post}
                label={{ text: displayStatus, color }}
                onClick={handlePostClick}
                actionText="Zobacz szczegóły"
                showHeader={false}
            />
        );
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
                    Twoje zgłoszenia
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                    Zobacz status swoich aplikacji do ogłoszeń
                </Typography>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <BackButton />
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<SearchIcon />}
                    onClick={handleSearchPosts}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Szukaj ogłoszeń
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <>
                    {applications.length > 0 ? (
                        <Grid container spacing={3}>
                            {applications.map((application) => (
                                <Grid item xs={12} sm={6} md={4} key={application.post_id}>
                                    {renderPostWithStatus(application)}
                                </Grid>
                            ))}
                        </Grid>
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
                                Nie masz jeszcze żadnych aplikacji
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Przeglądaj ogłoszenia i aplikuj, aby zobaczyć tutaj swoją listę
                            </Typography>
                        </Paper>
                    )}
                </>
            )}
        </Box>
    );
};

export default MyApplicationsPage;