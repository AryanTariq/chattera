import '../../css/Profile.css';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useAuthContext from '../../hooks/useAuthContext';
import useChatteraContext from '../../hooks/useChatteraContext';
import ImageCropper from '../ImageCropper';

const EditProfile = ({ profile, onSave, onCancel }) => {
    const { user, dispatch: authDispatch } = useAuthContext();
    const { dispatch: chattsDispatch } = useChatteraContext();

    const [displayName, setDisplayName] = useState(profile.displayName || '');
    const [bio, setBio]                 = useState(profile.bio || '');
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '');
    const [bannerPreview, setBannerPreview] = useState(profile.banner || '');
    const [avatarFile, setAvatarFile]   = useState(null);
    const [bannerFile, setBannerFile]   = useState(null);
    const [errors, setErrors]           = useState({});
    const [saving, setSaving]           = useState(false);
    const [cropSrc, setCropSrc]         = useState(null);
    const [cropType, setCropType]       = useState(null);

    // If the user closes the edit form without saving, remove blob URLs
    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }

            if (bannerPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(bannerPreview);
            }

            if (cropSrc?.startsWith('blob:')) {
                URL.revokeObjectURL(cropSrc);
            }
        };
    }, [avatarPreview, bannerPreview, cropSrc]);

    // Handle event when user changes avatar/banner
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];

        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setCropSrc(objectUrl);
        setCropType(type);
        e.target.value = '';
    };

    // Handleevent when user is finished cropping
    const handleCropDone = (blob) => {
        const croppedUrl = URL.createObjectURL(blob);

        const croppedFile = new File(
            [blob],
            `${cropType}-${Date.now()}.jpg`,
            { type: 'image/jpeg' }
        );

        if (cropType === 'avatar') {
            if (avatarPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }

            setAvatarFile(croppedFile);
            setAvatarPreview(croppedUrl);
        } else {
            if (bannerPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }

            setBannerFile(croppedFile);
            setBannerPreview(croppedUrl);
        }

        setCropSrc(null);
        setCropType(null);
    };

    // Upload user avatar/banner that they set
    const uploadFile = async (file, endpoint) => {
        const formData = new FormData();

        formData.append(endpoint, file);

        const res = await api.post(
            `/api/users/${profile._id}/${endpoint}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                }
            }
        );

        return res.data;
    };

    // Handle event when user clicks save on edit profile
    const handleSave = async () => {
        setErrors({});
        setSaving(true);

        try {
            let updatedUser = null;

            // Upload avatar if changed
            if (avatarFile) {
                updatedUser = await uploadFile(avatarFile, 'avatar');
            }

            // Upload banner if changed 
            if (bannerFile) {
                updatedUser = await uploadFile(bannerFile, 'banner');
            }

            // Save text fields
            const res = await api.patch(
                `/api/users/${profile._id}`,
                { 
                    displayName, 
                    bio        
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            updatedUser = res.data;

            // Store updated user in local storage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            authDispatch({ type: 'UPDATE_USER', payload: updatedUser });

            // Refetch chatts to display updated user info
            const chattsRes = await api.get('/api/chatts/');
            chattsDispatch({ type: 'SET_CHATTS', payload: chattsRes.data });

            onSave(updatedUser);

        } catch (err) {
            const data = err.response?.data;

            if (data?.errors) {
                setErrors(data.errors);
            } else {
                setErrors({ general: data?.error || 'Something went wrong' });
            }
        } finally {
            setSaving(false);
        }
    };

    // Handle event when user removes avatar
    const removeAvatar = async () => {
        try {
            const res = await api.delete(
                `/api/users/${profile._id}/avatar`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            setAvatarFile(null);
            setAvatarPreview('');
            authDispatch({ type: 'UPDATE_USER', payload: res.data });

            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.log(err);
        }
    };

    // Handle event when user removes banner
    const removeBanner = async () => {
        try {
            const res = await api.delete(
                `/api/users/${profile._id}/banner`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            setBannerFile(null);
            setBannerPreview('');
            authDispatch({ type: 'UPDATE_USER', payload: res.data });

            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            {/* Cropper overlay */}
            {cropSrc && (
                <ImageCropper
                    imageSrc={cropSrc}
                    aspect={cropType === 'avatar' ? 1 : 3}
                    onCrop={handleCropDone}
                    onCancel={() => { 
                        if (cropSrc?.startsWith('blob:')) {
                            URL.revokeObjectURL(cropSrc);
                        }
                        
                        setCropSrc(null); setCropType(null); 
                    }}
                />
            )}

            <div className="profile__edit-form">

                {/* Upload banner */}
                <div className="form-field">
                    <div className="profile__upload-header">
                        <label className="form-field__label">Banner</label>

                        {bannerPreview && (
                            <button
                                type="button"
                                className="btn btn--danger btn--sm"
                                onClick={removeBanner}
                            >
                                Remove banner
                            </button>
                        )}
                    </div>

                    <div
                        className="upload-preview upload-preview--banner"
                        style={bannerPreview
                            ? { backgroundImage: `url(${bannerPreview})` }
                            : {}
                        }
                    >
                        <label className="upload-btn">
                            <i className="bi bi-camera" />
                            <span>Upload banner</span>
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => handleFileChange(e, 'banner')}
                            />
                        </label>
                    </div>
                </div>

                {/* Upload avatar */}
                <div className="form-field">
                    <label className="form-field__label">Avatar</label>
                    <div className="upload-avatar-row">

                        <div className="avatar avatar--lg upload-preview--avatar">

                            {avatarPreview ? (
                                <img src={avatarPreview} alt="avatar" className="avatar__img" />
                            ) : (
                                profile.username?.slice(0, 2).toUpperCase()
                            )}

                        </div>

                        <label className="btn btn--ghost btn--sm upload-btn--text">
                            <i className="bi bi-camera" /> Change avatar
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => handleFileChange(e, 'avatar')}
                            />
                        </label>

                        {avatarPreview && (
                            <button
                                type="button"
                                className="btn btn--danger btn--sm"
                                onClick={removeAvatar}
                            >
                                Remove avatar
                            </button>
                        )}

                    </div>
                </div>

                {/* Display name */}
                <div className="form-field">
                    <label className="form-field__label">Display name</label>

                    <input
                        className={`form-field__input${errors.displayName ? ' form-field__input--error' : ''}`}
                        type="text"
                        value={displayName}
                        placeholder="Your display name"
                        onChange={(e) => {
                            setDisplayName(e.target.value);
                            setErrors((p) => ({ ...p, displayName: '' }));
                        }}
                    />

                    {errors.displayName && (
                        <span className="form-field__error">{errors.displayName}</span>
                    )}

                </div>

                {/* Bio */}
                <div className="form-field">
                    <label className="form-field__label">Bio</label>

                    <textarea
                        className={`form-field__textarea${errors.bio ? ' form-field__input--error' : ''}`}
                        value={bio}
                        placeholder="Tell us about yourself..."
                        onChange={(e) => {
                            setBio(e.target.value);
                            setErrors((p) => ({ ...p, bio: '' }));
                        }}
                    />

                    {errors.bio && (
                        <span className="form-field__error">{errors.bio}</span>
                    )}

                    <span className="form-field__label" style={{ marginTop: '4px' }}>
                        {bio.length}/250
                    </span>

                </div>

                {errors.general && (
                    <div className="form-error">{errors.general}</div>
                )}

                <div className="profile__edit-actions">

                    <button
                        className="btn btn--ghost btn--sm"
                        onClick={onCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn--primary btn--sm"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>

                </div>
            </div>
        </>
    );
};

export default EditProfile;