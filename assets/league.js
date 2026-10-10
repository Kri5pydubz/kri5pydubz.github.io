/* League table: loads assets/league.json, sorts, and re-renders the table.
   If this fails, the plain HTML rows in league.html stay on screen. */
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

  function formatDate(iso) {
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  fetch("assets/league.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("league.json"); return r.json(); })
    .then(function (data) {
      var win = data.pointsForWin != null ? num(data.pointsForWin) : 3;
      var loss = data.pointsForLoss != null ? num(data.pointsForLoss) : 0;
      var rows = (data.players || []).map(function (p) {
        var won = num(p.won), lost = num(p.lost), rw = num(p.roundsWon), rl = num(p.roundsLost);
        return {
          name: p.name, played: p.played != null ? num(p.played) : won + lost,
          won: won, lost: lost, rw: rw, rl: rl, diff: rw - rl, pts: won * win + lost * loss
        };
      });
      rows.sort(function (a, b) {
        return (b.pts - a.pts) || (b.diff - a.diff) || (b.rw - a.rw) ||
          String(a.name).localeCompare(String(b.name), "en-GB", { sensitivity: "base" });
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

      var upd = document.getElementById("league-updated");
      if (upd && data.lastUpdated) {
        upd.innerHTML = 'Last updated: <time datetime="' + esc(data.lastUpdated) + '">' +
          esc(formatDate(data.lastUpdated)) + "</time>";
      }
      var st = document.getElementById("league-status");
      if (st && data.season) st.textContent = data.season + (data.status ? " — " + data.status.toLowerCase() : "");
    })
    .catch(function () { /* keep the static fallback rows */ });
})();
