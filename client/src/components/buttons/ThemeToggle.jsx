import useThemeContext from '../../hooks/useThemeContext';
import '../../css/App.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeContext();
    const isDark = theme === 'dark';

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <span className="theme-toggle__track">
                <span className="theme-toggle__thumb">
                    <i className={`bi ${isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`} />
                </span>
            </span>
        </button>
    );
};

export default ThemeToggle;