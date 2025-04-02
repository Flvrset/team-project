import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PetsIcon from '@mui/icons-material/Pets';
import ReportIcon from '@mui/icons-material/Report';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { 
  Box, Typography, Container, Grid, Card, CardContent, 
  Button, CircularProgress, Paper, Divider,
  CardActionArea, CardActions
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getWithAuth } from '../../utils/auth';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  pendingReports: number;
  bannedUsers: number;
}

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    pendingReports: 0,
    bannedUsers: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const reportsResponse = await getWithAuth('/api/adminPanel/reports');
        
        if (reportsResponse.ok) {
          const reports = await reportsResponse.json();
          if (Array.isArray(reports)) {
            setStats(prev => ({ ...prev, pendingReports: reports.length }));
          }
        }
        
        // We could add more API calls here to fetch other stats
        // For now, we'll use dummy data for the rest
        setStats(prev => ({
          ...prev,
          totalUsers: 120,
          totalPosts: 345,
          bannedUsers: 5
        }));
      } catch (error) {
        console.error('Błąd podczas pobierania statystyk:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const navigateToReports = () => {
    navigate('/admin/reports');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Panel Administracyjny
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Przegląd Systemu
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#bbdefb', height: '100%' }}>
                    <CardContent>
                      <PeopleAltIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalUsers}
                      </Typography>
                      <Typography variant="body1">
                        Użytkownicy
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#c8e6c9', height: '100%' }}>
                    <CardContent>
                      <PetsIcon sx={{ fontSize: 40, color: '#388e3c', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalPosts}
                      </Typography>
                      <Typography variant="body1">
                        Ogłoszenia
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#ffecb3', height: '100%' }}>
                    <CardContent>
                      <ReportIcon sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {stats.pendingReports}
                      </Typography>
                      <Typography variant="body1">
                        Zgłoszenia
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#ffcdd2', height: '100%' }}>
                    <CardContent>
                      <WarningAmberIcon sx={{ fontSize: 40, color: '#d32f2f', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {stats.bannedUsers}
                      </Typography>
                      <Typography variant="body1">
                        Zablokowani
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ mt: 4, mb: 2 }}>
              Zarządzanie Systemem
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea sx={{ flexGrow: 1, p: 2 }} onClick={navigateToReports}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                      <ReportIcon sx={{ fontSize: 60, color: '#f57c00', mb: 2 }} />
                      <Typography variant="h6" align="center">
                        Zgłoszenia Użytkowników
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Przeglądaj i reaguj na zgłoszenia użytkowników
                      </Typography>
                    </Box>
                  </CardActionArea>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="warning" 
                      onClick={navigateToReports}
                      startIcon={<ReportIcon />}
                    >
                      Przejdź do zgłoszeń {stats.pendingReports > 0 && `(${stats.pendingReports})`}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                      <PeopleAltIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                      <Typography variant="h6" align="center">
                        Zarządzanie Użytkownikami
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Przeglądaj i zarządzaj kontami użytkowników
                      </Typography>
                    </Box>
                  </CardActionArea>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      startIcon={<PeopleAltIcon />}
                    >
                      Zarządzaj użytkownikami
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                      <PetsIcon sx={{ fontSize: 60, color: '#388e3c', mb: 2 }} />
                      <Typography variant="h6" align="center">
                        Zarządzanie Ogłoszeniami
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Przeglądaj i moderuj ogłoszenia w serwisie
                      </Typography>
                    </Box>
                  </CardActionArea>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="success"
                      startIcon={<PetsIcon />}
                    >
                      Zarządzaj ogłoszeniami
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;