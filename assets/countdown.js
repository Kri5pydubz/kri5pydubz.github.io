(function () {
  const root = document.getElementById("stream-countdown");
  const streams = (window.DUBZ_STREAMS || [])
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
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
      root.innerHTML = '<p class="stream-live">LIVE NOW</p><div class="stream-actions"><a class="btn btn-primary" href="https://www.tiktok.com/@kri5pydubz">Watch on TikTok</a><a class="btn btn-ghost" href="https://www.twitch.tv/kri5pydubz">Watch on Twitch</a></div>';
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
