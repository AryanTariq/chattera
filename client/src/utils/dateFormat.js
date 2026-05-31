// Relative timestamp shown on chatt cards
export const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000);

    // Just now
    if (seconds === 0) {
        return `now`
    }

    // Less than 1 minute
    if (seconds < 60) {
        return `${seconds}s`;
    }

    // Less than 1 hour
    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m`;
    }

    // Less than 24 hours
    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h`;
    }

    // Less than 1 year → "May 29"
    const years = now.getFullYear() - date.getFullYear();

    if (years < 1) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    }

    // 1+ years → "May 29, 2025"
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

// Full tooltip timestamp
export const formatFullDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.getDate();

    const getOrdinal = (n) => {
        if (n > 3 && n < 21) return 'th';

        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const month = date.toLocaleString('en-US', {
        month: 'long',
    });

    const year = date.getFullYear();

    const time = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    });

    return `${month} ${day}${getOrdinal(day)}, ${year} at ${time}`;
};