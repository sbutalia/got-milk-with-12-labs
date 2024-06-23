const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY;
const TWELVE_LABS_SUBMISSION_INDEX = '666afeda910befead385dd3c'; //Dev
const { TwelveLabs } = require('twelvelabs-js');
const client = new TwelveLabs({ apiKey: TWELVE_LABS_API_KEY }); 
const fetch = require('node-fetch');

exports.fetchThumbnail = async (indexID, videoID) => {
  const url = `https://api.twelvelabs.io/v1.2/indexes/${indexID}/videos/${videoID}/thumbnail`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': process.env.TWELVE_LABS_API_KEY // Ensure you have the API key
    }
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    //console.log('@fetchThumbnail: ', data);
    return data.thumbnail || ''; // Assuming 'thumbnail' is the key containing the URL
  } catch (error) {
    console.error(`Failed to fetch thumbnail for video ${videoID}:`, error);
    return '';
  }
}; 

exports.checkCriteria = async (indexID, videoID, judType) => {
  try {
    console.log(`${judType} checkCriteria id=${videoID}`);
    
     
    const evalPrompt = `As a judge for the 'Got Milk' campaign evaluate the video based on: 1. Relevance to promoting milk 2. Visuals of people drinking milk 3. Clear messaging about milk's benefits 4. Creativity in promoting milk. Provide an overall score on a scale of 10.`;
    const scorePrompt = `As a judge evaluate the video based on well it promotes Milk. Provide scores in scale of 10 in the following JSON format: {"relevance": 0, "visuals": 0, "messaging": 0, "creativity": 0, "impact": 0, "overall": 0}. Replace the zeros with your scores based on your evaluation.`;

    let judgePrompt = evalPrompt;
    if(judType == 'score') 
      judgePrompt = scorePrompt;
    
    let promptGenText = await client.generate.text(videoID, judgePrompt);
    promptGenText = promptGenText.data;
    console.log(`${judType} Judge Results: `, promptGenText); 
       
      return { 
        status: 'SUCCESS', 
        message: 'Generated successfully!', 
        judgeResults: promptGenText || null
      };
    
  } catch (error) { 
    console.error(error);
    return { status: 'ERROR', message: 'Failed to retrieve video' };
  }
};

exports.getVideo = async (indexID, videoID) => {
  try {
    
    console.log(`getVideo id=${videoID}`, 'index: ', indexID);
     
    let video = await client.index.video.retrieve(indexID, videoID);

    let simpleVideo = {
      id: video.id,
      metadata: video.metadata,
      hls: video.hls
    }
    console.log(video, simpleVideo);
    
    return simpleVideo;
  } catch (error) { 
    console.error(error);
    return { status: 'ERROR', message: 'Failed to retrieve video' };
  }
};

exports.getTaskStatus = async (indexID, taskId) => {
  try {
    
    console.log(`getTaskStatus id=${taskId}`, 'index: ', indexID);
     
    let task = await client.task.retrieve(taskId);

    console.log('@getTaskStatus-resp:', task);
    
    return task;
  } catch (error) { 
    console.error(error);
    return { status: 'ERROR', message: 'Failed to retrieve video' };
  }
};