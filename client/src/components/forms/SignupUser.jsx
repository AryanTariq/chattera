import '../../css/SignupLogin.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext';
import api from '../../utils/api';
import GoogleButton from '../buttons/GoogleButton';

const SignupUser = () => {
    const navigate = useNavigate();

    const { dispatch } = useAuthContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail]       = useState('');
    const [bio, setBio]           = useState('');
    const [errors, setErrors]     = useState({});

    // Helper functions to conditionally update form fields 
    const inputClass = (field) =>
        `form-field__input${errors[field] ? ' form-field__input--error' : ''}`;

    const textareaClass = (field) =>
        `form-field__textarea${errors[field] ? ' form-field__input--error' : ''}`;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields upfront on the frontend
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = 'Username is required';
        } else if (username.trim().length < 3) {
            newErrors.username = 'Username cannot be shorter than 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.trim().length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
            newErrors.password = 'Password must contain an uppercase letter, lowercase letter, number, and special character';
        }

        // If any errors, set them all at once and stop
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        const user = { username, password, email, bio };

        try {
            const res = await api.post('/api/users/signup/', user);
            
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

            setUsername(''); setPassword(''); setEmail(''); setBio('');
            navigate('/');

        } catch (err) {
            const data = err.response?.data;

            if (data?.errors) {
                setErrors(data.errors);
            } else {
                setErrors({ general: data?.error || "Something went wrong"});
            }
        }
    };

    const charCount = bio.length;
    // Display warning depending on text length (maximum 250 characters for bio)
    const charClass = charCount > 250 ? 'composer__char-count--over' : '';

    return (
        <div className="auth-card">
            <div className="auth-card__logo">Chatt<span>era</span></div>
            <div className="auth-card__tagline">// join the conversation</div>
            <div className="auth-card__title">Create account</div>

            <form className="form" onSubmit={handleSubmit}>

                <div className={"form-field"}>
                    <label className="form-field__label">Username</label>
                    <input
                        className={inputClass('username')}
                        type="text"
                        placeholder="yourhandle, your_handle123"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value)
                            setErrors((prev) => ({ ...prev, username: '' }));
                        }}
                    />
                </div>
                {errors.username && (
                    <span className="form-field__error">{errors.username}</span>
                )}

                <div className="form-field">
                    <label className="form-field__label">Email</label>
                    <input
                        className={inputClass('email')}
                        type="text"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                            setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                    />
                </div>
                {errors.email && (
                    <span className="form-field__error">{errors.email}</span>
                )}

                <div className="form-field">
                    <label className="form-field__label">Password</label>
                    <input
                        className={inputClass('password')}
                        type="password"
                        placeholder="min. 8 characters"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                    />
                </div>
                {errors.password && (
                    <span className="form-field__error">{errors.password}</span>
                )}

                <div className="form-field">
                    <label className="form-field__label">Bio</label>
                    <textarea
                        className={textareaClass('bio')}
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChange={(e) => {
                            setBio(e.target.value)
                            setErrors((prev) => ({ ...prev, bio: '' }));
                        }}
                    />
                </div>
                {errors.bio && (
                    <span className="form-field__error">{errors.bio}</span>
                )}

                <span style={{marginLeft: "auto"}} 
                    className={`composer__char-count ${charClass}`}
                >
                    {charCount}/250
                </span>

                {/* Display misc error message(s) */}
                {errors.general && (
                    <div className="form-error">{errors.general}</div>
                )}

                <button className="btn btn--primary btn--full btn--lg" type="submit">
                    Sign up →
                </button>

                <div className="form__divider">
                    <div className="form__divider-line" />
                    <span className="form__divider-text">or</span>
                    <div className="form__divider-line" />
                </div>

                <p className="form__footer-text">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>

                <GoogleButton />
            </form>
        </div>
    );
};

export default SignupUser;