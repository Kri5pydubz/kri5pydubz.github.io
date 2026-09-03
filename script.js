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
  fetch("assets/hero-single.b64")
    .then(function (r) {
      if (!r.ok) throw new Error("missing");
      return r.text();
    })
    .then(function (data) {
      data = data.trim();
      if (!data || data.indexOf("<") !== -1) return;
      img.src = "data:image/jpeg;base64," + data;
      img.width = 560;
      img.height = 792;
    })
    .catch(function () {});
})();
