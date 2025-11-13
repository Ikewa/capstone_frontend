/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, type ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

type AlertSeverity = 'success' | 'error' | 'warning' | 'info';

interface ToastContextValue {
  showToast: (message: string, severity?: AlertSeverity) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('success');

  const showToast = (msg: string, sev: AlertSeverity = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
