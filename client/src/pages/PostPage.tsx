import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Alert,
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
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Rating,
  Stack,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ApplicantsModal from '../components/ApplicantsModal';
import { useNotification } from '../contexts/NotificationContext';
import { Pet, User, Applicant } from '../types';
import { getWithAuth, postWithAuth, putWithAuth } from '../utils/auth';
import { formatTimeWithoutSeconds } from '../utils/utils';

interface Post {
  post_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  description: string;
  cost: number;
  is_active: boolean;
}

interface PostDetails {
  user: User;
  post: Post;
  pets: Pet[];
  status: "own" | "applied" | "declined" | "";
}

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const theme = useTheme();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPetIndex, setSelectedPetIndex] = useState<number>(0);
  const [applyLoading, setApplyLoading] = useState<boolean>(false);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState<boolean>(false);
  const [applicationsModalOpen, setApplicationsModalOpen] = useState<boolean>(false);

  const menuOpen = Boolean(menuAnchorEl);

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

  useEffect(() => {
    if (postDetails?.status === "own") {
      fetchApplicants();
    }
  }, [postDetails?.status]);

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
        setPostDetails(prev => prev ? { ...prev, status: "applied" } : null);
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
        setPostDetails(prev => prev ? { ...prev, status: "" } : null);
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

  const handleOpenApplicationsModal = () => {
    setApplicationsModalOpen(true);
  };

  const handleCloseApplicationsModal = () => {
    setApplicationsModalOpen(false);
  };

  const handleApplicantAccepted = (userId: number) => {
    // Since accepting makes the post inactive, update post details
    if (postDetails) {
      setPostDetails({
        ...postDetails,
        post: { ...postDetails.post, is_active: false }
      });
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

  const calculatePetAge = (birthDate: string) => {
    const years = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return `${years} ${years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}`;
  };

  const renderApplicationsSection = () => {
    if (postDetails?.status !== "own" || !postDetails) return null;

    const acceptedApplicant = applicants.find(app => app.status === "Accepted");

    if (acceptedApplicant) {
      return (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            mt: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)}, ${alpha(theme.palette.success.main, 0.1)})`,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlineIcon sx={{ mr: 1, color: theme.palette.success.main }} />
            Zaakceptowany opiekun
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={acceptedApplicant.photo}
              alt={`${acceptedApplicant.name} ${acceptedApplicant.surname}`}
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: `3px solid ${theme.palette.background.paper}`,
              }}
            >
              {acceptedApplicant.name[0]}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {acceptedApplicant.name} {acceptedApplicant.surname}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
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
            </Box>
          </Box>

          {(!!acceptedApplicant.city && !!acceptedApplicant.postal_code && <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <LocationOnIcon color="primary" sx={{ mt: 0.3, mr: 1.5 }} />
            <Typography>
              {acceptedApplicant.city}, {acceptedApplicant.postal_code}
            </Typography>
          </Box>)}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              component={Link}
              to={`/user/${acceptedApplicant.user_id}`}
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<PersonIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Profil opiekuna
            </Button>
          </Box>
        </Paper>
      );
    } else if (postDetails.post.is_active) {
      const pendingCount = applicants.filter(app => app.status !== "Declined").length;

      return (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            mt: 3,
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
    }

    return null;
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
            disabled={applyLoading || postDetails.post.is_active}
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

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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

      {/* Delete confirmation dialog */}
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

            {renderApplicationsSection()}

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
        {renderActionButton()}
      </Box>

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

export default PostPage;