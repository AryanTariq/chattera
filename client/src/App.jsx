import './css/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthContext from './hooks/useAuthContext';
import Feed from './pages/Feed';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from "./pages/Profile";
import NotFound from './pages/NotFound';
import Navbar from "./components/Navbar";
import OAuthCallback from './pages/OAuthCallback';
import ChattDetail from './pages/ChattDetail';

function App() {
  const { user } = useAuthContext();

  return (
    <div className='App'>
      <BrowserRouter>
        <Navbar />
        <div>
          <Routes>

            <Route path="/" element={<Feed />} />

            <Route path="/signup" element={
              // Go to home page if user is logged in on signup page
              user ? <Navigate to="/" /> : <Signup />
              } />
              
            <Route path="/login" element={
              // Go to home page if user is logged in on login page
              user ? <Navigate to="/" /> : <Login />
              } />

            <Route path="/profile/:username" element={<Profile />} />

            <Route path="/chatt/:id" element={<ChattDetail />} />

            <Route path="/auth/callback" element={<OAuthCallback />} />

            <Route path="*" element={<NotFound />} />
            
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
