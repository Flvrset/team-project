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

// Type definitions
interface Pet {
    pet_id: number;
    pet_name: string;
    type: string;
    race: string;
    size: string;
    age: number;
}

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
    const getPetIconColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'pies':
                return theme.palette.primary.main;
            case 'kot':
                return theme.palette.secondary.main;
            case 'królik':
                return theme.palette.info.main;
            case 'papuga':
                return theme.palette.success.main;
            case 'fretka':
                return theme.palette.warning.main;
            default:
                return theme.palette.grey[500];
        }
    };
    
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
    
    // Small variant (for selection in CreatePostPage)
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
                        transform: 'translateY(-4px)',
                        boxShadow: `0 6px 16px ${alpha(iconColor, 0.2)}`,
                    }
                }}
                onClick={handleClick}
            >
                <Box
                    sx={{
                        height: 8,
                        width: '100%',
                        backgroundColor: iconColor,
                    }}
                />
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
                        {pet.size} • {pet.age} {pet.age === 1 ? 'rok' : pet.age < 5 ? 'lata' : 'lat'}
                    </Typography>
                </CardContent>
            </Card>
        );
    }
    
    // Medium variant (for PetsPage)
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
            <Box
                sx={{
                    height: 8,
                    width: '100%',
                    backgroundColor: iconColor,
                }}
            />
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
                        <Box component="span" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Wiek:</Box> {pet.age} {pet.age === 1 ? 'rok' : pet.age < 5 ? 'lata' : 'lat'}
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