import '../css/Profile.css';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthContext from '../hooks/useAuthContext';
import EditProfile from '../components/forms/EditProfile';
import UserChatts from '../components/profile/UserChatts';
import LikedChatts from '../components/profile/LikedChatts';

const Profile = () => {
    const { username } = useParams();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [chatts, setChatts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chattsLoading, setChattsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [sort, setSort] = useState('newest');
    const [tab, setTab] = useState('chatts');       
    const [likedChatts, setLikedChatts] = useState([]); 
    const [likedLoading, setLikedLoading] = useState(false);

    const isOwner = user && profile &&
        user._id === profile._id.toString();

    // Fetch user's profile
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                const res = await api.get(`/api/users/u/${username}`)
                setProfile(res.data);
                
            } catch (err) {
                if (err.response?.status === 404) {
                    setNotFound(true);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [username]);

    // Fetch user's chatts whenever profile, sort, or liked chatts changes
    useEffect(() => {
        if (!profile) return;

        const fetchUserChatts = async () => {
            setChattsLoading(true);

            try {
                const res = await api.get(
                    `/api/chatts/user/${profile._id}?sort=${sort}`
                );
                setChatts(res.data);

            } catch (err) {
                console.log(err);
            } finally {
                setChattsLoading(false);
            }
        }

        fetchUserChatts();
    }, [profile, sort, likedChatts])

    // Fetch user's liked chatts when tab switches to "liked"
    useEffect(() => {
        if (!profile || tab !== 'liked') return;

        const fetchLikedChatts = async () => {
            setLikedLoading(true);

            try {
                const res = await api.get(
                    `/api/chatts/liked/${profile._id}?sort=${sort}`
                );

                setLikedChatts(res.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLikedLoading(false);
            }
        };

        fetchLikedChatts();
    }, [profile, tab, sort]);

    const handleProfileUpdate = async (updatedUser) => {
        setProfile(updatedUser);
        setIsEditing(false);

        // Refetch chatts when profile updates, so user's chatts reflect update
        try {
            const res = await api.get(
                `/api/chatts/user/${updatedUser._id}?sort=${sort}`
            );
            setChatts(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    // Handle the event where user updates their chatt on the profile page
    const handleChattUpdate = (updatedChatt) => {
        setChatts((prev) =>
            prev.map((chatt) =>
                chatt._id === updatedChatt._id ? updatedChatt : chatt
            )
        );
    };

    // Handle the event where user deletes their chatt on the profile page
    const handleChattDelete = (deletedChatt) => {
        setChatts((prev) =>
            prev.filter((chatt) => 
                // Remove the deleted chatt itself
                chatt._id !== deletedChatt._id &&
                // Also remove replies to the deleted chatt 
                chatt.parentId !== deletedChatt._id      
            )
        );
    };

    if (loading) return (
        <div className="profile-page">
            <div className="profile__banner skeleton" />
            <div className="profile__meta">
                <div className="avatar avatar--lg skeleton" />
            </div>
        </div>
    );

    if (notFound) return (
        <div className="profile-page">
            <div className="profile__not-found">
                <span className="profile__not-found-title">User not found</span>
                <span className="profile__not-found-sub">// @{username} doesn't exist</span>
                <button className="btn btn--ghost btn--sm" onClick={() => navigate('/')}>
                    ← Back to feed
                </button>
            </div>
        </div>
    );

    return (
        <div className="profile-page">

            {/* Display user banner */}
            <div
                className="profile__banner"
                style={profile.banner ? { backgroundImage: `url(${profile.banner})` } : {}}
            />

            {/* Avatar and edit button row */}
            <div className="profile__meta">
                <div className="avatar avatar--lg">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.username} className="avatar__img"/>
                    ) : (
                        profile.username?.slice(0, 2).toUpperCase()
                    )}
                </div>

                {isOwner && !isEditing && (
                    <button
                        className="btn btn--ghost btn--sm profile__edit-btn"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit profile
                    </button>
                )}
            </div>

            {/* Show edit form or profile info */}
            {isEditing ? (
                <EditProfile
                    profile={profile}
                    onSave={handleProfileUpdate}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <div className="profile__info">
                    <div className="profile__names">

                        <span className="profile__display-name">
                            {profile.displayName || profile.username}
                        </span>

                        <span className="profile__handle">
                            @{profile.username}
                        </span>

                    </div>

                    {profile.bio && (
                        <p className="profile__bio">{profile.bio}</p>
                    )}

                    <span className="profile__joined">
                        // joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                        })}
                    </span>
                </div>
            )}

            {/* Display tab for switching to user's chatts/user's liked chatts */}
            <div className="profile__chatts">
                <div className="profile__tabs">
                    <button
                        className={`profile__tab ${tab === 'chatts' ? 'active' : ''}`}
                        onClick={() => setTab('chatts')}
                    >
                        Chatts
                    </button>

                    <button
                        className={`profile__tab ${tab === 'liked' ? 'active' : ''}`}
                        onClick={() => setTab('liked')}
                    >
                        Liked
                    </button>
                </div>

                {/* Display chatt count and sorting buttons */}
                {tab === 'chatts' && (
                    <div className="profile__section-header">

                        <span className="profile__section-count">
                            {chatts.length} {chatts.length === 1 ? 'chatt' : 'chatts'}
                        </span>

                        <div className="profile__inline-sort">
                            <button
                                className={`profile__inline-sort-btn ${sort === 'newest' ? 'active' : ''}`}
                                onClick={() => setSort('newest')}
                            >
                                Newest
                            </button>

                            <span className="profile__inline-sort-divider">|</span>

                            <button
                                className={`profile__inline-sort-btn ${sort === 'oldest' ? 'active' : ''}`}
                                onClick={() => setSort('oldest')}
                            >
                                Oldest
                            </button>
                        </div>
                    </div>
                )}

                {/* Display liked chatt count */}
                {tab === 'liked' && (
                    <div className="profile__section-header">
                        <span className="profile__section-count">
                            {likedChatts.length} liked
                        </span>
                    </div>
                )}

                {tab === 'chatts' && (
                    <UserChatts
                        chatts={chatts}
                        loading={chattsLoading}
                        isOwner={isOwner}
                        username={profile.username}
                        user={user}
                        onUpdate={handleChattUpdate}
                        onDelete={handleChattDelete}
                    />
                )}

                {tab === 'liked' && (
                    <LikedChatts
                        chatts={likedChatts}
                        loading={likedLoading}
                        isOwner={isOwner}
                        username={profile.username}
                        user={user}
                        onUpdate={(updated) => {
                            const stillLiked = updated.likes?.some(
                                (id) => id.toString() === user?._id?.toString()
                            );
                            if (stillLiked) {
                                setLikedChatts((prev) =>
                                    prev.map((c) => c._id === updated._id ? updated : c)
                                );
                            } else {
                                // User unliked it, remove from liked tab immediately
                                setLikedChatts((prev) =>
                                    prev.filter((c) => c._id !== updated._id)
                                );
                            }
                        }}
                        onDelete={(deleted) => setLikedChatts((prev) =>
                            prev.filter((c) => c._id !== deleted._id)
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default Profile;