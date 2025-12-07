export function normalizeYouTubeId(value = '') {
    let input = (value ?? '').trim();
    if (!input) return '';

    // Try to parse as a URL to support pasting any YouTube link format
    try {
        const url = new URL(input);
        const hostname = url.hostname.toLowerCase();

        if (hostname.includes('youtu.be')) {
            const path = url.pathname.replace('/', '');
            if (path) {
                return path.split('?')[0];
            }
        }

        if (hostname.includes('youtube.com')) {
            const vParam = url.searchParams.get('v');
            if (vParam) return vParam;

            const segments = url.pathname.split('/').filter(Boolean);
            const embedIndex = segments.indexOf('embed');
            if (embedIndex !== -1 && segments[embedIndex + 1]) {
                return segments[embedIndex + 1];
            }
            if (segments.length) {
                return segments[segments.length - 1];
            }
        }
    } catch (err) {
        // Not a URL, fall through and treat as raw input.
    }

    const possibleId = input.replace(/[^\w-]/g, '');
    if (possibleId.length >= 11) {
        const match = possibleId.match(/[A-Za-z0-9_-]{11}/);
        return match ? match[0] : possibleId;
    }
    return possibleId;
}
