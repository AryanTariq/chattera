import '../../css/Feed.css';

const EditChatt = ({ onClick }) => {
    return (
        <button className="btn btn--edit" onClick={onClick}>
            Edit
        </button>
    );
};

export default EditChatt;