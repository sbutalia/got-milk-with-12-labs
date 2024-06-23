const TWELVE_LABS_SUBMISSION_INDEX = process.env.TWELVE_LABS_SUBMISSION_INDEX; //Dev

const twelveLabsLib = require('../lib/twelveLabsFuncs');

function extractJsonFromText(text) {
  const jsonStringMatch = text.match(/{[^}]*}/);
  if (jsonStringMatch) {
    try {
      const jsonObject = JSON.parse(jsonStringMatch[0]);
      return jsonObject;
    } catch (error) {
      console.error("Failed to parse JSON:", error);
    }
  }
  return null;
}

async function processNewEntries(dbInst){
        console.log('Checking for new DB entries', new Date().toISOString());
        try {
            const newEntries = await dbInst.getEntriesByStates(['NEW', 'INDEXED']); 
              
            if(newEntries){
              
              for (let entry of newEntries) {
                  //1. Process each entry
                  console.log('Processing: ', TWELVE_LABS_SUBMISSION_INDEX,  entry);
                
                  //if new, 2. get the index status
                  if(entry.state == 'NEW'){
                    let twTaskRsp = await twelveLabsLib.getTaskStatus(TWELVE_LABS_SUBMISSION_INDEX, entry.rec12Id);
                    
                    if(twTaskRsp && twTaskRsp.status == 'ready' && twTaskRsp.videoId){
                      // 3. get thumbnail
                      let twThumb = await twelveLabsLib.fetchThumbnail(TWELVE_LABS_SUBMISSION_INDEX, twTaskRsp.videoId);
                      
                      //4. Update local DB with metadata
                      await dbInst.updateSubmissionVidId(entry.rec12Id, twTaskRsp.videoId, twTaskRsp.metadata, twThumb, 'INDEXED');
                      entry.state = 'INDEXED';
                    }
                    
                  } 
                      
                  if(entry.state == 'INDEXED'){
                    //Finally: if Indexed, Judge Entry
                    let rsp = await twelveLabsLib.checkCriteria(TWELVE_LABS_SUBMISSION_INDEX, entry.twVideoId, 'eval');
                    //let rspScore = await twelveLabsLib.checkCriteria(TWELVE_LABS_SUBMISSION_INDEX, entry.twVideoId, 'score');

                    if(rsp && rsp.status == 'SUCCESS'){
                      //Format results and update
                      //let scoresJson = extractJsonFromText(rspScore.judgeResults);
                      
                      await dbInst.updateSubmissionAddJudgeResults(entry.rec12Id, rsp.judgeResults, null); 
                    }
                  } 
                
              } 
              
              // Process new entries here
              console.log('New entries processed successfully.');
            }
        } catch (error) {
            console.error('Failed to process new entries:', error);
        }
        processNewEntriesTimer(dbInst);  // Reschedule after current is done
} 
 
function processNewEntriesTimer(dbInst) { 
    setTimeout(processNewEntries, 120000);  // Runs every 120 seconds (2 mins)
}

module.exports = { 
    processNewEntries
};