import { useState } from 'react';
import axios from 'axios';
import useAuthContext from '../../hooks/useAuthContext';
import useChatteraContext from '../../hooks/useChatteraContext';
import ImageLightbox from '../ImageLightbox';

const ChattEditForm = ({ post, onSave, onCancel }) => {
    const { user } = useAuthContext();
    const { dispatch } = useChatteraContext();

    const [editText, setEditText]           = useState(post.text);
    const [editMedia, setEditMedia]         = useState(post.media || []);
    const [error, setError]                 = useState('');
    const [saving, setSaving]               = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const charCount = editText.length;
    // Display warning depending on text length (maximum 300 characters for a chatt)
    const charClass =
        charCount > 300 ? 'chatt-edit__charcount--over' :
        charCount > 280 ? 'chatt-edit__charcount--warn' : '';

    // Handle event when user removes media during editing
    const removeEditMedia = (index) => {
        setEditMedia(prev => prev.filter((_, i) => i !== index));
    };

    // Handle event when user saves their edited chatt
    const handleSave = async () => {
        setError('');
        setSaving(true);

        try {
            const res = await axios.patch(
                'http://localhost:5000/api/chatts/' + post._id,
                { text: editText, media: editMedia },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            dispatch({
                type: 'UPDATE_CHATT',
                payload: res.data
            });
            onSave(res.data);

        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                // Pick the first Mongoose validation error message
                const firstError = Object.values(data.errors)[0];
                setError(firstError);
            } else {
                setError(data?.error || 'Something went wrong');
            }
        } finally {
            setSaving(false);
        }
    };

    // Handle event when user cancels editing their chatt
    const handleCancel = () => {
        setEditText(post.text);
        setEditMedia(post.media || []);
        setError('');
        onCancel();
    };

    // Only image media is passed to the lightbox
    const images = editMedia.filter(m => m.type === 'image');

    return (
        <>
            {/* Display image pop-out when clicked on during editing */}
            {lightboxIndex !== null && (
                <ImageLightbox
                    media={images}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNavigate={setLightboxIndex}
                />
            )}

            <div className="chatt-edit">

                <textarea
                    className="chatt-edit__textarea"
                    value={editText}
                    autoFocus
                    disabled={saving}
                    onChange={(e) => setEditText(e.target.value)}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />

                {/* Show existing media with remove buttons */}
                {editMedia.length > 0 && (
                    <div className="chatt-edit__media">

                        {editMedia.map((item, i) => (
                            <div className="chatt-edit__media-item" key={i}>

                                {item.type === 'video' ? (
                                    <video
                                        src={item.url}
                                        className="chatt-edit__media-preview"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={item.url}
                                        alt=""
                                        className="chatt-edit__media-preview chatt-media__item--clickable"
                                        onClick={() => setLightboxIndex(
                                            images.findIndex(img => img.url === item.url)
                                        )}
                                    />
                                )}

                                <button
                                    type="button"
                                    className="composer__preview-remove"
                                    disabled={saving}
                                    onClick={() => removeEditMedia(i)}
                                >
                                    <i className="bi bi-x" />
                                </button>

                            </div>
                        ))}

                    </div>
                )}

                <div className="chatt-edit__actions">
                    <span className={`chatt-edit__charcount ${charClass}`}>
                        {editText.length}/300
                    </span>

                    {error && <span className="form-error">{error}</span>}

                    <button
                        className="btn btn--ghost btn--sm"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn--primary btn--sm"
                        onClick={handleSave}
                        disabled={saving}
                        style={{ minWidth: '68px' }}
                    >
                        {/* Display spinner when saving */}
                        {saving ? (
                            <span className="composer__spinner" />
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>

            </div>
        </>
    );
};

export default ChattEditForm;