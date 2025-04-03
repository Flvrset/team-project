import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthProvider';
import { NotificationProvider } from './contexts/NotificationContext';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import CreatePostPage from './pages/dashboard/CreatePostPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EditDataPage from './pages/dashboard/EditDataPage';
import MyApplicationsPage from './pages/dashboard/MyApplicationsPage';
import MyPostsPage from './pages/dashboard/MyPostsPage';
import PetsPage from './pages/dashboard/PetsPage';
import PostPage from './pages/dashboard/PostPage';
import SearchPostsPage from './pages/dashboard/SearchPostsPage';
import UserPage from './pages/dashboard/UserPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <div className='App'>
      <Router>
        <AuthProvider>
          <NotificationProvider>
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
                  <Route path='/dashboard/my-posts' element={<MyPostsPage />} />
                  <Route path='/dashboard/my-applications' element={<MyApplicationsPage />} />
                  <Route path='/dashboard/users/:userId' element={<UserPage />} />
                </Route>
              </Route>

              <Route element={<AdminRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path='/admin' element={<AdminDashboardPage />} />
                  <Route path='/admin/reports' element={<AdminReportsPage />} />
                  <Route path='/admin/posts' element={<AdminPostsPage />} />
                  <Route path='/admin/users' element={<AdminUsersPage />} />
                </Route>
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
