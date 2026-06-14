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
  var sidebarOpen = true;
  loadListOfLists();
  $("#returntostart").on("click", function() {
    loadListOfLists();
    $("#musicsearchbar").hide();
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
  $("#musicsearchbar").on('input', function() {
    searchMainline($("#musicsearchbar").val().toLowerCase());
  });
  $("#hidesonglist").on('click', function() {
    $("#songlist").toggle();
    text = sidebarOpen ? "Show Sidebar" : "Hide Sidebar";
    sidebarOpen = !(sidebarOpen);
    toggleWindowSize(sidebarOpen);
    $("#hidesonglist").html(text);
  });

  configureCursor();

  function toggleWindowSize(bool) {
    // the code's kinda shit but eh
    let master = ["sm:w-170", "sm:w-91", "grid-cols-1", "grid-cols-2"]
    let replacer = bool ? master[0] : master[1];
    let target = bool ? master[1] : master[0];
    $("#musicwindow").removeClass(target);
    $("#musicwindow").addClass(replacer);
    target = bool ? master[2] : master[3];
    replacer = bool ? master[3] : master[2];
    $("#musicplayercontents").removeClass(target);
    $("#musicplayercontents").addClass(replacer);
  }
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
          $("#musicsearchbar").show();
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
      songConstruction(song);
    }
  }

  function songConstruction(song) {
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
  function searchMainline(query) {
    $("#playlist").empty();
    for (var i = 0; i < currentPlaylistOrder.length; i++) {
      let song = currentPlaylistOrder[i];
      if ((song.title.toLowerCase().indexOf(query) >= 0) || (song.author.toLowerCase().indexOf(query) >= 0)) {
        songConstruction(song);
      }
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