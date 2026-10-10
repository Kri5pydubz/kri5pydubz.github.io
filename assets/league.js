/* DUBZ League: reads assets/league.json, works out the standings from the
   results list, and fills in the table, recent results and spotlight.
   If anything fails, the plain HTML already in league.html stays on screen. */
(function () {
  var body = document.getElementById("league-body");
  if (!body || !window.fetch) return;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function signed(n) { return n > 0 ? "+" + n : String(n); }
  function fmtDate(iso, opts) {
    var d = new Date(String(iso) + "T12:00:00");
    if (isNaN(d)) return String(iso || "");
    return d.toLocaleDateString("en-GB", opts || { day: "numeric", month: "long", year: "numeric" });
  }
  function byName(a, b) {
    return String(a).localeCompare(String(b), "en-GB", { sensitivity: "base" });
  }

  fetch("assets/league.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("league.json"); return r.json(); })
    .then(function (data) {
      // Points = 2 per game won + 1 per round won (losses score nothing)
      var perGame = data.pointsPerGameWon != null ? num(data.pointsPerGameWon) : 2;
      var perRound = data.pointsPerRoundWon != null ? num(data.pointsPerRoundWon) : 1;
      var table = {};
      function row(name) {
        name = String(name || "").trim();
        if (!name) return null;
        if (!table[name]) table[name] = { name: name, played: 0, won: 0, lost: 0, rw: 0, rl: 0 };
        return table[name];
      }
      (data.players || []).forEach(function (p) { row(typeof p === "string" ? p : p && p.name); });

      // Results: { "date": "YYYY-MM-DD", "p1": "Lenny", "p1Rounds": 2, "p2": "Drizzy", "p2Rounds": 1 }
      var results = (data.results || []).filter(function (m) {
        return m && m.p1 && m.p2 && num(m.p1Rounds) !== num(m.p2Rounds);
      });
      results.forEach(function (m) {
        var a = row(m.p1), b = row(m.p2), ar = num(m.p1Rounds), br = num(m.p2Rounds);
        a.played++; b.played++;
        a.rw += ar; a.rl += br; b.rw += br; b.rl += ar;
        if (ar > br) { a.won++; b.lost++; } else { b.won++; a.lost++; }
      });

      var rows = Object.keys(table).map(function (k) {
        var r = table[k];
        r.diff = r.rw - r.rl; r.pts = r.won * perGame + r.rw * perRound;
        return r;
      });
      rows.sort(function (a, b) {
        return (b.pts - a.pts) || (b.diff - a.diff) || (b.rw - a.rw) || byName(a.name, b.name);
      });
      var started = rows.some(function (r) { return r.played > 0; });
      var pos = 0, prev = null;
      body.innerHTML = rows.map(function (r, i) {
        var key = r.pts + "|" + r.diff + "|" + r.rw;
        if (key !== prev) { pos = i + 1; prev = key; }
        return "<tr>" +
          '<td class="lt-pos">' + (started ? pos : "–") + "</td>" +
          '<th scope="row" class="lt-player">' + esc(r.name) + "</th>" +
          "<td>" + r.played + "</td><td>" + r.won + "</td><td>" + r.lost + "</td>" +
          "<td>" + r.rw + "</td><td>" + r.rl + "</td><td>" + signed(r.diff) + "</td>" +
          '<td class="lt-pts">' + r.pts + "</td></tr>";
      }).join("");

      // Recent results, newest first
      var feed = document.getElementById("league-results");
      if (feed && results.length) {
        var recent = results.map(function (m, i) { return { m: m, i: i }; })
          .sort(function (x, y) { return String(y.m.date || "").localeCompare(String(x.m.date || "")) || (y.i - x.i); })
          .slice(0, 10);
        feed.innerHTML = recent.map(function (x) {
          var m = x.m, ar = num(m.p1Rounds), br = num(m.p2Rounds), aWin = ar > br;
          return '<li class="result">' +
            (m.date ? '<time class="result-date" datetime="' + esc(m.date) + '">' +
              esc(fmtDate(m.date, { day: "numeric", month: "short" })) + "</time>" : "") +
            '<span class="result-line"><span class="' + (aWin ? "result-win" : "") + '">' + esc(m.p1) + "</span> " +
            '<span class="result-score">' + ar + "–" + br + "</span> " +
            '<span class="' + (aWin ? "" : "result-win") + '">' + esc(m.p2) + "</span></span>" +
            (m.note ? '<span class="result-note">' + esc(m.note) + "</span>" : "") +
            "</li>";
        }).join("");
      }

      // Spotlight
      var top = document.getElementById("spot-top");
      if (top && started && rows[0] && rows[0].pts > 0) {
        var leaders = rows.filter(function (r) {
          return r.pts === rows[0].pts && r.diff === rows[0].diff && r.rw === rows[0].rw;
        });
        top.innerHTML = '<span class="spot-name">' + leaders.map(function (r) { return esc(r.name); }).join(" &amp; ") +
          '</span><span class="spot-meta">' + rows[0].pts + " pts · " + signed(rows[0].diff) + " round difference</span>";
      }
      var imp = document.getElementById("spot-improved");
      if (imp && data.mostImproved && String(data.mostImproved).trim()) {
        imp.innerHTML = '<span class="spot-name">' + esc(String(data.mostImproved).trim()) + "</span>";
      }

      var upd = document.getElementById("league-updated");
      if (upd && data.lastUpdated) {
        upd.innerHTML = 'Last updated: <time datetime="' + esc(data.lastUpdated) + '">' + esc(fmtDate(data.lastUpdated)) + "</time>";
      }
      var st = document.getElementById("league-status");
      if (st && data.season) st.textContent = data.season + (data.status ? " — " + String(data.status).toLowerCase() : "");
    })
    .catch(function () { /* keep the static fallback */ });
})();
