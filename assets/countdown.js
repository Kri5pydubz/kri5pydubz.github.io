(function () {
  const root = document.getElementById("stream-countdown");
  function weeklyStarts(rule, count) {
    if (!rule) return [];
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: rule.timeZone, year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", weekday: "short", hourCycle: "h23"
    });
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const out = [];
    const base = new Date(); base.setUTCHours(12, 0, 0, 0);
    for (let d = -7; d < 7 * count + 7 && out.length < count + 2; d++) {
      const noon = new Date(base.getTime() + d * 86400000);
      const p = Object.fromEntries(parts.formatToParts(noon).map((x) => [x.type, x.value]));
      if (days.indexOf(p.weekday) !== rule.weekday) continue;
      let guess = Date.UTC(+p.year, +p.month - 1, +p.day, rule.hour, rule.minute);
      for (let i = 0; i < 2; i++) {
        const q = Object.fromEntries(parts.formatToParts(new Date(guess)).map((x) => [x.type, x.value]));
        const shown = Date.UTC(+q.year, +q.month - 1, +q.day, +q.hour, +q.minute);
        guess -= shown - Date.UTC(+p.year, +p.month - 1, +p.day, rule.hour, rule.minute);
      }
      out.push(new Date(guess));
    }
    return out;
  }
  const seen = new Set();
  const streams = (window.DUBZ_STREAMS || [])
    .map((value) => new Date(value))
    .concat(weeklyStarts(window.DUBZ_WEEKLY, 8))
    .filter((date) => !Number.isNaN(date.getTime()))
    .filter((date) => !seen.has(date.getTime()) && seen.add(date.getTime()))
    .sort((a, b) => a - b);
  const liveMs = (Number(window.LIVE_HOURS) || 3) * 60 * 60 * 1000;
  if (!root || !streams.length) return;

  const queryNow = new URLSearchParams(window.location.search).get("now");
  const mockedNow = queryNow ? Date.parse(queryNow) : NaN;
  const realStart = Date.now();
  const now = () => Number.isNaN(mockedNow) ? Date.now() : mockedNow + Date.now() - realStart;
  const localDate = new Intl.DateTimeFormat(undefined, {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short"
  });
  const ukTime = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Europe/London"
  });

  function render() {
    const current = now();
    const stream = streams.find((start) => start.getTime() + liveMs > current);
    if (!stream) {
      root.hidden = true;
      return;
    }

    root.hidden = false;
    if (current >= stream.getTime()) {
      root.innerHTML = '<p class="stream-live">LIVE NOW</p><div class="stream-actions"><a class="btn btn-primary" href="https://www.youtube.com/@Kri5pydubz/live" target="_blank" rel="noopener">Watch on YouTube</a><a class="btn btn-ghost" href="https://www.tiktok.com/@kri5pydubz/live" target="_blank" rel="noopener">Watch on TikTok</a></div>';
      return;
    }

    let seconds = Math.floor((stream.getTime() - current) / 1000);
    const days = Math.floor(seconds / 86400); seconds %= 86400;
    const hours = Math.floor(seconds / 3600); seconds %= 3600;
    const minutes = Math.floor(seconds / 60); seconds %= 60;
    const values = [["DD", days], ["HH", hours], ["MM", minutes], ["SS", seconds]];
    root.innerHTML = '<div class="stream-clock">' + values.map(([label, value]) =>
      '<div class="stream-clock-box"><span class="stream-clock-value">' + String(value).padStart(2, "0") +
      '</span><span class="stream-clock-label">' + label + '</span></div>'
    ).join("") + '</div><p class="stream-start">Local: <time datetime="' + stream.toISOString() + '">' +
      localDate.format(stream) + '</time><span class="stream-uk">' + ukTime.format(stream).replace(/\s/g, "") + ' UK</span></p>';
  }

  render();
  window.setInterval(render, 1000);
})();
