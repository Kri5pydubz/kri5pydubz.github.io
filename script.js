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
  function load(name) {
    return fetch(name, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(name);
      return r.text();
    });
  }
  Promise.all([load("assets/hero-a.txt"), load("assets/hero-b.txt")])
    .then(function (parts) {
      var data = String(parts[0] || "").trim() + String(parts[1] || "").trim();
      if (data.length < 100 || data.indexOf("<") !== -1) return;
      var url = "data:image/jpeg;base64," + data;
      var probe = new Image();
      probe.onload = function () {
        img.src = url;
        img.width = 560;
        img.height = 792;
        img.removeAttribute("height");
        img.style.width = "100%";
        img.style.height = "auto";
      };
      probe.src = url;
    })
    .catch(function () {});
})();
