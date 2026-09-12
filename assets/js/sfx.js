/* ===========================================================================
 * sfx.js — all sound is synthesised with the Web Audio API. No audio files,
 * nothing to download, and every console gets its own voice.
 * Audio stays silent until the first user gesture, per browser policy.
 * ========================================================================= */
window.SFX = (function () {
  var ctx = null, on = true, started = 0;

  function ac() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      started = Date.now();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, delay) {
    if (!on) return;
    var c = ac(); if (!c) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol == null ? 0.06 : vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function sweep(f1, f2, dur, type, vol) {
    if (!on) return;
    var c = ac(); if (!c) return;
    var t = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol == null ? 0.08 : vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  return {
    enable:  function (v) { on = v; if (v) ac(); },
    enabled: function () { return on; },
    heldMs:  function () { return started ? Date.now() - started : 0; },

    /* Game Boy */
    move:  function () { tone(560, 0.05, 'square', 0.035); },
    pick:  function () { tone(880, 0.06, 'square', 0.05); tone(1180, 0.08, 'square', 0.04, 0.05); },
    back:  function () { tone(320, 0.08, 'square', 0.04); },
    gbBoot: function () {            // the falling-logo "ding"
      tone(523, 0.10, 'square', 0.05);
      tone(1046, 0.55, 'square', 0.06, 0.10);
    },

    /* PS5 — deep, smooth */
    psBoot: function () { sweep(60, 420, 1.5, 'sine', 0.12); sweep(220, 880, 1.1, 'triangle', 0.03); },
    psMove: function () { tone(720, 0.05, 'sine', 0.05); },

    /* Switch — bright click */
    swClick: function () { tone(1400, 0.035, 'triangle', 0.06); tone(2100, 0.05, 'triangle', 0.035, 0.03); },
    swBoot:  function () { tone(880, 0.07, 'triangle', 0.06); tone(1320, 0.12, 'triangle', 0.06, 0.09); },

    /* Terminal */
    key:   function () { tone(1100 + Math.random() * 350, 0.018, 'square', 0.02); },
    beepOk:function () { tone(1200, 0.07, 'square', 0.04); },
    err:   function () { tone(160, 0.22, 'sawtooth', 0.05); },

    /* Global */
    trophy: function () {
      [784, 988, 1319].forEach(function (f, i) { tone(f, 0.16, 'triangle', 0.055, i * 0.085); });
    },
    panic: function () { sweep(900, 70, 1.1, 'sawtooth', 0.09); }
  };
})();
