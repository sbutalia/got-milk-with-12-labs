async function submitVideo(ytUrl, subName, subEmail) {
    const response = await fetch('/submitVideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ytUrl, subName, subEmail })
    });
  
    if (!response.ok) {
        let resp = await response.json();
        throw new Error(resp.message);
    }
    return await response.json();
}

export { submitVideo };