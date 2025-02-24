import { Container, Typography, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Welcome to Animal Care
      </Typography>
      <Typography variant="h5" component={'p'} gutterBottom>
        Providing the best care for your beloved pets.
      </Typography>
      <Button variant="contained" color="secondary" component={Link} to="/login" style={{ marginLeft: '10px' }}>
        Login
      </Button>
      <Grid container spacing={4} style={{ marginTop: '20px' }}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Veterinary Services</Typography>
          <Typography component={'p'}>
            Comprehensive health care for your pets.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Grooming</Typography>
          <Typography component={'p'}>
            Keep your pets looking their best.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Training</Typography>
          <Typography component={'p'}>
            Professional training for well-behaved pets.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LandingPage;
