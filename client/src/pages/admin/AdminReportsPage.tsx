import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import {
  Box, Typography, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Grid, Divider,
  IconButton, Link, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import BanUserDialog from '../../components/admin/BanUserDialog';
import UserDetailsDialog from '../../components/admin/UserDetailsDialog';
import { useUserModeration } from '../../hooks/useUserModeration';
import { User } from '../../types';
import { getWithAuth } from '../../utils/auth';

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

interface ReportGroup {
  reportedUser: User;
  reports: Report[];
}

const AdminReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [groupedReports, setGroupedReports] = useState<ReportGroup[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewingReportedUser, setViewingReportedUser] = useState(false);

  const navigate = useNavigate();

  const {
    actionInProgress,
    banDialogOpen,
    handleOpenBanDialog,
    handleCloseBanDialog,
    handleBanUser,
  } = useUserModeration({
    onUserUpdate: (userId, isBanned) => {
      if (isBanned) {
        setReports(reports.filter(r => r.reported_user.user_id !== userId));
        setGroupedReports(groupedReports.filter(group => group.reportedUser.user_id !== userId));
      }

      if (selectedReport && selectedReport.reported_user.user_id === userId) {
        setSelectedReport(null);
      }
    }
  });

  useEffect(() => {
    fetchReports();
  }, []);
  
  useEffect(() => {
    const grouped = groupReportsByUser(reports);
    setGroupedReports(grouped);
  }, [reports]);

  const groupReportsByUser = (reports: Report[]): ReportGroup[] => {
    const groupsMap = new Map<number, ReportGroup>();
    
    reports.forEach(report => {
      const userId = report.reported_user.user_id;
      
      if (!groupsMap.has(userId)) {
        groupsMap.set(userId, {
          reportedUser: report.reported_user,
          reports: []
        });
      }
      
      groupsMap.get(userId)?.reports.push(report);
    });
    
    return Array.from(groupsMap.values());
  };

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

  const handleViewReportedUser = () => {
    setViewingReportedUser(true);
  };

  const handleCloseReportedUserView = () => {
    setViewingReportedUser(false);
  };

  const goBack = () => {
    navigate('/admin');
  };

  const navigateToUserProfile = (userId: number) => {
    navigate(`/dashboard/users/${userId}`);
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year} ${timeStr.substring(0, 5)}`;
  };

  const getReportTypeName = (typeId: number, typeName: string) => {
    return typeName || 'Inne';
  };

  const getReportTypeColor = (typeId: number): 'error' | 'warning' | 'info' | 'default' => {
    switch (typeId) {
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
            {groupedReports.length === 0 ? (
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
              <Box>
                {groupedReports.map((group) => (
                  <Accordion key={group.reportedUser.user_id} sx={{ mb: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ bgcolor: '#f5f5f5' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                          <Typography variant="subtitle1" fontWeight="bold">
                            {group.reportedUser.name} {group.reportedUser.surname}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer component={Paper} elevation={0} variant="outlined">
                        <Table size="small">
                          <TableHead sx={{ bgcolor: '#fafafa' }}>
                            <TableRow>
                              <TableCell>ID</TableCell>
                              <TableCell>Data</TableCell>
                              <TableCell>Typ zgłoszenia</TableCell>
                              <TableCell>Zgłaszający</TableCell>
                              <TableCell>Akcje</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.reports.map((report) => (
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
                                    variant="body2"
                                    onClick={() => navigateToUserProfile(report.reporter_user.user_id)}
                                  >
                                    {report.reporter_user.name} {report.reporter_user.surname}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="small"
                                    variant="outlined"
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
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          variant="outlined"
                          size="small"
                          onClick={() => navigateToUserProfile(group.reportedUser.user_id)}
                        >
                          Zobacz profil
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleOpenBanDialog(group.reportedUser)}
                        >
                          Zablokuj użytkownika
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>

      <Dialog
        open={!!selectedReport && !viewingReportedUser}
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

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleViewReportedUser}
                  >
                    Zobacz szczegóły zgłoszonego użytkownika
                  </Button>
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
                onClick={() => handleOpenBanDialog(selectedReport.reported_user)}
                color="error"
                variant="contained"
              >
                Zablokuj użytkownika
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {selectedReport && viewingReportedUser && (
        <UserDetailsDialog
          open={true}
          user={selectedReport.reported_user}
          onClose={handleCloseReportedUserView}
          onBan={() => handleOpenBanDialog(selectedReport.reported_user)}
          onUnban={() => { }}
        />
      )}

      <BanUserDialog
        open={banDialogOpen}
        user={selectedReport?.reported_user || null}
        onClose={handleCloseBanDialog}
        onConfirm={handleBanUser}
        actionInProgress={actionInProgress}
      />
    </Container>
  );
};

export default AdminReportsPage;