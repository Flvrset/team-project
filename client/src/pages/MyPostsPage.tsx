import { Box, Typography, Grid, CircularProgress, Paper, alpha, useTheme, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import BackButton from '../components/BackButton';
import PostCard from '../components/PostCard';
import { useNotification } from '../contexts/NotificationContext';
import { MyPostsResponse, Post } from '../types';
import { getWithAuth } from '../utils/auth';
import { convertBackendPosts } from '../utils/postUtils';

const MyPostsPage = () => {
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const theme = useTheme();

    useEffect(() => {
        fetchUserPosts();
    }, []);

    const fetchUserPosts = async () => {
        setLoading(true);
        try {
            const response = await getWithAuth('/api/getMyPosts');
            
            if (response.ok) {
                const data = await response.json() as MyPostsResponse;
                setUserPosts(convertBackendPosts(data.post_lst));
            } else {
                throw new Error('Failed to fetch user posts');
            }
        } catch (error) {
            console.error('Error fetching user posts:', error);
            showNotification('Nie udało się załadować Twoich ogłoszeń', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePostClick = (postId: number) => {
        navigate(`/dashboard/posts/${postId}`);
    };

    const handleCreatePost = () => {
        navigate('/dashboard/create-post');
    };

    const renderPostWithStatus = (post: Post) => {
        let color: 'success' | 'error' | 'primary';
        let displayStatus: string;
        
        switch (post.status) {
            case 'accepted':
                color = 'success';
                displayStatus = 'Zaakceptowane';
                break;
            case 'cancelled':
                color = 'error';
                displayStatus = 'Anulowane';
                break;
            case 'active':
            default:
                color = 'primary';
                displayStatus = 'Aktywne';
        }

        return (
            <PostCard 
                post={post}
                onClick={handlePostClick}
                actionText="Zarządzaj"
                showHeader={false}
                label={post.status ? {text: displayStatus, color} : undefined}
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
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    color: 'white',
                }}
            >
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Twoje ogłoszenia
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                    Zarządzaj swoimi ogłoszeniami
                </Typography>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <BackButton />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreatePost}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Dodaj ogłoszenie
                </Button>
            </Box>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <>
                    {userPosts.length > 0 ? (
                        <Grid container spacing={3}>
                            {userPosts.map((post) => (
                                <Grid item xs={12} sm={6} md={4} key={post.post_id}>
                                    {renderPostWithStatus(post)}
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
                                Nie masz jeszcze żadnych ogłoszeń
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Utwórz nowe ogłoszenie, aby rozpocząć
                            </Typography>
                        </Paper>
                    )}
                </>
            )}
        </Box>
    );
};

export default MyPostsPage;