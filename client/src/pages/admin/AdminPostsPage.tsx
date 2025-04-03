import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import TagIcon from '@mui/icons-material/Tag';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
    Box, Typography, Container, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, CircularProgress,
    Divider, IconButton, InputAdornment, TextField, Link,
    TablePagination, MenuItem, Select, FormControl, InputLabel, Grid
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useNotification } from '../../contexts/NotificationContext';
import { Post } from '../../types';
import { getWithAuth, putWithAuth } from '../../utils/auth';

const AdminPostsPage = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    
    // Separate filters for each category
    const [postIdFilter, setPostIdFilter] = useState('');
    const [userIdFilter, setUserIdFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [actionInProgress, setActionInProgress] = useState(false);

    const navigate = useNavigate();
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await getWithAuth('/api/getDashboardPost');
    
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setPosts(data);
                        setFilteredPosts(data);
                    }
                } else {
                    console.error('Nie udało się pobrać ogłoszeń');
                    showNotification('Nie udało się pobrać ogłoszeń', 'error');
                }
            } catch (error) {
                console.error('Błąd podczas pobierania ogłoszeń:', error);
                showNotification('Błąd podczas pobierania ogłoszeń', 'error');
            } finally {
                setLoading(false);
            }
        };
    
        fetchPosts();
    }, [showNotification]);

    useEffect(() => {
        const filterPosts = () => {
            let filtered = [...posts];

            if (postIdFilter) {
                filtered = filtered.filter(post => 
                    post.post_id.toString().includes(postIdFilter)
                );
            }
            
            if (userIdFilter) {
                filtered = filtered.filter(post => 
                    post.user_id.toString().includes(userIdFilter)
                );
            }
            
            if (cityFilter) {
                const cityQuery = cityFilter.toLowerCase();
                filtered = filtered.filter(post => 
                    (post.city?.toLowerCase() || '').includes(cityQuery)
                );
            }

            if (filterStatus === 'active') {
                filtered = filtered.filter(post => post.is_active !== false);
            } else if (filterStatus === 'inactive') {
                filtered = filtered.filter(post => post.is_active === false);
            }

            setFilteredPosts(filtered);
            setPage(0);
        };

        filterPosts();
    }, [filterStatus, postIdFilter, userIdFilter, cityFilter, posts]);


    const togglePostVisibility = async (post: Post) => {
        if (!window.confirm(`Czy na pewno chcesz ${post.is_active !== false ? 'ukryć' : 'przywrócić'} ogłoszenie #${post.post_id}?`)) {
            return;
        }

        setActionInProgress(true);

        try {
            const response = await putWithAuth(`/api/adminPanel/removePost/${post.post_id}`, {});

            if (response.ok) {
                const updatedPosts = posts.map(p => {
                    if (p.post_id === post.post_id) {
                        return { ...p, is_active: false };
                    }
                    return p;
                });

                setPosts(updatedPosts);
                setFilteredPosts(updatedPosts);

                showNotification('Status ogłoszenia został zmieniony', 'success');
            } else {
                showNotification('Nie udało się zmienić statusu ogłoszenia', 'error');
            }
        } catch (error) {
            console.error('Błąd podczas zmiany statusu ogłoszenia:', error);
            showNotification('Wystąpił błąd podczas zmiany statusu ogłoszenia', 'error');
        } finally {
            setActionInProgress(false);
        }
    };

    const clearFilters = () => {
        setPostIdFilter('');
        setUserIdFilter('');
        setCityFilter('');
        setFilterStatus('all');
    };

    const goBack = () => {
        navigate('/admin');
    };

    const navigateToPostDetails = (postId: number) => {
        navigate(`/dashboard/posts/${postId}`);
    };

    const navigateToUserProfile = (userId: number) => {
        navigate(`/dashboard/users/${userId}`);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('-');
        return `${day}.${month}.${year}`;
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
                        Zarządzanie Ogłoszeniami
                    </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Filtry</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        label="ID Ogłoszenia"
                                        variant="outlined"
                                        fullWidth
                                        value={postIdFilter}
                                        onChange={(e) => setPostIdFilter(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <TagIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        size="small"
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        label="ID Użytkownika"
                                        variant="outlined"
                                        fullWidth
                                        value={userIdFilter}
                                        onChange={(e) => setUserIdFilter(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        size="small"
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        label="Miasto"
                                        variant="outlined"
                                        fullWidth
                                        value={cityFilter}
                                        onChange={(e) => setCityFilter(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocationOnIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        size="small"
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="status-filter-label">Status</InputLabel>
                                        <Select
                                            labelId="status-filter-label"
                                            value={filterStatus}
                                            label="Status"
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <FilterAltIcon />
                                                </InputAdornment>
                                            }
                                        >
                                            <MenuItem value="all">Wszystkie</MenuItem>
                                            <MenuItem value="active">Aktywne</MenuItem>
                                            <MenuItem value="inactive">Nieaktywne</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button 
                                        variant="outlined"
                                        onClick={clearFilters}
                                        disabled={!postIdFilter && !userIdFilter && !cityFilter && filterStatus === 'all'}
                                    >
                                        Wyczyść filtry
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>

                        {filteredPosts.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <PetsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6">
                                    Brak ogłoszeń spełniających kryteria
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Spróbuj zmienić kryteria wyszukiwania.
                                </Typography>
                            </Paper>
                        ) : (
                            <>
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Znaleziono {filteredPosts.length} ogłoszeń
                                    </Typography>
                                </Box>
                            
                                <TableContainer component={Paper} elevation={2}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>ID Użytkownika</TableCell>
                                                <TableCell>Właściciel</TableCell>
                                                <TableCell>Miasto</TableCell>
                                                <TableCell>Data od-do</TableCell>
                                                <TableCell>Koszt</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Akcje</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredPosts
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((post) => (
                                                    <TableRow key={post.post_id} hover>
                                                        <TableCell>{post.post_id}</TableCell>
                                                        <TableCell>{post.user_id}</TableCell>
                                                        <TableCell>
                                                            <Link
                                                                component="button"
                                                                variant="body1"
                                                                onClick={() => navigateToUserProfile(post.user_id)}
                                                                sx={{
                                                                    textDecoration: 'none',
                                                                    '&:hover': {
                                                                        textDecoration: 'underline',
                                                                        cursor: 'pointer'
                                                                    }
                                                                }}
                                                            >
                                                                {post.name} {post.surname}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell>{post.city}</TableCell>
                                                        <TableCell>
                                                            {formatDate(post.start_date)} - {formatDate(post.end_date)}
                                                        </TableCell>
                                                        <TableCell>{post.cost} zł</TableCell>
                                                        <TableCell>
                                                            {post.is_active !== false ? (
                                                                <Chip
                                                                    label="Aktywne"
                                                                    color="success"
                                                                    size="small"
                                                                    icon={<VisibilityIcon />}
                                                                />
                                                            ) : (
                                                                <Chip
                                                                    label="Nieaktywne"
                                                                    color="default"
                                                                    size="small"
                                                                    icon={<VisibilityOffIcon />}
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => navigateToPostDetails(post.post_id)}
                                                                >
                                                                    Szczegóły
                                                                </Button>
                                                                {post.is_active !== false && (
                                                                    <Button
                                                                        variant="contained"
                                                                        color="error"
                                                                        size="small"
                                                                        onClick={() => togglePostVisibility(post)}
                                                                        disabled={actionInProgress}
                                                                    >
                                                                        Ukryj
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={filteredPosts.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    labelRowsPerPage="Wierszy na stronę:"
                                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} z ${count}`}
                                />
                            </>
                        )}
                    </>
                )}
            </Box>
        </Container>
    );
};

export default AdminPostsPage;