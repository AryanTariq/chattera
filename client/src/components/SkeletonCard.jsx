
const SkeletonCard = () => (
    <div className="chatt-card">
        <div className="avatar skeleton" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
            <div className="skeleton skeleton--line" style={{ width: '40%' }} />
            <div className="skeleton skeleton--line" style={{ width: '90%' }} />
            <div className="skeleton skeleton--line" />
        </div>
    </div>
);

export default SkeletonCard;