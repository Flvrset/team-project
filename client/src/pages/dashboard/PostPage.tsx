import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Alert,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import PostApplicantView from '../../components/post/PostApplicantView';
import PostOwnerView from '../../components/post/PostOwnerView';
import { PostDetails } from '../../types';
import { getWithAuth } from '../../utils/auth';

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!postId) {
          setError("Post ID is missing");
          return;
        }

        const response = await getWithAuth(`/api/getPost/${postId}`);

        if (response.ok) {
          const data = await response.json();
          setPostDetails(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch post details');
        }
      } catch (err) {
        setError('An error occurred while fetching post details');
        console.error('Error fetching post details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  if (loading) {
    return (
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
        <Button
          component={Link}
          to="/dashboard/search-posts"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Powrót do wyszukiwania
        </Button>
      </Box>
    );
  }

  if (!postDetails) {
    return (
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Nie znaleziono szczegółów ogłoszenia
        </Alert>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Powrót do wyszukiwania
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{
            borderRadius: 2,
            py: 1,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
          }}
        >
          Powrót do wyszukiwania
        </Button>
      </Box>

      {postDetails.status === 'own' ? (
        <PostOwnerView
          postDetails={postDetails}
          postId={postId}
        />
      ) : (
        <PostApplicantView
          postDetails={postDetails}
          postId={postId}
        />
      )}
    </Box>
  );
};

export default PostPage;