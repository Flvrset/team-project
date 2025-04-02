import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import ReportIcon from '@mui/icons-material/Report';
import {
  Box, Typography, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Grid, Card, CardContent, Avatar, Divider, Stack, IconButton,
  Link
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { User } from '../../types';
import { getWithAuth, putWithAuth } from '../../utils/auth';
import { formatTimeWithoutSeconds } from '../../utils/utils';

interface ReportType {
  report_id: number;
  who_user_id: number;
  whom_user_id: number;
  report_type_id: number;
  description: string;
  report_date: string;
  report_time: string;
  report_type_name: string;
}

interface Report {
  report: ReportType;
  reporter_user: User;
  reported_user: User;
}

const AdminReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<number[]>([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await getWithAuth('/api/adminPanel/reports');
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setReports(data);
        }
      } else {
        console.error('Nie udało się pobrać zgłoszeń');
      }
    } catch (error) {
      console.error('Błąd podczas pobierania zgłoszeń:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportDetails = (report: Report) => {
    setSelectedReport(report);
  };

  const handleCloseDetails = () => {
    setSelectedReport(null);
  };

  const handleOpenBanDialog = () => {
    if (selectedReport) {
      setBanDialogOpen(true);
    }
  };

  const handleCloseBanDialog = () => {
    setBanDialogOpen(false);
  };

  const handleBanUser = async () => {
    if (!selectedReport) return;

    setActionInProgress(true);
    try {
      const userId = selectedReport.reported_user.user_id;
      const response = await putWithAuth(`/api/adminPanel/reports/${userId}/ban`, {});
      
      if (response.ok) {
        setBannedUsers([...bannedUsers, userId]);
        setReports(reports.filter(r => r.reported_user.user_id !== userId));
        setBanDialogOpen(false);
        setSelectedReport(null);
      } else {
        console.error('Nie udało się zbanować użytkownika');
      }
    } catch (error) {
      console.error('Błąd podczas banowania użytkownika:', error);
    } finally {
      setActionInProgress(false);
    }
  };

  const goBack = () => {
    navigate('/admin');
  };

  const navigateToUserProfile = (userId: number) => {
    navigate(`/dashboard/users/${userId}`);
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year} ${formatTimeWithoutSeconds(timeStr)}`;
  };

  const getReportTypeName = (typeId: number, typeName: string) => {
    return typeName || 'Inne';
  };

  const getReportTypeColor = (typeId: number): 'error' | 'warning' | 'info' | 'default' => {
    switch(typeId) {
      case 1: return 'error';
      case 2: return 'warning';
      case 3: return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            sx={{ mr: 2 }} 
            onClick={goBack}
            color="primary"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Zgłoszenia Użytkowników
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {reports.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6">
                  Brak zgłoszeń do przeglądu
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Wszystkie zgłoszenia zostały rozpatrzone.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Typ zgłoszenia</TableCell>
                      <TableCell>Zgłaszający</TableCell>
                      <TableCell>Zgłoszony</TableCell>
                      <TableCell>Akcje</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.report.report_id} hover>
                        <TableCell>{report.report.report_id}</TableCell>
                        <TableCell>
                          {formatDate(report.report.report_date, report.report.report_time)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getReportTypeName(report.report.report_type_id, report.report.report_type_name)} 
                            color={getReportTypeColor(report.report.report_type_id)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Link 
                            component="button"
                            variant="body1"
                            onClick={() => navigateToUserProfile(report.reporter_user.user_id)}
                            sx={{ 
                              textDecoration: 'none', 
                              '&:hover': { 
                                textDecoration: 'underline', 
                                cursor: 'pointer' 
                              } 
                            }}
                          >
                            {report.reporter_user.name} {report.reporter_user.surname}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link 
                            component="button"
                            variant="body1"
                            onClick={() => navigateToUserProfile(report.reported_user.user_id)}
                            sx={{ 
                              textDecoration: 'none', 
                              '&:hover': { 
                                textDecoration: 'underline', 
                                cursor: 'pointer' 
                              } 
                            }}
                          >
                            {report.reported_user.name} {report.reported_user.surname}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleReportDetails(report)}
                          >
                            Szczegóły
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>

      {/* Report details dialog */}
      <Dialog 
        open={!!selectedReport} 
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        {selectedReport && (
          <>
            <DialogTitle sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>
              Szczegóły zgłoszenia #{selectedReport.report.report_id}
            </DialogTitle>
            <DialogContent sx={{ pt: 4 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Podstawowe informacje
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data zgłoszenia
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedReport.report.report_date, selectedReport.report.report_time)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Typ zgłoszenia
                  </Typography>
                  <Chip 
                    label={getReportTypeName(selectedReport.report.report_type_id, selectedReport.report.report_type_name)} 
                    color={getReportTypeColor(selectedReport.report.report_type_id)}
                    size="small"
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Treść zgłoszenia
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fafafa' }}>
                <Typography variant="body1">
                  {selectedReport.report.description || "(Brak treści zgłoszenia)"}
                </Typography>
              </Paper>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="h6">
                          Zgłaszający
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={1}>
                        <Typography variant="body1">
                          <strong>Imię i nazwisko:</strong>{' '}
                          <Link 
                            component="button"
                            variant="body1"
                            onClick={() => navigateToUserProfile(selectedReport.reporter_user.user_id)}
                            sx={{ 
                              fontWeight: 'normal',
                              textDecoration: 'none', 
                              '&:hover': { 
                                textDecoration: 'underline', 
                                cursor: 'pointer' 
                              } 
                            }}
                          >
                            {selectedReport.reporter_user.name} {selectedReport.reporter_user.surname}
                          </Link>
                        </Typography>
                        <Typography variant="body1">
                          <strong>ID:</strong> {selectedReport.reporter_user.user_id}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Miasto:</strong> {selectedReport.reporter_user.city}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Ocena:</strong> {selectedReport.reporter_user.rating?.toFixed(1) || 'Brak'}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                          <ReportIcon />
                        </Avatar>
                        <Typography variant="h6">
                          Zgłoszony
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={1}>
                        <Typography variant="body1">
                          <strong>Imię i nazwisko:</strong>{' '}
                          <Link 
                            component="button"
                            variant="body1"
                            onClick={() => navigateToUserProfile(selectedReport.reported_user.user_id)}
                            sx={{ 
                              fontWeight: 'normal',
                              textDecoration: 'none', 
                              '&:hover': { 
                                textDecoration: 'underline',
                                cursor: 'pointer' 
                              } 
                            }}
                          >
                            {selectedReport.reported_user.name} {selectedReport.reported_user.surname}
                          </Link>
                        </Typography>
                        <Typography variant="body1">
                          <strong>ID:</strong> {selectedReport.reported_user.user_id}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Miasto:</strong> {selectedReport.reported_user.city}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Ocena:</strong> {selectedReport.reported_user.rating?.toFixed(1) || 'Brak'}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={handleCloseDetails} 
                color="inherit"
              >
                Zamknij
              </Button>
              <Button 
                onClick={handleOpenBanDialog} 
                color="error"
                variant="contained"
                startIcon={<BlockIcon />}
              >
                Zbanuj użytkownika
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Ban user confirmation dialog */}
      <Dialog
        open={banDialogOpen}
        onClose={handleCloseBanDialog}
      >
        <DialogTitle>
          Potwierdź zablokowanie użytkownika
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz zablokować użytkownika {selectedReport?.reported_user.name} {selectedReport?.reported_user.surname}? 
            Spowoduje to zablokowanie jego konta oraz dezaktywację wszystkich jego ogłoszeń.
            Ta operacja jest nieodwracalna.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseBanDialog} 
            color="inherit"
            disabled={actionInProgress}
          >
            Anuluj
          </Button>
          <Button 
            onClick={handleBanUser} 
            color="error" 
            variant="contained"
            disabled={actionInProgress}
            startIcon={actionInProgress ? <CircularProgress size={16} /> : <BlockIcon />}
          >
            {actionInProgress ? 'Przetwarzanie...' : 'Zablokuj użytkownika'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminReportsPage;