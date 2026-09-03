(function () {
  var header = document.querySelector(".site-header");
  if (!header) return;
  var update = function () {
    header.classList.toggle("is-stuck", window.scrollY > 16);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
})();
