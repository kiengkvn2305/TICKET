/* ==========================================================
   js/common/authGuard.js
   Chạy ngay khi load — redirect nếu chưa đăng nhập.
   ========================================================== */
(function () {
    const user = localStorage.getItem("user");
    if (!user) {
        window.location.href = "loginpopup.html";
    }
})();
