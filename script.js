(function () {
  var header = document.querySelector(".site-header");
  if (header) {
    var update = function () {
      header.classList.toggle("is-stuck", window.scrollY > 16);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function paint(img, data) {
    if (!data || data.length < 100 || data.indexOf("<") !== -1) return;
    var url = "data:image/jpeg;base64," + data.replace(/\s+/g, "");
    var probe = new Image();
    probe.onload = function () {
      img.src = url;
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.filter = "none";
      img.style.imageRendering = "auto";
    };
    probe.src = url;
  }

  function loadText(name) {
    return fetch(name, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(name);
      return r.text();
    });
  }

  document.querySelectorAll("img[data-parts]").forEach(function (img) {
    var base = img.getAttribute("data-parts");
    if (!base) return;
    var countAttr = img.getAttribute("data-part-count");
    var fetches;
    if (countAttr) {
      var n = parseInt(countAttr, 10) || 0;
      fetches = [];
      for (var i = 0; i < n; i++) {
        fetches.push(loadText(base + "-" + i + ".txt"));
      }
    } else {
      fetches = [loadText(base + "-a.txt"), loadText(base + "-b.txt")];
    }
    Promise.all(fetches)
      .then(function (parts) {
        paint(img, parts.map(function (p) { return String(p || "").trim(); }).join(""));
      })
      .catch(function () {});
  });

  document.querySelectorAll("img[data-b64]").forEach(function (img) {
    loadText(img.getAttribute("data-b64"))
      .then(function (text) {
        paint(img, String(text || "").trim());
      })
      .catch(function () {});
  });
})();
