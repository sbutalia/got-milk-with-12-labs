// app.js
import * as api from "./api.js";
import * as uiComm from "../common/uiComm.js";
import { consts } from "../consts/consts.js";

document.addEventListener("DOMContentLoaded", async () => {

  //On Page Load - Init Data - Start  
  try {
    uiComm.showLoader();
    console.log('Init');
    uiComm.hideLoader();
  } catch (error) {
    console.error("Error:", error);
  }
  
  document
  .getElementById("submitBtn")
  .addEventListener("click", async function () {
    var ytUrl = document.getElementById("videoUrl").value;
    var subName = document.getElementById("subName").value;
    var subEmail = document.getElementById("subEmail").value;
    
    await uiComm.withLoader(async () => {
      try {
        let apiResp = await api.submitVideo(ytUrl, subName, subEmail);
        
        let rspMsg = 'Your submission has been received. Please keep this ID for your reference: ' + apiResp.resp.id;
        document.getElementById("respBox").innerHTML = rspMsg;
      
        uiComm.displayMsg('info', "respBox", apiResp.message);
        uiComm.hideElem("submitForm");
        
      } catch (error) {
        console.error("submitBtn: Error:", error);
        uiComm.displayMsg('danger', "respBox", error.message);
      }
    });
  });
  //On Page Load - Init Data - End

}); //-- DOMContentLoaded
