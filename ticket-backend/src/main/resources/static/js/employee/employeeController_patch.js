/* ==========================================================
   js/employee/employeeController_patch.js
   Phần mở rộng thanh toán chuyển khoản:
   - Load QR nhà tổ chức động khi chọn "Chuyển khoản"
   Phụ thuộc: employeeController.js (currentEvent, EventService)
   ========================================================== */

/**
 * Gọi từ selectPaymentMethod() khi method === "CHUYEN_KHOAN".
 * Dùng currentEvent.maCongTy để fetch QR nhà tổ chức.
 */
function _loadOrganizerQR() {
    const img = document.getElementById("qrOrganizerImg");
    const msg = document.getElementById("qrOrganizerMsg");

    const maCongTy = currentEvent && currentEvent.maCongTy;
    if (!maCongTy) {
        if (msg) msg.textContent = "Không tìm thấy nhà tổ chức.";
        return;
    }

    if (msg) msg.textContent = "Đang tải mã QR...";
    if (img) { img.style.display = "none"; img.src = ""; }

    EventService.getOrganizer(maCongTy)
        .then(function (org) {
            // Hỗ trợ nhiều tên field QR khác nhau từ backend
            const qr = org && (org.maQR || org.qrCode || org.anhQR || org.urlQR || org.qr);
            if (qr) {
                if (img) { img.src = qr; img.style.display = "block"; }
                if (msg) msg.textContent = "";
            } else {
                if (msg) msg.textContent = "Nhà tổ chức chưa cập nhật mã QR.";
            }
        })
        .catch(function () {
            if (msg) msg.textContent = "Không tải được mã QR.";
        });
}