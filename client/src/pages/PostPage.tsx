import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PetsIcon from '@mui/icons-material/Pets';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Rating,
  Stack,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Pet } from '../types';
import { getWithAuth } from '../utils/auth';
import { formatTimeWithoutSeconds } from '../utils/utils';

interface User {
  user_id: number;
  name: string;
  surname: string;
  city: string;
  postal_code: string;
  rating: number;
  photo?: string;
  description?: string;
}

interface Post {
  post_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  description: string;
  cost: number;
}

interface PostDetails {
  user: User;
  post: Post;
  pets: Pet[];
}

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const theme = useTheme();
  const navigate = useNavigate();

  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPetIndex, setSelectedPetIndex] = useState<number>(0);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!postId) {
          setError("Post ID is missing");
          return;
        }

        const response = await getWithAuth(`/api/getPost/${postId}`);

        if (response.ok) {
          const data = await response.json();
          setPostDetails(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch post details');
        }
      } catch (err) {
        setError('An error occurred while fetching post details');
        console.error('Error fetching post details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

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

  const handleApply = () => {
    alert("Application functionality will be implemented in the future!");
  };

  const calculatePetAge = (birthDate: string) => {
    const years = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return `${years} ${years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
        <Button
          component={Link}
          to="/dashboard/search-posts"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Powrót do wyszukiwania
        </Button>
      </Box>
    );
  }

  if (!postDetails) {
    return (
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Nie znaleziono szczegółów ogłoszenia
        </Alert>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Powrót do wyszukiwania
        </Button>
      </Box>
    );
  }

  const currentPet = postDetails.pets[selectedPetIndex];

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{
            borderRadius: 2,
            py: 1,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
          }}
        >
          Powrót do wyszukiwania
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={postDetails.user.photo}
                  alt={`${postDetails.user.name} ${postDetails.user.surname}`}
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: `3px solid ${theme.palette.background.paper}`,
                  }}
                >
                  {postDetails.user.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {postDetails.user.name} {postDetails.user.surname}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Rating
                      value={postDetails.user.rating}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {postDetails.user.rating.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <LocationOnIcon color="primary" sx={{ mt: 0.3, mr: 1.5 }} />
                <Typography>
                  {postDetails.user.city}, {postDetails.user.postal_code}
                </Typography>
              </Box>

              {postDetails.user.description && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <RateReviewIcon color="primary" sx={{ mt: 0.3, mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        O mnie
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {postDetails.user.description}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>

            <Paper
              elevation={2}
              sx={{ p: 3, borderRadius: 3 }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Szczegóły ogłoszenia
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CalendarTodayIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Termin
                    </Typography>
                    <Typography>
                      {postDetails.post.start_date} do {postDetails.post.end_date}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <ScheduleIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Godziny
                    </Typography>
                    <Typography>
                      {formatTimeWithoutSeconds(postDetails.post.start_time)} - {formatTimeWithoutSeconds(postDetails.post.end_time)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <AttachMoneyIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Stawka godzinowa
                    </Typography>
                    <Typography fontWeight="bold">
                      {postDetails.post.cost} PLN/h
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <PetsIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Liczba zwierząt
                    </Typography>
                    <Typography>
                      {postDetails.pets.length}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {postDetails.post.description && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <RateReviewIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Opis
                      </Typography>
                      <Typography sx={{ whiteSpace: 'pre-line' }}>
                        {postDetails.post.description || "Brak opisu"}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card
            elevation={3}
            sx={{
              height: '100%',
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
                        lineHeight: 1.7
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
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CheckCircleOutlineIcon />}
          onClick={handleApply}
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
          Aplikuj na to ogłoszenie
        </Button>
      </Box>
    </Box>
  );
};

export default PostPage;