import { useEffect } from 'react';
import '../css/Feed.css';

const ImageLightbox = ({ media, currentIndex, onNavigate, onClose }) => {
    const currentImage = media[currentIndex];
    
    // Close on Escape key, right/left arrows for navigation
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }

            if (e.key === 'ArrowLeft') {
                onNavigate(
                    currentIndex === 0
                        ? media.length - 1
                        : currentIndex - 1
                );
            }

            if (e.key === 'ArrowRight') {
                onNavigate(
                    currentIndex === media.length - 1
                        ? 0
                        : currentIndex + 1
                );
            }
        };

        window.addEventListener('keydown', handleKey);

        return () =>
            window.removeEventListener('keydown', handleKey);
    }, [currentIndex, media, onClose, onNavigate]);

    const goPrev = (e) => {
        e.stopPropagation();

        onNavigate(
            currentIndex === 0
                ? media.length - 1
                : currentIndex - 1
        );
    };

    const goNext = (e) => {
        e.stopPropagation();

        onNavigate(
            currentIndex === media.length - 1
                ? 0
                : currentIndex + 1
        );
    };

    return (
        <div className="lightbox-overlay" onClick={onClose}>

            {/* Display image navigation arrows */}
            {media.length > 1 && (
                <>
                    <button
                        className="lightbox-arrow lightbox-arrow--left"
                        onClick={goPrev}
                    >
                        <i className="bi bi-chevron-left" />
                    </button>

                    <button
                        className="lightbox-arrow lightbox-arrow--right"
                        onClick={goNext}
                    >
                        <i className="bi bi-chevron-right" />
                    </button>
                </>
            )}
            
            <button className="lightbox-close" onClick={onClose}>
                <i className="bi bi-x-lg" />
            </button>

            <img
                src={currentImage.url}
                alt=""
                className="lightbox-img"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default ImageLightbox;