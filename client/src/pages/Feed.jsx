import '../css/Feed.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import CreateChatt from "../components/forms/CreateChatt";
import ChattCard from '../components/ChattCard';
import useAuthContext from '../hooks/useAuthContext';
import useChatteraContext from '../hooks/useChatteraContext';

const Feed = () => {
    const { user } = useAuthContext();
    const {chatts, dispatch} = useChatteraContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChatts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/chatts/');

                dispatch({
                    type: "SET_CHATTS", 
                    payload: res.data
                });
                
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchChatts();
    }, [dispatch]);

    return (
        <div className="feed">
            <div className="feed__header">
                <span className="feed__title">Feed</span>
            </div>

            {user && <CreateChatt />}

            <hr className="divider" />

            {/* Loading skeleton */}
            {loading && (
                <div className="chatt-card">
                    <div className="avatar skeleton" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div className="skeleton skeleton--line" style={{ width: '40%' }} />
                        <div className="skeleton skeleton--line" style={{ width: '90%' }} />
                        <div className="skeleton skeleton--line" />
                    </div>
                </div>
            )}

            {/* Posts */}
            {!loading && chatts.length === 0 && (
                <div className="feed__empty">
                    <div className="feed__empty-title">Nothing here yet</div>
                    <div className="feed__empty-sub">// be the first to chatt</div>
                </div>
            )}

            {chatts.map((post) => (
                <ChattCard
                    key={post._id}
                    post={post}
                    isAuthor={user && user._id === post.user?._id}
                />
            ))}
        </div>
    );
};

export default Feed;
