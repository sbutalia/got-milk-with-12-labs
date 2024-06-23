const loaderWrapper = document.getElementById("loader-wrapper");
  const loader = document.getElementById("loader");
  const loaderTime = document.getElementById("loader-time");
  
  let startTime;
  let intervalId;
  
  function showAlertModal(message) {
    // Set the message in the modal's body
    document.getElementById('alertModalBody').innerText = message;

    // Show the modal
    var myModal = new bootstrap.Modal(document.getElementById('alertModal'), {
      keyboard: false
    });
    myModal.show();
  }

  function showLoader() {
    startTime = new Date().getTime();
    loaderWrapper.classList.add("active");
    loader.classList.add("active");
    loaderWrapper.style.display = "flex";
    intervalId = setInterval(updateTime, 200); // Update every second
  }

  function hideLoader() {
    clearInterval(intervalId); // Stop updating
    var endTime = new Date().getTime();
    var timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    loaderTime.innerHTML = `Time taken: ${timeTaken.toFixed(2)}s`;
    loaderWrapper.classList.remove("active");
    loader.classList.remove("active");
    loaderWrapper.style.display = "none";
  }

  // Utility function to wrap async operations with loader visibility
  async function withLoader(asyncFunc) {
    try {
      showLoader();
      await asyncFunc();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      hideLoader();
    }
  }

  function updateTime() {
    var currentTime = new Date().getTime();
    var timeTaken = (currentTime - startTime) / 1000; // Convert to seconds
    console.log("Updating time:", timeTaken);
    loaderTime.innerHTML = `${timeTaken.toFixed(2)}s`;
  }

function displayMsg(status, elemId, msg) {
        document.getElementById(elemId).innerHTML = msg;
        document.getElementById(elemId).classList.add("alert")
        document.getElementById(elemId).classList.add("alert-"+status)
}

function hideElem(elemId){
  document.getElementById(elemId).style.display = 'none';
}


export { displayMsg, hideElem, showLoader, hideLoader, withLoader, updateTime };