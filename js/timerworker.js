/* timerSetFor is the master time, timeRemaining is the more dynamic one. all units are in seconds.
    moreover, "clarkson" resets the timer and sets the phase, while "mafuyu" is the standard per-second update. "startingWindows" denotes pause/resume.
*/
var timerSetFor = 1500;
var timeRemaining = 1500;
var timerInterval = undefined;
var breaker = 0;
var isBreak = false;
var timerRunning = false;

var minutes = 0;
var seconds = 0;
var percentage = 0.0;

onmessage = (e) => {
    toggleTimer(timerSetFor);
}   

function toggleTimer(masterTime) {
    let timerSet = masterTime + 2;
    if (timerRunning) {
        timerSet = timeRemaining;
        timerRunning = false;
        clearInterval(timerInterval);
        postMessage(["startingWindows", timerRunning]);
    } else {
        timerRunning = true;
        postMessage(["startingWindows", timerRunning]);
        timerInterval = setInterval(increment, 1000);
        setTimeout(() => {
            clearInterval(timerInterval);
            incrementTimer();
        }, (timerSet * 1000));
    }
}

function increment() {
    percentage = (timeRemaining / timerSetFor);
    minutes = Math.floor(timeRemaining / 60);
    seconds = timeRemaining % 60;
    timeRemaining--;
    postMessage(["mafuyu", percentage, configureTimerText()])
}

function incrementTimer() {
    timerRunning = false;
    isBreak = !(isBreak);
    breaker++;
    timerSetFor = isBreak ? 300 : 1500;
    if (breaker % 7 === 0) {
        breaker = -1;
        timerSetFor = 1200;
    }
    postMessage(["clarkson", `${Math.floor(breaker / 2) + 1}/4`]);
    timeRemaining = timerSetFor;
    toggleTimer(timerSetFor);
}

function configureTimerText() {
    var minutes = Math.floor(timeRemaining / 60);
    var seconds = timeRemaining % 60;
    return (`${minutes}:${(seconds).toString().padStart(2, "0")}`);
}