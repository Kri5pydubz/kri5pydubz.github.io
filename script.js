(function () {
  var header = document.querySelector(".site-header");
  if (header) {
    var update = function () {
      header.classList.toggle("is-stuck", window.scrollY > 16);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }
  var img = document.querySelector(".hero-art img");
  if (!img) return;
  var n = 12;
  var jobs = [];
  for (var i = 1; i <= n; i++) {
    jobs.push(fetch("assets/hero-b64/" + i + ".txt").then(function (r) { return r.text(); }));
  }
  Promise.all(jobs).then(function (chunks) {
    img.src = "data:image/jpeg;base64," + chunks.join("");
    img.width = 560;
    img.height = 792;
  }).catch(function () {});
})();
