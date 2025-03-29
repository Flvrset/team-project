import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  text?: string;
}

const BackButton = ({ to = '/dashboard', text = 'Powrót' }: BackButtonProps) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      startIcon={<ArrowBackIcon />}
      component={Link}
      to={to}
      sx={{
        borderRadius: '18px',
        py: 1,
        px: 2.5,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
    >
      {text}
    </Button>
  );
};

export default BackButton;