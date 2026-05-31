import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthContext from '../hooks/useAuthContext';

const OAuthCallback = () => {
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('token');

        if (!raw) {
            navigate('/login?error=oauth_failed');
            return;
        }

        try {
            const userData = JSON.parse(raw);

            // Store in localStorage, same as regular login
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData));

            // Update auth context
            dispatch({ type: 'LOGIN', payload: userData });

            navigate('/');

        } catch (err) {
            console.error('OAuth callback error:', err);
            navigate('/login?error=oauth_failed');
        }
    }, [dispatch, navigate]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - var(--navbar-height))',
            flexDirection: 'column',
            gap: '12px'
        }}>

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
                // signing you in...
            </span>
            
            <div style={{
                width: '20px', height: '20px',
                border: '2px solid var(--border-strong)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite'
            }} />
        </div>
    );
};

export default OAuthCallback;