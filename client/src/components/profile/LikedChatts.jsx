import ChattCard from '../ChattCard';
import SkeletonCard from '../SkeletonCard';

const LikedChatts = ({ chatts, loading, isOwner, username, onUpdate, onDelete }) => {
    return (
        <>
            <hr className="divider" />

            {loading && <SkeletonCard />}

            {!loading && chatts.length === 0 && (
                <div className="feed__empty">
                    <div className="feed__empty-title">No liked chatts</div>
                    <div className="feed__empty-sub">
                        // {isOwner
                            ? "chatts you like will appear here"
                            : `@${username} hasn't liked anything yet`
                        }
                    </div>
                </div>
            )}

            {!loading && chatts.map((post) => (
                <ChattCard
                    key={post._id}
                    post={post}
                    isAuthor={false}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
};

export default LikedChatts;