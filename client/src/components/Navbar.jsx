import '../css/App.css';
import { Link, useLocation } from 'react-router-dom';
import useAuthContext from '../hooks/useAuthContext';
import Logout from '../components/buttons/Logout';
import GoBack from './buttons/GoBack';
import ThemeToggle from './buttons/ThemeToggle';

const Navbar = () => {
    const { user } = useAuthContext();
    const location = useLocation();
    const onProfile = location.pathname.startsWith('/profile/');
    const onAuthPage = location.pathname === '/login' ||
                       location.pathname === '/signup';

    const loginSignupButtons = (
        <>
            <Link to="/login" className="btn btn--ghost btn--sm">Log in</Link>
            <Link to="/signup" className="btn btn--primary btn--sm">Sign up</Link>
        </>
    );

    const navActions = user ? (
        // Display username if logged in, display "Go back" button if on profile page
        <>
            <Link to={`/profile/${user.username}`} className="navbar__username">
                @{user.username}
            </Link>
            {onProfile && <GoBack />}
            <Logout />
        </>
    ) : (
        // Display login, signup & go back buttons if on login/signup/profile pages */
        <>
            {(onAuthPage || onProfile) && <GoBack />}
            {loginSignupButtons}
        </>
    );

    return (
        <nav className="navbar">
            <Link to="/" className="navbar__logo">
                Chatt<span>era</span>
            </Link>

            <div className="navbar__actions">
                {navActions}
                <ThemeToggle />
            </div>
        </nav>
    );
};

export default Navbar;