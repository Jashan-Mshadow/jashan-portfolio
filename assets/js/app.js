/* ===========================================================================
 * app.js — five consoles over one content model.
 *
 * content.js holds every fact exactly once. Each mode is a renderer. Adding
 * a console means writing one function, not duplicating content.
 * ========================================================================= */
(function () {
  'use strict';

  var S = window.SITE, T = window.TROPHY;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage  = document.getElementById('stage');
  var picker = document.getElementById('picker');
  var seenProjects = {};

  var el = function (t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };
  var esc = function (s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  var md  = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); };

  function clear(n) {
    if (n === stage) [].slice.call(n.children).forEach(function (c) {
      if (c._keys) removeEventListener('keydown', c._keys);
      if (c._stop) c._stop();
    });
    while (n.firstChild) n.removeChild(n.firstChild);
  }

  var MODES = [
    { id: 'gb',    label: 'Game Boy',    art: 'art-gb',    blurb: 'Split screen: the console drives, the monitor plays the footage.' },
    { id: 'tm',    label: 'Terminal',    art: 'art-tm',    blurb: 'A real shell with real commands. Type help.' },
    { id: 'sw',    label: 'Switch',      art: 'art-sw',    blurb: 'Home screen, Joy-Cons, and a working eShop.' },
    { id: 'ps',    label: 'PlayStation', art: 'art-ps',    blurb: 'Full-bleed game hub with a cover-art carousel.' },
    { id: 'plain', label: 'Boring',      art: 'art-plain', blurb: 'An ordinary website. Recruiters, start here.' }
  ];
  var current = null, visited = {};

  /* ============================================================= RESUME */
  /* Only surface a download once we know the file is really there. */
  var resumeOK = false;
  (function resumeCheck() {
    if (!S.resume || !window.fetch) return;
    fetch(S.resume, { method: 'HEAD' }).then(function (r) {
      if (!r.ok) return;
      resumeOK = true;
      document.querySelectorAll('[data-resume]').forEach(function (n) { n.hidden = false; });
    }).catch(function () {});
  })();
  /* Visibility is decided when the button renders, not once at page load --
     modes render long after the HEAD request resolves, and the old version
     left every later-rendered button stuck hidden. */
  function resumeBtn(cls) {
    return '<a class="' + cls + '" data-resume href="' + (S.resume || '#') +
           '" download' + (resumeOK ? '' : ' hidden') + '>Download resume (PDF)</a>';
  }

  /* ============================================================ TROPHIES */
  function markProject(id) {
    if (seenProjects[id]) return;
    seenProjects[id] = Date.now();
    var n = Object.keys(seenProjects).length;
    if (n >= 3) T.unlock('baremetal');
    if (n >= S.projects.length) T.unlock('complete');
    setTimeout(function () {
      // still on the same project a minute later? they're actually reading.
      if (seenProjects[id] && Date.now() - seenProjects[id] >= 59000) T.unlock('reader');
    }, 60000);
  }
  setInterval(function () {
    if (SFX.enabled() && SFX.heldMs() > 120000) T.unlock('sound');
  }, 10000);
  if (new Date().getHours() < 5) T.unlock('night');

  /* ============================================================ SYS MENU */
  var sysBtn  = document.getElementById('sysBtn');
  var sysMenu = document.getElementById('sysMenu');
  function buildSys() {
    var g = sysMenu.querySelector('.sys-grid');
    g.innerHTML = '';
    MODES.forEach(function (m) {
      var b = el('button', 'pick');
      b.type = 'button';
      b.innerHTML = '<span class="pick-art ' + m.art + '"><i></i></span>' +
        '<span class="pick-meta"><strong>' + m.label + (current === m.id ? ' ·' : '') +
        '</strong><span>' + m.blurb + '</span></span>';
      b.addEventListener('click', function () { closeSys(); setMode(m.id); });
      g.appendChild(b);
    });
  }
  function openSys()  { buildSys(); sysMenu.classList.add('open'); }
  function closeSys() { sysMenu.classList.remove('open'); }
  sysBtn.addEventListener('click', function () { SFX.swClick(); sysMenu.classList.contains('open') ? closeSys() : openSys(); });
  sysMenu.querySelector('.sys-close').addEventListener('click', closeSys);

  /* ============================================================== KONAMI */
  var KON = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var kbuf = [];
  addEventListener('keydown', function (e) {
    kbuf.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    if (kbuf.length > KON.length) kbuf.shift();
    if (kbuf.join(',') === KON.join(',')) { kbuf = []; panic(); }
    if (e.key === 'Escape') { sysMenu.classList.contains('open') ? closeSys() : openSys(); }
  });
  function panic() {
    T.unlock('konami'); SFX.panic();
    var p = document.getElementById('panic');
    p.classList.add('open');
    var out = p.querySelector('.dump');
    var lines = [
      'kernel: [  0.000000] PANIC: unexpected input on /dev/portfolio',
      'kernel: [  0.000031] CPU0: overclocked beyond tasteful limits',
      'kernel: [  0.000058] stack trace:',
      'kernel: [  0.000061]   konami_handler+0x1f/0x40',
      'kernel: [  0.000074]   nostalgia_overflow+0xb8/0x100',
      'kernel: [  0.000090]   jashan_show_off+0x2c/0x60',
      'kernel: [  0.000112] hardware: popsicle sticks, hot glue, hope',
      'kernel: [  0.000140] one (1) trophy awarded as compensation',
      'kernel: [  0.000180] system halted. you did this.'
    ];
    out.textContent = '';
    var i = 0;
    (function step() {
      if (i >= lines.length) return;
      out.textContent += lines[i++] + '\n';
      setTimeout(step, reduce ? 0 : 130);
    })();
  }
  document.getElementById('panicClose').addEventListener('click', function () {
    document.getElementById('panic').classList.remove('open');
  });

  /* ============================================================== RAMMY */
  var rmHost = null, rmTimer = null;
  function rammyMount(onClick) {
    rammyKill();
    rmHost = document.createElement('div');
    rmHost.id = 'rammy';
    rmHost.innerHTML = '<div class="bub" id="rmBub"></div>' +
      '<button class="pup" type="button" aria-label="Ask Rammy">' + RAMMY.full(64) + '</button>';
    document.body.appendChild(rmHost);
    rmHost.querySelector('.pup').addEventListener('click', function () {
      SFX.pick();
      rammySay(onClick ? onClick() : RAMMY.say('idle'));
    });
    rmTimer = setInterval(function () { rammySay(RAMMY.say('idle')); }, 26000);
    setTimeout(function () { rammySay(RAMMY.say('menu')); }, 1200);
  }
  function rammySay(txt) {
    if (!rmHost) return;
    var b = rmHost.querySelector('#rmBub');
    b.textContent = txt; b.classList.add('show');
    clearTimeout(b._t); b._t = setTimeout(function () { b.classList.remove('show'); }, 5600);
  }
  function rammyKill() {
    if (rmTimer) clearInterval(rmTimer);
    if (rmHost) rmHost.remove();
    rmHost = null; rmTimer = null;
  }
  document.querySelectorAll('.joycon').forEach(function (j) { j.classList.remove('in'); });

  /* ========================================================= MODE SWITCH */
  var pickedAt = Date.now();
  function setMode(id) {
    current = id; visited[id] = 1;
    if (Object.keys(visited).length >= MODES.length) T.unlock('wars');
    if (id === 'plain' && Date.now() - pickedAt < 3000) T.unlock('boring');
    try { localStorage.setItem('jm-mode', id); } catch (e) {}
    rammyKill();
    document.querySelectorAll('.joycon').forEach(function (j) { j.classList.remove('in'); });
    picker.classList.add('hide');
    sysBtn.classList.remove('hide');
    clear(stage);
    stage.classList.remove('hide');
    ({ gb: renderGB, ps: renderPS, sw: renderSW, tm: renderTM, plain: renderPlain }[id])();
    window.scrollTo(0, 0);
  }
  function showPicker() { rammyKill(); sysBtn.classList.add('hide'); stage.classList.add('hide'); picker.classList.remove('hide'); }

  /* =========================================================== GAME BOY */
  function renderGB() {
    var w = el('div', 'gbm');
    w.innerHTML =
      '<div class="gbm-split">' +
        '<div class="gb-side"><div class="gb-shell">' +
          '<div class="gb-cartridge" id="cart"></div>' +
          '<div class="gb-sliders">' +
            '<div class="gb-sl"><label>CONTRAST</label><input id="con" type="range" min="60" max="180" value="100"></div>' +
            '<div class="gb-sl"><label>VOLUME</label><input id="vol" type="range" min="0" max="100" value="85"></div>' +
          '</div>' +
          '<div class="gb-brand"><span>JASHAN-OS</span><span>DOT MATRIX WITH STEREO SOUND</span></div>' +
          '<div class="gb-win"><div class="gb-lcd" id="lcdBox"><div class="gb-inner" id="lcd"></div>' +
          '<div class="gb-foot" id="lcdFoot"></div></div></div>' +
          '<div class="gb-pad"><div class="dpad">' +
            '<button class="sp" tabindex="-1"></button><button data-k="up">\u25B2</button><button class="sp" tabindex="-1"></button>' +
            '<button data-k="left">\u25C0</button><button class="mid" tabindex="-1"></button><button data-k="right">\u25B6</button>' +
            '<button class="sp" tabindex="-1"></button><button data-k="down">\u25BC</button><button class="sp" tabindex="-1"></button>' +
          '</div><div class="gb-ab"><button data-k="b">B</button><button data-k="a">A</button></div></div>' +
          '<div class="gb-se"><button data-k="b">SELECT</button><button data-k="a">START</button></div>' +
        '</div>' +
        '<p class="gb-hint">Arrow keys move \u00b7 Enter selects \u00b7 Backspace goes back \u00b7 Escape swaps console</p>' +
        '<p class="gb-cart">Cartridge contacts dirty? <button id="blow" type="button">Hold to blow the dust out.</button></p></div>' +

        '<div class="gb-display">' +
          '<div class="gb-display-bar"><span class="dot"></span><span id="dispTitle">NO SIGNAL</span></div>' +
          '<div class="gb-screen-in" id="disp"><div class="gb-idle">SELECT A PROJECT ON THE CONSOLE<br>TO PLAY ITS FOOTAGE HERE</div></div>' +
          '<div class="gb-display-info" id="dispInfo"></div>' +
        '</div>' +
      '</div>';
    stage.appendChild(w);

    var lcd = w.querySelector('#lcd'), foot = w.querySelector('#lcdFoot'),
        lcdBox = w.querySelector('#lcdBox'), cart = w.querySelector('#cart'),
        disp = w.querySelector('#disp'), dispTitle = w.querySelector('#dispTitle'),
        dispInfo = w.querySelector('#dispInfo');

    /* hardware sliders, both actually wired to something */
    w.querySelector('#con').addEventListener('input', function () {
      lcdBox.style.setProperty('--lcd-con', (this.value / 100).toFixed(2));
      lcdBox.style.setProperty('--lcd-bri', (0.72 + this.value / 240).toFixed(2));
    });
    w.querySelector('#vol').addEventListener('input', function () { SFX.volume(this.value / 100); SFX.move(); });
    w.querySelector('#blow').addEventListener('click', function () {
      T.unlock('cartridge'); SFX.back();
      this.textContent = 'Somehow that worked. It never actually did.';
    });

    var MENU = [['NEW GAME','about'],['SELECT PROJECT','projects'],['MEMORY CARD','skills'],
                ['TROPHY CASE','trophies'],['TRANSMIT','contact']];
    var screen = 'menu', sel = 0, open = 0, typer = null;
    function stopType() { if (typer) { clearTimeout(typer); typer = null; } }
    w._stop = stopType;

    function type(node, text) {
      stopType();
      /* Typing is charming on a short blurb and infuriating on a long list --
         the trophy case took nine seconds before you could even scroll it. */
      if (reduce || text.length > 320) { node.textContent = text; return; }
      node.textContent = ''; var i = 0;
      (function step() {
        if (i >= text.length) { typer = null; return; }
        node.textContent += text.charAt(i++);
        typer = setTimeout(step, 11);
      })();
    }

    /* the big screen next to the console */
    function project(p) {
      dispTitle.textContent = p.full.toUpperCase();
      disp.innerHTML = p.video
        ? '<video src="' + p.video + '" poster="' + p.img + '" controls autoplay muted loop playsinline></video>'
        : '<img src="' + p.img + '" alt="' + esc(p.full) + '">';
      dispInfo.innerHTML = '<h3>' + esc(p.full) + '</h3><p>' + esc(p.hook) + '</p>' +
        '<p style="margin-top:9px">' + esc(p.lesson) + '</p>' +
        '<div class="chips">' + p.parts.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') +
        '</div><div class="chips" style="margin-top:11px"><a class="pl-btn" href="' + p.repo +
        '" target="_blank" rel="noopener">View code</a></div>';
      markProject(p.id);
      cart.classList.add('in');
      lcdBox.classList.add('gb-glitch');
      setTimeout(function () { lcdBox.classList.remove('gb-glitch'); }, 320);
      setTimeout(function () { cart.classList.remove('in'); }, 900);
    }

    function list(title, rows, hint) {
      stopType(); lcd.innerHTML = '';
      lcd.appendChild(el('h3', null, title));
      lcd.appendChild(el('div', 'rule'));
      var box = el('div'); box.style.overflowY = 'auto'; box.style.flex = '1';
      rows.forEach(function (r, i) {
        box.appendChild(el('div', 'gb-row' + (i === sel ? ' sel' : ''), (i === sel ? '\u25B6 ' : '  ') + r));
      });
      lcd.appendChild(box);
      /* Rammy, as an 8-bit sprite living on the LCD */
      var rm = el('div'); rm.style.cssText = 'display:flex;align-items:center;gap:6px;color:#0f380f;margin-top:6px';
      rm.innerHTML = RAMMY.pixel(30) + '<span style="font-size:10.5px;line-height:1.3">' + esc(RAMMY.say(screen === 'projects' ? 'projects' : 'menu')) + '</span>';
      lcd.appendChild(rm);
      foot.textContent = hint || 'A = SELECT';
      var sv = box.querySelector('.sel'); if (sv && sv.scrollIntoView) sv.scrollIntoView({ block: 'nearest' });
    }

    function page(title, lines) {
      stopType(); lcd.innerHTML = '';
      lcd.appendChild(el('h3', null, title));
      lcd.appendChild(el('div', 'rule'));
      var t = el('div', 'gb-type'); lcd.appendChild(t);
      type(t, lines.join('\n\n'));
      foot.textContent = 'B = BACK';
    }

    function draw() {
      if (screen === 'menu')          list('JASHAN-OS', MENU.map(function (m) { return m[0]; }));
      else if (screen === 'projects') list('SELECT PROJECT', S.projects.map(function (p) { return p.name.toUpperCase(); }), 'A = LOAD CART  B = BACK');
      else if (screen === 'project')  { var p = S.projects[open]; page(p.name.toUpperCase(), [p.hook, p.lesson, p.parts.join(' \u00b7 ')]); project(p); }
      else if (screen === 'about')    page('NEW GAME', [S.thesis, S.thesis2, S.fleet]);
      else if (screen === 'skills')   page('MEMORY CARD', S.skills.map(function (x) { return x[0].toUpperCase() + ':\n' + x[1].join(', '); }));
      else if (screen === 'trophies') page('TROPHY CASE', [T.count() + ' / ' + T.total() + ' UNLOCKED'].concat(
          T.all().map(function (t) { return (T.has(t.id) ? '\u2605 ' : '\u2606 ') + t.name.toUpperCase() + (T.has(t.id) ? '\n   ' + t.desc : '\n   ???'); })));
      else if (screen === 'contact')  { T.unlock('recruiter'); page('TRANSMIT', [S.contact.line, S.contact.email, 'linkedin.com/in/jashanmultani',
          'github.com/Jashan-Mshadow'].concat(resumeOK ? ['RESUME: available in BORING MODE'] : [])); }
    }

    function key(k) {
      var len = screen === 'menu' ? MENU.length : (screen === 'projects' ? S.projects.length : 0);
      if ((k === 'up' || k === 'down') && len) { sel = k === 'up' ? (sel - 1 + len) % len : (sel + 1) % len; SFX.move(); }
      if (k === 'a') {
        SFX.pick();
        if (screen === 'menu') { screen = MENU[sel][1]; sel = 0; }
        else if (screen === 'projects') { open = sel; screen = 'project'; }
        else if (screen === 'project') { open = (open + 1) % S.projects.length; }
      }
      if (k === 'b') {
        SFX.back();
        if (screen === 'project') { screen = 'projects'; sel = open; }
        else if (screen !== 'menu') { screen = 'menu'; sel = 0; }
      }
      draw();
    }
    w.querySelectorAll('[data-k]').forEach(function (bt) { bt.addEventListener('click', function () { key(bt.dataset.k); }); });
    var km = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
    w._keys = function (e) {
      if (sysMenu.classList.contains('open')) return;
      if (km[e.key]) { e.preventDefault(); key(km[e.key]); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); key('a'); }
      else if (e.key === 'Backspace') { e.preventDefault(); key('b'); }
    };
    addEventListener('keydown', w._keys);
    draw();
  }

  /* ========================================================= PLAYSTATION */
  var PS_GLOW = ['rgba(46,111,184,.55)','rgba(184,92,46,.55)','rgba(107,63,184,.55)','rgba(46,184,148,.5)',
                 'rgba(184,46,92,.5)','rgba(184,162,46,.45)','rgba(46,147,184,.5)','rgba(138,184,46,.45)','rgba(184,114,46,.5)'];
  function renderPS() {
    var w = el('div', 'ps5'), sel = 0, tab = 'games';
    w.innerHTML =
      '<div class="ps5-bg" id="bg"></div><div class="ps5-scrim"></div><div class="ps5-tint" id="tint"></div>' +
      '<div class="ps5-top"><div class="av">JM</div><div><strong>' + esc(S.name) + '</strong>' +
        '<span>' + esc(S.role) + '</span></div><div class="ps5-nav" id="nav"></div></div>' +
      '<div class="ps5-hub" id="hub"></div><div id="pane"></div>';
    stage.appendChild(w);
    var bg = w.querySelector('#bg'), tint = w.querySelector('#tint'),
        nav = w.querySelector('#nav'), hub = w.querySelector('#hub'), pane = w.querySelector('#pane');
    var TABS = [['games','Games'],['about','About'],['work','Experience'],['trophy','Trophies'],['contact','Party']];

    /* cross-fade the full-bleed background between projects */
    function setBg(p, i) {
      var next = p.video ? document.createElement('video') : document.createElement('img');
      if (p.video) { next.src = p.video; next.poster = p.img; next.muted = true; next.loop = true;
                     next.autoplay = true; next.playsInline = true; next.play().catch(function () {}); }
      else next.src = p.img;
      bg.appendChild(next);
      requestAnimationFrame(function () { next.classList.add('on'); });
      setTimeout(function () {
        [].slice.call(bg.children).forEach(function (c) { if (c !== next) c.remove(); });
      }, 480);
      tint.style.background = PS_GLOW[i % PS_GLOW.length];
    }

    function drawNav() {
      nav.innerHTML = '';
      TABS.forEach(function (t) {
        var b = el('button', null, t[1]); b.type = 'button';
        b.setAttribute('aria-pressed', String(tab === t[0]));
        b.addEventListener('click', function () { SFX.psMove(); tab = t[0]; draw(); });
        nav.appendChild(b);
      });
    }

    function games() {
      pane.innerHTML = ''; hub.style.display = '';
      var p = S.projects[sel];
      setBg(p, sel); markProject(p.id);
      hub.innerHTML =
        '<div class="ps5-meta"><p class="kick">' + esc(p.status) + ' &middot; ' + esc(p.year) + '</p>' +
        '<h2>' + esc(p.full) + '</h2><p>' + esc(p.hook) + '</p>' +
        '<dl class="ps5-specs">' +
          '<div><dt>Hardware</dt><dd>' + esc(p.parts[0]) + '</dd></div>' +
          '<div><dt>Stack</dt><dd>' + esc(p.parts.slice(1, 3).join(', ') || p.parts[0]) + '</dd></div>' +
          '<div><dt>Year</dt><dd>' + esc(p.year) + '</dd></div>' +
          '<div><dt>Source</dt><dd>Public</dd></div>' +
        '</dl></div>' +
        '<div class="ps5-rail" id="rail"></div>' +
        '<div class="ps5-hints">' +
          '<span><b>\u2715</b>Launch demo</span><span><b>\u25A1</b>View source</span>' +
          '<span><b>\u25B3</b>Details</span><span>\u2190 \u2192 browse</span></div>';
      var rail = hub.querySelector('#rail');
      S.projects.forEach(function (q, i) {
        var b = el('button', 'ps5-card'); b.type = 'button';
        b.setAttribute('aria-current', String(i === sel));
        b.innerHTML = '<img src="' + q.img + '" alt=""><b>' + esc(q.name) + '</b>';
        b.addEventListener('click', function () { SFX.psMove(); sel = i; draw(); });
        rail.appendChild(b);
      });
      var cur = rail.querySelector('[aria-current="true"]');
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    function panel(title, html) {
      hub.style.display = 'none';
      pane.innerHTML = '<div class="ps5-pane"><h2>' + title + '</h2>' + html + '</div>';
    }

    function draw() {
      drawNav();
      if (tab === 'games') games();
      else if (tab === 'trophy') panel('Trophies', '<p>' + T.count() + ' of ' + T.total() +
        ' unlocked. Some are hiding in other consoles.</p><div class="ps-trophies">' +
        T.all().map(function (t) {
          var h = T.has(t.id);
          return '<div class="ps-tr' + (h ? '' : ' locked') + '"><span class="ico">' + t.icon +
                 '</span><span><b>' + esc(h ? t.name : '???') + '</b><small>' + esc(h ? t.desc : 'Locked.') + '</small></span></div>';
        }).join('') + '</div>');
      else if (tab === 'about') panel('About', '<p>' + esc(S.thesis) + '</p><p>' + esc(S.thesis2) + '</p><p>' + esc(S.fleet) + '</p>' +
        S.interests.map(function (i) { return '<p><b>' + esc(i[0]) + '</b> \u2014 ' + esc(i[1]) + '</p>'; }).join(''));
      else if (tab === 'work') panel('Experience', S.experience.map(function (j) {
        return '<p class="kick" style="color:#8FC7FF;font-family:var(--mono);font-size:11px;letter-spacing:.15em">' +
               esc(j.when) + ' \u00b7 ' + esc(j.where) + '</p><h2 style="font-size:21px">' + esc(j.org) + '</h2>' +
               '<p style="color:#8FC7FF">' + esc(j.role) + '</p>' +
               j.bullets.map(function (x) { return '<p>' + md(x) + '</p>'; }).join('');
      }).join('<hr style="border:0;border-top:1px solid rgba(255,255,255,.12);margin:24px 0">'));
      else { T.unlock('recruiter'); panel('Party', '<p>' + esc(S.contact.line) + '</p><div class="ps-actions">' +
        '<a class="ps-btn" href="mailto:' + S.contact.email + '">' + S.contact.email + '</a>' +
        '<a class="ps-btn ghost" href="' + S.contact.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>' +
        '<a class="ps-btn ghost" href="' + S.contact.github + '" target="_blank" rel="noopener">GitHub</a>' +
        resumeBtn('ps-btn ghost') + '</div>'); }
    }

    w._keys = function (e) {
      if (sysMenu.classList.contains('open')) return;
      if (tab !== 'games') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); SFX.psMove(); sel = (sel + 1) % S.projects.length; draw(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); SFX.psMove(); sel = (sel - 1 + S.projects.length) % S.projects.length; draw(); }
      if (e.key === 'Enter')      { var v = bg.querySelector('video'); if (v) { v.muted = !v.muted; } }
      if (e.key.toLowerCase() === 's') window.open(S.projects[sel].repo, '_blank', 'noopener');
    };
    addEventListener('keydown', w._keys);
    SFX.psBoot(); draw();
    rammyMount(function () { return tab === 'games' ? RAMMY.forProject(S.projects[sel]) : RAMMY.say('idle'); });
  }

  /* ============================================================== SWITCH */
  var AVATARS = [['RAMMY','Rammy'],['🚀','Astronaut'],['⚡','Voltage'],['🐉','Dragon']];
  function renderSW() {
    var w = el('div', 'swm'), sel = 0, view = 'games', me = null, docked = false;
    stage.appendChild(w);

    function profiles() {
      w.innerHTML = '<div class="sw-profiles"><div><h2>Who\'s playing?</h2><div class="sw-plist" id="pl"></div></div></div>';
      var pl = w.querySelector('#pl');
      AVATARS.forEach(function (a, i) {
        var b = el('button', 'sw-p'); b.type = 'button';
        var face = a[0] === 'RAMMY' ? RAMMY.full(58) : a[0];
        b.innerHTML = '<span class="av" style="background:' + ['#1D6E52','#00A0E9','#F5B700','#7B2FF7'][i] + '">' + face + '</span><span>' + a[1] + '</span>';
        b.addEventListener('click', function () {
          SFX.swBoot(); me = a; home();
          document.querySelectorAll('.joycon').forEach(function (j, k) {
            setTimeout(function () { j.classList.add('in'); SFX.swClick(); }, 90 + k * 130);
          });
          rammyMount(function () { return view === 'games' ? RAMMY.forProject(S.projects[sel]) : RAMMY.say('idle'); });
        });
        pl.appendChild(b);
      });
    }

    function home() {
      w.innerHTML =
        '<div class="sw-top"><div class="sw-av">' + (me[0] === 'RAMMY' ? RAMMY.full(26) : me[0]) + '</div>' +
        '<div>' + esc(S.name) + ' · ' + esc(S.role) + '</div>' +
        '<div class="sw-mode-toggle"><button type="button" data-dock="0" aria-pressed="true">Handheld</button>' +
        '<button type="button" data-dock="1" aria-pressed="false">Docked</button></div>' +
        '<div class="sw-status"><span>' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) +
        '</span><span class="sw-batt"><i></i></span></div></div>' +
        '<div class="sw-body"><div class="sw-strip" id="strip"></div><div id="det"></div></div>' +
        '<div class="sw-dock"><div class="sw-dock-in" id="dock"></div></div>';
      draw();
    }

    var DOCK = [['games','🎮 Projects'],['work','🔴 News'],['skills','⚪ eShop'],['album','🔵 Album'],['settings','⚙️ Settings']];
    function draw() {
      var dock = w.querySelector('#dock'), strip = w.querySelector('#strip'), det = w.querySelector('#det');
      dock.innerHTML = '';
      DOCK.forEach(function (d) {
        var b = el('button', null, d[1]); b.type = 'button';
        b.setAttribute('aria-pressed', String(view === d[0]));
        b.addEventListener('click', function () { SFX.swClick(); view = d[0]; draw(); });
        dock.appendChild(b);
      });
      strip.classList.toggle('hide', view !== 'games');
      strip.classList.toggle('docked', !!docked);
      w.querySelectorAll('[data-dock]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(!!docked === (btn.dataset.dock === '1')));
        btn.onclick = function () { SFX.swClick(); docked = btn.dataset.dock === '1'; draw(); };
      });
      if (view === 'games') {
        strip.innerHTML = '';
        strip.classList.add('sw-home-grid');
        S.projects.forEach(function (p, i) {
          var b = el('button', 'sw-tile'); b.type = 'button';
          b.setAttribute('aria-current', String(i === sel));
          var stars = '\u2605'.repeat(4 + (i % 2)) + '\u2606'.repeat(1 - (i % 2));
          b.innerHTML = '<span class="sq"><img src="' + p.img + '" alt=""></span><span>' + esc(p.name) + '</span>' +
            '<span class="sw-stars">' + stars + '</span>' +
            '<span class="sw-price' + (p.repo ? ' os' : '') + '">' + (p.repo ? 'OPEN SOURCE' : 'FREE') + '</span>';
          b.addEventListener('click', function () { SFX.swClick(); sel = i; draw(); });
          strip.appendChild(b);
        });
        var c = strip.querySelector('[aria-current="true"]'); if (c && c.scrollIntoView) c.scrollIntoView({ block:'nearest', inline:'center' });
        var p = S.projects[sel]; markProject(p.id);
        det.innerHTML = '<div class="sw-detail"><div class="yr">' + esc(p.status) + ' · ' + esc(p.year) + '</div><h2>' + esc(p.full) + '</h2>' +
          (p.video ? '<video src="' + p.video + '" poster="' + p.img + '" controls playsinline preload="metadata" style="border-radius:10px;margin-top:16px;max-height:400px;width:auto"></video>' : '') +
          '<p>' + esc(p.hook) + '</p><p>' + esc(p.body) + '</p><p class="lesson">' + esc(p.lesson) + '</p>' +
          '<div class="sw-chips">' + p.parts.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
          '<div class="sw-chips" style="margin-top:14px"><a class="pl-btn primary" href="' + p.repo + '" target="_blank" rel="noopener">View code</a></div></div>';
      } else if (view === 'work') {
        det.innerHTML = '<div class="sw-detail"><h2>News</h2>' + S.experience.map(function (j) {
          return '<div class="yr" style="margin-top:18px">' + esc(j.when) + ' · ' + esc(j.where) + '</div><h2 style="font-size:20px">' + esc(j.org) +
                 '</h2><p style="color:#E4747E">' + esc(j.role) + '</p>' + j.bullets.map(function (b) { return '<p>' + md(b) + '</p>'; }).join('');
        }).join('') + '</div>';
      } else if (view === 'skills') {
        var PACKS = [
          ['Embedded Systems Pack', 'linear-gradient(135deg,#00A0E9,#0063A8)', 5.0, '48 KB', 'C++, C', 0,
           'Arduino, sensor integration, motor control, circuits and soldering.', 'https://github.com/Jashan-Mshadow/line-following-robot'],
          ['Robotics Control Suite', 'linear-gradient(135deg,#E4000F,#A00009)', 4.5, '36 KB', 'C++', 1,
           'Differential drive, claw sequencing and the timing fixes that stopped it dropping boxes.', 'https://github.com/Jashan-Mshadow/ontarioskills-robot'],
          ['Software & Data Bundle', 'linear-gradient(135deg,#7B2FF7,#4A17A8)', 4.5, '2.1 MB', 'Python, TS', 2,
           'React, Pandas, NumPy, Git, and multi-agent system design.', 'https://github.com/Jashan-Mshadow'],
          ['Fabrication Toolkit', 'linear-gradient(135deg,#FF6000,#C43F00)', 5.0, '14 MB', 'CAD, G-code', 3,
           'SolidWorks, CNC milling, V-Carve, metal lathe and 3D printing.', 'https://github.com/Jashan-Mshadow/workshop']
        ];
        det.innerHTML = '<div class="esh"><div class="esh-hero"><h2>Nintendo eShop</h2>' +
          '<p>Everything here is free, open source, and comes with no downloadable content whatsoever.</p></div>' +
          '<div class="esh-grid">' + PACKS.map(function (k) {
            var full = Math.floor(k[2]), half = k[2] % 1 >= 0.5;
            var stars = '\u2605'.repeat(full) + (half ? '\u00bd' : '') + '\u2606'.repeat(5 - full - (half ? 1 : 0));
            return '<div class="esh-card"><div class="esh-banner" style="background:' + k[1] + '">' + esc(k[0]) + '</div>' +
              '<div class="esh-body"><span class="esh-badge">OPEN SOURCE</span>' +
              '<h3>' + esc(k[0]) + '</h3>' +
              '<span class="esh-stars">' + stars + '<small>' + k[2].toFixed(1) + ' / 5</small></span>' +
              '<p style="margin:0;font-size:13px;color:#B4B4B4">' + esc(k[6]) + '</p>' +
              '<div class="esh-meta">File size: ' + k[3] + ' &nbsp;\u00b7&nbsp; Languages: ' + k[4] + '</div>' +
              '<div class="esh-tags">' + (S.skills[k[5]] ? S.skills[k[5]][1].map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') : '') + '</div>' +
              '<a class="esh-dl" href="' + k[7] + '" target="_blank" rel="noopener">FREE DOWNLOAD</a>' +
              '</div></div>';
          }).join('') + '</div></div>';
      } else if (view === 'album') {
        det.innerHTML = '<div class="sw-detail"><h2>Album</h2><div class="sw-chips" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px">' +
          S.projects.map(function (p) { return '<img src="' + p.img + '" alt="' + esc(p.name) + '" style="width:100%;border-radius:10px" loading="lazy">'; }).join('') + '</div></div>';
      } else {
        T.unlock('recruiter');
        det.innerHTML = '<div class="sw-detail"><h2>Settings</h2><p>' + esc(S.contact.line) + '</p>' +
          '<div class="sw-chips" style="margin-top:16px">' +
          '<a class="pl-btn primary" href="mailto:' + S.contact.email + '">' + S.contact.email + '</a>' +
          '<a class="pl-btn" href="' + S.contact.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>' +
          '<a class="pl-btn" href="' + S.contact.github + '" target="_blank" rel="noopener">GitHub</a>' +
          resumeBtn('pl-btn primary') +
          '<button class="pl-btn" id="toBoring" type="button">Switch to Boring Mode</button></div>' +
          '<p style="margin-top:18px;color:#8A8A8A;font-size:13px">Trophies: ' + T.count() + ' / ' + T.total() + '</p></div>';
        var tb = det.querySelector('#toBoring'); if (tb) tb.addEventListener('click', function () { setMode('plain'); });
      }
    }
    w._keys = function (e) {
      if (view !== 'games' || !me || sysMenu.classList.contains('open')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); SFX.swClick(); sel = (sel + 1) % S.projects.length; draw(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); SFX.swClick(); sel = (sel - 1 + S.projects.length) % S.projects.length; draw(); }
    };
    addEventListener('keydown', w._keys);
    profiles();
  }

  /* ============================================================ TERMINAL */
  function renderTM() {
    var w = el('div', 'tmm'), ran = 0;
    w.innerHTML = '<div class="crt"><div class="crt-out" id="out"></div>' +
      '<div class="crt-line"><span>jashan@waterloo:~$</span><input id="in" autocomplete="off" spellcheck="false" aria-label="Terminal input"></div>' +
      '<div class="crt-tags" id="tags"></div></div>';
    stage.appendChild(w);
    var out = w.querySelector('#out'), inp = w.querySelector('#in'), tags = w.querySelector('#tags');

    function w_(t, cls) { var d = el('div', cls); d.textContent = t; out.appendChild(d); out.scrollTop = out.scrollHeight; }
    function boot() {
      var lines = RAMMY.ascii.split('\n').concat(['', 'JashanOS v2.6.0 (armv7e-m)','', 'RAM test 640K ......... OK',
        'Flash  512K ......... OK','UART0 baud 115200 .... OK','Peripherals .......... OK','',
        'Type `help` for commands.','']);
      var i = 0;
      (function step() {
        if (i >= lines.length) return;
        w_(lines[i++], 'c2');
        setTimeout(step, reduce ? 0 : 90);
      })();
    }

    var CMDS = {
      help: function () {
        w_('Available commands:', 'c2');
        [['cat about.txt','who I am'],['ls /projects','list every build'],
         ['cat /projects/<name>','open one — try `cat /projects/line`'],
         ['whoami','short version'],['uptime','how long I have been at this'],
         ['neofetch','system info'],['trophies','achievement status'],
         ['ping contact','how to reach me'],['resume','download the PDF'],['clear','wipe the screen']]
        .forEach(function (c) { w_('  ' + c[0].padEnd(26) + c[1]); });
      },
      whoami: function () { w_(S.name + ' — ' + S.role); w_(S.blurb, 'c2'); },
      uptime: function () { w_('1A Computer Engineering, University of Waterloo. Building things since roughly age 12.'); },
      neofetch: function () {
        w_('       .--.        jashan@waterloo', 'c2');
        w_('      |o_o |       ---------------', 'c2');
        w_('      |:_/ |       OS: JashanOS v2.6.0', 'c2');
        w_('     //   \\ \\      Shell: bash (pretend)', 'c2');
        w_('    (|     | )     Focus: firmware, embedded', 'c2');
        w_('   /\'\\_   _/`\\     Projects: ' + S.projects.length, 'c2');
        w_('   \\___)=(___/     Seeking: Summer 2027 co-op', 'c2');
      },
      trophies: function () {
        w_(T.count() + ' / ' + T.total() + ' unlocked');
        T.all().forEach(function (t) { w_((T.has(t.id) ? '  [x] ' : '  [ ] ') + (T.has(t.id) ? t.name : '???')); });
      },
      clear: function () { out.innerHTML = ''; },
      resume: function () {
        if (!resumeOK) { w_('resume: not published here yet \u2014 email for a copy.', 'err'); return; }
        w_('Fetching resume.pdf ...', 'c2');
        w_('  1 page \u00b7 Computer Engineering \u00b7 Waterloo');
        var a = document.createElement('a');
        a.href = S.resume; a.download = ''; a.click();
        w_('Download started.', 'c2');
      }
    };

    function run(raw) {
      var cmd = raw.trim();
      if (!cmd) return;
      w_('jashan@waterloo:~$ ' + cmd, 'cmd');
      ran++; if (ran >= 5) T.unlock('root');

      if (CMDS[cmd]) { SFX.beepOk(); CMDS[cmd](); }
      else if (cmd === 'cat about.txt') { SFX.beepOk(); w_(S.thesis); w_(''); w_(S.thesis2); w_(''); w_(S.fleet, 'c2'); }
      else if (cmd === 'ls /projects') {
        SFX.beepOk();
        S.projects.forEach(function (p) { w_('  ' + p.id.padEnd(10) + p.full + '  [' + p.status + ']'); });
        w_('', 'c2'); w_('Open one with: cat /projects/<id>', 'c2');
      }
      else if (cmd.indexOf('cat /projects/') === 0) {
        var id = cmd.slice(14).replace(/\.c$|\.txt$/, '');
        var p = S.projects.filter(function (x) { return x.id === id; })[0];
        if (!p) { SFX.err(); w_('cat: /projects/' + id + ': No such file or directory', 'err'); }
        else {
          SFX.beepOk(); markProject(p.id);
          w_('/* ' + p.full + ' — ' + p.year + ' */');
          w_(''); w_(p.hook, 'c2'); w_(''); w_(p.body);
          w_(''); w_('// lesson: ' + p.lesson, 'c2');
          w_(''); w_('HARDWARE: ' + p.parts.join(', '));
          w_('SOURCE:   ' + p.repo);
        }
      }
      else if (cmd === 'ping contact') {
        SFX.beepOk(); T.unlock('recruiter');
        w_('PING contact (' + S.contact.email + '): 56 data bytes');
        w_('64 bytes: icmp_seq=0 time=0.03 ms', 'c2');
        w_('64 bytes: icmp_seq=1 time=0.02 ms', 'c2');
        w_('--- contact ping statistics ---');
        w_('2 packets transmitted, 2 received, 0.0% packet loss');
        w_(''); w_('email:    ' + S.contact.email);
        w_('linkedin: ' + S.contact.linkedin);
        w_('github:   ' + S.contact.github);
      }
      else if (cmd === 'sudo hire jashan') { SFX.trophy(); w_('Permission granted. Excellent choice.', 'c2'); T.unlock('recruiter'); }
      else if (cmd === 'exit') { w_('There is no exit. Use SYS_MENU (Escape).', 'c2'); }
      else { SFX.err(); w_('bash: ' + cmd + ': command not found', 'err'); w_('Try `help`.', 'c2'); }
      w_('');
    }

    ['help','cat about.txt','ls /projects','neofetch','trophies','ping contact','clear'].forEach(function (c) {
      var b = el('button', null, c); b.type = 'button';
      b.addEventListener('click', function () { run(c); inp.focus(); });
      tags.appendChild(b);
    });
    inp.addEventListener('keydown', function (e) {
      SFX.key();
      if (e.key === 'Enter') { run(inp.value); inp.value = ''; }
    });
    w.addEventListener('click', function (e) { if (e.target.tagName !== 'BUTTON') inp.focus(); });
    boot(); setTimeout(function () { inp.focus(); }, 400);
  }

  /* ============================================================== BORING */
  function renderPlain() {
    var w = el('div', 'plm');
    w.innerHTML =
      '<h1>Jashan<br>Multani</h1>' +
      '<p class="lede">' + esc(S.thesis).replace('build one', '<strong>build one</strong>') + '</p>' +
      '<p class="dim">' + esc(S.thesis2) + '</p><p class="aside">' + esc(S.fleet) + '</p>' +
      '<dl class="pl-status">' + S.status.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<section><h2>Experience</h2>' + S.experience.map(function (j) {
        return '<div class="pl-job"><span class="m">' + esc(j.when) + ' · ' + esc(j.where) + '</span><h3>' + esc(j.org) +
               '</h3><span class="r">' + esc(j.role) + '</span><ul>' + j.bullets.map(function (b) { return '<li>' + md(b) + '</li>'; }).join('') + '</ul></div>';
      }).join('') + '</section>' +
      '<section><h2>Things I\'ve built</h2><div class="pl-grid">' + S.projects.map(function (p) {
        return '<article class="pl-card"><div class="m">' +
          (p.video ? '<video src="' + p.video + '" poster="' + p.img + '" controls playsinline preload="none"></video>'
                   : '<img src="' + p.img + '" alt="' + esc(p.full) + '" loading="lazy">') +
          '</div><div class="b"><h3>' + esc(p.full) + '</h3><p>' + esc(p.hook) + '</p><p>' + esc(p.body) + '</p>' +
          '<div class="pl-chips">' + p.parts.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
          '<div class="pl-chips"><a class="pl-btn" href="' + p.repo + '" target="_blank" rel="noopener">View code</a></div></div></article>';
      }).join('') + '</div></section>' +
      '<section><h2>Toolkit</h2><div class="pl-skills">' + S.skills.map(function (s) {
        return '<div class="pl-skill"><h3>' + esc(s[0]) + '</h3><ul>' + s[1].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
      }).join('') + '</div></section>' +
      '<section><h2>Background noise</h2><div class="pl-notes">' + S.interests.map(function (i) {
        return '<div class="pl-note"><b>' + esc(i[0]) + '</b><p>' + esc(i[1]) + '</p></div>';
      }).join('') + '</div></section>' +
      '<section><h2>Contact</h2><div class="pl-contact"><p>' + esc(S.contact.line) + '</p><div class="pl-links">' +
        '<a class="pl-btn primary" href="mailto:' + S.contact.email + '">Email me</a>' +
        resumeBtn('pl-btn') +
        '<a class="pl-btn" href="' + S.contact.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>' +
        '<a class="pl-btn" href="' + S.contact.github + '" target="_blank" rel="noopener">GitHub</a>' +
      '</div></div></section><footer>Built by hand · Waterloo, Ontario</footer>';
    stage.appendChild(w);

    /* Trophies must be earned, not handed over on render. Cards count only
       once they've actually been scrolled into view. */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var i = [].indexOf.call(e.target.parentNode.children, e.target);
          if (S.projects[i]) markProject(S.projects[i].id);
          io.unobserve(e.target);
        });
      }, { threshold: 0.55 });
      w.querySelectorAll('.pl-card').forEach(function (c) { io.observe(c); });
      var contact = w.querySelector('.pl-contact');
      if (contact) {
        var io2 = new IntersectionObserver(function (es) {
          if (es[0].isIntersecting) { T.unlock('recruiter'); io2.disconnect(); }
        }, { threshold: 0.5 });
        io2.observe(contact);
      }
    }
  }

  /* ================================================================ BOOT */
  function boot(done) {
    var b = document.getElementById('boot');
    if (reduce) { b.remove(); done(); return; }
    var logo = b.querySelector('.boot-logo'), sub = b.querySelector('.boot-sub'), fired = false;
    function finish() {
      if (fired) return; fired = true;
      T.unlock('power');
      b.classList.add('out');
      setTimeout(function () { b.remove(); done(); }, 520);
    }
    /* Browsers refuse to play audio before a user gesture, so the boot waits
       for one. That is also what PRESS START always meant. */
    function start() { SFX.enable(true); SFX.gbBoot(); setTimeout(finish, 620); }
    b.querySelector('.boot-skip').addEventListener('click', function (e) { e.stopPropagation(); finish(); });
    addEventListener('keydown', function k() { removeEventListener('keydown', k); start(); }, { once: true });
    b.addEventListener('click', start);

    logo.style.transition = 'transform 1.2s cubic-bezier(.33,0,.2,1)';
    requestAnimationFrame(function () { logo.style.transform = 'translateY(0)'; });
    setTimeout(function () {
      logo.style.transition = 'transform .16s ease';
      logo.style.transform = 'translateY(-7px)';
      setTimeout(function () { logo.style.transform = 'translateY(0)'; }, 160);
      sub.style.transition = 'opacity .4s ease'; sub.style.opacity = '1';
    }, 1220);
    /* No auto-advance: without a press there is no sound, and the chime is
       half the point. The Skip link is there for anyone who disagrees. */
    setTimeout(function () { sub.classList.add('nudge'); }, 5000);
  }

  /* ================================================================ INIT */
  picker.querySelectorAll('[data-mode]').forEach(function (b) {
    b.addEventListener('click', function () { SFX.enable(true); SFX.pick(); setMode(b.dataset.mode); });
  });
  document.getElementById('pickAgain').addEventListener('click', function (e) {
    e.preventDefault(); clear(stage); showPicker();
  });

  /* Always land on the picker. Remembering the last console meant returning
     visitors never saw the choice, which is the best part of the site. */
  boot(function () { pickedAt = Date.now(); showPicker(); });
})();
