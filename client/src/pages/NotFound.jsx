import { Link } from 'react-router-dom';
import '../css/NotFound.css';

const NotFound = () => (
    <div className="not-found">
        <span className="not-found__code">404</span>
        <h1 className="not-found__title">Page not found</h1>
        <p className="not-found__sub">// this route doesn't exist</p>
        <Link to="/" className="btn btn--ghost btn--sm">← Back to feed</Link>
    </div>
);

export default NotFound;