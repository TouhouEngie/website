// cookie getter, setter, and applier functions
// todo: fix the iframe issues

function setOutsideCookie(name, event) {
    event.preventDefault();
    setCookie(name, event.target.value, 365);
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";domain=.touhouengie.com;samesite=lax" + expires + ";path=/";
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
  let visualize = getCookie('visualizer');

  if (cursor != "") {
    configureCursor(cursor);
  } else {   
    setCookie("cursor", "1", 365);
  }

  // move this to the other js sometime
  if (visualize != "") {
    setVisualizer(visualize);
  } else {
    setCookie('visualizer', false, 365);
  }
  function setVisualizer(flag) {
    console.log(flag);
  }
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