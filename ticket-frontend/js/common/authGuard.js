/* =========================
   AUTH GUARD
   Dùng cho các trang yêu cầu đăng nhập.
   Thêm <script src="js/common/authGuard.js"></script>
   SAU api.js để sử dụng.
========================= */

(function () {
    const user = localStorage.getItem("user");
    if (!user) {
        // FIX: file tên thực là loginpopup.html (chữ thường), Linux phân biệt hoa/thường
        window.location.href = "loginpopup.html";
    }
})();