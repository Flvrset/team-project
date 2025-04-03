import ReportIcon from '@mui/icons-material/Report';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    CircularProgress,
    useTheme,
    alpha,
    Fade,
    Paper,
} from '@mui/material';
import { useState, useEffect } from 'react';

import { useNotification } from '../contexts/NotificationContext';
import { getWithAuth, postWithAuth } from '../utils/auth';

interface ReportType {
    report_type_id: number;
    report_type_name: string;
}

interface ReportUserModalProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

const DESCRIPTION_MAX_LENGTH = 500;

const ReportUserModal = ({ open, onClose, userId }: ReportUserModalProps) => {
    const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
    const [selectedType, setSelectedType] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);
    const { showNotification } = useNotification();
    const theme = useTheme();

    useEffect(() => {
        const fetchReportTypes = async () => {
            setLoading(true);
            try {
                const response = await getWithAuth('/api/getReportTypes');
                if (response.ok) {
                    const data = await response.json();
                    setReportTypes(data);
                } else {
                    showNotification('Nie udało się pobrać typów zgłoszeń', 'error');
                }
            } catch {
                showNotification('Wystąpił błąd podczas ładowania typów zgłoszeń', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchReportTypes();
        }
    }, [open, showNotification]);

    const validateDescription = (text: string): string | undefined => {
        if (text.length > DESCRIPTION_MAX_LENGTH) {
            return `Opis nie może przekraczać ${DESCRIPTION_MAX_LENGTH} znaków`;
        }
        return undefined;
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setDescription(newValue);
        setDescriptionError(validateDescription(newValue));
    };

    const handleSubmit = async () => {
        if (!selectedType) {
            showNotification('Wybierz powód zgłoszenia', 'error');
            return;
        }

        const descValidationError = validateDescription(description);
        if (descValidationError) {
            setDescriptionError(descValidationError);
            return;
        }

        setSubmitting(true);
        try {
            const response = await postWithAuth(`/api/user/${userId}/report`, {
                report_type_id: selectedType,
                description: description || null
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(data.msg, 'success');
                handleClose();
            } else {
                const error = await response.json();
                showNotification(error.msg || 'Nie udało się zgłosić użytkownika', 'error');
            }
        } catch {
            showNotification('Wystąpił błąd podczas zgłaszania użytkownika', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedType('');
        setDescription('');
        setDescriptionError(undefined);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Fade}
            transitionDuration={300}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                }
            }}
        >
            <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
                pt: 2,
                pb: 2.5,
                px: 3,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        bgcolor: 'white',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                    }}>
                        <ReportIcon color="error" fontSize="large" />
                    </Box>
                    <DialogTitle sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        fontWeight: 'bold',
                        p: 0,
                        color: 'white'
                    }}>
                        Zgłoś użytkownika
                    </DialogTitle>
                </Box>
            </Box>

            <DialogContent sx={{ p: { xs: 2, sm: 3 }, mt: 1 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 1.5, sm: 2.5 },
                                mb: 3,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.warning.light, 0.1),
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5
                            }}
                        >
                            <WarningAmberIcon color="warning" sx={{ mt: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                                Zgłaszanie użytkowników pomaga nam utrzymać bezpieczną społeczność.
                                Twoje zgłoszenie zostanie dokładnie rozpatrzone przez nasz zespół.
                                Pamiętaj, by podać dokładne informacje dotyczące naruszenia.
                            </Typography>
                        </Paper>

                        <FormControl
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 3 }}
                            required
                            error={selectedType === ''}
                        >
                            <InputLabel id="report-type-label">Powód zgłoszenia</InputLabel>
                            <Select
                                labelId="report-type-label"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as number)}
                                label="Powód zgłoszenia"
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 300,
                                            borderRadius: 2,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                            mt: 0.5,
                                            '& .MuiMenuItem-root': {
                                                py: 1.5
                                            }
                                        }
                                    }
                                }}
                                sx={{
                                    borderRadius: 2,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderWidth: 2,
                                        borderColor: theme.palette.primary.main
                                    }
                                }}
                            >
                                {reportTypes.map((type) => (
                                    <MenuItem key={type.report_type_id} value={type.report_type_id}>
                                        {type.report_type_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Dodatkowy opis (opcjonalnie)"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={description}
                            onChange={handleDescriptionChange}
                            error={!!descriptionError}
                            helperText={descriptionError || "Opisz szczegóły zgłoszenia (maksymalnie 500 znaków)"}
                            placeholder="Podaj więcej informacji o naruszeniu..."
                            inputProps={{
                                maxLength: DESCRIPTION_MAX_LENGTH + 10
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderWidth: 2
                                }
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Typography
                                variant="caption"
                                color={description.length > DESCRIPTION_MAX_LENGTH ? 'error' : 'text.secondary'}
                                fontWeight={description.length > DESCRIPTION_MAX_LENGTH ? 'bold' : 'normal'}
                            >
                                {description.length}/{DESCRIPTION_MAX_LENGTH}
                            </Typography>
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 1 } }}>
                <Button
                    onClick={handleClose}
                    color="inherit"
                    disabled={submitting}
                    sx={{
                        borderRadius: 2,
                        px: 3
                    }}
                >
                    Anuluj
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="error"
                    disabled={loading || submitting || !selectedType || !!descriptionError || description.length > DESCRIPTION_MAX_LENGTH}
                    sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1,
                        boxShadow: '0 4px 12px rgba(211,47,47,0.3)',
                        '&:hover': {
                            boxShadow: '0 6px 16px rgba(211,47,47,0.4)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    {submitting ? (
                        <>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            Wysyłanie...
                        </>
                    ) : 'Zgłoś'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReportUserModal;