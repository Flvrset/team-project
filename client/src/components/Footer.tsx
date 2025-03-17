import { Box, Container, Typography } from "@mui/material";

const Footer = () =>
    <>
        <Box sx={{ width: '100%', bgcolor: 'primary.dark', color: 'white', py: 3, mt: 6 }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="inherit">
                        © {new Date().getFullYear()} PetBuddies. Wszystkie prawa zastrzeżone.
                    </Typography>
                </Box>
            </Container>
        </Box>

    </>

export default Footer;
