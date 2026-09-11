/* ===========================================================================
 * app.js — boot sequence, console picker, and four renderers over content.js.
 *
 * The idea: content lives in exactly one place (window.SITE) and each mode is
 * a function that turns it into a different interface. Adding a console means
 * adding a renderer, not duplicating content.
 * ========================================================================= */
(function () {
  'use strict';

  var S = window.SITE;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage  = document.getElementById('stage');
  var picker = document.getElementById('picker');

  var el = function (tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  };
  // **bold** -> <b>bold</b>, and nothing else. Content is ours, not user input.
  var md = function (s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  };
  var clear = function (n) { while (n.firstChild) n.removeChild(n.firstChild); };

  /* ======================================================= MODE SWITCHER */
  var MODES = [
    { id: 'gb',    label: 'Game Boy' },
    { id: 'ps',    label: 'PlayStation' },
    { id: 'sw',    label: 'Switch' },
    { id: 'plain', label: 'Boring' }
  ];
  var current = null;
  var switcher = document.getElementById('modeSwitch');

  function buildSwitcher() {
    clear(switcher);
    MODES.forEach(function (m) {
      var b = el('button', null, m.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(current === m.id));
      b.addEventListener('click', function () { setMode(m.id); });
      switcher.appendChild(b);
    });
  }

  function setMode(id) {
    current = id;
    try { localStorage.setItem('jm-mode', id); } catch (e) {}
    picker.classList.add('hide');
    switcher.classList.remove('hide');
    buildSwitcher();
    clear(stage);
    stage.classList.remove('hide');
    ({ gb: renderGB, ps: renderPS, sw: renderSW, plain: renderPlain }[id])();
    window.scrollTo(0, 0);
  }

  /* ============================================================ THE BOOT */
  function boot(done) {
    var b = document.getElementById('boot');
    if (reduce) { b.remove(); done(); return; }

    var logo = b.querySelector('.boot-logo');
    var sub  = b.querySelector('.boot-sub');
    var fired = false;
    var finish = function () {
      if (fired) return; fired = true;
      b.classList.add('out');
      setTimeout(function () { b.remove(); done(); }, 520);
    };
    b.querySelector('.boot-skip').addEventListener('click', finish);
    addEventListener('keydown', finish, { once: true });

    // The Game Boy boot: logo slides down, lands, then the subtitle appears.
    logo.style.transition = 'transform 1.15s cubic-bezier(.33,0,.2,1)';
    requestAnimationFrame(function () { logo.style.transform = 'translateY(0)'; });
    setTimeout(function () {
      logo.style.transition = 'transform .16s ease';
      logo.style.transform = 'translateY(-6px)';
      setTimeout(function () { logo.style.transform = 'translateY(0)'; }, 160);
      sub.style.transition = 'opacity .4s ease';
      sub.style.opacity = '1';
    }, 1180);
    setTimeout(finish, 2500);
  }

  /* ========================================================== THE PICKER */
  function showPicker() {
    switcher.classList.add('hide');
    stage.classList.add('hide');
    picker.classList.remove('hide');
  }
  picker.querySelectorAll('[data-mode]').forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.dataset.mode); });
  });

  /* ======================================================= GAME BOY MODE */
  function renderGB() {
    var wrap = el('div', 'gbm');
    wrap.innerHTML =
      '<div>' +
        '<div class="gb-shell">' +
          '<div class="gb-brand"><span>JM-BOY</span><span>DOT MATRIX WITH STEREO SOUND</span></div>' +
          '<div class="gb-win"><div class="gb-lcd"><div class="gb-scroll" id="lcd"></div>' +
            '<div class="gb-foot" id="lcdFoot"></div></div></div>' +
          '<div class="gb-pad">' +
            '<div class="dpad">' +
              '<button class="sp" tabindex="-1"></button><button data-k="up">▲</button><button class="sp" tabindex="-1"></button>' +
              '<button data-k="left">◀</button><button class="mid" tabindex="-1"></button><button data-k="right">▶</button>' +
              '<button class="sp" tabindex="-1"></button><button data-k="down">▼</button><button class="sp" tabindex="-1"></button>' +
            '</div>' +
            '<div class="gb-ab"><button data-k="b">B</button><button data-k="a">A</button></div>' +
          '</div>' +
          '<div class="gb-se"><button data-k="b">SELECT</button><button data-k="a">START</button></div>' +
        '</div>' +
        '<p class="gb-hint">D-pad or arrow keys · A / Enter to select · B to go back</p>' +
      '</div>';
    stage.appendChild(wrap);

    var lcd  = wrap.querySelector('#lcd');
    var foot = wrap.querySelector('#lcdFoot');

    var MENU = [
      ['PROJECTS',   'projects'],
      ['ABOUT ME',   'about'],
      ['EXPERIENCE', 'experience'],
      ['TOOLKIT',    'skills'],
      ['SIGNALS',    'interests'],
      ['CONTACT',    'contact']
    ];
    var screen = 'menu', sel = 0, back = null;

    function list(title, rows, hint) {
      clear(lcd);
      lcd.appendChild(el('h3', null, title));
      lcd.appendChild(el('div', 'rule'));
      rows.forEach(function (r, i) {
        lcd.appendChild(el('div', 'gb-row' + (i === sel ? ' sel' : ''), (i === sel ? '▸ ' : '  ') + r));
      });
      foot.textContent = hint || 'A = SELECT';
      var s = lcd.querySelector('.sel');
      if (s && s.scrollIntoView) s.scrollIntoView({ block: 'nearest' });
    }

    function page(title, lines, hint) {
      clear(lcd);
      lcd.appendChild(el('h3', null, title));
      lcd.appendChild(el('div', 'rule'));
      lines.forEach(function (t) {
        var p = el('div', null, t);
        p.style.marginBottom = '7px';
        lcd.appendChild(p);
      });
      foot.textContent = hint || 'B = BACK';
    }

    function draw() {
      if (screen === 'menu') {
        list('JASHAN MULTANI', MENU.map(function (m) { return m[0]; }), 'A = SELECT');
      } else if (screen === 'projects') {
        list('PROJECTS', S.projects.map(function (p) { return p.name.toUpperCase(); }), 'A = OPEN  B = BACK');
      } else if (screen === 'project') {
        var p = S.projects[back];
        page(p.name.toUpperCase(), [p.hook, p.body, '> ' + p.lesson, p.parts.join(' · ')], 'B = BACK');
      } else if (screen === 'about') {
        page('ABOUT ME', [S.thesis, S.thesis2, S.fleet]);
      } else if (screen === 'experience') {
        var lines = [];
        S.experience.forEach(function (j) {
          lines.push(j.org.toUpperCase() + ' — ' + j.when);
          lines.push(j.role);
          j.bullets.forEach(function (b) { lines.push('· ' + b.replace(/\*\*/g, '')); });
        });
        page('EXPERIENCE', lines);
      } else if (screen === 'skills') {
        page('TOOLKIT', S.skills.map(function (s) { return s[0].toUpperCase() + ': ' + s[1].join(', '); }));
      } else if (screen === 'interests') {
        page('SIGNALS', S.interests.map(function (i) { return i[0].toUpperCase() + ' — ' + i[1]; }));
      } else if (screen === 'contact') {
        page('CONTACT', [S.contact.line, S.contact.email, 'linkedin.com/in/jashanmultani', 'github.com/Jashan-Mshadow']);
      }
    }

    function key(k) {
      var len = screen === 'menu' ? MENU.length : (screen === 'projects' ? S.projects.length : 0);
      if (k === 'up'   && len) { sel = (sel - 1 + len) % len; }
      if (k === 'down' && len) { sel = (sel + 1) % len; }
      if (k === 'a') {
        if (screen === 'menu')          { screen = MENU[sel][1]; sel = 0; }
        else if (screen === 'projects') { back = sel; screen = 'project'; }
      }
      if (k === 'b') {
        if (screen === 'project')      { screen = 'projects'; sel = back || 0; }
        else if (screen !== 'menu')    { screen = 'menu'; sel = 0; }
      }
      draw();
    }

    wrap.querySelectorAll('[data-k]').forEach(function (b) {
      b.addEventListener('click', function () { key(b.dataset.k); });
    });
    var kmap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    wrap._keys = function (e) {
      if (kmap[e.key]) { e.preventDefault(); key(kmap[e.key]); }
      else if (e.key === 'Enter' || e.key === 'a' || e.key === 'A') key('a');
      else if (e.key === 'Backspace' || e.key === 'b' || e.key === 'B') { e.preventDefault(); key('b'); }
    };
    addEventListener('keydown', wrap._keys);
    draw();
  }

  /* ===================================================== PLAYSTATION MODE */
  function renderPS() {
    var wrap = el('div', 'psm');
    var sel = 0, tab = 'games';

    wrap.innerHTML =
      '<div class="ps-top">' +
        '<div class="ps-av">JM</div>' +
        '<div><strong>' + S.name + '</strong><span>' + S.role + '</span></div>' +
      '</div>' +
      '<div class="ps-tabs" id="psTabs"></div>' +
      '<div id="psMain"></div>';
    stage.appendChild(wrap);

    var tabs = wrap.querySelector('#psTabs');
    var main = wrap.querySelector('#psMain');
    var TABS = [['games', 'Projects'], ['about', 'About'], ['work', 'Experience'], ['contact', 'Contact']];

    function drawTabs() {
      clear(tabs);
      TABS.forEach(function (t) {
        var b = el('button', null, t[1]);
        b.type = 'button';
        b.setAttribute('aria-pressed', String(tab === t[0]));
        b.addEventListener('click', function () { tab = t[0]; draw(); });
        tabs.appendChild(b);
      });
    }

    function drawGames() {
      var p = S.projects[sel];
      var media = p.video
        ? '<video src="' + p.video + '" poster="' + p.img + '" controls playsinline preload="none"></video>'
        : '<img src="' + p.img + '" alt="' + p.full + '">';
      main.innerHTML =
        '<div class="ps-hero">' +
          '<div class="ps-art">' + media + '</div>' +
          '<div class="ps-info">' +
            '<span class="ps-badge">' + p.status + ' · ' + p.year + '</span>' +
            '<h2>' + p.full + '</h2>' +
            '<p>' + p.hook + '</p>' +
            '<p>' + p.body + '</p>' +
            '<p class="lesson">' + p.lesson + '</p>' +
            '<div class="ps-actions">' +
              '<a class="ps-btn" href="' + p.repo + '" target="_blank" rel="noopener">View code</a>' +
              '<a class="ps-btn ghost" href="#" data-next>Next project</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ps-rail"><div class="ps-strip" id="psStrip"></div></div>';

      var strip = main.querySelector('#psStrip');
      S.projects.forEach(function (q, i) {
        var b = el('button', 'ps-tile');
        b.type = 'button';
        b.setAttribute('aria-current', String(i === sel));
        b.innerHTML = '<img src="' + q.img + '" alt=""><span>' + q.name + '</span>';
        b.addEventListener('click', function () { sel = i; draw(); });
        strip.appendChild(b);
      });
      var nx = main.querySelector('[data-next]');
      if (nx) nx.addEventListener('click', function (e) {
        e.preventDefault(); sel = (sel + 1) % S.projects.length; draw();
      });
      var cur = strip.querySelector('[aria-current="true"]');
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    function drawAbout() {
      main.innerHTML =
        '<div class="ps-hero" style="grid-template-columns:1fr">' +
          '<div class="ps-info">' +
            '<h2>About</h2>' +
            '<p>' + S.thesis + '</p><p>' + S.thesis2 + '</p>' +
            '<p class="lesson">' + S.fleet + '</p>' +
            '<div class="ps-actions">' +
              S.interests.map(function (i) {
                return '<span class="ps-badge" style="margin:0">' + i[0] + '</span>';
              }).join('') +
            '</div>' +
            S.interests.map(function (i) { return '<p>' + i[1] + '</p>'; }).join('') +
          '</div>' +
        '</div>';
    }

    function drawWork() {
      main.innerHTML = '<div class="ps-hero" style="grid-template-columns:1fr"><div class="ps-info">' +
        '<h2>Experience</h2>' +
        S.experience.map(function (j) {
          return '<span class="ps-badge">' + j.when + ' · ' + j.where + '</span>' +
                 '<h2 style="font-size:20px">' + j.org + '</h2>' +
                 '<p style="color:#7FC7FF">' + j.role + '</p>' +
                 j.bullets.map(function (b) { return '<p>' + md(b) + '</p>'; }).join('');
        }).join('<hr style="border:0;border-top:1px solid #24405C;margin:22px 0">') +
        '</div></div>';
    }

    function drawContact() {
      main.innerHTML = '<div class="ps-hero" style="grid-template-columns:1fr"><div class="ps-info">' +
        '<h2>Contact</h2><p>' + S.contact.line + '</p>' +
        '<div class="ps-actions">' +
          '<a class="ps-btn" href="mailto:' + S.contact.email + '">' + S.contact.email + '</a>' +
          '<a class="ps-btn ghost" href="' + S.contact.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>' +
          '<a class="ps-btn ghost" href="' + S.contact.github + '" target="_blank" rel="noopener">GitHub</a>' +
        '</div></div></div>';
    }

    function draw() {
      drawTabs();
      ({ games: drawGames, about: drawAbout, work: drawWork, contact: drawContact }[tab])();
    }

    wrap._keys = function (e) {
      if (tab !== 'games') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); sel = (sel + 1) % S.projects.length; draw(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); sel = (sel - 1 + S.projects.length) % S.projects.length; draw(); }
    };
    addEventListener('keydown', wrap._keys);
    draw();
  }

  /* ========================================================= SWITCH MODE */
  function renderSW() {
    var wrap = el('div', 'swm');
    var sel = 0, view = 'games';

    wrap.innerHTML =
      '<div class="sw-top"><div class="sw-av">J</div><div>' + S.name + ' · ' + S.role + '</div></div>' +
      '<div class="sw-body"><div class="sw-strip" id="swStrip"></div><div id="swDetail"></div></div>' +
      '<div class="sw-dock"><div class="sw-dock-in" id="swDock"></div></div>';
    stage.appendChild(wrap);

    var strip  = wrap.querySelector('#swStrip');
    var detail = wrap.querySelector('#swDetail');
    var dock   = wrap.querySelector('#swDock');
    var DOCK = [['games', 'Projects'], ['about', 'About'], ['work', 'Experience'], ['skills', 'Toolkit'], ['contact', 'Contact']];

    function drawDock() {
      clear(dock);
      DOCK.forEach(function (d) {
        var b = el('button', null, d[1]);
        b.type = 'button';
        b.setAttribute('aria-pressed', String(view === d[0]));
        b.addEventListener('click', function () { view = d[0]; draw(); });
        dock.appendChild(b);
      });
    }

    function drawStrip() {
      strip.classList.toggle('hide', view !== 'games');
      if (view !== 'games') return;
      clear(strip);
      S.projects.forEach(function (p, i) {
        var b = el('button', 'sw-tile');
        b.type = 'button';
        b.setAttribute('aria-current', String(i === sel));
        b.innerHTML = '<span class="sq"><img src="' + p.img + '" alt=""></span><span>' + p.name + '</span>';
        b.addEventListener('click', function () { sel = i; draw(); });
        strip.appendChild(b);
      });
      var cur = strip.querySelector('[aria-current="true"]');
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    function drawDetail() {
      if (view === 'games') {
        var p = S.projects[sel];
        detail.innerHTML =
          '<div class="sw-detail">' +
            '<div class="yr">' + p.status + ' · ' + p.year + '</div>' +
            '<h2>' + p.full + '</h2>' +
            (p.video ? '<video src="' + p.video + '" poster="' + p.img + '" controls playsinline preload="none" style="border-radius:10px;margin-top:16px;max-height:420px;width:auto"></video>' : '') +
            '<p>' + p.hook + '</p><p>' + p.body + '</p>' +
            '<p class="lesson">' + p.lesson + '</p>' +
            '<div class="sw-chips">' + p.parts.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
            '<div class="sw-chips" style="margin-top:14px"><a class="pl-btn primary" href="' + p.repo + '" target="_blank" rel="noopener">View code</a></div>' +
          '</div>';
      } else if (view === 'about') {
        detail.innerHTML = '<div class="sw-detail"><h2>About</h2><p>' + S.thesis + '</p><p>' + S.thesis2 +
          '</p><p class="lesson">' + S.fleet + '</p>' +
          S.interests.map(function (i) { return '<p><b>' + i[0] + '</b> — ' + i[1] + '</p>'; }).join('') + '</div>';
      } else if (view === 'work') {
        detail.innerHTML = '<div class="sw-detail"><h2>Experience</h2>' +
          S.experience.map(function (j) {
            return '<div class="yr" style="margin-top:18px">' + j.when + ' · ' + j.where + '</div>' +
                   '<h2 style="font-size:20px">' + j.org + '</h2><p style="color:#E4747E">' + j.role + '</p>' +
                   j.bullets.map(function (b) { return '<p>' + md(b) + '</p>'; }).join('');
          }).join('') + '</div>';
      } else if (view === 'skills') {
        detail.innerHTML = '<div class="sw-detail"><h2>Toolkit</h2>' +
          S.skills.map(function (s) {
            return '<div class="yr" style="margin-top:16px">' + s[0] + '</div>' +
                   '<div class="sw-chips">' + s[1].map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>';
          }).join('') + '</div>';
      } else {
        detail.innerHTML = '<div class="sw-detail"><h2>Contact</h2><p>' + S.contact.line + '</p>' +
          '<div class="sw-chips" style="margin-top:16px">' +
            '<a class="pl-btn primary" href="mailto:' + S.contact.email + '">' + S.contact.email + '</a>' +
            '<a class="pl-btn" href="' + S.contact.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>' +
            '<a class="pl-btn" href="' + S.contact.github + '" target="_blank" rel="noopener">GitHub</a>' +
          '</div></div>';
      }
    }

    function draw() { drawDock(); drawStrip(); drawDetail(); }

    wrap._keys = function (e) {
      if (view !== 'games') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); sel = (sel + 1) % S.projects.length; draw(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); sel = (sel - 1 + S.projects.length) % S.projects.length; draw(); }
    };
    addEventListener('keydown', wrap._keys);
    draw();
  }

  /* ========================================================== BORING MODE */
  function renderPlain() {
    var w = el('div', 'plm');
    w.innerHTML =
      '<h1>' + S.first.charAt(0) + S.first.slice(1).toLowerCase() + '<br>' +
        S.last.charAt(0) + S.last.slice(1).toLowerCase() + '</h1>' +
      '<p class="lede">' + S.thesis.replace('build one', '<strong>build one</strong>') + '</p>' +
      '<p class="dim">' + S.thesis2 + '</p>' +
      '<p class="aside">' + S.fleet + '</p>' +
      '<dl class="pl-status">' + S.status.map(function (r) {
        return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
      }).join('') + '</dl>' +

      '<section><h2>Experience</h2>' + S.experience.map(function (j) {
        return '<div class="pl-job"><span class="m">' + j.when + ' · ' + j.where + '</span>' +
               '<h3>' + j.org + '</h3><span class="r">' + j.role + '</span>' +
               '<ul>' + j.bullets.map(function (b) { return '<li>' + md(b) + '</li>'; }).join('') + '</ul></div>';
      }).join('') + '</section>' +

      '<section><h2>Things I\'ve built</h2><div class="pl-grid">' + S.projects.map(function (p) {
        var media = p.video
          ? '<video src="' + p.video + '" poster="' + p.img + '" controls playsinline preload="none"></video>'
          : '<img src="' + p.img + '" alt="' + p.full + '" loading="lazy">';
        return '<article class="pl-card"><div class="m">' + media + '</div><div class="b">' +
               '<h3>' + p.full + '</h3><p>' + p.hook + '</p><p>' + p.body + '</p>' +
               '<div class="pl-chips">' + p.parts.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
               '</div></article>';
      }).join('') + '</div></section>' +

      '<section><h2>Toolkit</h2><div class="pl-skills">' + S.skills.map(function (s) {
        return '<div class="pl-skill"><h3>' + s[0] + '</h3><ul>' +
               s[1].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>';
      }).join('') + '</div></section>' +

      '<section><h2>Background noise</h2><div class="pl-notes">' + S.interests.map(function (i) {
        return '<div class="pl-note"><b>' + i[0] + '</b><p>' + i[1] + '</p></div>';
      }).join('') + '</div></section>' +

      '<section><h2>Contact</h2><div class="pl-contact"><p>' + S.contact.line + '</p>' +
        '<div class="pl-links">' +
          '<a class="pl-btn primary" href="mailto:' + S.contact.email + '">Email me</a>' +
          '<a class="pl-btn" href="' + S.contact.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>' +
          '<a class="pl-btn" href="' + S.contact.github + '" target="_blank" rel="noopener">GitHub</a>' +
        '</div></div></section>' +
      '<footer>Built by hand · Waterloo, Ontario</footer>';
    stage.appendChild(w);
  }

  /* Renderers register a _keys handler on their wrapper; drop the previous
     one whenever the stage is cleared so modes don't stack listeners. */
  var _clear = clear;
  clear = function (n) {
    if (n === stage) {
      [].slice.call(n.children).forEach(function (c) {
        if (c._keys) removeEventListener('keydown', c._keys);
      });
    }
    _clear(n);
  };

  /* ================================================================ INIT */
  var saved = null;
  try { saved = localStorage.getItem('jm-mode'); } catch (e) {}

  boot(function () {
    if (saved && MODES.some(function (m) { return m.id === saved; })) setMode(saved);
    else showPicker();
  });

  document.getElementById('pickAgain').addEventListener('click', function (e) {
    e.preventDefault();
    clear(stage);
    showPicker();
  });
})();
