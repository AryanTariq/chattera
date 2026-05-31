import '../../css/App.css';
import { useNavigate } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext';

const Logout = () => {
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear user and token from storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        dispatch({ type: "LOGOUT"});
        navigate("/login");
    }

    return (
        <button
            className="btn btn--ghost btn--sm"
            onClick={handleLogout}
        >
            Log out
        </button>
    )
}

export default Logout;