(function () {
  const root = document.getElementById("stream-countdown");
  const TZ = "Europe/London";
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const fmtParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", weekday: "short", hourCycle: "h23"
  });
  const partsOf = (date) => Object.fromEntries(fmtParts.formatToParts(date).map((x) => [x.type, x.value]));
  // UK wall-clock time -> real instant (DST-aware).
  function ukToDate(y, m, d, hh, mm) {
    const want = Date.UTC(y, m - 1, d, hh, mm);
    let guess = want;
    for (let i = 0; i < 2; i++) {
      const q = partsOf(new Date(guess));
      guess -= Date.UTC(+q.year, +q.month - 1, +q.day, +q.hour, +q.minute) - want;
    }
    return new Date(guess);
  }
  function parseOneOff(value) {
    const m = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})$/);
    if (m) return ukToDate(+m[1], +m[2], +m[3], +m[4], +m[5]);
    return new Date(value); // also accepts full ISO with Z/offset
  }
  function weeklyStarts(rules, weeks) {
    const out = [];
    const base = new Date(); base.setUTCHours(12, 0, 0, 0);
    for (let d = -2; d < 7 * weeks; d++) {
      const p = partsOf(new Date(base.getTime() + d * 86400000));
      rules.forEach((rule) => {
        const day = DAYS.indexOf(String(rule.day || "").slice(0, 3).replace(/^./, (c) => c.toUpperCase()));
        const t = String(rule.time || "").match(/^(\d{1,2}):(\d{2})$/);
        if (day < 0 || !t || DAYS.indexOf(p.weekday) !== day) return;
        out.push(ukToDate(+p.year, +p.month, +p.day, +t[1], +t[2]));
      });
    }
    return out;
  }
  const oneOffs = (window.DUBZ_STREAMS || []).map(parseOneOff);
  const weekly = Array.isArray(window.DUBZ_WEEKLY) ? window.DUBZ_WEEKLY : [];
  const seen = new Set();
  const listed = oneOffs.concat(weeklyStarts(weekly, 3))
    .filter((date) => !Number.isNaN(date.getTime()))
    .filter((date) => !seen.has(date.getTime()) && seen.add(date.getTime()))
    .sort((a, b) => a - b);
  const fallback = weeklyStarts([{ day: "Sun", time: "21:00" }], 3);
  const liveMs = (Number(window.LIVE_HOURS) || 3) * 60 * 60 * 1000;
  if (!root) return;

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

  const heading = document.getElementById("when-heading");
  const dayName = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: TZ });
  const dayDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: TZ });
  const ukKey = (date) => { const p = partsOf(date); return p.year + "-" + p.month + "-" + p.day; };
  function setHeading(stream, current) {
    if (!heading || !stream) return;
    const time = ukTime.format(stream).replace(/\s/g, "").replace(":00", "");
    let day;
    if (current >= stream.getTime()) day = "Live";
    else if (ukKey(stream) === ukKey(new Date(current))) day = "Tonight";
    else if (ukKey(stream) === ukKey(new Date(current + 86400000))) day = "Tomorrow";
    else if (stream.getTime() - current < 6 * 86400000) day = dayName.format(stream);
    else day = dayDate.format(stream);
    const text = day === "Live" ? "We're live" : day + ", " + time;
    if (heading.textContent !== text) heading.textContent = text;
  }

  function render() {
    const current = now();
    const stream = listed.find((start) => start.getTime() + liveMs > current) ||
      fallback.find((start) => start.getTime() + liveMs > current);
    setHeading(stream, current);
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
