import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PetsIcon from '@mui/icons-material/Pets';
import { Button, Toolbar, AppBar as MuiAppBar, Typography, } from "@mui/material";
import { Link } from 'react-router-dom';

const AppBar = () =>
    <>
        <MuiAppBar position="sticky" color="primary" elevation={0} sx={{ top: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <PetsIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    PetCare Connect
                </Typography>

                <Button
                    color="inherit"
                    component={Link}
                    to="/login"
                    startIcon={<AccountCircleIcon />}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        px: 2,
                        py: 0.7,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Logowanie
                </Button>

                <Button
                    color="secondary"
                    variant="contained"
                    component={Link}
                    to="/register"
                    sx={{
                        ml: 2,
                        borderRadius: 2,
                        px: 2,
                        py: 0.7,
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.5)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Rejestracja
                </Button>
            </Toolbar>
        </MuiAppBar>
    </>


export default AppBar;