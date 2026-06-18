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
    var author = getSongAuthor(song.author, false);
    var newSong = $('<li>');
    newSong.add("pointer");
    newSong.html(`<p>${song.title}</p><p class="text-xs"${author}</p><br>`);
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
    $("#songauthor").html(`<p${getSongAuthor(song.author, true)}</p>`);
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

  function getSongAuthor(author, type) {
    if (author.indexOf(";") < 0) {
      return ">" + author;
    }
    if (type) {
      setSongAuthor(author);
      return ' onclick="openBlankWindow(tempAuthorString)" class="text-blue-500">View Full Details...';
    } else {
      // the reason i'm not initially saving it is that not all songs will use this.
      return ">" + author.substring(0, author.indexOf(";"));
    }
  }

  function setSongAuthor(author) {
      var listOfAuthors = author.split(";");
      tempAuthorString = "";
      for (var i = 0; i < listOfAuthors.length; i++) {
        tempAuthorString = tempAuthorString + "<p>" + listOfAuthors[i] + "</p>";
      }
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
