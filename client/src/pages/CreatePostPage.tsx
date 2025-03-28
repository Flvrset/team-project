import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaidIcon from '@mui/icons-material/Paid';
import PetsIcon from '@mui/icons-material/Pets';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    FormHelperText,
    Alert,
    CircularProgress,
    InputAdornment,
    alpha,
    useTheme
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale/pl';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PetCard from '../components/PetCard';
import PetFormModal from '../components/PetFormModal';
import { useNotification } from '../contexts/NotificationContext';
import { Pet } from '../types';
import { getWithAuth, postWithAuth } from '../utils/auth';
import { combineDateAndTime } from '../utils/utils';

interface FormData {
    startDate: Date | null;
    endDate: Date | null;
    startTime: Date | null;
    endTime: Date | null;
    description: string;
    cost: string;
    selectedPets: number[];
}

const CreatePostPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState<FormData>({
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
        description: '',
        cost: '',
        selectedPets: []
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [pets, setPets] = useState<Pet[]>([]);
    const [loadingPets, setLoadingPets] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [openPetModal, setOpenPetModal] = useState(false);

    const fetchPets = async () => {
        setLoadingPets(true);

        try {
            const response = await getWithAuth('/api/getMyPets');

            if (response.ok) {
                const data = await response.json();
                setPets(data || []);
            } else {
                const errorData = await response.json();
                showNotification(errorData.msg || 'Nie udało się pobrać danych zwierząt', 'error');

            }
        } catch (err) {
            console.error('Error fetching pets:', err);
            showNotification('Wystąpił błąd podczas pobierania danych zwierząt', 'error');
        } finally {
            setLoadingPets(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDateChange = (field: 'startDate' | 'endDate', value: Date | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleTimeChange = (field: 'startTime' | 'endTime', value: Date | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handlePetSelection = (petId: number) => {
        setFormData(prev => {
            const isSelected = prev.selectedPets.includes(petId);

            return {
                ...prev,
                selectedPets: isSelected
                    ? prev.selectedPets.filter(id => id !== petId)
                    : [...prev.selectedPets, petId]
            };
        });

        if (formErrors.selectedPets) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.selectedPets;
                return newErrors;
            });
        }
    };

    const handleOpenPetModal = () => {
        setOpenPetModal(true);
    };

    const handleClosePetModal = () => {
        setOpenPetModal(false);
    };

    const handlePetAddSuccess = () => {
        showNotification('Zwierzak został dodany pomyślnie!', 'success');
        fetchPets();
        setOpenPetModal(false);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        const now = new Date();

        if (!formData.startDate) {
            errors.startDate = 'Data początkowa jest wymagana';
        } else if (formData.startDate < new Date(now.setHours(0, 0, 0, 0))) {
            errors.startDate = 'Data początkowa nie może być wcześniejsza niż dzisiaj';
        }

        if (!formData.endDate) {
            errors.endDate = 'Data końcowa jest wymagana';
        } else if (formData.startDate && formData.endDate < formData.startDate) {
            errors.endDate = 'Data końcowa musi być późniejsza niż data początkowa';
        }

        if (!formData.startTime) {
            errors.startTime = 'Godzina początkowa jest wymagana';
        }

        if (!formData.endTime) {
            errors.endTime = 'Godzina końcowa jest wymagana';
        }

        if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
            const startDateTime = combineDateAndTime(formData.startDate, formData.startTime);
            const endDateTime = combineDateAndTime(formData.endDate, formData.endTime);

            if (startDateTime && endDateTime && startDateTime >= endDateTime) {
                errors.endTime = 'Czas zakończenia musi być późniejszy niż czas rozpoczęcia';
            }
        }

        if (formData.selectedPets.length === 0) {
            errors.selectedPets = 'Wybierz co najmniej jednego zwierzaka';
        }

        const costValue = parseFloat(formData.cost);
        if (!formData.cost) {
            errors.cost = 'Stawka godzinowa jest wymagana';
        } else if (isNaN(costValue) || costValue <= 0) {
            errors.cost = 'Stawka musi być liczbą większą od 0';
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const startDateFormatted = formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : '';
            const endDateFormatted = formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : '';
            const startTimeFormatted = formData.startTime ? format(formData.startTime, 'HH:mm') : '';
            const endTimeFormatted = formData.endTime ? format(formData.endTime, 'HH:mm') : '';

            const response = await postWithAuth('/api/createPost', {
                start_date: startDateFormatted,
                end_date: endDateFormatted,
                start_time: startTimeFormatted,
                end_time: endTimeFormatted,
                description: formData.description,
                cost: parseFloat(formData.cost),
                pet_list: formData.selectedPets.map(petId => ({ pet_id: petId }))
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(data.msg || 'Ogłoszenie zostało utworzone pomyślnie!', 'success');

                setFormData({
                    startDate: null,
                    endDate: null,
                    startTime: null,
                    endTime: null,
                    description: '',
                    cost: '',
                    selectedPets: []
                });
                navigate('/dashboard');
            } else {
                const errorData = await response.json();
                showNotification(errorData.msg || 'Nie udało się utworzyć ogłoszenia', 'error');
            }
        } catch (err) {
            console.error('Error creating post:', err);
            showNotification('Wystąpił błąd podczas tworzenia ogłoszenia', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
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
                        Utwórz nowe ogłoszenie
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                        Wypełnij formularz, aby utworzyć ogłoszenie opieki nad zwierzakiem
                    </Typography>
                </Paper>

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
                        Powrót
                    </Button>
                </Box>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <EventNoteIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                                    Termin i koszt opieki
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <DatePicker
                                            label="Data początkowa"
                                            value={formData.startDate}
                                            onChange={(date) => handleDateChange('startDate', date)}
                                            disablePast
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!formErrors.startDate,
                                                    helperText: formErrors.startDate,
                                                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <DatePicker
                                            label="Data końcowa"
                                            value={formData.endDate}
                                            onChange={(date) => handleDateChange('endDate', date)}
                                            disablePast
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!formErrors.endDate,
                                                    helperText: formErrors.endDate,
                                                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TimePicker
                                            label="Godzina początkowa"
                                            value={formData.startTime}
                                            onChange={(time) => handleTimeChange('startTime', time)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!formErrors.startTime,
                                                    helperText: formErrors.startTime,
                                                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TimePicker
                                            label="Godzina końcowa"
                                            value={formData.endTime}
                                            onChange={(time) => handleTimeChange('endTime', time)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!formErrors.endTime,
                                                    helperText: formErrors.endTime,
                                                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Stawka godzinowa (PLN)"
                                            name="cost"
                                            type="number"
                                            value={formData.cost}
                                            onChange={handleInputChange}
                                            error={!!formErrors.cost}
                                            helperText={formErrors.cost}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PaidIcon color="primary" />
                                                    </InputAdornment>
                                                ),
                                                inputProps: { min: 0, step: 0.01 }
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2
                                                }
                                            }}
                                        />
                                        <FormHelperText>
                                            Podaj stawkę godzinową za opiekę nad zwierzakiem
                                        </FormHelperText>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Opis (opcjonalnie)"
                                            name="description"
                                            multiline
                                            rows={4}
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Dodaj dodatkowe informacje dla opiekuna..."
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PetsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                                        Wybierz zwierzęta
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenPetModal}
                                        sx={{
                                            borderRadius: 2,
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            },
                                        }}
                                    >
                                        Dodaj nowego
                                    </Button>
                                </Box>

                                {loadingPets ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : pets.length === 0 ? (
                                    <Box
                                        sx={{
                                            p: 4,
                                            textAlign: 'center',
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 3,
                                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                        }}
                                    >
                                        <PetsIcon color="disabled" sx={{ fontSize: 60, mb: 2, opacity: 0.6 }} />
                                        <Typography variant="h6" gutterBottom color="text.secondary">
                                            Nie masz jeszcze żadnych zwierząt
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Dodaj swojego pierwszego pupila, aby móc tworzyć ogłoszenia
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleOpenPetModal}
                                            sx={{
                                                mt: 2,
                                                borderRadius: 2,
                                                py: 1,
                                                px: 3,
                                                boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
                                            }}
                                        >
                                            Dodaj zwierzaka
                                        </Button>
                                    </Box>
                                ) : (
                                    <>
                                        {formErrors.selectedPets && (
                                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                                {formErrors.selectedPets}
                                            </Alert>
                                        )}

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Wybierz zwierzęta, dla których szukasz opieki:
                                            </Typography>
                                        </Box>

                                        <Box sx={{ overflow: 'auto', flex: 1 }}>
                                            <Grid container spacing={2}>
                                                {pets.map((pet) => (
                                                    <Grid item xs={12} sm={6} key={pet.pet_id}>
                                                        <PetCard
                                                            pet={pet}
                                                            size="small"
                                                            selected={formData.selectedPets.includes(pet.pet_id)}
                                                            onSelect={handlePetSelection}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    </>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={submitting || pets.length === 0}
                            sx={{
                                py: 1.5,
                                px: 6,
                                borderRadius: 2,
                                boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px 0 rgba(76, 175, 80, 0.6)',
                                }
                            }}
                        >
                            {submitting ? <CircularProgress size={24} /> : 'Utwórz ogłoszenie'}
                        </Button>
                    </Box>
                </Box>

                <PetFormModal
                    open={openPetModal}
                    onClose={handleClosePetModal}
                    onSuccess={handlePetAddSuccess}
                />
            </Box>
        </LocalizationProvider>
    );
};

export default CreatePostPage;