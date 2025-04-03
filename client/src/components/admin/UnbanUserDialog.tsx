import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Button, CircularProgress, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';

import { User } from '../../types';

interface UnbanUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  actionInProgress: boolean;
}

const UnbanUserDialog = ({ open, user, onClose, onConfirm, actionInProgress }: UnbanUserDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        Potwierdź odblokowanie użytkownika
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Czy na pewno chcesz odblokować użytkownika {user?.name} {user?.surname}? 
          Użytkownik odzyska możliwość korzystania z serwisu.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={actionInProgress}
        >
          Anuluj
        </Button>
        <Button 
          onClick={onConfirm} 
          color="success" 
          variant="contained"
          disabled={actionInProgress}
          startIcon={actionInProgress ? <CircularProgress size={16} /> : <CheckCircleIcon />}
        >
          {actionInProgress ? 'Przetwarzanie...' : 'Odblokuj użytkownika'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnbanUserDialog;