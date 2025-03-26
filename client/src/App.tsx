import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './hooks/AuthProvider';
import DashboardLayout from './layouts/DashboardLayout';
import CreatePostPage from './pages/CreatePostPage';
import DashboardPage from './pages/DashboardPage';
import EditDataPage from './pages/EditDataPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PetsPage from './pages/PetsPage';
import PostPage from './pages/PostPage';
import RegisterPage from './pages/RegisterPage';
import SearchPostsPage from './pages/SearchPostsPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <div className='App'>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/edit-data" element={<EditDataPage />} />
                <Route path='/dashboard/create-post' element={<CreatePostPage />} />
                <Route path='/dashboard/search-posts' element={<SearchPostsPage />} />
                <Route path='/dashboard/pets' element={<PetsPage />} />
                <Route path='/dashboard/posts/:postId' element={<PostPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
