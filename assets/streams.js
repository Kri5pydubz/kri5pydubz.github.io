// ===== DUBZ STREAM SCHEDULE (easy to edit) =====
// The countdown always counts to the SOONEST upcoming stream from both lists below.
//
// 1) One-off streams: add ONE line per stream, UK date and time "YYYY-MM-DD HH:MM" (24h UK clock;
//    summer/winter time is handled automatically). Old dates can stay; they're skipped once past.
window.DUBZ_STREAMS = [
  "2026-10-25 21:00",
];
//
// 2) Regular weekly streams: day (Mon Tue Wed Thu Fri Sat Sun) and UK time "HH:MM" (24h).
//    Default is Sunday 9pm UK. Example extra line: { day: "Wed", time: "20:00" },
window.DUBZ_WEEKLY = [
  { day: "Sun", time: "21:00" },
];
//
// If both lists are empty, it falls back to Sunday 21:00 UK.
// How long the LIVE NOW state shows after a stream starts:
window.LIVE_HOURS = 3;
