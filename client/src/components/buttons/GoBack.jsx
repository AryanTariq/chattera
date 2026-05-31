import { useNavigate } from 'react-router-dom';

const GoBack = () => {
    const navigate = useNavigate();

    return (
        <button
            className="btn btn--ghost btn--sm"
            onClick={() => navigate(-1)}
        >
            ← Go back
        </button>
    )
};

export default GoBack;
