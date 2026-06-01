import '../css/Feed.css';
import '../css/ChatDetail.css';
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ChattCard from '../components/ChattCard';
import CreateChatt from '../components/forms/CreateChatt';
import useAuthContext from '../hooks/useAuthContext';

const ChattDetail = () => {
    const { id } = useParams();
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();

    const [chatt, setChatt]         = useState(null);
    const [replies, setReplies]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [repliesLoading, setRepliesLoading] = useState(true);
    const [notFound, setNotFound]   = useState(false);
    const [sort, setSort]           = useState('popular');

    const highlightRef = useRef(null);
    const highlightId = location.state?.highlightId || null;

    useEffect(() => {
        const fetchChatt = async () => {
            setLoading(true);

            try {
                const res = await axios.get(
                    `http://localhost:5000/api/chatts/detail/${id}`
                );
                const data = res.data;

                // If this chatt is itself a reply, redirect to parent
                // and highlight this reply
                if (data.parentId) {
                    const parentId = typeof data.parentId === 'object'
                        ? data.parentId._id
                        : data.parentId;

                    navigate(
                        `/chatt/${parentId}`,
                        { state: { highlightId: id }, replace: true }
                    );
                    return;
                }

                setChatt(data);
            } catch (err) {
                if (err.response?.status === 404) setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchChatt();
    }, [id, navigate]);

    // Fetch replies whenever chatt or sort changes
    useEffect(() => {
        if (!chatt) return;

        const fetchReplies = async () => {
            setRepliesLoading(true);

            try {
                const res = await axios.get(
                    `http://localhost:5000/api/chatts/${chatt._id}/replies?sort=${sort}`
                );
                setReplies(res.data);
            } catch (err) {
                console.log(err);
            } finally {
                setRepliesLoading(false);
            }
        };

        fetchReplies();
    }, [chatt, sort]);

    // Scroll to highlighted reply
    useEffect(() => {
        if (highlightId && highlightRef.current) {
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);
        }
    }, [highlightId, replies]);

    const handleReplyCreated = (newReply) => {
        // Add to top then re-sort
        setReplies(prev => {
            const updated = [newReply, ...prev];
            if (sort === 'newest') return updated;
            if (sort === 'oldest') return [...prev, newReply];
            // popular — new reply has 0 likes so goes to end
            return [...prev, newReply];
        });

        // Update reply count on parent chatt
        setChatt(prev => ({ ...prev, replyCount: (prev.replyCount || 0) + 1 }));
    };
    
    // Handle updates to a reply (e.g. like, edit)
    const handleReplyUpdate = (updated) => {
        setReplies(prev =>
            prev.map(r => r._id === updated._id ? updated : r)
        );
    };

    // Handle deletion of a reply
    const handleReplyDelete = (deleted) => {
        setReplies(prev => prev.filter(r => r._id !== deleted._id));
        setChatt(prev => ({
            ...prev,
            replyCount: Math.max(0, (prev.replyCount || 0) - 1)
        }));
    };

    if (loading) return (
        <div className="chatt-detail">
            <div className="chatt-card">
                <div className="avatar skeleton" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton--line" style={{ width: '40%' }} />
                    <div className="skeleton skeleton--line" style={{ width: '90%' }} />
                    <div className="skeleton skeleton--line" />
                </div>
            </div>
        </div>
    );

    if (notFound) return (
        <div className="chatt-detail">
            <div className="feed__empty">
                <div className="feed__empty-title">Chatt not found</div>
                <div className="feed__empty-sub">// it may have been deleted</div>
                <button className="btn btn--ghost btn--sm" onClick={() => navigate('/')}>
                    ← Back to feed
                </button>
            </div>
        </div>
    );

    return (
        <div className="chatt-detail">

            {/* Back button */}
            <div className="chatt-detail__header">
                <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                <span className="chatt-detail__title">Chatt</span>
            </div>

            {/* The main chatt */}
            {chatt && (
                <ChattCard
                    post={chatt}
                    isAuthor={user && user._id === chatt.user?._id}
                    onUpdate={(updated) => setChatt(updated)}
                    onDelete={() => navigate('/')}
                    disableNavigation
                />
            )}

            <hr className="divider" />

            {/* Reply composer */}
            {user && chatt && (
                <CreateChatt
                    parentId={chatt._id}
                    onSuccess={handleReplyCreated}
                />
            )}

            {/* Replies header with sort */}
            <div className="chatt-detail__replies-header">
                <span className="profile__section-count">
                    {chatt?.replyCount ?? 0}{' '}
                    {(chatt?.replyCount ?? 0) === 1 ? 'reply' : 'replies'}
                </span>

                <div className="profile__inline-sort">
                    {['popular', 'newest', 'oldest'].map(s => (
                        <button
                            key={s}
                            className={`profile__inline-sort-btn ${sort === s ? 'active' : ''}`}
                            onClick={() => setSort(s)}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* Replies list */}
            {repliesLoading && (
                <div className="chatt-card">
                    <div className="avatar skeleton" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div className="skeleton skeleton--line" style={{ width: '40%' }} />
                        <div className="skeleton skeleton--line" style={{ width: '90%' }} />
                        <div className="skeleton skeleton--line" />
                    </div>
                </div>
            )}

            {!repliesLoading && replies.length === 0 && (
                <div className="feed__empty">
                    <div className="feed__empty-title">No replies yet</div>
                    <div className="feed__empty-sub">
                        // {user ? 'be the first to reply' : 'log in to reply'}
                    </div>
                </div>
            )}

            {!repliesLoading && replies.map((reply) => (
                <div
                    key={reply._id}
                    ref={reply._id === highlightId ? highlightRef : null}
                >
                    <ChattCard
                        post={reply}
                        isAuthor={user && user._id === reply.user?._id}
                        onUpdate={handleReplyUpdate}
                        onDelete={handleReplyDelete}
                        highlighted={reply._id === highlightId}
                        disableNavigation
                    />
                </div>
            ))}

        </div>
    );
};

export default ChattDetail;