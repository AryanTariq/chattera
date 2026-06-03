import '../../css/Feed.css';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext';
import useChatteraContext from '../../hooks/useChatteraContext';
import api from '../../utils/api';

// Form for creating a new chatt
const CreateChatt = ({ parentId = null, onSuccess = null }) => {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const { dispatch } = useChatteraContext();

    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [previews, setPreviews]   = useState([]);
    const [posting, setPosting] = useState(false);

    // Handle event when user submits chatt form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!user) { navigate('/signup'); return; }
        // Start loading
        setPosting(true);

        try {
            const formData = new FormData();
            formData.append('text', text);
            mediaFiles.forEach(file => formData.append('media', file));

            // Use reply endpoint if parentId provided, otherwise regular endpoint
            const url = parentId
                ? `/api/chatts/${parentId}/replies`
                : '/api/chatts/';

            const res = await api.post(url, formData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // If this is a reply, call onSuccess callback to update parent chatt's replies
            if (parentId && onSuccess) {
                onSuccess(res.data);
            } else {
                dispatch({ type: "CREATE_CHATT", payload: res.data });
            }

            setText('');
            setMediaFiles([]);
            setPreviews([]);
            
        } catch (err) {
            setError(err.response?.data?.errors?.text);
        } finally {
            setPosting(false); // Stop loading
        }
    };

    // Handle event when media changes
    const handleMediaChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const remaining = 4 - mediaFiles.length;
        const toAdd = newFiles.slice(0, remaining); 

        setMediaFiles(prev => [...prev, ...toAdd]);
        setPreviews(prev => [
            ...prev,
            ...toAdd.map(f => ({
                url: URL.createObjectURL(f),
                type: f.type.startsWith('video/') ? 'video' : 'image'
            }))
        ]);

        // Reset input so same file can be re-added after removal
        e.target.value = '';
    };

    // Handle event when user removes media
    const removeMedia = (index) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const charCount = text.length;
    // Display warning depending on text length (maximum 300 characters for a chatt)
    const charClass =
        charCount > 300 ? 'composer__char-count--over' :
        charCount > 280 ? 'composer__char-count--warn' :
        '';

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="composer">
                {/* Avatar displays first two letters of user's username */}
                <Link to={`/profile/${user?.username}`} className="avatar">

                    {/* Display user avatar and username if it exists */}
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.username}
                            className="avatar__img"
                        />
                    ) : (
                        user?.username 
                            ? user.username.slice(0, 2).toUpperCase() 
                            : '?'
                    )}

                </Link>
                <div className="composer__body">
                    
                    <textarea
                        className="composer__textarea"
                        placeholder={parentId ? "Post your reply..." : "What's happening?"}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />

                    {/* Media previews */}
                    {previews.length > 0 && (
                        <div className="composer__previews">

                            {previews.map((p, i) => (
                                <div className="composer__preview-item" key={i}>

                                    {p.type === 'video' ? (
                                        <video src={p.url} className="chatt-edit__media-preview" />
                                    ) : (
                                        <img src={p.url} alt="" className="chatt-edit__media-preview" />
                                    )}

                                    <button
                                        type="button"
                                        className="composer__preview-remove"
                                        onClick={() => removeMedia(i)}
                                    >
                                        <i className="bi bi-x" />
                                    </button>

                                </div>
                            ))}
                        </div>
                    )}

                    <div className="composer__footer">
                        <span className={`composer__char-count ${charClass}`}>
                            {charCount}/300
                        </span>

                        <label className={`composer__media-btn ${posting ? 'disabled' : ''}`}>
                            <i className="bi bi-image" />
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                hidden
                                disabled={posting}
                                onChange={handleMediaChange}
                            />
                        </label>

                        <button
                            className="btn btn--primary btn--sm"
                            disabled={posting}
                            style={{ minWidth: '68px' }}
                        >
                            {posting 
                                ? <span className="composer__spinner" />
                                : parentId ? 'Reply' : 'Chatt'
                            }
                        </button>
                    </div>

                    {error && <div className="form-error">{error}</div>}
                </div>
            </div>
        </form>
    );
}

export default CreateChatt;