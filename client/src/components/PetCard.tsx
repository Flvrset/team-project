import DeleteIcon from '@mui/icons-material/Delete';
import PetsIcon from '@mui/icons-material/Pets';
import { 
    Box, 
    Card, 
    CardContent, 
    CardActions,
    Typography, 
    Divider,
    Button,
    Tooltip,
    alpha,
    useTheme 
} from '@mui/material';

import { Pet, PetType } from '../types';

interface PetCardProps {
    pet: Pet;
    size?: 'small' | 'medium';
    selected?: boolean;
    onSelect?: (petId: number) => void;
    onDelete?: (petId: number) => void;
    showDeleteButton?: boolean;
}

const PetCard: React.FC<PetCardProps> = ({ 
    pet, 
    size = 'medium', 
    selected = false, 
    onSelect,
    onDelete,
    showDeleteButton = false
}) => {
    const theme = useTheme();
    
    // Get pet icon color
    const getPetIconColor = (type: PetType) => {
        switch (type) {
            case 'Pies':
                return theme.palette.primary.main;
            case 'Kot':
                return theme.palette.secondary.main;
            case 'Królik':
                return theme.palette.info.main;
            case 'Papuga':
                return theme.palette.success.main;
            case 'Fretka':
                return theme.palette.warning.main;
            default:
                return theme.palette.grey[500];
        }
    };

    const petAge: number = new Date().getFullYear() - new Date(pet.birth_date).getFullYear();
    
    const handleClick = () => {
        if (onSelect) {
            onSelect(pet.pet_id);
        }
    };
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card selection when clicking delete
        if (onDelete) {
            onDelete(pet.pet_id);
        }
    };
    
    const iconColor = getPetIconColor(pet.type);
    
    if (size === 'small') {
        return (
            <Card 
                sx={{
                    borderRadius: 2,
                    border: selected 
                        ? `2px solid ${iconColor}` 
                        : `1px solid ${theme.palette.divider}`,
                    boxShadow: selected 
                        ? `0 4px 12px ${alpha(iconColor, 0.3)}` 
                        : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: `inset 0 6px 16px ${alpha(iconColor, 0.2)}`,
                    }
                }}
                onClick={handleClick}
            >
                {pet.photo ? (
                    <Box sx={{ 
                        height: 80, 
                        width: '100%', 
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <Box 
                            component="img"
                            src={pet.photo}
                            alt={pet.pet_name}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.style.display = 'none';
                            }}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            height: 8,
                            width: '100%',
                            backgroundColor: iconColor,
                        }}
                    />
                )}
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 36,
                                width: 36,
                                borderRadius: '50%',
                                backgroundColor: alpha(iconColor, 0.1),
                                mr: 1.5,
                            }}
                        >
                            <PetsIcon sx={{
                                fontSize: 20,
                                color: iconColor
                            }} />
                        </Box>
                        <Typography variant="h6" fontWeight="600">
                            {pet.pet_name}
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 1.5 }} />
                    
                    <Typography variant="body2" color="text.secondary">
                        <strong>{pet.type}</strong> • {pet.race}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {pet.size} • {petAge} {petAge === 1 ? 'rok' : petAge < 5 ? 'lata' : 'lat'}
                    </Typography>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {pet.photo ? (
                <Box sx={{ 
                    height: 180, 
                    width: '100%', 
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <Box 
                        component="img"
                        src={pet.photo}
                        alt={pet.pet_name}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                const fallbackStripe = document.createElement('div');
                                fallbackStripe.style.height = '8px';
                                fallbackStripe.style.width = '100%';
                                fallbackStripe.style.backgroundColor = iconColor;
                                parent.appendChild(fallbackStripe);
                            }
                        }}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </Box>
            ) : (
                <Box
                    sx={{
                        height: 8,
                        width: '100%',
                        backgroundColor: iconColor,
                    }}
                />
            )}
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 48,
                            width: 48,
                            borderRadius: '50%',
                            backgroundColor: alpha(iconColor, 0.1),
                            mr: 2,
                        }}
                    >
                        <PetsIcon sx={{
                            fontSize: 28,
                            color: iconColor
                        }} />
                    </Box>
                    <Typography variant="h5" component="h2" fontWeight="600">
                        {pet.pet_name}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body1">
                        <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{pet.type}</Box>
                    </Typography>
                    <Typography variant="body1">
                        <Box component="span" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Rasa:</Box> {pet.race}
                    </Typography>
                    <Typography variant="body1">
                        <Box component="span" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Rozmiar:</Box> {pet.size}
                    </Typography>
                    <Typography variant="body1">
                        <Box component="span" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Wiek:</Box> {petAge} {petAge === 1 ? 'rok' : petAge < 5 ? 'lata' : 'lat'}
                    </Typography>
                </Box>
            </CardContent>
            
            {showDeleteButton && (
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                    <Tooltip title="Usuń zwierzaka">
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                            sx={{
                                borderRadius: 2,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                                }
                            }}
                        >
                            Usuń
                        </Button>
                    </Tooltip>
                </CardActions>
            )}
        </Card>
    );
};

export default PetCard;