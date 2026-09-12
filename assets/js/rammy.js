/* ===========================================================================
 * rammy.js — RAMMY, the site mascot. A RAM stick that thinks it's a dog.
 * Entirely inline SVG / ASCII so there's nothing to download, and entirely
 * original so there's nothing to get sued over.
 * ========================================================================= */
window.RAMMY = (function () {

  /* Colour variant — PS5, Switch, picker. */
  function full(size, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 64 64" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      /* ears */
      '<path d="M14 16 L14 6 L22 12 Z" fill="#7BD6E8"/>' +
      '<path d="M50 16 L50 6 L42 12 Z" fill="#7BD6E8"/>' +
      /* board */
      '<rect x="12" y="12" width="40" height="30" rx="4" fill="#1D6E52" stroke="#0E4A36" stroke-width="2"/>' +
      /* chips */
      '<rect x="17" y="18" width="9" height="7" rx="1" fill="#0B2C21"/>' +
      '<rect x="38" y="18" width="9" height="7" rx="1" fill="#0B2C21"/>' +
      /* eyes */
      '<rect x="19" y="20" width="3" height="3" fill="#9BF5C8" class="rm-eye"/>' +
      '<rect x="40" y="20" width="3" height="3" fill="#9BF5C8" class="rm-eye"/>' +
      /* snout + tongue */
      '<rect x="27" y="29" width="10" height="6" rx="2" fill="#0B2C21"/>' +
      '<rect x="30" y="33" width="4" height="4" rx="1" fill="#F27D8C" class="rm-tongue"/>' +
      /* gold contact pins */
      '<g fill="#E8C46B">' +
        '<rect x="14" y="42" width="3" height="7"/><rect x="20" y="42" width="3" height="7"/>' +
        '<rect x="26" y="42" width="3" height="7"/><rect x="35" y="42" width="3" height="7"/>' +
        '<rect x="41" y="42" width="3" height="7"/><rect x="47" y="42" width="3" height="7"/>' +
      '</g>' +
      /* tail */
      '<path d="M52 30 q9 -3 8 -12" stroke="#7BD6E8" stroke-width="4" fill="none" stroke-linecap="round" class="rm-tail"/>' +
      '</svg>';
  }

  /* Chunky 1-bit variant that survives the Game Boy LCD filter. */
  function pixel(size, cls) {
    var p = [
      '..XX........XX..',
      '.XXX........XXX.',
      'XXXXXXXXXXXXXXXX',
      'X..............X',
      'X.XXXX....XXXX.X',
      'X.X..X....X..X.X',
      'X.XXXX....XXXX.X',
      'X..............X',
      'X.....XXXX.....X',
      'X.....X..X.....X',
      'X.....XXXX.....X',
      'XXXXXXXXXXXXXXXX',
      'X.X.X.X..X.X.X.X',
      'X.X.X.X..X.X.X.X'
    ];
    var u = 100 / 16, r = '';
    p.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        if (row.charAt(x) === 'X') {
          r += '<rect x="' + (x * u).toFixed(2) + '" y="' + (y * u).toFixed(2) +
               '" width="' + (u + 0.4).toFixed(2) + '" height="' + (u + 0.4).toFixed(2) + '" fill="currentColor"/>';
        }
      }
    });
    return '<svg class="' + (cls || '') + '" viewBox="0 0 100 ' + (14 * u).toFixed(1) +
           '" width="' + size + '" aria-hidden="true">' + r + '</svg>';
  }

  var ASCII = [
    "      /\\_____/\\        ",
    "     /  o   o  \\       RAMMY v1.0",
    "    ( ==  ^  == )      8 GB of loyalty",
    "     )         (       DDR4-3200",
    "    (           )      ",
    "   ( (  )   (  ) )     `help` for commands",
    "  (__(__)___(__)__)    "
  ].join('\n');

  /* Context-aware one-liners. Rammy is helpful and slightly rude. */
  var LINES = {
    menu:     ["Press A. I'm not doing it for you.", "Everything here was built by hand. Including me."],
    projects: ["Nine builds. Two involve popsicle sticks.", "Pick one. I'll wait. I'm a RAM stick, I have time."],
    about:    ["The Coke Zero chute is still theoretical.", "He really does want to automate a whole house."],
    contact:  ["This is the part where you hire him.", "Summer 2027. Just saying."],
    trophy:   ["Collect them all. Or don't. I'm a mascot, not a cop."],
    idle:     ["Still here.", "I'm 8 GB of loyalty.", "Try the Konami code.", "Ask the terminal for `neofetch`."]
  };
  function say(key) {
    var a = LINES[key] || LINES.idle;
    return a[Math.floor(Math.random() * a.length)];
  }
  function forProject(p) {
    return [p.parts[0] + ' powered this one.',
            'Status: ' + p.status + '.',
            p.lesson.length > 70 ? p.lesson.slice(0, 68) + '…' : p.lesson][Math.floor(Math.random() * 3)];
  }

  return { full: full, pixel: pixel, ascii: ASCII, say: say, forProject: forProject };
})();
