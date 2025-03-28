import { Alert, Snackbar } from '@mui/material';
import React from 'react';

import { useNotification } from '../contexts/NotificationContext';

const GlobalSnackbar = () => {
  const { open, message, severity, hideNotification } = useNotification();

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={hideNotification}
        severity={severity}
        sx={{ width: '100%', borderRadius: 2 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;