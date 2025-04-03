import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box, Typography, Container, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, CircularProgress,
    Divider, IconButton, Link, InputAdornment, TextField,
    TablePagination, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import BanUserDialog from '../../components/admin/BanUserDialog';
import UnbanUserDialog from '../../components/admin/UnbanUserDialog';
import UserDetailsDialog from '../../components/admin/UserDetailsDialog';
import { useUserModeration } from '../../hooks/useUserModeration';
import { IRating, Pet, User } from '../../types';
import { getWithAuth } from '../../utils/auth';

interface UserWithDetails {
    user: User;
    pets: Pet[];
    ratings: IRating[];
}

const AdminUsersPage = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserWithDetails[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
    const [selectedUserDetails, setSelectedUserDetails] = useState<UserWithDetails | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const navigate = useNavigate();

    const {
        actionInProgress,
        banDialogOpen,
        unbanDialogOpen,
        selectedUser,
        handleOpenBanDialog,
        handleCloseBanDialog,
        handleOpenUnbanDialog,
        handleCloseUnbanDialog,
        handleBanUser,
        handleUnbanUser
    } = useUserModeration({
        onUserUpdate: (userId, isBanned) => {
            const updateUserList = (list: UserWithDetails[]) => {
                return list.map(item => {
                    if (item.user.user_id === userId) {
                        return {
                            ...item,
                            user: {
                                ...item.user,
                                is_banned: isBanned
                            }
                        };
                    }
                    return item;
                });
            };

            setUsers(updateUserList(users));
            setFilteredUsers(updateUserList(filteredUsers));

            if (selectedUserDetails && selectedUserDetails.user.user_id === userId) {
                setSelectedUserDetails({
                    ...selectedUserDetails,
                    user: {
                        ...selectedUserDetails.user,
                        is_banned: isBanned
                    }
                });
            }
        }
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filterUsers = () => {
            let filtered = [...users];

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                filtered = filtered.filter(item =>
                    (item.user.name?.toLowerCase() || '').includes(query) ||
                    (item.user.surname?.toLowerCase() || '').includes(query) ||
                    (item.user.city?.toLowerCase() || '').includes(query) ||
                    item.user.user_id.toString().includes(query)
                );
            }

            if (filterStatus === 'banned') {
                filtered = filtered.filter(item => item.user.is_banned);
            } else if (filterStatus === 'active') {
                filtered = filtered.filter(item => !item.user.is_banned);
            }

            setFilteredUsers(filtered);
        };

        filterUsers();
    }, [filterStatus, searchQuery, users]);


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getWithAuth('/api/adminPanel/users');

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setUsers(data);
                    setFilteredUsers(data);
                }
            } else {
                console.error('Nie udało się pobrać użytkowników');
            }
        } catch (error) {
            console.error('Błąd podczas pobierania użytkowników:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserDetails = (user: UserWithDetails) => {
        setSelectedUserDetails(user);
    };

    const handleCloseDetails = () => {
        setSelectedUserDetails(null);
    };

    const goBack = () => {
        navigate('/admin');
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
                        Zarządzanie Użytkownikami
                    </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                                label="Wyszukaj użytkownika"
                                variant="outlined"
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                            />

                            <FormControl sx={{ minWidth: 200 }} size="small">
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
                                    <MenuItem value="all">Wszyscy</MenuItem>
                                    <MenuItem value="active">Aktywni</MenuItem>
                                    <MenuItem value="banned">Zablokowani</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {filteredUsers.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <PersonIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6">
                                    Brak użytkowników spełniających kryteria
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Spróbuj zmienić kryteria wyszukiwania.
                                </Typography>
                            </Paper>
                        ) : (
                            <>
                                <TableContainer component={Paper} elevation={2}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Imię i Nazwisko</TableCell>
                                                <TableCell>Miasto</TableCell>
                                                <TableCell>Kod Pocztowy</TableCell>
                                                <TableCell>Ocena</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Akcje</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredUsers
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((userItem) => (
                                                    <TableRow key={userItem.user.user_id} hover>
                                                        <TableCell>{userItem.user.user_id}</TableCell>
                                                        <TableCell>
                                                            <Link
                                                                component="button"
                                                                variant="body1"
                                                                onClick={() => navigateToUserProfile(userItem.user.user_id)}
                                                                sx={{
                                                                    textDecoration: 'none',
                                                                    '&:hover': {
                                                                        textDecoration: 'underline',
                                                                        cursor: 'pointer'
                                                                    }
                                                                }}
                                                            >
                                                                {userItem.user.name} {userItem.user.surname}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell>{userItem.user.city}</TableCell>
                                                        <TableCell>{userItem.user.postal_code}</TableCell>
                                                        <TableCell>
                                                            {userItem.user.rating ? userItem.user.rating.toFixed(1) : 'Brak ocen'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {userItem.user.is_banned ? (
                                                                <Chip
                                                                    label="Zablokowany"
                                                                    color="error"
                                                                    size="small"
                                                                    icon={<BlockIcon />}
                                                                />
                                                            ) : (
                                                                <Chip
                                                                    label="Aktywny"
                                                                    color="success"
                                                                    size="small"
                                                                    icon={<CheckCircleIcon />}
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => handleUserDetails(userItem)}
                                                            >
                                                                Szczegóły
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={filteredUsers.length}
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

            {selectedUserDetails && (
                <UserDetailsDialog
                    open={!!selectedUserDetails}
                    user={selectedUserDetails.user}
                    pets={selectedUserDetails.pets}
                    ratings={selectedUserDetails.ratings}
                    onClose={handleCloseDetails}
                    onBan={() => handleOpenBanDialog(selectedUserDetails.user)}
                    onUnban={() => handleOpenUnbanDialog(selectedUserDetails.user)}
                />
            )}

            <BanUserDialog
                open={banDialogOpen}
                user={selectedUser}
                onClose={handleCloseBanDialog}
                onConfirm={handleBanUser}
                actionInProgress={actionInProgress}
            />

            <UnbanUserDialog
                open={unbanDialogOpen}
                user={selectedUser}
                onClose={handleCloseUnbanDialog}
                onConfirm={handleUnbanUser}
                actionInProgress={actionInProgress}
            />
        </Container>
    );
};

export default AdminUsersPage;