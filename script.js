/*
    Touhou Engie Operating Environment
    Copyright (C) 2025 Touhou Engie
    Licensed under the GPL
*/


// some things just need to be global
const json = "https://fileserver.touhouengie.com/drive/webpage_data";
var largestIndex = 1;
var audio = null;
var appList = undefined;
var deez = new Date();


// call critical components before we start
configureSettings();
timePerSecond();
setInterval(timePerSecond, 1000);
time();
setWindows();
getLatestCommitId();


// the lone dropdown menu (not very lonely anymore)
$("#dropdownopen").on("click", function(event) {
  event.stopPropagation();
  openWindow("#dropdownmenu");
});
$(document).on("click", function() {
  closeWindow("#dropdownmenu");
});
$("#time").on("click", function(event) {
  event.stopPropagation();
  if ($("#datewidget").is(":visible")) {
    closeWindow("#datewidget");
  } else {
    openWindow("#datewidget");
  }
});

// navbar logic
var a = 0;
$(function() {
  $("#moveup").on("click", (function() {
    $("#gallerycontents").html('');
    $("#filepath").html('/');
    galleryStart();
    // this will work for now but will have to redo logic later
  }));
});


// cookie getter, setter, and applier functions
function setOutsideCookie(name, event) {
    event.preventDefault();
    setCookie(name, event.target.value, 365);
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    configureSettings();
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let cookiearray = decodedCookie.split(';');
  for(let i = 0; i < cookiearray.length; i++) {
    let c = cookiearray[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setOutsideCheckbox() {
  // all checkboxes (as of right now) live here. will find a more efficient way soon.
  
  $("#visual").on('click', function() {
    setCookie("test", document.getElementById("visual").checked, 365);
  });
}
setOutsideCheckbox();

function configureSettings() {
  // check cookie
  let cursor = getCookie("cursor");
  let visualize = getCookie('test');

  if (cursor != "") {
    configureCursor(cursor);
  } else {   
    setCookie("cursor", "1", 365);
  }

  if (visualize != "") {
    setVisualizer(visualize);
  } else {
    setCookie('test', false, 365);
  }
  function setVisualizer(flag) {
    console.log(flag);
  }
}


// apply the settings from outside to inside
async function getJsonData(url, file) {
  var finale = [];
  const signal = await fetch(url.concat("/json/", file));
  const json = await signal.json();
  for (var i in json) {
    finale.push(json[i]);
  }
  return finale[0];
}

async function getLatestCommitId() {
  fetch('https://api.github.com/repos/TouhouEngie/website/commits?per_page=1')
    .then(res => res.json())
    .then(res => {
      $("#commit").html(res[0].sha.substring(0,7));
    });
}

function configureCursor(num) {
    num = num || 1
    // note: this may be an issue later on
    const cursorPointer = $(".pointer");
    const cursorDefault = $(".normal");
    const cursorText = $(".text");
    var param = ["cursor-", "0", "-", "~"];
    var a = getCookie("cursor");
    param[1] = num.toString();
    routeCursorStyle(cursorPointer, param, "pointer");
    routeCursorStyle(cursorDefault, param, "normal");
    routeCursorStyle(cursorText, param, "text");

    function routeCursorStyle(cursor, arr, style) {
      arr[3] = style;
      var text = arr.join('');
      if (cursor.length < 1) {
        arr[1] = a;
        cursor = $(arr.join(''));
        style = arr.join('');
      }
      setCursors(cursor, style, text);
    }

    function setCursors(list, target, replacer) {
      for (var i = 0; i < list.length; i++) {
        // if it ain't broke don't fix this
        list[i].classList.replace(target, replacer);
      }
    }
}


function time() {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    let day = deez.getDate();
    let num = deez.getMonth();
    let month = monthOfYear[num];
    let year = deez.getFullYear();
    let weekday = daysOfWeek[deez.getDay()];
    
    const actualDate = `${weekday}, ${month} ${day}, ${year}`;
    $("#date").html(actualDate);
    setCalendar(num, year, month);

    function daysInMonth(month, year) {
      return new Date(year, (month+1), 0).getDate();
    }

    function setCalendar(month, year, wordMonth) {
      let nutz = new Date(year + "-" + (month+1) + "-01").getDay();
      for (var i = 0; i <= nutz; i++) {
        $("#calendar").append('<p></p>');
      }
      for (var i = 1; i <= daysInMonth(month, year); i++) {
        $("#calendar").append(`<p id="entry${i}" class="text-center">${i}</p>`);
      }
      $(`#entry${day}`).addClass("border-2");
      $(`#entry${day}`).addClass("rounded-md");
      $(`#entry${day}`).addClass("-translate-y-0.5");
      getCalendarDates(wordMonth);
    }
  }

async function getCalendarDates(month) {
  const calendar = await getJsonData(json, "calendar.json");
  var index = calendar.findIndex(c => c.month === month);
  if (index < 0) {
    return;
  }
  for (let i = 0; i < calendar[index].dates.length; i++) {
    var entry = `#entry${calendar[index].dates[i].day}`;
    $(entry).addClass("pointer");
    $(entry).addClass(calendar[index].dates[i].color);
    $(entry).addClass("hover:bg-sky-400");
    $(entry).addClass("active:bg-sky-600");
    $(entry).on("click", function() {
      $("#event").html(`${month} ${calendar[index].dates[i].day} - ${calendar[index].dates[i].desc}`);
    });
  }
  configureCursor();
}

function timePerSecond() {
  deez = new Date();
  let hour = deez.getHours();
  let minute = deez.getMinutes();
  let period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  hour = hour ? hour : 12;
  minute = convertToProperMinutesOrSeconds(minute);

  const actualTime = `${hour}:${minute} ${period}`;
  if (actualTime === "12:00 AM") {
    time();
  }
  $("#time").html(actualTime);
}

// used for both mp3 player and current time
function convertToProperMinutesOrSeconds(minutes) {
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return minutes;
}


// all apps
async function noteviewStart() {
  const blog = await getJsonData(json, "blog.json");
  for (let i = 0; i < blog.length; i++) {
    var note = blog[i];
    var newEntry = $("<div>");
    newEntry.addClass("border-solid").addClass("border-2").addClass("rounded-md").addClass("bg-gray-900").addClass("pointer");
    newEntry.html(`<p>${note.title} (${note.date})</p>`);
    newEntry.on("click", function() {
      $('#notescontent').html(blog[i].content);
      configureCursor();
    });
    $("#history").append(newEntry);
  }
  $('#notescontent').html(blog[0].content);
  configureCursor();
}

async function galleryStart() {
  const galleryStructure = await getJsonData(json, "gallery.json");
  
  for (var i = 0; i < galleryStructure.length; i++) {
    setGalleryContent(galleryStructure, i);
    // i ain't gonna make your life harder than it has to be
  }
  // consult gallery.json for the file structure array
  function setGalleryContent(inputArray, index) {
    var newEntry = $("<span class='pointer'>");
    var imgsrc = setIconSource(inputArray, index);
    newEntry.html(`<img class="w-20 h-20" src="${imgsrc}"><p class="break-all text-sm">${inputArray[index].name}</p>`);
    if (inputArray[index].isFolder) {
      newEntry.on("click", function() {
        $("#gallerycontents").html('');
        $("#filepath").html('/' + inputArray[index].name + '/');
        for (var i = 0; i < inputArray[index].contents.length; i++) {
          setGalleryContent(inputArray[index].contents, i);
        }
        configureCursor();
      });
    } else {
      newEntry.on("click", function() {
        $("#imgviewcontents").html(setFileSource(inputArray, index));
        openWindow($("#imgview"));
      });
    }
    $("#gallerycontents").append(newEntry);
  }

  function setIconSource(inputArray, index) {
    if (inputArray[index].isFolder) {
      return `${json}/Images/folder.png`;
    }
    if (inputArray[index].usesIconFromCopyparty) {
      return `${json}/Images/${inputArray[index].image}`;
    }
    return inputArray[index].image;
  }

  function setFileSource(inputArray, index) {
    if (inputArray[index].artFromCopyparty) {
      return `<img src="${json}/Images/gallery/${inputArray[index].contents}">`
    }
    return inputArray[index].contents;
  }
  configureCursor();
}

function gamedemoStart() {
  $("#thingbutton").on("click", function() {
    $("#thing").html(`<iframe class="cursor-[url('./cursors/normal.cur'),default]" frameborder="0" src="https://itch.io/embed-upload/15081350?color=333333" allowfullscreen="" width="640" height="380"><a href="https://smirbyrneh420.itch.io/together-or-never-demo">Itch.io link</a></iframe>`);
  });
}

function interwebzStart() {
  return;
}

function refreshToHomeScreen() {
  $("#webview").attr('src', "https://fileserver.touhouengie.com/");
}

function pythonStart() {
  return;
} 

/*
CORS + copyparty = disaster.

function emailStart() {
  $('#aForm').on('submit', async function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData($('#aForm').get(0)).entries());
    console.log("sending...");
    const send = await fetch("https://fileserver.touhouengie.com/mail", {
      method: "POST",
      headers: { "PW": "p4ssw0rd69" },
      body: `f=${JSON.stringify(data)}`
    });
    if (res.ok) {
      $('#submitted').removeClass('hidden');
      $("#form")[0].reset();
    } else {
      alert("Error sending message.");
      console.error(await send.text());
    }
  });
}
*/

async function musicplayerStart() {
  const playlist = await getJsonData(json, "music.json");
  var shuffle = false;
  var repeat = false;
  var openedAPlaylist = false;
  var shuffleOrder = [];
  var currentPlaylistOrder = [];
  var increment = 0;
  var index = 0;
  var newClass = "";
  var original = "";

  if (isNotMobileDevice) {
    $("#visualizeropen").show();
  }

  loadListOfLists();
  $("#returntostart").on("click", function() {
    loadListOfLists();
  });
  $("#pause").on('click', function() {
    if (!audio.paused) {
      // context.suspend();
      audio.pause();
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>`);
    } else {
      // context.resume();
      audio.play();
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z"/></svg>`);
    }
  });

  // Set the buttons and shuffle functionality
  $("#shuffle").on('click', function() {
    if (!(openedAPlaylist)) {
      return;
    }
    shuffler();
    setSvgAndStuff('shuffle');
    if (!(audio)) {
      playSong(currentPlaylistOrder[shuffleOrder[increment]]);
    }
  });
  $("#repeat").on('click', function() {
    setSvgAndStuff('repeat');
  });
  $("#nextsong").on('click', function() {
    if (!(openedAPlaylist)) {
      return;
    }
    invokeNextSong();
  });
  $("#rewind").on('click', function() {
    if (!(openedAPlaylist)) {
      return;
    }
    if (shuffle) {
      increment--;
      playNextSong(currentPlaylistOrder[shuffleOrder[increment]]);
    } else if (repeat) {
      // todo: set this to refer to the current playing object instead of the array to avoid dereferencing bugs
      playNextSong(currentPlaylistOrder[index]);
    } else { 
      playNextSong(currentPlaylistOrder[index-1]);
    }
  });

  configureCursor();
  function setSvgAndStuff(vari) {
    eval(vari + ` = !(` + vari + `)`);
    var variName = eval(vari);
    newClass = variName ? "fill-cyan-500" : "fill-white";
    original = variName ? "fill-white" : "fill-cyan-500";
    $("#" + vari).addClass(newClass).removeClass(original);
    newClass = variName ? "stroke-cyan-500" : "stroke-white";
    original = variName ? "stroke-white" : "stroke-cyan-500";
     $("#" + vari + "stroke").addClass(newClass).removeClass(original);
  }

  function loadListOfLists() {
    $("#playlist").empty();
    constructor(`<p>All Songs...</p><br>`, -1);
    for (let i = 0; i < playlist.length; i++){
      constructor(`<p>${playlist[i].title}</p><br>`, i);
    }
    function constructor(htmlText, e) {
      var playlistEntry = $("<li>");
      playlistEntry.addClass("pointer");
      playlistEntry.html(htmlText);
      playlistEntry.on('click', (function() {
        $("#playlist").empty();
        if (e < 0) {
          getAllSongs();
        } else {
          currentPlaylistOrder = (playlist[e].contents);
        }
        setListOfSongs();
        shuffler();
      }));
      $("#playlist").append(playlistEntry);
    }
  }

  function setListOfSongs() {
    openedAPlaylist = true;
    $("#playlist").empty();
    for (let i = 0; i < currentPlaylistOrder.length; i++) {
      var song = currentPlaylistOrder[i];
      var newSong = $('<li>');
      newSong.add("pointer");
      newSong.html(`<p>${song.title}</p><p class="text-xs">${song.author}</p><br>`);
      newSong.on('click', (function(currentSong) {
        return function() {
          // is only called once but it's one hell of a logic segment
          playSong(currentSong);
        };
      })(song));
      $("#playlist").append(newSong);
    }
  }

  function shuffler() {
    var temp = 0;
    while (shuffleOrder.length <= (currentPlaylistOrder.length - 1)) {
      temp = Math.abs(Math.round((Math.random() * currentPlaylistOrder.length) - 1));
      if (shuffleOrder.indexOf(temp) < 0) {
        shuffleOrder.push(temp);
      }
    }
  }

  function getAllSongs() {
    currentPlaylistOrder = [];
    for (var i = 0; i < playlist.length; i++) {
      for (var k = 0; k < playlist[i].contents.length; k++) {
        if (playlist[i].contents[k].inMainline) {
          currentPlaylistOrder.push(playlist[i].contents[k]);
        }
      }
    }
  }

  function isNotMobileDevice() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return !(check);
  }

  function playSong(song) {
    // Handles anything related to the Audio class.

    // basically the equivalent of taking an integral of a derivative.
    // takes the index of a song in the array
    index = currentPlaylistOrder.findIndex(s => s.title === song.title && s.author === song.author);
    var currentProgressInSeconds = 0;
    var totalProgressInSeconds = 0;
    if (audio) {
      audio.pause();
      audio = null;
    }
    audio = new Audio(json.concat(song.file));
    audio.crossOrigin = "anonymous";
    $("#thumbnail").html(`<img src="${json.concat(song.image)}">`);
    $("#songtitle").html(`<h3>${song.title}</h3>`);
    $("#songauthor").html(`<p>${song.author}</p>`);
    $('#pausebutton').html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z"/></svg>`);
    audio.addEventListener('timeupdate', function() {
      $("#seekbar").val((this.currentTime / this.duration) * 100);
      currentProgressInSeconds = convertToProperMinutesOrSeconds(Math.round(this.currentTime) % 60);
      totalProgressInSeconds = convertToProperMinutesOrSeconds(Math.round(this.duration) % 60);
      $("#seekprogress").html(`${(Math.floor(Math.round(this.currentTime) / 60))}:${currentProgressInSeconds}`);
      $("#totalprogress").html(`${Math.floor(Math.round(this.duration) / 60)}:${totalProgressInSeconds}`);
    });
    // The following logic initializes UI, then plays audio, then sets event listeners to check for headphone input or song ending
    seekbar.addEventListener('input', function() {
      if (audio && audio.duration) {
        audio.currentTime = (seekbar.value / 100) * audio.duration;
      }
    });
    if (!(isNotMobileDevice)) {
      let visualizer = new Wave(audio, document.getElementById("canvas"));
      visualizer.addAnimation(new visualizer.animations.Lines({
        lineWidth: 3,
        lineColor: "#fff"
      }));
    }
    audio.play();
    // play_and_draw();
    audio.addEventListener('ended', function() {
      invokeNextSong(song);
    });
    audio.addEventListener('pause', function() {
      // context.suspend();
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>`);
    });
    audio.addEventListener('play', function() {
      // context.resume();
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z"/></svg>`);
    });
  }
  function invokeNextSong(song) {
    if (shuffle) {
      increment++;
      playNextSong(currentPlaylistOrder[shuffleOrder[increment]]);
    } else if (repeat) {
      // todo: set this to refer to the current playing object instead of the array to avoid dereferencing bugs
      playNextSong(song);
    } else { 
      playNextSong(currentPlaylistOrder[index+1]);
    }
  }
  function playNextSong(song) {
    if (song) {
      playSong(song);
    } else {
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>`);
      audio.pause();
    }
  }
  // TODO: Set visualizer as an optional (experimental) setting, and squash the syncronization bugs related with the web audio API
}

function pomodoroStart() {
  // timerSetFor is the master time, timeRemaining is the more dynamic one
  var timerSetFor = 1500;
  var timeRemaining = 1500;
  var timerInterval = undefined;
  var breaker = 0;
  var isBreak = false;
  var timerRunning = false;
  $("#toggletimer").on("click", (function() {
    toggleTimer(timerSetFor);
  }));

  function toggleTimer(masterTime) {
    timerSet = masterTime + 2;
    if (timerRunning) {
      timerSet = timeRemaining;
      timerRunning = false;
      $("#msg").html("Timer paused");
      clearInterval(timerInterval);
    } else {
      timerRunning = true;
      $("#msg").html("Timer started");
      timerInterval = setInterval(increment, 1000);
      setTimeout(() => {
        clearInterval(timerInterval);
        incrementTimer();
      }, (timerSet * 1000));
    }
  }

  function increment() {
    document.getElementById("timer").value = (timeRemaining / timerSetFor);
    configureTimerText();
    timeRemaining--;
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
    $("#phase").html(`${Math.floor(breaker / 2) + 1}/4`);
    timeRemaining = timerSetFor;
    toggleTimer(timerSetFor);
  }

  function configureTimerText() {
    var minutes = Math.floor(timeRemaining / 60);
    var seconds = timeRemaining % 60;
    $("#timeremains").html(`${minutes}:${convertToProperMinutesOrSeconds(seconds)}`);
  }
}


// window management all the way down
async function setWindows() {
  appList = await getJsonData(json, "applist2.json");
  // set all them variables for them windows
  // image viewer is called within gallery, so skip that
  $(function() {
    for (let i = 0; i < appList.length; i++) {
      let app = appList[i].title;
      $(`#` + app + `close`).on("click", (function() { closeWindow("#" + app) })); // could just do $("#app")
      if (i > 1) {
        if (i < 8) {
          $(`#` + app + `open`).on("click", (function() { openWindow("#" + app) }));
        } else {
          $(`#` + app + `open`).on("click", (function() { iconTap(app) }));
        }
      }
      dragElement("#" + app);
    }
  });
}

// window management.sys
function dragElement(app) {
  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;
  var newX = 0;
  var newY = 0;
  const header = app + "header";

  if ($(header).length) {
    $(header).on("mousedown", function(event) { startDragging(event) });
  } else {
    $(app).on("mousedown", function(event) { startDragging(event) });
  }

  // capture the initial mouse position and set up event listeners
  function startDragging(e) {
    $(function() {
      e = e || window.event;
      e.preventDefault();
      reorganizeWindows(app);
      // initial mouse pos
      initialX = e.clientX;
      initialY = e.clientY;
      $(document).on("mouseup", function() { stopDragging(); });
      $(document).on("mousemove",  elementDrag);
    });
  }

  // checks mouse position and drags window accordingly, with limitations
  // note to self: this has to load before the DOM
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    var offset = $(app).position();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;
    // I inverted these at one point...
    newY = offset.top - currentY;
    newX = offset.left - currentX;
    if (newX < 0) {
      stopDragging();
      newX = 1;
    }
    if (newY < 0) {
      stopDragging();
      newY = 1;
    }
    if (newX > ($(window).width())) {
      stopDragging();
      newX = $(window).width() - 32;
    }
    if (newY > ($(window).height())) {
      stopDragging();
      newY = $(window).height() - 32;
    }
    $(app).css("top", (newY) + "px");
    $(app).css("left", (newX) + "px");
  }

  function stopDragging() {
    $(function() {
      $(document).off("mouseup");
      $(document).off("mousemove");
    });
  }
}

function refresh() {
  window.location.reload();
}

// icon and window stuffs
// Most requires a # preceding the string

// Takes a string, no #
function iconTap(window) {
    loadApp(window);
    openWindow("#" + window);
}

function closeWindow(element) {
  $(function() {
    $(element).addClass("hidden");
    $(element).removeClass("block");
  });
}

function openWindow(element) {
  $(function() {
    $(element).addClass("block");
    $(element).removeClass("hidden");
    reorganizeWindows(element);
  });
}

function reorganizeWindows(element) {
  $(function() {
    largestIndex = largestIndex + 1;
    $(element).css("zIndex", largestIndex);
    $("#topbar").css("zIndex", largestIndex + 1);
    $("#desktopApps").css("zIndex", largestIndex + 1);
  });
}

// This takes a string, no #
function loadApp(ignition) {
  var index = appList.findIndex(a => a.title === ignition);
  if (!(appList[index].hasBeenOpened)) { 
    eval(ignition + "Start();");
    appList[index].hasBeenOpened = true;
  } else { return; }
}
