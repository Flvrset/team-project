import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale/pl';
import { useState, useEffect, useRef } from 'react';

import { PET_SIZES, PET_TYPES, PetSize, PetType } from '../types';
import { postWithAuth } from '../utils/auth';

export interface PetFormData {
    pet_name: string;
    type: PetType;
    race: string;
    size: PetSize;
    birth_month: number;
    birth_year: number;
}

const initialFormData: PetFormData = {
    pet_name: '',
    type: 'Pies',
    race: '',
    size: 'Średni',
    birth_month: new Date().getMonth() + 1,
    birth_year: new Date().getFullYear() - 1,
};

interface PetFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onError?: (message: string) => void;
    title?: string;
    submitLabel?: string;
}

const PetFormModal = ({
    open,
    onClose,
    onSuccess,
    onError = () => {},
    title = 'Dodaj nowego zwierzaka',
    submitLabel = 'Dodaj zwierzaka',
}: PetFormModalProps) => {
    const theme = useTheme();
    const [formData, setFormData] = useState<PetFormData>(initialFormData);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [birthDate, setBirthDate] = useState<Date | null>(
        new Date(initialFormData.birth_year, initialFormData.birth_month - 1, 15)
    );
    
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [photoError, setPhotoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setFormData(initialFormData);
            setBirthDate(new Date(initialFormData.birth_year, initialFormData.birth_month - 1, 15));
            setFormError(null);
            setPhotoFile(null);
            setPhotoPreview('');
            setPhotoError(null);
        }
    }, [open]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
        const { name, value } = e.target;
        if (name) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setBirthDate(date);
            setFormData(prev => ({
                ...prev,
                birth_month: date.getMonth() + 1,
                birth_year: date.getFullYear()
            }));
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            setPhotoError('Zdjęcie musi być mniejsze niż 1MB');
            return;
        }

        setPhotoError(null);

        setPhotoFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview('');
        setPhotoError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
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

        if (!formData.birth_month || !formData.birth_year) {
            setFormError('Miesiąc i rok urodzenia są wymagane');
            return false;
        }

        const currentYear = new Date().getFullYear();
        if (formData.birth_year < 1900 || formData.birth_year > currentYear) {
            setFormError(`Rok urodzenia musi być pomiędzy 1900 a ${currentYear}`);
            return false;
        }

        if (photoError) {
            setFormError(photoError);
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
            const formattedDate = birthDate ?
                format(birthDate, 'yyyy-MM-dd') :
                `${formData.birth_year}-${String(formData.birth_month).padStart(2, '0')}-15`;
            
            const formDataToSend = new FormData();
            
            const petData = {
                pet_name: formData.pet_name,
                type: formData.type,
                race: formData.race,
                size: formData.size,
                birth_date: formattedDate,
            };
            
            formDataToSend.append('json', JSON.stringify(petData));
            
            if (photoFile) {
                formDataToSend.append('photo', photoFile);
            }

            const response = await postWithAuth('/api/addPet', formDataToSend);

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
                    maxHeight: '90vh',
                    overflowY: 'auto',
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

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 3,
                        mt: 3
                    }}>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 2 }}
                        >
                            Zdjęcie zwierzaka
                        </Typography>

                        <Box
                            sx={{
                                position: 'relative',
                                width: 150,
                                height: 150,
                                mb: 1
                            }}
                        >
                            {photoPreview ? (
                                <Box
                                    component="img"
                                    src={photoPreview}
                                    alt="Zdjęcie zwierzaka"
                                    onError={() => {
                                        setPhotoPreview('');
                                    }}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        borderRadius: 2,
                                        objectFit: 'cover',
                                        border: `3px solid ${theme.palette.primary.main}`,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                        }
                                    }}
                                    onClick={handlePhotoClick}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: alpha(theme.palette.primary.light, 0.1),
                                        border: `2px dashed ${theme.palette.primary.main}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.light, 0.2),
                                            transform: 'scale(1.05)',
                                        }
                                    }}
                                    onClick={handlePhotoClick}
                                >
                                    <PetsIcon
                                        sx={{
                                            fontSize: 50,
                                            color: theme.palette.primary.main,
                                            opacity: 0.7
                                        }}
                                    />
                                </Box>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handlePhotoChange}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handlePhotoClick}
                                startIcon={<AddAPhotoIcon />}
                                sx={{ borderRadius: 2 }}
                            >
                                {photoPreview ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'}
                            </Button>

                            {photoPreview && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={handleRemovePhoto}
                                    startIcon={<DeleteIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Usuń
                                </Button>
                            )}
                        </Box>

                        {photoError && (
                            <Typography
                                variant="caption"
                                color="error"
                                sx={{ mt: 1 }}
                            >
                                {photoError}
                            </Typography>
                        )}

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 1, textAlign: 'center' }}
                        >
                            Dodaj zdjęcie zwierzaka (maks. 1MB)
                        </Typography>
                    </Box>

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
                            {PET_TYPES.map((type) => (
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
                            {PET_SIZES.map((size) => (
                                <MenuItem key={size} value={size}>
                                    {size}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
                        <DatePicker
                            views={['year', 'month']}
                            label="Miesiąc i rok urodzenia"
                            value={birthDate}
                            onChange={handleDateChange}
                            format="MM/yyyy"
                            disableFuture
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    sx: {
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    },
                                    margin: "normal"
                                },
                            }}
                        />
                    </LocalizationProvider>

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