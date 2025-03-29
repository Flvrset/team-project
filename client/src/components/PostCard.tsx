import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PetsIcon from '@mui/icons-material/Pets';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActionArea,
    Divider,
    Chip,
    alpha,
    Stack,
    Avatar,
    AvatarGroup,
    useTheme,
} from '@mui/material';
import React from 'react';

import { Post } from '../types';
import { formatTimeWithoutSeconds } from '../utils/utils';

interface PostCardLabelProps {
    text: string;
    color: 'success' | 'error' | 'primary' | 'grey';
}

export interface PostCardProps {
    post: Post;
    onClick: (postId: number) => void;
    label?: PostCardLabelProps;
    actionText?: string;
    showHeader?: boolean;
    badgeCount?: number;
}

const PostCard: React.FC<PostCardProps> = ({
    post,
    onClick,
    label,
    actionText = "Zobacz szczegóły",
    showHeader = true,
    badgeCount = 0
}) => {
    const theme = useTheme();

    return (
        <Card
            elevation={2}
            sx={{
                position: 'relative',
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 6
                }
            }}
        >
            <CardActionArea
                onClick={() => onClick(post.post_id)}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
                {showHeader && post.name && post.surname && post.city && post.postal_code && (
                    <Box
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            p: 2,
                            pb: 1
                        }}
                    >
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                            {post.name} {post.surname}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                            <Typography variant="body2" color="text.secondary">
                                {post.city}, {post.postal_code}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {post.pet_photos && post.pet_photos.length > 0 && (
                    <Box sx={{ p: 2, pb: 0 }}>
                        <AvatarGroup
                            max={4}
                            sx={{ flexDirection: 'row' }}>
                            {post.pet_photos.map((photo, index) => (
                                <Avatar
                                    key={index}
                                    src={photo}
                                    variant="circular"
                                    color="primary"
                                    alt={`Pet ${index + 1}`}
                                    sx={{ width: 60, height: 60 }}
                                />
                            ))}
                        </AvatarGroup>
                    </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Stack spacing={2}>
                        <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarTodayIcon color="action" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                <Typography variant="body2">
                                    {post.start_date} do {post.end_date}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon color="action" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                <Typography variant="body2">
                                    {formatTimeWithoutSeconds(post.start_time)} - {formatTimeWithoutSeconds(post.end_time)}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PetsIcon color="action" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                <Typography variant="body2">
                                    {post.pet_list ? (
                                        <>Zwierzęta: {post.pet_list.join(', ')} </>
                                    ) : (
                                        <>Liczba zwierząt: {post.pet_count || 0}</>
                                    )}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <MonetizationOnIcon color="action" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                <Typography variant="body2" fontWeight="bold">
                                    {post.cost} PLN/h
                                </Typography>
                            </Box>

                            {label && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Chip
                                        label={label.text}
                                        color={label.color !== 'grey' ? label.color : undefined}
                                        size="small"
                                        sx={{
                                            fontWeight: 500,
                                            borderRadius: '16px',
                                            ...(label.color === 'grey' && {
                                                backgroundColor: theme.palette.grey[300],
                                                color: theme.palette.grey[800],
                                            })
                                        }}
                                    />
                                </Box>
                            )}
                        </Stack>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Chip
                                label={actionText}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 500, borderRadius: '16px' }}
                            />
                        </Box>
                    </Stack>
                </CardContent>
            </CardActionArea>

            {badgeCount > 0 && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 12,
                        right: 12,
                        zIndex: 20,
                    }}
                >
                    <Chip
                        icon={<NotificationsIcon fontSize="small" sx={{ color: 'white !important' }} />}
                        label={`${badgeCount} ${badgeCount === 1 ? 'nowa aplikacja' : 'nowe aplikacje'}`}
                        color="error"
                        size="small"
                        sx={{
                            fontWeight: 'bold',
                            px: 1,
                            height: 28,
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            border: '1px solid white',
                            '& .MuiChip-label': {
                                px: 0.5
                            },
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                            },
                            transition: 'all 0.2s ease',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': {
                                    boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.4)'
                                },
                                '70%': {
                                    boxShadow: '0 0 0 8px rgba(211, 47, 47, 0)'
                                },
                                '100%': {
                                    boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)'
                                }
                            }
                        }}
                    />
                </Box>
            )}
        </Card>
    );
};

export default PostCard;