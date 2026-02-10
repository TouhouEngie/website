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
setOutsideCheckbox();


// the lone dropdown menu (not very lonely anymore)
$("#dropdownopen").on("click", function(event) {
  event.stopPropagation();
  openWindow("#dropdownmenu");
});
$(document).on("click", function() {
  closeWindow("#dropdownmenu");
  closeWindow("#pageringwidget");
  closeWindow('#easterndatewidget');
});
setTopBarWidgets('#time', '#datewidget');
setTopBarWidgets('#webring', '#pageringwidget');
setTopBarWidgets('#volume', '#volumewidget');
setTopBarWidgets('#yetanotherclock', '#easterndatewidget')

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
  const dateInator = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' });
  const monthInator = new Intl.DateTimeFormat('en-US', { month: "long" });
  
  let day = deez.getDate();
  let num = deez.getMonth();
  let month = monthInator.format(deez);
  let year = deez.getFullYear();
  
  $("#date").html(dateInator.format(deez));
  setCalendar(num, year, month);

  function daysInMonth(month, year) {
    return new Date(year, (month+1), 0).getDate();
  }

  function setCalendar(month, year, wordMonth) {
    let nutz = new Date(year, month, 1).getDay();
    $("#calendar").empty()
    for (var i = 0; i <= nutz - 1; i++) {
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

function easternTime(flag) {
  let localTimeInator = new Intl.DateTimeFormat('en-US', { timeZone: "America/New_York", timeStyle: "short"});
  var deviation = "";
  
  if (deviation === "" || flag) {
    easternDate();
  }
  
  $("#mylocaldate").html(`My time: ${deviation} at ${localTimeInator.format(deez)}`);

  function easternDate() {
    let localInator = new Intl.DateTimeFormat('en-US', { timeZone: "America/New_York", day: "numeric"});
    let convertInator = new Intl.DateTimeFormat('en-US', { day: "numeric"} );

    switch (localInator.format(deez) - convertInator.format(deez)) {
      case -1:
        deviation = "Yesterday";
        break;
      case 1:
        deviation = "Tomorrow";
        break;
      case 0:
        deviation = "Today";
        break;
      default:
        deviation = "Huh?";
    }
  }
}

function timePerSecond() {
  deez = new Date();
  var setEastDate = false;
  const dateInator = new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short'
  });

  const actualTime = dateInator.format(deez);
  if (actualTime === "12:00 AM" && deez.getSeconds() === 0) {
    time();
    setEastDate = true;
  }
  $("#time").html(actualTime);
  easternTime(setEastDate);
  setEastDate = false;
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

function setImageViewer(link) {
  $("#imgviewcontents").html(link);
  openWindow($("#imgview"));
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
        setImageViewer(setFileSource(inputArray, index));
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
      $("#playingAudio").hide();
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>`);
    } else {
      audio.play();
      $("#playingAudio").show();
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
    $("#playingAudio").show();
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
      $("#playingAudio").hide();
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
      doTheThing = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><title>Muted-linear SVG Icon</title><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M16.659 6c-.14-.798-.37-1.315-.792-1.628a2.113 2.113 0 0 0-.538-.29c-.992-.357-2.172.465-4.533 2.11l-.204.14c-.397.277-.595.415-.809.515a2.676 2.676 0 0 1-.66.21c-.231.04-.469.04-.944.04c-1.276 0-1.914 0-2.47.272c-.509.249-1.017.754-1.283 1.275c-.291.57-.325 1.162-.394 2.348c-.02.35-.032.692-.032 1.008c0 .316.012.658.032 1.008c.069 1.186.103 1.778.394 2.348c.266.521.774 1.026 1.282 1.275c.557.272 1.195.272 2.47.272c.476 0 .714 0 .944.04c.228.041.45.112.661.21c.214.1.412.238.81.514l.203.142c2.36 1.644 3.542 2.466 4.533 2.109c.19-.069.374-.168.538-.29c.422-.313.652-.83.792-1.628M20 9l-6 6m0-6l6 6"/></svg>`
    } else if (volume <= 33) {
      doTheThing = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><title>Volume-linear SVG Icon</title><path fill="none" stroke="currentColor" stroke-width="1.5" d="M5.035 10.971c.073-1.208.11-1.813.424-2.394a3.215 3.215 0 0 1 1.38-1.3C7.44 7 8.127 7 9.5 7c.512 0 .768 0 1.016-.042c.245-.042.485-.113.712-.214c.23-.101.444-.242.871-.524l.22-.144C14.86 4.399 16.132 3.56 17.2 3.925c.205.07.403.17.58.295c.922.648.992 2.157 1.133 5.174A68.21 68.21 0 0 1 19 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.314 2.314 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151l-.219-.144c-.427-.282-.64-.423-.871-.525a2.998 2.998 0 0 0-.712-.213C10.268 17 10.012 17 9.5 17c-1.374 0-2.06 0-2.66-.277a3.215 3.215 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17.127 17.127 0 0 1 5 12c0-.323.013-.671.035-1.029Z"/></svg>`
    // for any coders looking here in the latter half of the 21st century: no, this was not a technical issue, it was to spite the brainrotten dipsh!ts who ruined a perfectly good number.
    } else if (volume >= (64+3)){
      doTheThing = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><title>Volume-loud-linear SVG Icon</title><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1.535 10.971c.073-1.208.11-1.813.424-2.394a3.215 3.215 0 0 1 1.38-1.3C3.94 7 4.627 7 6 7c.512 0 .768 0 1.016-.042a3 3 0 0 0 .712-.214c.23-.101.444-.242.871-.524l.22-.144C11.36 4.399 12.632 3.56 13.7 3.925c.205.07.403.17.58.295c.922.648.993 2.157 1.133 5.174A68.21 68.21 0 0 1 15.5 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.314 2.314 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151L8.6 17.78c-.427-.282-.64-.423-.871-.525a3 3 0 0 0-.712-.213C6.768 17 6.512 17 6 17c-1.374 0-2.06 0-2.66-.277a3.215 3.215 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17.127 17.127 0 0 1 1.5 12c0-.323.013-.671.035-1.029Z"/><path stroke-linecap="round" d="M20 6s1.5 1.8 1.5 6s-1.5 6-1.5 6m-2-9s.5.9.5 3s-.5 3-.5 3"/></g></svg>`
    } else {
      doTheThing = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><title>Volume-small-linear SVG Icon</title><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1.535 10.971c.073-1.208.11-1.813.424-2.394a3.215 3.215 0 0 1 1.38-1.3C3.94 7 4.627 7 6 7c.512 0 .768 0 1.016-.042a3 3 0 0 0 .712-.214c.23-.101.444-.242.871-.524l.22-.144C11.36 4.399 12.632 3.56 13.7 3.925c.205.07.403.17.58.295c.922.648.993 2.157 1.133 5.174A68.21 68.21 0 0 1 15.5 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.314 2.314 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151L8.6 17.78c-.427-.282-.64-.423-.871-.525a3 3 0 0 0-.712-.213C6.768 17 6.512 17 6 17c-1.374 0-2.06 0-2.66-.277a3.215 3.215 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17.127 17.127 0 0 1 1.5 12c0-.323.013-.671.035-1.029Z"/><path stroke-linecap="round" d="M18 9s.5.9.5 3s-.5 3-.5 3"/></g></svg>`;
    }
    icon.html(doTheThing);
  }
}

function pomodoroStart() {
  timerWorker = new Worker("timerworker.js");

  $("#toggletimer").on("click", (function() {
    timerWorker.postMessage("pomodorintime");
  }));
  
  timerWorker.onmessage = (e) => {
    switch (e.data[0]) {
      case "clarkson":
        $("#phase").html(e.data[1]);
        break;
      case "startingWindows":
        $("#msg").html(e.data[1] ? "Timer started" : "Timer paused");
        break;
      default:
        document.getElementById("timer").value = (e.data[1]);
        $("#timeremains").html(e.data[2]);
    }
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
