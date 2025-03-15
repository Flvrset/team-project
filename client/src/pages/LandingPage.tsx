import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PetsIcon from '@mui/icons-material/Pets';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { Container, Typography, Button, Grid, Box, Card, CardContent, CardMedia, Stack, Avatar, Rating } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import heroImage from '../assets/hero-image.webp';
import petBoardingImage from '../assets/pet-boarding.webp';
import petSittingImage from '../assets/pet-sitting.webp';
import petWalkingImage from '../assets/pet-walking.webp';
import AppBar from '../components/AppBar';


const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const calculateRotation = () => {
    const maxRotation = 5;
    const scrollFactor = 0.02;
    const rotation = -5 + (scrollY * scrollFactor);

    return Math.min(Math.max(rotation, -maxRotation), maxRotation);
  };

  return (
    <>
      <AppBar />
      <Box
        sx={{
          width: '100%',
          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          color: 'primary.contrastText',
          py: 10,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 10.5%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0',
            opacity: 0.5,
          }
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    mb: 2
                  }}
                >
                  Znajdź opiekę dla swoich zwierząt
                </Typography>
                <Typography
                  variant="h6"
                  paragraph
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    maxWidth: '90%'
                  }}
                >
                  Łączymy właścicieli zwierząt z zaufanymi opiekunami w Twojej okolicy.
                  Szukasz opieki czy oferujesz swoje usługi? Jesteś we właściwym miejscu!
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    startIcon={<SearchIcon />}
                    component={Link}
                    to="/login"
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      boxShadow: '0 4px 14px rgba(255, 152, 0, 0.4)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 6px 20px rgba(255, 152, 0, 0.6)',
                      }
                    }}
                  >
                    Szukaj opiekuna
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<VolunteerActivismIcon />}
                    component={Link}
                    to="/login"
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.7)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Oferuj opiekę
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{
                maxWidth: '100%',
                height: 'auto',
                position: 'relative',
                pt: '56.25%',
                transform: `perspective(1000px) rotateY(${calculateRotation()}deg)`,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'perspective(1000px) rotateY(0deg)'
                }
              }}>
                <Avatar
                  variant="rounded"
                  src={heroImage}
                  alt="Zwierzęta domowe"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: '4px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <PetsIcon sx={{ fontSize: 80 }} />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Usługi opieki nad zwierzętami
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" paragraph sx={{ mb: 6 }}>
          Znajdź idealnego opiekuna dla swojego pupila lub zaoferuj swoje usługi innym
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={petWalkingImage}
                alt="Spacer z psem"
              />
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Spacery z psem
                </Typography>
                <Typography variant="body1">
                  Regularne spacery dla twojego psa, gdy jesteś w pracy lub nie masz czasu.
                  Nasi opiekunowie zapewnią twojemu pupilowi ruch i zabawę.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={petSittingImage}
                alt="Opieka domowa"
              />
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Opieka domowa
                </Typography>
                <Typography variant="body1">
                  Doświadczeni opiekunowie zaopiekują się Twoim zwierzakiem w Twoim domu.
                  Karmienie, zabawa i towarzystwo podczas Twojej nieobecności.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={petBoardingImage}
                alt="Pobyt u opiekuna"
              />
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Pobyt u opiekuna
                </Typography>
                <Typography variant="body1">
                  Twój pupil może zamieszkać u opiekuna na czas Twojej nieobecności.
                  Idealne rozwiązanie na wakacje czy wyjazdy służbowe.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ width: '100%', bgcolor: 'grey.100', py: 6, my: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Jak to działa?
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" paragraph sx={{ mb: 6 }}>
            Trzy proste kroki do znalezienia idealnej opieki
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto', mb: 2, transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                  <AccountCircleIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" gutterBottom>
                  1. Zarejestruj się
                </Typography>
                <Typography variant="body1">
                  Stwórz konto, by móc publikować ogłoszenia lub odpowiadać na nie.
                  Uzupełnij swój profil ze zdjęciem i informacjami.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80, mx: 'auto', mb: 2, transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                  <SearchIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" gutterBottom>
                  2. Szukaj lub publikuj
                </Typography>
                <Typography variant="body1">
                  Publikuj ogłoszenia o potrzebie opieki lub przeglądaj ogłoszenia i oferuj swoje usługi.
                  Filtruj według lokalizacji, typu zwierząt i usług.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto', mb: 2, transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                  <VolunteerActivismIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" gutterBottom>
                  3. Połącz się
                </Typography>
                <Typography variant="body1">
                  Kontaktuj się bezpośrednio z wybranymi osobami, ustal szczegóły i ciesz się profesjonalną opieką dla swoich zwierząt.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Dołącz do naszej społeczności już dziś!
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          Tysiące właścicieli zwierząt i opiekunów już korzysta z naszej platformy.
          <br />
          <Rating name="landing-cta-rating" value={5} readOnly size="large" sx={{ mt: 2 }} />
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          to="/register"
          sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
        >
          Załóż konto za darmo
        </Button>
      </Container>

      <Box sx={{ width: '100%', bgcolor: 'primary.dark', color: 'white', py: 3, mt: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{textAlign: 'center'}}>
            <Typography variant="body2" color="inherit">
              © {new Date().getFullYear()} PetBuddies. Wszystkie prawa zastrzeżone.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
