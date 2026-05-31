import '../../css/Feed.css';

const DeleteChatt = ({ onClick }) => {

    return (
        <span className="btn btn--danger" onClick={onClick}>
            Delete
        </span>
    );
};

export default DeleteChatt;