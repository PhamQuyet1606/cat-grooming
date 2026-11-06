// Form đăng ký groomer (trang /groomer).
// Cố ý KHÔNG tải Meta/TikTok Pixel và KHÔNG gửi sự kiện Lead: groomer không phải khách,
// nếu gửi sự kiện thì quảng cáo sẽ tối ưu sai đối tượng.
(function () {
  "use strict";

  var cfg = window.SACHBY_CONFIG || {};
  var form = document.querySelector(".js-gform");
  var success = document.querySelector(".js-gsuccess");
  var submitBtn = document.querySelector(".js-gsubmit");
  var formError = document.querySelector(".js-gform-error");
  if (!form) return;

  var params = new URLSearchParams(window.location.search);

  function normalizePhone(raw) {
    var d = String(raw || "").replace(/[^\d+]/g, "");
    if (d.indexOf("+84") === 0) d = "0" + d.slice(3);
    else if (d.indexOf("84") === 0 && d.length === 11) d = "0" + d.slice(2);
    return d.replace(/\D/g, "");
  }
  function isValidPhone(p) { return /^0[35789]\d{8}$/.test(p); }

  function setError(name, msg) {
    var el = form.querySelector('[data-error-for="' + name + '"]');
    if (el) el.textContent = msg || "";
    var input = form.elements[name];
    if (input && input.tagName === "INPUT") input.setAttribute("aria-invalid", msg ? "true" : "false");
    var group = form.querySelector('[data-group="' + name + '"] .chips');
    if (group) group.classList.toggle("is-invalid", !!msg);
  }

  ["name", "phone", "area"].forEach(function (n) {
    form.elements[n].addEventListener("input", function () { setError(n, ""); formError.textContent = ""; });
  });
  ["experience", "cats"].forEach(function (n) {
    form.querySelectorAll('input[name="' + n + '"]').forEach(function (r) {
      r.addEventListener("change", function () { setError(n, ""); formError.textContent = ""; });
    });
  });

  function checked(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(window.location.hostname);
  var sending = false;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    formError.textContent = "";

    var name = form.elements.name.value.trim();
    var phone = normalizePhone(form.elements.phone.value);
    var area = form.elements.area.value.trim();
    var experience = checked("experience");
    var cats = checked("cats");
    var firstBad = null;

    function bad(field, msg, focusEl) { setError(field, msg); if (!firstBad) firstBad = focusEl; }
    if (!name) bad("name", "Vui lòng nhập họ tên của bạn.", form.elements.name);
    if (!phone) bad("phone", "Vui lòng nhập số điện thoại.", form.elements.phone);
    else if (!isValidPhone(phone)) bad("phone", "Số điện thoại chưa hợp lệ, vui lòng kiểm tra lại.", form.elements.phone);
    if (!area) bad("area", "Vui lòng cho biết khu vực bạn có thể nhận đơn.", form.elements.area);
    if (!experience) bad("experience", "Vui lòng chọn số năm kinh nghiệm.", form.querySelector('input[name="experience"]'));
    if (!cats) bad("cats", "Vui lòng chọn một lựa chọn.", form.querySelector('input[name="cats"]'));
    if (firstBad) { firstBad.focus(); return; }

    if (form.elements.website.value) { showSuccess(); return; }

    var times = [];
    form.querySelectorAll('input[name="times"]:checked').forEach(function (c) { times.push(c.value); });

    var payload = {
      form: "groomer",
      name: name.slice(0, 120),
      phone: phone,
      area: area.slice(0, 200),
      experience: experience,
      cats: cats,
      times: times.join(", "),
      portfolio: form.elements.portfolio.value.trim().slice(0, 300),
      utm_source: (params.get("utm_source") || "").slice(0, 100),
      utm_campaign: (params.get("utm_campaign") || "").slice(0, 100),
      referrer: document.referrer.slice(0, 300)
    };

    if (!cfg.FORM_ENDPOINT) {
      if (isLocal) { console.warn("[Sạch By] Chưa cấu hình FORM_ENDPOINT, đăng ký groomer KHÔNG được lưu:", payload); showSuccess(); }
      else formError.textContent = "Form chưa sẵn sàng, vui lòng quay lại sau ít phút.";
      return;
    }

    sending = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi…";

    fetch(cfg.FORM_ENDPOINT, { method: "POST", mode: "no-cors", body: new URLSearchParams(payload) })
      .then(showSuccess)
      .catch(function () {
        sending = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Gửi đăng ký";
        formError.textContent = "Chưa gửi được, có thể do kết nối mạng. Vui lòng thử lại.";
      });
  });

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
