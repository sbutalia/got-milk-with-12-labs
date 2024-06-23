// app.js
import * as api from "./api.js";
import * as ui from "./ui.js";
import * as uiComm from "../common/uiComm.js";
import { consts } from "../consts/consts.js";

let g_selectedVideoID;
let g_indexID = '666afeda910befead385dd3c';

async function checkCriteriaFunc(indexID, videoID){
  await uiComm.withLoader(async () => {
    const resp = await api.checkGMCriteria(indexID, videoID);

    console.log('checkCriteriaFunc: ', resp);
    if(resp.status === 'SUCCESS')
      ui.displayJudgeResults(resp.judgeResults);
    else
      alert('Could not check criteria.');

    //judgeResponse
  }); 
}

async function loadVideo(indexID, videoID){
  await uiComm.withLoader(async () => {

    //ui.populateVideoId(videoID); // Assuming this function sets some UI elements based on videoID
    g_selectedVideoID = videoID;
    const videoData = await api.fetchVideo(g_indexID, videoID);

    const videoUrl = videoData.hls.videoUrl;

    //videoData.hls.videoUrl,
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoElem);
    } else if (videoElem.canPlayType("application/vnd.apple.mpegurl")) {
      videoElem.src = videoUrl;
    }
  });    
}

document.addEventListener("DOMContentLoaded", async () => {
  //On Page Load - Init Data - Start  
  await uiComm.withLoader(async () => {
    const entries = await api.fetchSubmissions();

    const newContainer = document.getElementById('newVideoCardsContainer');
    const processedContainer = document.getElementById('processedVideoCardsContainer');

      ui.populateVideoCards(entries.newItems, newContainer, loadVideo, checkCriteriaFunc);
      ui.populateVideoCards(entries.processed, processedContainer, loadVideo, checkCriteriaFunc);
  });
  //On Page Load - Init Data - End
}); //-- DOMContentLoaded
