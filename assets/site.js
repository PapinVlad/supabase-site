/* Supabase · Group B · COMP10020 — small progressive enhancements.
   Every page works without JavaScript; this file only adds copy buttons,
   tutorial progress and the slide filter. */
(function () {
  'use strict';

  // ---------- copy buttons on code blocks ----------
  document.querySelectorAll('pre:not(.no-copy)').forEach(function (pre) {
    if (pre.closest('.sheet')) return;   // the cheat sheet is for reading and printing
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-btn';
    button.textContent = 'Copy';
    button.addEventListener('click', function () {
      var text = (pre.querySelector('code') || pre).innerText;
      var done = function () {
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = 'Copy'; }, 1500);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { button.textContent = 'Select and copy'; });
      } else {
        var range = document.createRange();
        range.selectNodeContents(pre.querySelector('code') || pre);
        var sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(range);
        try { document.execCommand('copy'); done(); } catch (e) { button.textContent = 'Press Ctrl+C'; }
      }
    });
    pre.appendChild(button);
  });

  // ---------- tutorial progress (remembered in this browser only) ----------
  var steps = document.querySelectorAll('.step[data-step]');
  if (steps.length) {
    var KEY = 'sb-groupb-tutorial-done';
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
    var bar = document.querySelector('.progress-bar span');
    var label = document.querySelector('[data-progress-label]');
    var update = function () {
      var done = 0;
      steps.forEach(function (step) { if (step.classList.contains('done')) done++; });
      if (bar) bar.style.width = Math.round(done / steps.length * 100) + '%';
      if (label) label.textContent = done + ' of ' + steps.length + ' steps done';
    };
    steps.forEach(function (step) {
      var id = step.getAttribute('data-step');
      var box = step.querySelector('.done-toggle input');
      if (!box) return;
      if (saved[id]) { box.checked = true; step.classList.add('done'); }
      box.addEventListener('change', function () {
        step.classList.toggle('done', box.checked);
        saved[id] = box.checked;
        try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* storage blocked: progress just isn't remembered */ }
        update();
      });
    });
    update();
  }

  // ---------- slides page ----------
  var list = document.getElementById('slideList');
  if (list && Array.isArray(window.SLIDES)) {
    var render = function (filter) {
      list.replaceChildren();
      window.SLIDES.forEach(function (s) {
        if (filter && filter !== 'all' && s.group !== filter) return;
        var item = document.createElement('article');
        item.className = 'slide-item';
        item.id = 'slide-' + s.n;
        var img = document.createElement('img');
        img.src = s.image; img.alt = 'Slide ' + s.n + ': ' + s.title; img.loading = 'lazy';
        img.width = 1280; img.height = 720;
        var body = document.createElement('div');
        var meta = document.createElement('div');
        meta.className = 'slide-meta';
        meta.textContent = 'Slide ' + s.n + ' · ' + s.speaker;
        var h = document.createElement('h3');
        h.textContent = s.title;
        var notes = document.createElement('p');
        notes.className = 'slide-notes' + (s.notes ? '' : ' empty');
        notes.textContent = s.notes || 'Speaker notes for this slide will be added after the presentation.';
        body.append(meta, h, notes);
        item.append(img, body);
        list.append(item);
      });
    };
    var buttons = document.querySelectorAll('.filters button');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        render(b.getAttribute('data-filter'));
      });
    });
    render('all');
  }
})();
