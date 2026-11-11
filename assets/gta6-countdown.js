/* ==========================================================================
   TEMPORARY seasonal script — GTA 6 launch countdown
   ==========================================================================
   Safe to delete this file (and the #gta6-drop section on index.html)
   when the season ends. Does not change stream times, assets/streams.js,
   or the existing #when stream countdown.
   ========================================================================== */
(function () {
  // 19 Nov 2026, 00:00 Europe/London. The UK is on GMT then, so this is 2026-11-19T00:00:00Z.
  const TARGET_ISO = "2026-11-19T00:00:00Z";
  const TARGET = Date.parse(TARGET_ISO);
  const root = document.getElementById("gta6-countdown");
  const heading = document.getElementById("gta6-heading");
  if (!root || Number.isNaN(TARGET)) return;

  const pad = (n) => String(n).padStart(2, "0");

  function render() {
    const ms = TARGET - Date.now();
    if (ms <= 0) {
      if (heading) heading.hidden = true;
      root.innerHTML = '<p class="gta6-out">GTA 6 is out. Catch it on stream.</p>';
      return;
    }
    if (heading) heading.hidden = false;
    let seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const values = [
      ["Days", days],
      ["Hrs", hours],
      ["Mins", minutes],
      ["Secs", seconds]
    ];
    root.innerHTML =
      '<div class="gta6-clock">' +
      values
        .map(
          ([label, value]) =>
            '<div class="gta6-clock-box"><span class="gta6-clock-value">' +
            pad(value) +
            '</span><span class="gta6-clock-label">' +
            label +
            "</span></div>"
        )
        .join("") +
      "</div>";
  }

  render();
  window.setInterval(render, 1000);
})();
