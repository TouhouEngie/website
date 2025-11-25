// TODO: Maybe copyparty is a little too slow for my needs?
const json = "https://comment-walt-warrior-donated.trycloudflare.com/drive/webpage_data";
var largestIndex = 1;
var selectedIcon = undefined;
var audio = null;
var appList = undefined;

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
configureSettings();

async function setWindows() {
  appList = await getJsonData(json, "applist.json");
  // set all them variables for them windows
  // image viewer is called within gallery, so skip that
  $(function() {
    for (let i = 0; i < appList.length; i++) {
      let app = appList[i].title;
      $(`#` + app + `close`).on("click", (function() { closeWindow("#" + app) })); // could just do $("#app")
      if (i > 0) {
        if (i < 6) {
          $(`#` + app + `open`).on("click", (function() { openWindow("#" + app) }));
        } else {
          $(`#` + app + `open`).on("click", (function() { iconTap(app) }));
        }
      }
      dragElement("#" + app);
    }
  });
}
setWindows();

// the lone dropdown menu
$("#dropdownopen").on("click", function(event) {
  event.stopPropagation();
  openWindow("#dropdownmenu");
});
$(document).on("click", function() {
  closeWindow("#dropdownmenu");
});


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

function configureSettings() {

  // check cookie
  let cursor = getCookie("cursor");
  // let visualize = getCookie('visualizer');
  if (cursor != "") {
    configureCursor(cursor);
  } else {   
    setCookie("cursor", "1", 365);
  }
  /*
  if (visualize != "") {
    setVisualizer(visualize);
  } else {
    setCookie('visualizer', '1', 365);
  }
  */
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
  function setVisualizer(flag) {
    // test
  }
}

async function getJsonData(url, file) {
  var finale = [];
  const signal = await fetch(url.concat("/json/", file));
  const json = await signal.json();
  for (var i in json) {
    finale.push(json[i]);
  }
  return finale[0];
}

// consult blog.json for the content array
async function noteviewStart() {
  const blog = await getJsonData(json, "blog.json");
  for (let i = 0; i < blog.length; i++) {
    var note = blog[i];
    var newEntry = $("<div>");
    newEntry.addClass("border-solid").addClass("border-2").addClass("rounded-md").addClass("bg-gray-900").addClass("pointer");
    newEntry.html(`<p>${note.title} (${note.date})</p>`);
    newEntry.on("click", function() {
      $('#notescontent').html(blog[i].content);
    });
    $("#history").append(newEntry);
  }
  $('#notescontent').html(blog[0].content);
  configureSettings();
}

async function galleryStart() {
  const galleryStructure = await getJsonData(json, "gallery.json");
  
  for (var i = 0; i < galleryStructure.length; i++) {
    setGalleryContent(galleryStructure, i);
    // i ain't gonna make your life harder than it has to be
  }
  // consult gallery.json for the file structure array
  function setGalleryContent(inputArray, index) {
    var newEntry = $("<span>");
    newEntry.html(`<img class="w-20 h-20" src="${inputArray[index].image}"><p class="break-all text-sm">${inputArray[index].name}</p>`);
    if (inputArray[index].isFolder) {
      newEntry.on("click", function() {
        $("#gallerycontents").html('');
        $("#filepath").html('/' + inputArray[index].name + '/');
        for (var i = 0; i < inputArray[index].contents.length; i++) {
          setGalleryContent(inputArray[index].contents, i);
        } 
      });
    } else {
      newEntry.on("click", function() {
        $("#imgviewcontents").html(inputArray[index].contents);
        openWindow($("#imgview"));
      });
    }
    $("#gallerycontents").append(newEntry);
  }
}

function gamedemoStart() {
  $("#thing").html(`<iframe class="cursor-[url('./cursors/normal.cur'),default]" frameborder="0" src="https://itch.io/embed-upload/15081350?color=333333" allowfullscreen="" width="640" height="380"><a href="https://smirbyrneh420.itch.io/together-or-never-demo">Itch.io link</a></iframe>`);
}

function emailStart() {
  // TODO: Buy a domain to migrate from GitHub Pages to another provider for PHP and MySQL support
  return;
}

function interwebzStart() {
  return;
}

function refreshToHomeScreen() {
  $("#webview").attr('src', "https://comment-walt-warrior-donated.trycloudflare.com/");
}

function pythonStart() {
  return;
}

// i can't get this to work
async function parseAsTextDoc() {
  var message = document.getElementById('message').value;
  message = "<-- BEGIN PGP MESSAGE --> \\n".concat(message);
  message = message.concat("\\n <-- END PGP MESSAGE -->")
  // this web user is already extremely restricted anyway
  fetch("https://comment-walt-warrior-donated.trycloudflare.com/mail/mail.txt?pw=p4ssw0rd69", {
    method: 'PUT',
    body: message,
    headers: {
      "Content-Type": "text/markdown; charset=UTF-8"
    }
  });
}

async function musicplayerStart() {
  const playlist = await getJsonData(json, "music.json");
  var shuffle = false;
  var repeat = false;
  var shuffleOrder = [];
  var increment = 0;
  var index = 0;
  var newClass = "";
  var original = "";
  // var context = new AudioContext();
  // var analyser = context.createAnalyser();
  for (let i = 0; i < playlist.length; i++) {
    var song = playlist[i];
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
    var temp = 0;
    while (shuffleOrder.length <= (playlist.length - 1)) {
      temp = Math.abs(Math.round((Math.random() * playlist.length) - 1));
      if (shuffleOrder.indexOf(temp) < 0) {
        shuffleOrder.push(temp);
      }
    }
    setSvgAndStuff('shuffle');
    if (!(audio)) {
      playSong(playlist[shuffleOrder[increment]]);
    }
  });
  $("#repeat").on('click', function() {
    setSvgAndStuff('repeat');
  });
  $("#nextsong").on('click', function() {
    if (shuffle) {
      increment++;
      playNextSong(playlist[shuffleOrder[increment]]);
    } else if (repeat) {
      playNextSong(playlist[index]);
    } else { 
      playNextSong(playlist[index+1]);
    }
  });
  $("#rewind").on('click', function() {
    if (shuffle) {
      increment--;
      playNextSong(playlist[shuffleOrder[increment]]);
    } else if (repeat) {
      playNextSong(playlist[index]);
    } else { 
      playNextSong(playlist[index-1]);
    }
  });

  configureSettings();
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

  function playSong(song) {
    // Handles anything related to the Audio class.

    // basically the equivalent of taking an integral of a derivative.
    // takes the index of a song in the array
    index = playlist.findIndex(s => s.title === song.title && s.author === song.author);
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
    audio.play();
    // play_and_draw();
    audio.addEventListener('ended', function() {
      if (shuffle) {
        increment++;
        playNextSong(playlist[shuffleOrder[increment]]);
      } else if (repeat) {
        playNextSong(playlist[index]);
      } else { 
        playNextSong(playlist[index+1]);
      }
    });
    audio.addEventListener('pause', function() {
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>`);
    });
    audio.addEventListener('play', function() {
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z"/></svg>`);
    });
  }
  function playNextSong(song) {
    if (song) {
      playSong(song);
    } else {
      $("#pause").html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"/></svg>`);
      audio.pause();
    }
  }
  function play_and_draw() {
    // doing more than one source causes audio glitches beyond my understanding
    // otherwise this is one and done
    if (!src) {
      var src = context.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(context.destination);
    }
    var ctx = $("#canvas")[0].getContext("2d");
    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);
    var WIDTH = $("#canvas").width;
    var HEIGHT = $("#canvas").height;
    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;
    function renderFrame() {
      requestAnimationFrame(renderFrame);
      x = 0;
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5 - 50;
        
        var r = barHeight + (25 * (i/bufferLength));
        var g = 250 * (i/bufferLength);
        var b = 50;

        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }
    audio.play();
    renderFrame();
  }
  // TODO: Set visualizer as an optional (experimental) setting, and squash the syncronization bugs related with the web audio API
}

function time() {
    const deez = new Date();
    let hour = deez.getHours();
    let minute = deez.getMinutes();
    let period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    hour = hour ? hour : 12;
    minute = convertToProperMinutesOrSeconds(minute);

    const actualDate = `${hour}:${minute} ${period}`;
    $("#time").html(actualDate);
}
time();
setInterval(time, 1000);

// used for both mp3 player and current time
function convertToProperMinutesOrSeconds(minutes) {
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return minutes;
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

function windowTap(element) {
  reorganizeWindows(element);
  deselectIcon(selectedIcon);
}

// This takes a string, no #
function loadApp(ignition) {
  var index = appList.findIndex(a => a.title === ignition);
  if (!(appList[index].hasBeenOpened)) { 
    eval(ignition + "Start();");
    appList[index].hasBeenOpened = true;
  } else { return; }
}
