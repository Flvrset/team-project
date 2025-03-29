import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PetsIcon from '@mui/icons-material/Pets';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Divider, Paper, Stack, Typography } from '@mui/material';

import { Pet, Post } from '../../types';
import { formatTimeWithoutSeconds } from '../../utils/utils';

interface PostDetailsSummaryProps {
    post: Post;
    pets: Pet[];
}

const PostDetailsSummary = ({ post, pets }: PostDetailsSummaryProps) => {
    return (
        <Paper
            elevation={2}
            sx={{ p: 3, borderRadius: 3 }}
        >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Szczegóły ogłoszenia
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CalendarTodayIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Termin
                        </Typography>
                        <Typography>
                            {post.start_date} do {post.end_date}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <ScheduleIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Godziny
                        </Typography>
                        <Typography>
                            {formatTimeWithoutSeconds(post.start_time)} - {formatTimeWithoutSeconds(post.end_time)}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <AttachMoneyIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Stawka godzinowa
                        </Typography>
                        <Typography fontWeight="bold">
                            {post.cost} PLN/h
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <PetsIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Zwierzęta
                        </Typography>
                        <Typography>
                            {pets.map(p => p.pet_name).join(", ")} (liczba: {pets.length})
                        </Typography>
                    </Box>
                </Box>
            </Stack>

            {post.description && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <RateReviewIcon color="primary" sx={{ mt: 0.5, mr: 1.5 }} />
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Opis
                            </Typography>
                            <Typography sx={{ whiteSpace: 'pre-line' }}>
                                {post.description || "Brak opisu"}
                            </Typography>
                        </Box>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default PostDetailsSummary;