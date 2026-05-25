// ── QR THANH TOÁN ─────────────────────────────────────────
// Ghi đè finalConfirmBuy để hiện QR trước khi mua
function finalConfirmBuy() {
    const items = CartModel.getItems();
    if (!items.length) {
        EventView.showVoucherMsg("Vui lòng chọn ít nhất 1 vé.", "err");
        return;
    }

    const maCongTy = currentEvent?.maCongTy;
    if (!maCongTy) {
        // Không có nhà tổ chức → mua thẳng
        confirmBuy();
        return;
    }

    // Lấy QR của nhà tổ chức
    EventService.getOrganizer(maCongTy)
        .then(org => {
            if (!org?.maQR) {
                // Không có QR → mua thẳng
                confirmBuy();
                return;
            }
            _showQRPayModal(org.maQR);
        })
        .catch(() => {
            // Lỗi lấy QR → mua thẳng
            confirmBuy();
        });
}

function _showQRPayModal(qrPath) {
    document.getElementById("qrPayImg").src = qrPath;
    document.getElementById("qrPayTotal").textContent =
        finalTotal.toLocaleString("vi-VN") + " ₫";
    document.getElementById("qrPayMsg").textContent = "";
    document.getElementById("qrPayMsg").className = "buy-msg";

    const overlay = document.getElementById("qrPayOverlay");
    const modal   = document.getElementById("qrPayModal");
    overlay.style.display = "block";
    modal.style.display   = "block";
    requestAnimationFrame(() => modal.classList.add("open"));
}

function closeQRPayModal() {
    const overlay = document.getElementById("qrPayOverlay");
    const modal   = document.getElementById("qrPayModal");
    modal.classList.remove("open");
    setTimeout(() => {
        overlay.style.display = "none";
        modal.style.display   = "none";
    }, 220);
}

function confirmAfterQR() {
    const btn = document.getElementById("confirmAfterQRBtn");
    btn.disabled = true;
    btn.textContent = "Đang xử lý...";

    const qrMsg = document.getElementById("qrPayMsg");
    qrMsg.textContent = "⏳ Đang xử lý...";
    qrMsg.className = "buy-msg";

    // Gọi thẳng OrderService.purchase (giống confirmBuy nhưng không đóng voucherModal)
    const items = CartModel.getItems();
    const maVoucher = document.getElementById("voucherInput")?.value.trim() || null;

    const _normaliseType2 = (loaiVe) => {
        const u = (loaiVe || '').toUpperCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return u.includes('VIP') ? 'vip' : 'normal';
    };
    const selectedSeats = (window._selectedSeats || []).map(seatId => {
        const rowChar = seatId.charAt(0);
        const isVip   = rowChar <= 'C';
        const allT    = window._currentTickets || [];
        const vipT    = allT.find(t => _normaliseType2(t.loaiVe) === 'vip');
        const normalT = allT.find(t => _normaliseType2(t.loaiVe) === 'normal');
        const matchT  = isVip ? (vipT || allT[0]) : (normalT || allT[0]);
        return { khuVuc: seatId, maVe: matchT?.maVe };
    });

    OrderService.purchase({
        maTaiKhoan: currentUser.maTaiKhoan,
        maSuKien:   currentEvent.maSuKien,
        maVoucher:  maVoucher || null,
        items,
        ghes:       selectedSeats,
    })
    .then(data => {
        qrMsg.textContent = `🎉 Mua thành công! Mã HĐ: #${data.maHoaDon}`;
        qrMsg.className = "buy-msg ok";
        CartModel.reset();
        window._selectedSeats = [];
        setTimeout(() => {
            closeQRPayModal();
            closeVoucherModal();
            loadAllEvents();
        }, 2200);
    })
    .catch(err => {
        qrMsg.textContent = `❌ ${err.message}`;
        qrMsg.className = "buy-msg err";
        btn.disabled = false;
        btn.textContent = "✅ Đã thanh toán";
    });
}