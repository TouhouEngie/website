// some things just need to be global
const json = "https://fileserver.touhouengie.com/drive/webpage_data";
var largestIndex = 1;
var audio = null;
var volume = 100;
var appList = undefined;
var deez = new Date();


// call critical components before we start
configureSettings();
timePerSecond();
setInterval(timePerSecond, 1000);
time();
setWindows();
getLatestCommitId();
setVolume();


// the lone dropdown menu (not very lonely anymore)
$("#dropdownopen").on("click", function(event) {
  event.stopPropagation();
  openWindow("#dropdownmenu");
});
$(document).on("click", function() {
  closeWindow("#dropdownmenu");
  closeWindow("#pageringwidget");
});
setTopBarWidgets('#time', '#datewidget');
setTopBarWidgets('#webring', '#pageringwidget');
setTopBarWidgets('#volume', '#volumewidget');

function setTopBarWidgets(widget, content) {
  $(widget).on("click", function(event) {
    event.stopPropagation();
    if ($(content).is(":visible")) {
      closeWindow(content);
    } else {
      openWindow(content);
    }
  });
}

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
    setCookie("visualizer", document.getElementById("visual").checked, 365);
  });
}
setOutsideCheckbox();

function configureSettings() {
  // check cookie
  let cursor = getCookie("cursor");
  let visualize = getCookie('visualizer');

  if (cursor != "") {
    configureCursor(cursor);
  } else {   
    setCookie("cursor", "1", 365);
  }

  if (visualize != "") {
    setVisualizer(visualize);
  } else {
    setCookie('visualizer', false, 365);
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
  minute = minute.toString().padStart(2, "0");

  const actualTime = `${hour}:${minute} ${period}`;
  if (actualTime === "12:00 AM") {
    time();
  }
  $("#time").html(actualTime);
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
  loadListOfLists();
  $("#returntostart").on("click", function() {
    loadListOfLists();
  });
  $("#pause").on('click', function() {
    if (!audio.paused) {
      audio.pause();
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>`);
    } else {
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
    audio.volume = volume / 100;
    $("#thumbnail").html(`<img src="${json.concat(song.image)}">`);
    $("#songtitle").html(`<h3>${song.title}</h3>`);
    $("#songauthor").html(`<p>${song.author}</p>`);
    $('#pausebutton').html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z"/></svg>`);
    audio.addEventListener('timeupdate', function() {
      $("#seekbar").val((this.currentTime / this.duration) * 100);
      currentProgressInSeconds = (Math.round(this.currentTime) % 60).toString().padStart(2, "0");
      totalProgressInSeconds = (Math.round(this.duration) % 60).toString().padStart(2, "0");
      $("#seekprogress").html(`${(Math.floor(Math.round(this.currentTime) / 60))}:${currentProgressInSeconds}`);
      $("#totalprogress").html(`${Math.floor(Math.round(this.duration) / 60)}:${totalProgressInSeconds}`);
    });
    // The following logic initializes UI, then plays audio, then sets event listeners to check for headphone input or song ending
    seekbar.addEventListener('input', function() {
      if (audio && audio.duration) {
        audio.currentTime = (seekbar.value / 100) * audio.duration;
      }
    });
    audio.play();
    audio.addEventListener('ended', function() {
      invokeNextSong(song);
    });
    audio.addEventListener('pause', function() {
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>`);
    });
    audio.addEventListener('play', function() {
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

function setVolume() {
  var slider = document.getElementById("volumeslider")
  slider.addEventListener("input", function() {
    volume = slider.value;
    $("#volumepercent").html(`${volume}%`);
    let allOtherAudio = document.getElementsByTagName("audio");
    for (var i = 0; i < allOtherAudio.length; i++) {
      allOtherAudio[i].volume = volume / 100;
    }
    if (audio) {
      audio.volume = volume / 100;
    }
    setVolumeIcon();
  });
  setVolumeIcon();

  function setVolumeIcon() {
    var icon = $("#volume");
    let doTheThing;
    if (volume <= 0) {
      doTheThing = `<img class="w-4 h-4" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xNi42NTg5IDZDMTYuNTE4NiA1LjIwMjE3IDE2LjI4ODcgNC42ODQ2NyAxNS44NjY5IDQuMzcxNjNDMTUuNzAyNiA0LjI0OTczIDE1LjUxODYgNC4xNTA4OSAxNS4zMjg2IDQuMDgyNDFDMTQuMzM3NSAzLjcyNTI3IDEzLjE1NjkgNC41NDcyOCAxMC43OTU1IDYuMTkxM0wxMC41OTIyIDYuMzMyODRDMTAuMTk1MyA2LjYwOTIyIDkuOTk2NzcgNi43NDc0MSA5Ljc4MzA5IDYuODQ2OTlDOS41NzE4NiA2Ljk0NTQzIDkuMzQ5ODUgNy4wMTU3NiA5LjEyMjE5IDcuMDU2MzVDOC44OTE4OSA3LjA5NzQyIDguNjU0MTQgNy4wOTc0MiA4LjE3ODY1IDcuMDk3NDJDNi45MDI4NyA3LjA5NzQyIDYuMjY0OTggNy4wOTc0MiA1LjcwODQ2IDcuMzY5M0M1LjE5OTk5IDcuNjE3NzEgNC42OTE1MyA4LjEyMjg5IDQuNDI1NzkgOC42NDM2OUM0LjEzNDkzIDkuMjEzNzEgNC4xMDA3MiA5LjgwNjM1IDQuMDMyMyAxMC45OTE2QzQuMDEyMDYgMTEuMzQyMyA0IDExLjY4MzkgNCAxMkM0IDEyLjMxNjEgNC4wMTIwNiAxMi42NTc3IDQuMDMyMyAxMy4wMDg0QzQuMTAwNzIgMTQuMTkzNiA0LjEzNDkzIDE0Ljc4NjMgNC40MjU3OSAxNS4zNTYzQzQuNjkxNTMgMTUuODc3MSA1LjE5OTk5IDE2LjM4MjMgNS43MDg0NiAxNi42MzA3QzYuMjY0OTggMTYuOTAyNiA2LjkwMjg3IDE2LjkwMjYgOC4xNzg2NSAxNi45MDI2QzguNjU0MTQgMTYuOTAyNiA4Ljg5MTg5IDE2LjkwMjYgOS4xMjIxOSAxNi45NDM2QzkuMzQ5ODUgMTYuOTg0MiA5LjU3MTg2IDE3LjA1NDYgOS43ODMwOSAxNy4xNTNDOS45OTY3NyAxNy4yNTI2IDEwLjE5NTMgMTcuMzkwOCAxMC41OTIyIDE3LjY2NzJMMTAuNzk1NSAxNy44MDg3QzEzLjE1NjkgMTkuNDUyNyAxNC4zMzc1IDIwLjI3NDcgMTUuMzI4NiAxOS45MTc2QzE1LjUxODYgMTkuODQ5MSAxNS43MDI2IDE5Ljc1MDMgMTUuODY2OSAxOS42Mjg0QzE2LjI4ODcgMTkuMzE1MyAxNi41MTg2IDE4Ljc5NzggMTYuNjU4OSAxOCIgc3Ryb2tlPSIjMUMyNzRDIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+DQo8cGF0aCBkPSJNMjAgOS4wMDAwMkwxNCAxNU0xNCA5TDE5Ljk5OTkgMTUiIHN0cm9rZT0iIzFDMjc0QyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPg0KPC9zdmc+">`
    } else if (volume >= 50) {
      doTheThing = `<img class="w-4 h-4" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xLjUzNDc5IDEwLjk3MTRDMS42MDg0NyA5Ljc2MjU1IDEuNjQ1MzEgOS4xNTgxNCAxLjk1ODU0IDguNTc2NzlDMi4yNDQ3MyA4LjA0NTYzIDIuNzkyMyA3LjUzMDQyIDMuMzM5ODggNy4yNzcwN0MzLjkzOTIxIDYuOTk5NzkgNC42MjYxNyA2Ljk5OTc5IDYuMDAwMDggNi45OTk3OUM2LjUxMjE1IDYuOTk5NzkgNi43NjgxOSA2Ljk5OTc5IDcuMDE2MiA2Ljk1NzkxQzcuMjYxMzggNi45MTY1IDcuNTAwNDYgNi44NDQ3OCA3LjcyNzk1IDYuNzQ0MzhDNy45NTgwNiA2LjY0MjgzIDguMTcxODEgNi41MDE4OSA4LjU5OTMyIDYuMjIwMDJMOC44MTgyNSA2LjA3NTY2QzExLjM2MTIgNC4zOTg5OCAxMi42MzI3IDMuNTYwNjMgMTMuNzAwMSAzLjkyNDg3QzEzLjkwNDcgMy45OTQ3IDE0LjEwMjggNC4wOTU1MSAxNC4yNzk3IDQuMjE5ODRDMTUuMjAyNCA0Ljg2ODI5IDE1LjI3MjUgNi4zNzY5OSAxNS40MTI3IDkuMzk0NEMxNS40NjQ2IDEwLjUxMTcgMTUuNSAxMS40Njc5IDE1LjUgMTEuOTk5OEMxNS41IDEyLjUzMTcgMTUuNDY0NiAxMy40ODc5IDE1LjQxMjcgMTQuNjA1MkMxNS4yNzI1IDE3LjYyMjYgMTUuMjAyNCAxOS4xMzEzIDE0LjI3OTcgMTkuNzc5N0MxNC4xMDI4IDE5LjkwNDEgMTMuOTA0NyAyMC4wMDQ5IDEzLjcwMDEgMjAuMDc0N0MxMi42MzI3IDIwLjQzODkgMTEuMzYxMiAxOS42MDA2IDguODE4MjUgMTcuOTIzOUw4LjU5OTMyIDE3Ljc3OTZDOC4xNzE4MSAxNy40OTc3IDcuOTU4MDYgMTcuMzU2NyA3LjcyNzk1IDE3LjI1NTJDNy41MDA0NiAxNy4xNTQ4IDcuMjYxMzggMTcuMDgzMSA3LjAxNjIgMTcuMDQxN0M2Ljc2ODE5IDE2Ljk5OTggNi41MTIxNSAxNi45OTk4IDYuMDAwMDggMTYuOTk5OEM0LjYyNjE3IDE2Ljk5OTggMy45MzkyMSAxNi45OTk4IDMuMzM5ODggMTYuNzIyNUMyLjc5MjMgMTYuNDY5MiAyLjI0NDczIDE1Ljk1MzkgMS45NTg1NCAxNS40MjI4QzEuNjQ1MzEgMTQuODQxNCAxLjYwODQ3IDE0LjIzNyAxLjUzNDc5IDEzLjAyODJDMS41MTI5OSAxMi42NzA2IDEuNSAxMi4zMjIyIDEuNSAxMS45OTk4QzEuNSAxMS42Nzc0IDEuNTEyOTkgMTEuMzI5IDEuNTM0NzkgMTAuOTcxNFoiIHN0cm9rZT0iIzFDMjc0QyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4NCjxwYXRoIGQ9Ik0yMCA2QzIwIDYgMjEuNSA3LjggMjEuNSAxMkMyMS41IDE2LjIgMjAgMTggMjAgMTgiIHN0cm9rZT0iIzFDMjc0QyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPg0KPHBhdGggZD0iTTE4IDlDMTggOSAxOC41IDkuOSAxOC41IDEyQzE4LjUgMTQuMSAxOCAxNSAxOCAxNSIgc3Ryb2tlPSIjMUMyNzRDIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+DQo8L3N2Zz4=">`
    } else {
      doTheThing = `<img class="w-4 h-4" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xLjUzNDc5IDEwLjk3MTRDMS42MDg0NyA5Ljc2MjU1IDEuNjQ1MzEgOS4xNTgxNCAxLjk1ODU0IDguNTc2NzlDMi4yNDQ3MyA4LjA0NTYzIDIuNzkyMyA3LjUzMDQyIDMuMzM5ODggNy4yNzcwN0MzLjkzOTIxIDYuOTk5NzkgNC42MjYxNyA2Ljk5OTc5IDYuMDAwMDggNi45OTk3OUM2LjUxMjE1IDYuOTk5NzkgNi43NjgxOSA2Ljk5OTc5IDcuMDE2MiA2Ljk1NzkxQzcuMjYxMzggNi45MTY1IDcuNTAwNDYgNi44NDQ3OCA3LjcyNzk1IDYuNzQ0MzhDNy45NTgwNiA2LjY0MjgzIDguMTcxODEgNi41MDE4OSA4LjU5OTMyIDYuMjIwMDJMOC44MTgyNSA2LjA3NTY2QzExLjM2MTIgNC4zOTg5OCAxMi42MzI3IDMuNTYwNjMgMTMuNzAwMSAzLjkyNDg3QzEzLjkwNDcgMy45OTQ3IDE0LjEwMjggNC4wOTU1MSAxNC4yNzk3IDQuMjE5ODRDMTUuMjAyNCA0Ljg2ODI5IDE1LjI3MjUgNi4zNzY5OSAxNS40MTI3IDkuMzk0NEMxNS40NjQ2IDEwLjUxMTcgMTUuNSAxMS40Njc5IDE1LjUgMTEuOTk5OEMxNS41IDEyLjUzMTcgMTUuNDY0NiAxMy40ODc5IDE1LjQxMjcgMTQuNjA1MkMxNS4yNzI1IDE3LjYyMjYgMTUuMjAyNCAxOS4xMzEzIDE0LjI3OTcgMTkuNzc5N0MxNC4xMDI4IDE5LjkwNDEgMTMuOTA0NyAyMC4wMDQ5IDEzLjcwMDEgMjAuMDc0N0MxMi42MzI3IDIwLjQzODkgMTEuMzYxMiAxOS42MDA2IDguODE4MjUgMTcuOTIzOUw4LjU5OTMyIDE3Ljc3OTZDOC4xNzE4MSAxNy40OTc3IDcuOTU4MDYgMTcuMzU2NyA3LjcyNzk1IDE3LjI1NTJDNy41MDA0NiAxNy4xNTQ4IDcuMjYxMzggMTcuMDgzMSA3LjAxNjIgMTcuMDQxN0M2Ljc2ODE5IDE2Ljk5OTggNi41MTIxNSAxNi45OTk4IDYuMDAwMDggMTYuOTk5OEM0LjYyNjE3IDE2Ljk5OTggMy45MzkyMSAxNi45OTk4IDMuMzM5ODggMTYuNzIyNUMyLjc5MjMgMTYuNDY5MiAyLjI0NDczIDE1Ljk1MzkgMS45NTg1NCAxNS40MjI4QzEuNjQ1MzEgMTQuODQxNCAxLjYwODQ3IDE0LjIzNyAxLjUzNDc5IDEzLjAyODJDMS41MTI5OSAxMi42NzA2IDEuNSAxMi4zMjIyIDEuNSAxMS45OTk4QzEuNSAxMS42Nzc0IDEuNTEyOTkgMTEuMzI5IDEuNTM0NzkgMTAuOTcxNFoiIHN0cm9rZT0iIzFDMjc0QyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4NCjxwYXRoIGQ9Ik0xOCA5QzE4IDkgMTguNSA5LjkgMTguNSAxMkMxOC41IDE0LjEgMTggMTUgMTggMTUiIHN0cm9rZT0iIzFDMjc0QyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPg0KPC9zdmc+">`;
    }
    icon.html(doTheThing);
  }
}

function pomodoroStart() {
  // timerSetFor is the master time, timeRemaining is the more dynamic one. all units are in seconds.
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
    $("#timeremains").html(`${minutes}:${(seconds).toString().padStart(2, "0")}`);
  }
}


// window management all the way down
async function setWindows() {
  appList = await getJsonData(json, "applist.json");
  // set all them variables for them windows
  // image viewer is called within gallery, so skip that
  $(function() {
    for (let i = 0; i < appList.length; i++) {
      let app = appList[i].title;
      $(`#` + app + `close`).on("click", (function() { closeWindow("#" + app) })); // could just do $("#app")
      if (i > 1) {
        if (i < 7) {
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
