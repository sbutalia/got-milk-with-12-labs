function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const formattedHours = hrs > 0 ? `${hrs}:` : "";
    const formattedMinutes = mins < 10 ? `0${mins}` : mins;
    const formattedSeconds = secs < 10 ? `0${secs}` : secs;

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
}

function populateVideoCards(videos, container, loadVideoFunction, checkCriteriaFunc) {
  //const container = document.getElementById('videoCardsContainer');
  container.innerHTML = ''; // Clear existing content

  if(!(videos))
    return false;
  
  videos.forEach(video => {
    // Create column div
    const colDiv = document.createElement('div');
    colDiv.className = 'col-sm-4 col-md-4 col-lg-4 mt-2';

    // Create card div
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card interactive-card';
    
    colDiv.appendChild(cardDiv);
    
    // Create and append img element
    const img = document.createElement('img');
    img.src = video.thumb || video.thumbnailUrl;
    img.className = 'card-img-top';
    img.alt = 'Video Thumbnail';
    img.onclick = () => {
      event.preventDefault();
      loadVideoFunction(video.indexID, video.twVideoId); // Assuming indexID is available
    };
    cardDiv.appendChild(img);

    // Create card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardDiv.appendChild(cardBody);

    // Create and append h5 title
    if(video.twVideoMetadata){
      const title = document.createElement('h5');
      title.className = 'card-title';
      title.textContent = video.twVideoMetadata.filename;
      cardBody.appendChild(title);
    }

    // Create and append p element for video size
    if(video.twVideoMetadata){
      const pText = document.createElement('p');
      pText.className = 'card-text';
      pText.textContent = `Duration: ${formatDuration(video.twVideoMetadata.duration)}`;
      cardBody.appendChild(pText);
    }
    
    const pText2 = document.createElement('p');
    pText2.className = 'card-text';
    pText2.textContent = `Submitted By: ${video.subName}`;
    cardBody.appendChild(pText2);
    
    const pText3 = document.createElement('p');
    pText3.className = 'card-text';
    pText3.textContent = `Email: ${video.subEmail}`;
    cardBody.appendChild(pText3);
    
    // Create form-check div
    const formCheckDiv = document.createElement('div');
    formCheckDiv.className = 'form-check';
    cardBody.appendChild(formCheckDiv);

    
    // DEPRECATE: Add judge scores
    /*
    if (video.judgeScore) {
      const judgeScores = document.createElement('div');
      judgeScores.className = 'mt-2';
      const scores = video.judgeScore;
      judgeScores.innerHTML = `
        <h6>Judge Scores</h6>
        <p><strong>Relevance:</strong> ${scores.relevance}</p>
        <p><strong>Visuals:</strong> ${scores.visuals}</p>
        <p><strong>Messaging:</strong> ${scores.messaging}</p>
        <p><strong>Creativity:</strong> ${scores.creativity}</p>
        <p><strong>Impact:</strong> ${scores.impact}</p>
        <p><strong>Overall:</strong> ${scores.overall}</p>
      `;
      cardBody.appendChild(judgeScores);
    }
    */
    
    // Add judge results
    if (video.judgeResults) {
      const judgeResults = document.createElement('div');
      judgeResults.innerHTML = marked.parse(video.judgeResults);
      cardBody.appendChild(judgeResults);
    }
    
    
    // Create card footer
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer text-muted p-0';
    cardDiv.appendChild(cardFooter);

    // Append the column to the container
    container.appendChild(colDiv);
  });
  
}

export { populateVideoCards };