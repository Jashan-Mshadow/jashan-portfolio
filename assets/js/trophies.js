/* ===========================================================================
 * trophies.js — achievement system. Unlocks persist in localStorage so the
 * banner doesn't re-fire on every visit, and the PS5 Trophy Room reads the
 * same list.
 * ========================================================================= */
window.TROPHY = (function () {
  var LIST = [
    { id: 'power',      icon: '🔌', name: 'Power On',              desc: 'Booted the site. The bar is low and you cleared it.' },
    { id: 'boring',     icon: '📄', name: 'Boring Person',          desc: 'Went straight to Boring Mode. Respect — you have a job to do.' },
    { id: 'baremetal',  icon: '🔧', name: 'Bare Metal Explorer',    desc: 'Opened three or more builds.' },
    { id: 'complete',   icon: '💯', name: 'Completionist',          desc: 'Looked at every single project. Who hurt you?' },
    { id: 'wars',       icon: '🕹️', name: 'Console Wars',           desc: 'Tried every interface. There is no wrong answer, but Game Boy is the right one.' },
    { id: 'sound',      icon: '🔊', name: 'Sound On',               desc: 'Kept the audio on for two minutes without rage-muting.' },
    { id: 'cartridge',  icon: '💨', name: 'Blow on the Cartridge',  desc: 'The oldest fix in the book. It never actually worked.' },
    { id: 'root',       icon: '⌨️', name: 'Root Access',            desc: 'Ran five commands in the terminal. You read the help text.' },
    { id: 'konami',     icon: '🐉', name: '↑↑↓↓←→←→BA',             desc: 'You found the Konami code. Of course you did.' },
    { id: 'reader',     icon: '📖', name: 'Actually Read It',       desc: 'Stayed on one project for a full minute. Genuinely appreciated.' },
    { id: 'night',      icon: '🌙', name: 'Night Shift',            desc: 'Visiting after midnight. Same, honestly.' },
    { id: 'recruiter',  icon: '🤝', name: 'The Good Ending',        desc: 'Opened the contact section. Jashan is available Summer 2027.' }
  ];

  var got = {};
  try { got = JSON.parse(localStorage.getItem('jm-trophies') || '{}'); } catch (e) { got = {}; }

  var host = null;
  function mount() {
    if (host) return host;
    host = document.createElement('div');
    host.id = 'trophies';
    document.body.appendChild(host);
    return host;
  }

  function banner(t) {
    var n = document.createElement('div');
    n.className = 'trophy';
    n.innerHTML = '<span class="ico">' + t.icon + '</span><span>' +
                  '<b>Trophy unlocked</b><span>' + t.name + '</span></span>';
    mount().appendChild(n);
    requestAnimationFrame(function () { n.classList.add('in'); });
    setTimeout(function () {
      n.classList.remove('in');
      setTimeout(function () { n.remove(); }, 500);
    }, 4200);
  }

  return {
    all:    function () { return LIST; },
    has:    function (id) { return !!got[id]; },
    count:  function () { return Object.keys(got).length; },
    total:  function () { return LIST.length; },
    unlock: function (id) {
      if (got[id]) return false;
      var t = LIST.filter(function (x) { return x.id === id; })[0];
      if (!t) return false;
      got[id] = Date.now();
      try { localStorage.setItem('jm-trophies', JSON.stringify(got)); } catch (e) {}
      banner(t);
      if (window.SFX) SFX.trophy();
      return true;
    },
    reset: function () { got = {}; try { localStorage.removeItem('jm-trophies'); } catch (e) {} }
  };
})();
