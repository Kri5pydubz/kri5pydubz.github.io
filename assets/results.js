/* DUBZ Results: reads assets/league.json (same file as the League table)
   and lists every result, newest first, grouped by date.
   If anything fails, the plain empty-state message in results.html stays. */
(function () {
  var list = document.getElementById("history-list");
  if (!list || !window.fetch) return;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function fmtDate(iso) {
    var d = new Date(String(iso) + "T12:00:00");
    if (isNaN(d)) return String(iso || "Date TBC");
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function byName(a, b) {
    return String(a).localeCompare(String(b), "en-GB", { sensitivity: "base" });
  }

  var emptyHTML = list.innerHTML;

  fetch("assets/league.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("league.json"); return r.json(); })
    .then(function (data) {
      var results = (data.results || [])
        .filter(function (m) { return m && m.p1 && m.p2 && num(m.p1Rounds) !== num(m.p2Rounds); })
        .map(function (m, i) { return { m: m, i: i }; })
        .sort(function (x, y) {
          return String(y.m.date || "").localeCompare(String(x.m.date || "")) || (y.i - x.i);
        });
      if (!results.length) return; // keep the empty state

      var names = {};
      results.forEach(function (x) {
        names[String(x.m.p1).trim()] = 1; names[String(x.m.p2).trim()] = 1;
      });
      var sel = document.getElementById("history-player");
      var filterBox = document.getElementById("history-filter");
      var count = document.getElementById("history-count");
      Object.keys(names).sort(byName).forEach(function (n) {
        var o = document.createElement("option"); o.value = n; o.textContent = n; sel.appendChild(o);
      });

      function render() {
        var who = sel.value;
        var shown = results.filter(function (x) {
          return !who || String(x.m.p1).trim() === who || String(x.m.p2).trim() === who;
        });
        count.textContent = shown.length + (shown.length === 1 ? " match" : " matches") +
          (who ? " involving " + who : " played");
        if (!shown.length) { list.innerHTML = emptyHTML; return; }

        var groups = [], cur = null;
        shown.forEach(function (x) {
          var key = String(x.m.date || "");
          if (!cur || cur.key !== key) { cur = { key: key, items: [] }; groups.push(cur); }
          cur.items.push(x.m);
        });

        list.innerHTML = groups.map(function (g, gi) {
          var id = "day-" + gi;
          return '<section class="history-day" aria-labelledby="' + id + '">' +
            '<h3 id="' + id + '">' + (g.key ? '<time datetime="' + esc(g.key) + '">' + esc(fmtDate(g.key)) + "</time>" : "Date TBC") + "</h3>" +
            '<ul class="results-feed history-feed">' +
            g.items.map(function (m) {
              var ar = num(m.p1Rounds), br = num(m.p2Rounds), aWin = ar > br;
              var winner = aWin ? m.p1 : m.p2;
              return '<li class="result history-match">' +
                '<span class="result-line">' +
                  '<span class="' + (aWin ? "result-win" : "") + '">' + esc(m.p1) + "</span> " +
                  '<span class="result-score" aria-label="' + ar + " rounds to " + br + '">' + ar + "–" + br + "</span> " +
                  '<span class="' + (aWin ? "" : "result-win") + '">' + esc(m.p2) + "</span>" +
                "</span>" +
                '<span class="history-outcome">' + esc(winner) + " wins</span>" +
                (m.note ? '<span class="result-note">' + esc(m.note) + "</span>" : "") +
                "</li>";
            }).join("") +
            "</ul></section>";
        }).join("");
      }

      sel.addEventListener("change", render);
      filterBox.hidden = false;
      render();
    })
    .catch(function () { /* keep the static fallback */ });
})();
