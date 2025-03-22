import CloseIcon from '@mui/icons-material/Close';
import PetsIcon from '@mui/icons-material/Pets';
import {
    Box,
    Typography,
    Button,
    Modal,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    IconButton,
    useTheme,
    alpha,
    InputAdornment,
    SelectChangeEvent,
    Backdrop,
} from '@mui/material';
import { useState, useEffect } from 'react';

import { postWithAuth } from '../utils/auth';

// Type definitions
type PetSize = 'Mały' | 'Średni' | 'Duży';
type PetType = 'Pies' | 'Kot' | 'Królik' | 'Papuga' | 'Fretka' | 'Inne';

export interface PetFormData {
    pet_name: string;
    type: string;
    race: string;
    size: PetSize;
    age: string;
}

const initialFormData: PetFormData = {
    pet_name: '',
    type: '',
    race: '',
    size: 'Średni',
    age: '',
};

// Pet type options
const petTypes: PetType[] = ['Pies', 'Kot', 'Królik', 'Papuga', 'Fretka', 'Inne'];
const petSizes: PetSize[] = ['Mały', 'Średni', 'Duży'];

interface PetFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onError: (message: string) => void;
    title?: string;
    submitLabel?: string;
}

const PetFormModal = ({
    open,
    onClose,
    onSuccess,
    onError,
    title = 'Dodaj nowego zwierzaka',
    submitLabel = 'Dodaj zwierzaka',
}: PetFormModalProps) => {
    const theme = useTheme();
    const [formData, setFormData] = useState<PetFormData>(initialFormData);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            // Reset form when modal opens
            setFormData(initialFormData);
            setFormError(null);
        }
    }, [open]);

    // Form handlers
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
        const { name, value } = e.target;
        if (name) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = (): boolean => {
        if (!formData.pet_name.trim()) {
            setFormError('Imię zwierzaka jest wymagane');
            return false;
        }

        if (!formData.type) {
            setFormError('Rodzaj zwierzaka jest wymagany');
            return false;
        }

        if (!formData.race.trim()) {
            setFormError('Rasa jest wymagana');
            return false;
        }

        if (!formData.size) {
            setFormError('Rozmiar jest wymagany');
            return false;
        }

        if (!formData.age.trim() || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
            setFormError('Wiek musi być liczbą większą od 0');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setFormSubmitting(true);
        setFormError(null);

        try {
            const response = await postWithAuth('/api/addPet', {
                pet_name: formData.pet_name,
                type: formData.type,
                race: formData.race,
                size: formData.size,
                age: parseInt(formData.age, 10),
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.msg || 'Nie udało się dodać zwierzaka';
                setFormError(errorMessage);
                onError(errorMessage);
            }
        } catch (err) {
            const errorMessage = 'Wystąpił błąd podczas dodawania zwierzaka';
            setFormError(errorMessage);
            onError(errorMessage);
            console.error('Error adding pet:', err);
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: alpha(theme.palette.background.paper, 0.7),
                        backdropFilter: 'blur(4px)',
                    },
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 500 },
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 24,
                    p: 0,
                    outline: 'none',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="h5" component="h2" fontWeight="bold">
                        {title}
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{ color: 'white' }}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {formError}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        required
                        label="Imię zwierzaka"
                        name="pet_name"
                        value={formData.pet_name}
                        onChange={handleFormChange}
                        margin="normal"
                        error={formData.pet_name.trim() === '' && formData.pet_name !== ''}
                        helperText={formData.pet_name.trim() === '' && formData.pet_name !== '' ? 'Imię nie może być puste' : ''}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PetsIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="pet-type-label">Rodzaj zwierzaka *</InputLabel>
                        <Select
                            labelId="pet-type-label"
                            id="pet-type"
                            name="type"
                            value={formData.type}
                            onChange={handleFormChange}
                            required
                            label="Rodzaj zwierzaka *"
                            sx={{ borderRadius: 2 }}
                        >
                            {petTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        required
                        label="Rasa"
                        name="race"
                        value={formData.race}
                        onChange={handleFormChange}
                        margin="normal"
                        error={formData.race.trim() === '' && formData.race !== ''}
                        helperText={formData.race.trim() === '' && formData.race !== '' ? 'Rasa nie może być pusta' : ''}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                        slotProps={{
                            htmlInput: { maxLength: 100 }
                        }}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="pet-size-label">Rozmiar *</InputLabel>
                        <Select
                            labelId="pet-size-label"
                            id="pet-size"
                            name="size"
                            value={formData.size}
                            onChange={handleFormChange}
                            required
                            label="Rozmiar *"
                            sx={{ borderRadius: 2 }}
                        >
                            {petSizes.map((size) => (
                                <MenuItem key={size} value={size}>
                                    {size}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        required
                        label="Wiek (w latach)"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleFormChange}
                        margin="normal"
                        helperText={
                            formData.age !== '' && (
                                isNaN(Number(formData.age))
                                    ? 'Wiek musi być liczbą'
                                    : Number(formData.age) < 1
                                        ? 'Wiek musi być większy od 0'
                                        : Number(formData.age) > 100
                                            ? 'Maksymalny wiek to 100 lat'
                                            : ''
                            )
                        }
                        inputProps={{ min: 1, max: 100, step: 1 }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            Anuluj
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={formSubmitting}
                            sx={{
                                borderRadius: 2,
                                boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
                            }}
                        >
                            {formSubmitting ? <CircularProgress size={24} /> : submitLabel}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default PetFormModal;