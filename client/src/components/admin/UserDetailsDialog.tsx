import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import {
  Avatar, Badge, Box, Button, Card, CardContent, Chip, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper, Stack, Typography
} from '@mui/material';

import { User, Pet, IRating } from '../../types';

interface UserDetailsProps {
  open: boolean;
  user: User;
  pets?: Pet[];
  ratings?: IRating[];
  onClose: () => void;
  onBan: () => void;
  onUnban: () => void;
}

const UserDetailsDialog = ({ 
  open, 
  user, 
  pets = [], 
  ratings = [], 
  onClose, 
  onBan, 
  onUnban 
}: UserDetailsProps) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>
        Szczegóły użytkownika
      </DialogTitle>
      <DialogContent sx={{ pt: 7 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={user.photo || undefined} 
                    sx={{ width: 56, height: 56, mr: 2 }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {user.name} {user.surname}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      {user.is_banned ? (
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
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Typography variant="body1">
                    <strong>ID:</strong> {user.user_id}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Miasto:</strong> {user.city}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Kod pocztowy:</strong> {user.postal_code}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Ocena:</strong> {user.rating?.toFixed(1) || 'Brak ocen'}
                  </Typography>
                </Stack>

                {user.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Opis
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                      <Typography variant="body2">
                        {user.description}
                      </Typography>
                    </Paper>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Zwierzęta
                  </Typography>
                  <Badge badgeContent={pets?.length || 0} color="primary">
                    <PetsIcon />
                  </Badge>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {!pets || pets.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Użytkownik nie ma zarejestrowanych zwierząt.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {pets.map(pet => (
                      <Paper key={pet.pet_id} variant="outlined" sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {pet.photo && (
                            <Avatar 
                              src={pet.photo} 
                              variant="rounded"
                              sx={{ width: 50, height: 50 }}
                            />
                          )}
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {pet.pet_name}
                            </Typography>
                            <Typography variant="body2">
                              {pet.type}, {pet.race || 'Rasa nieznana'}, Rozmiar: {pet.size}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {ratings && ratings.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Oceny użytkownika
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    {ratings.map((rating, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Ocena: {rating.star_number}/5
                            </Typography>
                            {rating.description && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                "{rating.description}"
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
        >
          Zamknij
        </Button>
        {!user.is_banned ? (
          <Button 
            onClick={onBan} 
            color="error"
            variant="contained"
            startIcon={<BlockIcon />}
          >
            Zablokuj użytkownika
          </Button>
        ) : (
          <Button 
            onClick={onUnban} 
            color="success"
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            Odblokuj użytkownika
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog;