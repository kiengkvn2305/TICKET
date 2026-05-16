/* =========================
   AUTH GUARD
   Dùng cho các trang yêu cầu đăng nhập.
   Thêm <script src="js/common/authGuard.js"></script>
   SAU api.js để sử dụng.
========================= */

(function () {
    const user = localStorage.getItem("user");
    if (!user) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
    }
})();
