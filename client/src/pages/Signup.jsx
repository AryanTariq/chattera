import '../css/SignupLogin.css';
import SignupUser from '../components/forms/SignupUser'

const Signup = () => {
    return (
        <div className="signup-page">
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <SignupUser />
            </div>
        </div>
    );
};

export default Signup;