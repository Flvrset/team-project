import BlockIcon from '@mui/icons-material/Block';
import {
  Button, CircularProgress, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';

import { User } from '../../types';

interface BanUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  actionInProgress: boolean;
}

const BanUserDialog = ({ open, user, onClose, onConfirm, actionInProgress }: BanUserDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        Potwierdź zablokowanie użytkownika
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Czy na pewno chcesz zablokować użytkownika {user?.name} {user?.surname}? 
          Spowoduje to zablokowanie jego konta oraz dezaktywację wszystkich jego ogłoszeń.
          Ta operacja jest odwracalna, użytkownika można później odblokować.
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
          color="error" 
          variant="contained"
          disabled={actionInProgress}
          startIcon={actionInProgress ? <CircularProgress size={16} /> : <BlockIcon />}
        >
          {actionInProgress ? 'Przetwarzanie...' : 'Zablokuj użytkownika'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BanUserDialog;