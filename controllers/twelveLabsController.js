require('dotenv').config();  // Load environment variables from .env file

const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY;
//const TWELVE_LABS_SUBMISSION_INDEX = '666afeda910befead385dd3c'; //Dev
const TWELVE_LABS_SUBMISSION_INDEX = process.env.TWELVE_LABS_SUBMISSION_INDEX; //Dev
const { TwelveLabs } = require('twelvelabs-js');
const client = new TwelveLabs({ apiKey: TWELVE_LABS_API_KEY }); 
const fetch = require('node-fetch');


let dbInst;

exports.setDbInstance = (db) => {
  dbInst = db;
};


//API: https://docs.twelvelabs.io/docs/sample-apps-generate-titles-topics-and-hashtags
// https://docs.twelvelabs.io/reference/list-videos

// Fetching thumbnails for each video concurrently
const fetchThumbnail = async (indexID, videoID) => {
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
    return data.thumbnail || ''; // Assuming 'thumbnail' is the key containing the URL
  } catch (error) {
    console.error(`Failed to fetch thumbnail for video ${videoID}:`, error);
    return '';
  }
};


//Sample VideoID = 6645072bd22b3a3c97bee58b
exports.generateData = async (request, reply) => {
    const { videoID, inPrompt, includes } = request.body;
    console.log(request.body);
  
    try {
        let gist = '';
        if (includes && (includes.basic === 'true' || includes.basic === true)){
           gist = await client.generate.gist(videoID, ['title', 'topic', 'hashtag']);
          console.log(`Title: ${gist.title}\nTopics=${gist.topics}\nHashtags=${gist.hashtags}`);
        }
      
        let summaryTxt = '';
        let highlightTxt = '';
        let chapterText = '';
        let apiRsp;
      
     
        if (includes && (includes.summary === 'true' || includes.summary === true)){
          apiRsp = await client.generate.summarize(videoID, 'summary');
          summaryTxt = apiRsp.summary;
          console.log('summary: ', apiRsp);
        }
        else
          summaryTxt = null;

        if (includes && (includes.highlights === 'true' || includes.highlights === true)){
          apiRsp = await client.generate.summarize(videoID, 'highlight');
          console.log('highlights => ', apiRsp);
          highlightTxt = apiRsp.highlights;
        }
        else
          highlightTxt = null;
      
        if (includes && (includes.chapters === 'true' || includes.chapters === true)){
          apiRsp = await client.generate.summarize(videoID, 'chapter');
          console.log('chapters => ', apiRsp);
          chapterText = apiRsp.chapters;
        }
        else
          chapterText = null;
      
        let promptGenText = ''
        if (includes && (includes.prompt === 'true' || includes.prompt === true)){ 
          promptGenText = await client.generate.text(videoID, inPrompt);
          promptGenText = promptGenText.data;
          console.log(`Prompt Generated Text: `, promptGenText);
        }
        else
          promptGenText = null;
      
       
        reply.send({
          status: 'SUCCESS', 
          message: 'Generated successfully!', 
          generatedData: gist, 
          summaryData: summaryTxt, 
          highlights: highlightTxt, 
          chapters: chapterText, 
          promptedText: promptGenText || null
        });
    } catch (error) {
        console.log(error);
        reply.code(500).send({ status: 'ERROR', message: error.body.message });
    }
};

exports.listIndexes = async (request, reply) => {
  try {
    const indexes = await client.index.list();
    console.log('listIndexes-response: ', indexes);
    
    // Simplify the indexes before sending them back
    const simplifiedIndexes =  indexes.map(index => ({
      id: index.id,
      name: index.name,
      videoCount: index.videoCount,
      totalDuration: index.totalDuration,
      createdAt: index.createdAt,
      updatedAt: index.updatedAt
    }));

    console.log('Simplified Indexes:', simplifiedIndexes); // Optional: log for debugging
    reply.send(simplifiedIndexes);
  } catch (error) { 
    console.error(error);
    reply.code(500).send({ status: 'ERROR', message: 'Failed to retrieve indexes' });
  }
};

//-- https://docs.twelvelabs.io/reference/list-videos
exports.listVideosInIndex = async (request, reply) => {
  try {
    const { indexID } = request.body;
    
    console.log(`Videos in index id=${indexID}`);
    
    const videos = await client.index.video.list(indexID);
    console.log(videos);
   
    // Mapping each video to a simplified object including the thumbnail URL
    let simplifiedVideos = await Promise.all(videos.map(async video => ({
      id: video.id,
      indexID: indexID,
      duration: video.metadata.duration,
      filename: video.metadata.filename,
      fps: video.metadata.fps,
      height: video.metadata.height,
      size: video.metadata.size,
      width: video.metadata.width,
      thumbnailUrl: await fetchThumbnail(indexID, video.id)
    })));
    
    reply.send(simplifiedVideos);
    
  } catch (error) { 
    console.error(error);
    reply.code(500).send({ status: 'ERROR', message: 'Failed to retrieve indexes' });
  }
};


exports.getVideo = async (request, reply) => {
  try {
    const { indexID, videoID } = request.body;
    
    console.log(`Video id=${videoID}`);
    
    let video = await client.index.video.retrieve(indexID, videoID);

    let simpleVideo = {
      id: video.id,
      metadata: video.metadata,
      hls: video.hls
    }
    console.log(video, simpleVideo);
    
    reply.send(simpleVideo);
  } catch (error) { 
    console.error(error);
    reply.code(500).send({ status: 'ERROR', message: 'Failed to retrieve video' });
  }
};

exports.getThumbnail = async (request, reply) => {
    const { indexID, videoID } = request.body;
    try {
       let thumbnailUrl = await fetchThumbnail(indexID, videoID);
      
        reply.send({ status: 'SUCCESS', thumbnail: thumbnailUrl}); // Adjust according to the response structure
    } catch (error) {
        console.error('Failed to fetch thumbnail:', error);
        reply.code(500).send({ status: 'ERROR', message: 'Failed to retrieve thumbnail' });
    }
};


exports.submitVideo = async (req, reply) => {
    const { subName, subEmail, ytUrl } = req.body;
    //dbInst.clearDB();

    //console.log("---> ", ytUrl, subName, subEmail)
    //return reply.status(200).send({ status: 'SUCCESS', message: 'Video ingested successfully.', resp: "done" });
  

    // Validate the YouTube URL
    if (!/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(ytUrl)) {
        return reply.status(400).send({ status: 'ERROR', message: 'Invalid YouTube URL' });
    }

    const apiUrl = 'https://api.twelvelabs.io/v1.2/tasks/external-provider';
    const options = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-key': TWELVE_LABS_API_KEY
        },
        body: JSON.stringify({
            index_id: TWELVE_LABS_SUBMISSION_INDEX,
            url: ytUrl
        })
    };

    try {
        console.log('Sending Req to 12 Labs ', options)
      
        const response = await fetch(apiUrl, options);
        const respJson 
        
        = await response.json();

        console.log('Response from 12 Labs: ', respJson)
        if (response.status === 201) {
            let twelveTaskId = respJson._id;
            dbInst.addSubmission(subName, subEmail, ytUrl, twelveTaskId);
            let respMsgStr = 'Video ingested successfully. ID: ' + twelveTaskId;
            return reply.status(200).send({ status: 'SUCCESS', message: respMsgStr, resp: respJson });
        } else {
            return reply.code(500).send({ status: 'ERROR', message: respJson.message });
        }
    } catch (error) {
        console.error('Error:', error);
        reply.code(500).send({ status: 'ERROR', message: 'Internal Server Error', error: error });
    }
};


exports.checkCriteria = async (request, reply) => {
  try {
    const { indexID, videoID } = request.body;
    
    console.log(`checkCriteria id=${videoID}`);
    
    const judgePrompt = `As a judge for the 'Got Milk' campaign, evaluate video based on: 1. Relevance to promoting milk, 2. Visuals of people drinking milk, 3. Clear messaging about milk's benefits, 4. Creativity in promoting milk, 5 Overall impact. Provide a detailed evaluation and an overall score out of 10.`;
    
    let promptGenText = await client.generate.text(videoID, judgePrompt);
    promptGenText = promptGenText.data;
    console.log(`Judge Results: `, promptGenText);
       
      reply.send({
        status: 'SUCCESS', 
        message: 'Generated successfully!', 
        judgeResults: promptGenText || null
      });
    
  } catch (error) { 
    console.error(error);
    reply.code(500).send({ status: 'ERROR', message: 'Failed to retrieve video' });
  }
}; 

exports.getSubmissions = async (request, reply) => {
  let resp = {
    newItems: {},
    processed: {}
  }
  
  try {
    resp.newItems = await dbInst.getEntriesByStates(['NEW', 'INDEXED']);
    resp.processed = await dbInst.getEntriesByState('PROCESSED');
    
    console.log('getSubmissions: ', resp);
    
    reply.send(resp);
  } catch (error) { 
    console.error(error);
    reply.code(500).send({ status: 'ERROR', message: 'Failed to retrieve video' });
  }
};

exports.twelveWebHook = async (request, reply) => {
  console.log('@twelveWebHook: ', request.body);
}