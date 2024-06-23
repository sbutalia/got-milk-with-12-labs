async function fetchVideos(indexID) {
    const response = await fetch('/listVideosInIndex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexID })
    });
    if (!response.ok) {
        throw new Error('Failed to fetch videos');
    }
    return await response.json();
}

async function fetchVideo(indexID, videoID) {
    const response = await fetch('/getVideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexID, videoID })
    });
    if (!response.ok) {
        throw new Error('Failed to fetch video');
    }
    return await response.json();
}

async function checkGMCriteria(indexID, videoID) {
    const response = await fetch('/checkCriteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexID, videoID })
    });
    if (!response.ok) {
        throw new Error('Failed to fetch video');
    }
    return await response.json();
}

async function fetchSubmissions() {
    const response = await fetch('/getSubmissions');
    if (!response.ok) {
        throw new Error('Failed to fetch submissions');
    }
    return await response.json();
}

export { fetchVideos, fetchVideo, checkGMCriteria, fetchSubmissions };