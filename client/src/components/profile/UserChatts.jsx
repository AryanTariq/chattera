import ChattCard from '../ChattCard';
import SkeletonCard from '../SkeletonCard';

const UserChatts = ({ chatts, loading, isOwner, username, user, onUpdate, onDelete }) => {
    return (
        <>
            <hr className="divider" />

            {loading && <SkeletonCard />}

            {!loading && chatts.length === 0 && (
                <div className="feed__empty">
                    <div className="feed__empty-title">No chatts yet</div>
                    <div className="feed__empty-sub">
                        // {isOwner
                            ? "share what's on your mind"
                            : `@${username} hasn't chatted yet`
                        }
                    </div>
                </div>
            )}

            {!loading && chatts.map((post) => (
                <ChattCard
                    key={post._id}
                    post={post}
                    isAuthor={user && user._id === post.user?._id}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
};

export default UserChatts;