import '../css/Feed.css'
import ChattCard from './ChattCard';

const DeleteAlert = ({ post, onConfirm, onCancel }) => {
    return (
        <div className="alert-overlay" onClick={onCancel}>
            <div className="alert" onClick={(e) => e.stopPropagation()}>

                <div className="alert__header">
                    <span className="alert__title">Delete chatt?</span>
                    <span className="alert__sub">This cannot be undone</span>
                </div>

                <div className="alert__preview">
                   <ChattCard post={post} />
                </div>

                <div className="alert__actions">
                    <button
                        className="btn btn--ghost btn--sm"
                        onClick={onCancel}
                    >
                        No, keep it
                    </button>
                    
                    <button
                        className="btn btn--danger-solid btn--sm"
                        onClick={onConfirm}
                    >
                        Yes, delete
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DeleteAlert;