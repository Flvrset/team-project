import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import {
    Box,
    Typography,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Alert,
    Snackbar,
    Paper,
    useTheme,
    alpha,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PetCard from '../components/PetCard';
import PetFormModal from '../components/PetFormModal';
import { getWithAuth, postWithAuth } from '../utils/auth';

// Type definitions
type PetSize = 'Mały' | 'Średni' | 'Duży';

interface Pet {
    pet_id: number;
    pet_name: string;
    type: string;
    race: string;
    size: PetSize;
    age: number;
}

const PetsPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // State for pets data
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for modals
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

    // State for notifications
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    });

    // Load pets data
    const fetchPets = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getWithAuth('/api/getMyPets');

            if (response.ok) {
                const data = await response.json();
                setPets(data.pet_list || []);
            } else {
                const errorData = await response.json();
                if (response.status === 404) {
                    // User has no pets, not an error condition
                    setPets([]);
                } else {
                    setError(errorData.msg || 'Nie udało się pobrać danych zwierząt');
                }
            }
        } catch (err) {
            setError('Wystąpił błąd podczas pobierania danych zwierząt');
            console.error('Error fetching pets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    // Handle success from PetFormModal
    const handlePetAddSuccess = () => {
        setNotification({
            open: true,
            message: 'Zwierzak został dodany pomyślnie!',
            severity: 'success',
        });
        fetchPets(); // Refresh pets list
    };

    // Handle error from PetFormModal
    const handlePetAddError = (errorMessage: string) => {
        setNotification({
            open: true,
            message: errorMessage,
            severity: 'error',
        });
    };

    const handleDeletePet = async () => {
        if (!selectedPetId) return;

        try {
            const response = await postWithAuth(`/api/deletePet/${selectedPetId}`, {});

            if (response.ok) {
                setNotification({
                    open: true,
                    message: 'Zwierzak został usunięty',
                    severity: 'info',
                });
                fetchPets(); // Refresh pets list
            } else {
                const errorData = await response.json();
                setNotification({
                    open: true,
                    message: errorData.msg || 'Nie udało się usunąć zwierzaka',
                    severity: 'error',
                });
            }
        } catch (err) {
            setNotification({
                open: true,
                message: 'Wystąpił błąd podczas usuwania zwierzaka',
                severity: 'error',
            });
            console.error('Error deleting pet:', err);
        } finally {
            setOpenDeleteDialog(false);
            setSelectedPetId(null);
        }
    };

    // Modal handlers
    const handleOpenAddModal = () => {
        setOpenAddModal(true);
    };

    const handleCloseAddModal = () => {
        setOpenAddModal(false);
    };

    const handleOpenDeleteDialog = (petId: number) => {
        setSelectedPetId(petId);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedPetId(null);
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{
            maxWidth: 1200,
            mx: 'auto',
            p: { xs: 2, md: 4 },
            minHeight: '100vh'
        }}>
            {/* Header */}
            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        opacity: 0.1,
                        transform: 'rotate(15deg)',
                    }}
                >
                    <PetsIcon sx={{ fontSize: 150 }} />
                </Box>

                <Typography variant="h4" component="h1" fontWeight="bold">
                    Moje zwierzaki
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                    Zarządzaj swoimi zwierzakami i dodawaj nowe
                </Typography>
            </Paper>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<ArrowBackIcon />}
                    component={Link}
                    to='/dashboard'
                    sx={{
                        borderRadius: 2,
                        py: 1,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        },
                    }}
                >
                    Powrót do panelu
                </Button>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddModal}
                    sx={{
                        borderRadius: 2,
                        py: 1,
                        boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
                        transition: 'all 0.3s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px 0 rgba(76, 175, 80, 0.6)',
                        }
                    }}
                >
                    Dodaj zwierzaka
                </Button>
            </Box>

            {/* Content */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                    {error}
                </Alert>
            ) : pets.length === 0 ? (
                <Paper
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                >
                    <PetsIcon color="disabled" sx={{ fontSize: 60, mb: 2, opacity: 0.6 }} />
                    <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
                        Nie masz jeszcze żadnych zwierząt
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Dodaj swojego pierwszego pupila, aby móc tworzyć ogłoszenia
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddModal}
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            py: 1.5,
                            px: 3,
                            boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
                        }}
                    >
                        Dodaj zwierzaka
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {pets.map((pet) => (
                        <Grid item xs={12} sm={6} md={4} key={pet.pet_id}>
                            <PetCard
                                pet={pet}
                                size="medium"
                                showDeleteButton={true}
                                onDelete={(petId) => handleOpenDeleteDialog(petId)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add Pet Modal */}
            <PetFormModal
                open={openAddModal}
                onClose={handleCloseAddModal}
                onSuccess={handlePetAddSuccess}
                onError={handlePetAddError}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1,
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Potwierdź usunięcie</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Czy na pewno chcesz usunąć tego zwierzaka? Ta operacja jest nieodwracalna.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleDeletePet}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 4px 14px 0 rgba(211, 47, 47, 0.3)',
                        }}
                    >
                        Usuń
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PetsPage;