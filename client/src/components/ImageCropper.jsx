import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import '../css/Profile.css';

// Helper to create a cropped image blob from canvas
const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
    const image = await createImageBitmap(
        await (await fetch(imageSrc)).blob()
    );

    const canvas = document.createElement('canvas');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
    );

    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
};

const ImageCropper = ({ imageSrc, aspect, onCrop, onCancel }) => {
    const [crop, setCrop]       = useState({ x: 0, y: 0 });
    const [zoom, setZoom]       = useState(1);
    const [croppedArea, setCroppedArea] = useState(null);

    const onCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedArea(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        const blob = await getCroppedImg(imageSrc, croppedArea);
        onCrop(blob);
    };

    return (
        <div className="cropper-overlay">
            <div className="cropper-container">
                <div className="cropper-area">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="cropper-controls">
                    <div className="cropper-zoom">
                        <label className="form-field__label">Zoom</label>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.05}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="cropper-zoom-slider"
                        />
                    </div>

                    <div className="cropper-actions">
                        <button className="btn btn--ghost btn--sm" onClick={onCancel}>
                            Cancel
                        </button>
                        
                        <button className="btn btn--primary btn--sm" onClick={handleConfirm}>
                            Apply crop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;