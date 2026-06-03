import '../../css/SignupLogin.css';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext';
import api from '../../utils/api';
import GoogleButton from '../buttons/GoogleButton';

const LoginUser = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const oauthError = new URLSearchParams(location.search).get('error');
    
    const { dispatch } = useAuthContext();
    const [nameOrEmail, setNameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const user = { nameOrEmail, password };

        try {
            const res = await api.post('/api/users/login', user);

            localStorage.setItem('user', JSON.stringify({
                _id: res.data._id,
                displayName: user.displayName,
                username: res.data.username,
                email: res.data.email,
                avatar: res.data.avatar,
                banner: res.data.banner,
                createdAt: res.data.createdAt,
                token: res.data.token
            }));

            dispatch({
                type: "LOGIN",
                payload: res.data
            })

            setNameOrEmail(''); setPassword('');
            navigate('/');

        } catch (err) {
            const data = err.response?.data;
            setError(data?.error || "Something went wrong");
        }
    };

    return (
        <div className="auth-card">
            <div className="auth-card__logo">Chatt<span>era</span></div>
            <div className="auth-card__tagline">// join the conversation</div>
            <div className="auth-card__title">Login</div>

            <form className="form" onSubmit={handleSubmit}>

                <div className="form-field">
                    <label className="form-field__label">Username/Email</label>
                    <input
                        className="form-field__input"
                        type="text"
                        placeholder="yourhandle/name@example.com"
                        value={nameOrEmail}
                        onChange={(e) => setNameOrEmail(e.target.value)}
                    />
                </div>

                <div className="form-field" style={{marginBottom: "7.5px"}}>
                    <label className="form-field__label">Password</label>
                    <input
                        className="form-field__input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && <div className="form-error">{error}</div>}

                {oauthError === 'oauth_failed' && (
                    <div className="form-error">
                        Google sign-in failed. Please try again.
                    </div>
                )}

                <button className="btn btn--primary btn--full btn--lg" 
                        type="submit" 
                        style={{marginTop: "7.5px"}}
                >
                    Log in →
                </button>

                <GoogleButton />
            </form>
        </div>
    )
}

export default LoginUser;