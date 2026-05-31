import '../css/SignupLogin.css';
import LoginUser from '../components/forms/LoginUser';

const Login = () => {
    return (
        <div className="signup-page">
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <LoginUser />
            </div>
        </div>
    )
}

export default Login;