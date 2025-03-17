import DashboardIcon from '@mui/icons-material/Dashboard';
import { Box, Button, Typography } from '@mui/material';

import { useAuth } from '../hooks/AuthProvider';


const DashboardPage = () => {
    const auth = useAuth();

    return (
        <>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Witaj, {auth.userData?.name}! Oto Twój panel główny w aplikacji PetBuddies.
            </Typography>

            <Box
                sx={{
                    mt: 4,
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    minHeight: '300px'
                }}
            >
                <DashboardIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.7 }} />
                <Typography variant="h5" align="center" gutterBottom>
                    Twój panel zarządzania
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                    Tutaj będą dostępne funkcje zarządzania Twoimi zwierzętami i ogłoszeniami.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        mt: 4,
                        borderRadius: 2,
                        px: 4,
                        py: 1
                    }}
                >
                    Dodaj ogłoszenie
                </Button>
            </Box>
        </>
    );
};

export default DashboardPage;