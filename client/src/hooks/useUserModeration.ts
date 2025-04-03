import { useState } from 'react';

import { User } from '../types';
import { putWithAuth } from '../utils/auth';

interface UseUserModerationProps {
  onUserUpdate?: (userId: number, isBanned: boolean) => void;
}

export const useUserModeration = ({ onUserUpdate }: UseUserModerationProps = {}) => {
  const [actionInProgress, setActionInProgress] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleOpenBanDialog = (user: User) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const handleCloseBanDialog = () => {
    setBanDialogOpen(false);
  };
  
  const handleOpenUnbanDialog = (user: User) => {
    setSelectedUser(user);
    setUnbanDialogOpen(true);
  };

  const handleCloseUnbanDialog = () => {
    setUnbanDialogOpen(false);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    setActionInProgress(true);
    try {
      const userId = selectedUser.user_id;
      const response = await putWithAuth(`/api/adminPanel/reports/${userId}/ban`, {});
      
      if (response.ok) {
        if (onUserUpdate) {
          onUserUpdate(userId, true);
        }
        setBanDialogOpen(false);
      } else {
        console.error('Nie udało się zbanować użytkownika');
      }
    } catch (error) {
      console.error('Błąd podczas banowania użytkownika:', error);
    } finally {
      setActionInProgress(false);
    }
  };
  
  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    setActionInProgress(true);
    try {
      const userId = selectedUser.user_id;
      const response = await putWithAuth(`/api/adminPanel/reports/${userId}/unban`, {});
      
      if (response.ok) {
        if (onUserUpdate) {
          onUserUpdate(userId, false);
        }
        setUnbanDialogOpen(false);
      } else {
        console.error('Nie udało się odbanować użytkownika');
      }
    } catch (error) {
      console.error('Błąd podczas odbanowania użytkownika:', error);
    } finally {
      setActionInProgress(false);
    }
  };
  
  return {
    actionInProgress,
    banDialogOpen,
    unbanDialogOpen,
    selectedUser,
    setSelectedUser,
    handleOpenBanDialog,
    handleCloseBanDialog,
    handleOpenUnbanDialog,
    handleCloseUnbanDialog,
    handleBanUser,
    handleUnbanUser
  };
};