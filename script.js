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
    fetch("assets/hero-a.txt").then(function (r) { if (!r.ok) throw new Error("a"); return r.text(); }),
    fetch("assets/hero-b.txt").then(function (r) { if (!r.ok) throw new Error("b"); return r.text(); })
  ]).then(function (parts) {
    var data = (parts[0] + parts[1]).replace(/\s+/g, "");
    if (!data || data.indexOf("<") !== -1) return;
    img.src = "data:image/jpeg;base64," + data;
    img.width = 560;
    img.height = 792;
  }).catch(function () {});
})();
