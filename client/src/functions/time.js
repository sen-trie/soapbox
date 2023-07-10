function timePassed(checkDate) {
    // TAKES MILISECONDS
    let currentTime = new Date();
    let passedSeconds = Math.floor((currentTime - checkDate)/1000);
    if (passedSeconds < 60) {
      return `(${passedSeconds} seconds ago)`;
    } else if (passedSeconds < 3600) {
      return `(${Math.floor(passedSeconds/60)} minutes ago)`;
    } else if (passedSeconds < 86400) {
      return `(${Math.floor(passedSeconds/3600)} hours ago)`;
    } else if (passedSeconds < 604800) {
      return `(${Math.floor(passedSeconds/86400)} days ago)`;
    } else if (passedSeconds < 2628000) {
      return `(${Math.floor(passedSeconds/604800)} weeks ago)`;
    } else if (passedSeconds < 31540000) {
      return `(${Math.floor(passedSeconds/2628000)} months ago)`;
    } else {
      return `(${Math.floor(passedSeconds/31540000)} years ago)`;
    }
}

export default timePassed;