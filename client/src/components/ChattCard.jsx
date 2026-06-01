import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthContext from '../hooks/useAuthContext';
import useChatteraContext from '../hooks/useChatteraContext';
import DeleteChatt from './buttons/DeleteChatt';
import EditChatt from './buttons/EditChatt';
import DeleteAlert from './DeleteAlert';
import ImageLightbox from './ImageLightbox';
import ChattEditForm from './forms/ChattEdit';
import { formatRelativeDate, formatFullDate } from '../utils/dateFormat';

const ChattCard = ({ post, isAuthor, onUpdate, onDelete, highlighted, disableNavigation }) => {
    const { user } = useAuthContext();
    const { dispatch } = useChatteraContext();
    const navigate = useNavigate();

    const [isEditing, setIsEditing]         = useState(false);
    const [showAlert, setShowAlert]         = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // Check if logged in user has liked this chatt
    const isLiked = user && post.likes?.some(
        (id) => id.toString() === user._id.toString()
    );

    // Handle the event where user likes this chatt
    const handleLike = async () => {
        if (!user) return;

        try {
            const res = await axios.patch(
                `http://localhost:5000/api/chatts/like/${post._id}`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            dispatch({
                type: 'UPDATE_CHATT',
                payload: res.data
            });
            onUpdate?.(res.data);

        } catch (err) {
            console.log(err.response?.data?.error || 'Something went wrong');
        }
    };

    // Handle event when user deletes their chatt
    const handleDelete = async () => {
        try {
            const res = await axios.delete(
                'http://localhost:5000/api/chatts/' + post._id,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            dispatch({
                type: 'DELETE_CHATT',
                payload: res.data
            });
            onDelete?.(res.data); // If onDelete is provided, then call handleChattDelete

            setShowAlert(false);

        } catch (err) {
            console.log(err.response?.data?.error || 'Something went wrong');
            setShowAlert(false);
        }
    };

    // Handle event when user successfully saves their edited chatt
    const handleEditSave = (updatedChatt) => {
        onUpdate?.(updatedChatt); // If onUpdate is provided, then call handleChattUpdate
        setIsEditing(false);
    };

    // Handle click on the card, navigate to chatt detail page
    const handleCardClick = (e) => {
        // Don't navigate if user clicked a link, button, or interactive element
        if (e.target.closest('a, button, textarea, input, video')) return;
        if (disableNavigation) return;

        navigate(`/chatt/${post._id}`);
    };

    // Only image media is passed to the lightbox
    const images = post.media?.filter(m => m.type === 'image') || [];

    return (
        <>
            {showAlert && (
                <DeleteAlert
                    post={post}
                    onConfirm={handleDelete}
                    onCancel={() => setShowAlert(false)}
                />
            )}

            {/* Display image pop-out when clicked on */}
            {lightboxIndex !== null && (
                <ImageLightbox
                    media={images}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNavigate={setLightboxIndex}
                />
            )}

            <div 
                className={`chatt-card ${highlighted ? 'chatt-card--highlighted' : ''}`} 
                onClick={handleCardClick}
            >

                <Link to={`/profile/${post.user?.username}`}
                      className="avatar avatar--sm"
                >
                    {/* Display user avatar if it exists */}
                    {/* Otherwise, display first 2 letters of user's username */}
                    {post.user?.avatar ? (
                        <img
                            src={post.user.avatar}
                            alt={post.user.username}
                            className="avatar__img"
                        />
                    ) : (
                        post.user?.username
                            ? post.user.username.slice(0, 2).toUpperCase()
                            : '?'
                    )}
                </Link>

                <div className="chatt-card__body">
                    <div className="chatt-card__header">

                        <Link to={`/profile/${post.user?.username}`}
                              className="chatt-card__name"
                        >
                            {post.user?.displayName ||
                             post.user?.username || 'Anonymous'}
                        </Link>

                        <Link to={`/profile/${post.user?.username}`}
                              className="chatt-card__handle"
                        >
                            @{post.user?.username || 'anon'}
                        </Link>

                        <span className="chatt-card__time-wrapper">
                            <span className="chatt-card__time">
                                · {formatRelativeDate(post.createdAt)}
                            </span>

                            {/* Tooltip showing full date on hover */}
                            <div className="chatt-card__tooltip">
                                {formatFullDate(post.createdAt)}
                            </div>
                        </span>

                        {post.edited && (
                            <span className="chatt-card__edited">Edited</span>
                        )}

                    </div>

                    {/* Show edit form or chatt content */}
                    {isEditing ? (
                        <ChattEditForm
                            post={post}
                            onSave={handleEditSave}
                            onCancel={() => setIsEditing(false)}
                        />
                    ) : (
                        <>
                            {/* Only render text paragraph if there is text */}
                            {post.text && (
                                <p className="chatt-card__text">{post.text}</p>
                            )}

                            {/* Display chatt media if it exists */}
                            {post.media?.length > 0 && (
                                <div className={`chatt-media chatt-media--${post.media.length > 1 ? 'grid' : 'single'}`}>

                                    {post.media.map((item, i) => (
                                        item.type === 'video' ? (
                                            <video
                                                key={i}
                                                src={item.url}
                                                className="chatt-media__item"
                                                controls
                                            />
                                        ) : (
                                            <img
                                                key={i}
                                                src={item.url}
                                                alt=""
                                                className="chatt-media__item chatt-media__item--clickable"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setLightboxIndex(
                                                        images.findIndex(img => img.url === item.url)
                                                    )
                                                }}
                                            />
                                        )
                                    ))}

                                </div>
                            )}
                        </>
                    )}

                    <div className="chatt-actions">
                        <button
                            className={`chatt-action chatt-action--like ${isLiked ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleLike(); }}
                            style={{ cursor: user ? 'pointer' : 'default' }}
                        >
                            <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`} />
                            {post.likes?.length ?? 0}
                        </button>

                        {/* Reply button, only on top-level chatts */}
                        {!post.parentId && (
                            <button
                                className="chatt-action chatt-action--reply"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/chatt/${post._id}`);
                                }}
                            >
                                <i className="bi bi-chat" />
                                {post.replyCount ?? 0}
                            </button>
                        )}  

                        {/* Display edit and delete buttons if user is logged in and author */}
                        {isAuthor && !isEditing && (
                            <>
                                <EditChatt onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }} />
                                <DeleteChatt onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAlert(true);
                                }} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChattCard;