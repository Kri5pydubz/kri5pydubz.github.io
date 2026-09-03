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
  Promise.all([
    fetch("assets/hero-tiny-1.txt").then(function (r) { if (!r.ok) throw new Error("1"); return r.text(); }),
    fetch("assets/hero-tiny-2.txt").then(function (r) { if (!r.ok) throw new Error("2"); return r.text(); })
  ]).then(function (parts) {
    img.src = "data:image/jpeg;base64," + parts[0].trim() + parts[1].trim();
    img.width = 560;
    img.height = 792;
  }).catch(function () {});
})();
