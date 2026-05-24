// some things just need to be global
// debug flag. keep this to True.
const enableCookies = true;

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
setTopBarWidgets('#yetanotherclock', '#easterndatewidget');

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


function setOutsideCheckbox() {
  // all checkboxes (as of right now) live here. will find a more efficient way soon.
  if (enableCookies) {
    $("#visual").on('click', function() {
      setCookie("visualizer", document.getElementById("visual").checked, 365);
    });
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
  var sidebarOpen = true;
  var text = "";

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

  $('#toggletopbar').on("click", function() {
    $("#history").toggle();
    text = sidebarOpen ? "Show Topbar" : "Hide Topbar";
    sidebarOpen = !(sidebarOpen);
    $("#toggletopbar").html(text);
  })
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
    $("#thing").html(`<iframe frameborder="0" src="https://itch.io/embed-upload/16740430?color=333333" allowfullscreen="" width="512" height="660"><a href="https://touhouengie.itch.io/falling-engie">Play Falling Engie on itch.io</a></iframe>`);
}

function interwebzStart() {
  $("#interwebzui").html(`<a href="#" onclick="refreshToHomeScreen()">Load Server Homepage</a><iframe id="webview" class="w-full sm:w-150 h-120" src="https://fileserver.touhouengie.com?pw=p4ssw0rd69"></iframe>`);
  return;
}

function chatbookStart() {
  $("#chatbookui").html(`<iframe id="chatview" class="w-full sm:w-150 h-full sm:h-120" src="https://chatbook.touhouengie.com"></iframe>`);
}

function refreshToHomeScreen() {
  $("#webview").attr('src', "https://fileserver.touhouengie.com/");
}

function pythonStart() {
  $("#pythonui").html(`<iframe class="w-full sm:w-140 h-full sm:h-110" src="https://www.touhouengie.com/python/index.html"></iframe>`);
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
