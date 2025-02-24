import React from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';

const LoginPage = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form>
        <TextField label="Username" fullWidth margin="normal" />
        <TextField label="Password" type="password" fullWidth margin="normal" />
        <Button variant="contained" color="primary" type="submit">
          Login
        </Button>
      </form>
    </Container>
  );
};

export default LoginPage;