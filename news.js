// Lazy YouTube: swap the thumbnail button for an iframe on tap.
document.querySelectorAll('.yt[data-id]').forEach(function (b) {
  var id = b.dataset.id;
  b.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
  b.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    f.title = b.getAttribute('aria-label') || 'YouTube video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    var w = document.createElement('div'); w.className = 'yt is-live'; w.appendChild(f);
    b.replaceWith(w);
  });
});

// X posts from news-feed.json (static file; no X widgets).
(function () {
  var box = document.getElementById('x-feed');
  if (!box) return;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fail() {
    box.innerHTML = '';
    var c = el('article', 'news-card');
    c.appendChild(el('h3', null, 'Posts unavailable right now'));
    var p = el('p'); p.innerHTML = 'Catch the latest on <a href="https://x.com/TEKKEN" target="_blank" rel="noopener">@TEKKEN on X</a>.';
    c.appendChild(p); box.appendChild(c);
  }
  fetch('news-feed.json?v=' + Date.now()).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
    var posts = (d && d.posts) || [];
    if (!posts.length) return fail();
    box.innerHTML = '';
    posts.forEach(function (p) {
      var c = el('article', 'news-card');
      var m = el('p', 'news-meta', p.name + ' ');
      m.appendChild(el('span', 'x-handle', '@' + p.handle));
      c.appendChild(m);
      c.appendChild(el('p', 'x-text', p.text));
      var dt = new Date(p.date);
      c.appendChild(el('p', 'news-meta', isNaN(dt) ? '' : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })));
      var a = el('a', 'btn btn-ghost', 'View on X');
      a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
      c.appendChild(a); box.appendChild(c);
    });
  }).catch(fail);
})();
