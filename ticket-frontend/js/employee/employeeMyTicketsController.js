/* ==========================================================
   js/employee/myTicketsController.js
   Quản lý tab "Vé đã bán" — dành riêng cho nhân viên.
   Phụ thuộc: common/api, common/eventService (OrderService),
              common/myTicketsView (MyTicketsView),
              common/ui (EventView)
   ========================================================== */

// ── STATE ─────────────────────────────────────────────────
let allMyTickets   = [];
let activeMyFilter = "all";
let _ticketsLoaded = false; // cache — tránh gọi lại mỗi lần click tab

// ── LOAD & RENDER ─────────────────────────────────────────
function loadMyTickets() {
    MyTicketsView.showLoading();
    // Dùng maNhanVien (không phải maTaiKhoan) để query đúng bảng NHANVIEN
    OrderService.getByEmployee(currentUser.maNhanVien)
        .then(data => { allMyTickets = data; _ticketsLoaded = true; activeMyFilter = "all"; renderMyTickets(); })
        .catch(err  => MyTicketsView.showError(err.message));
}

function applyMyTicketFilter(filter) {
    activeMyFilter = filter;
    renderMyTickets();
}

function renderMyTickets() {
    MyTicketsView.render(allMyTickets, activeMyFilter, "applyMyTicketFilter", "openHoanVeModal");
}

// ── HOÀN VÉ ───────────────────────────────────────────────
let hoanVeData = { maVe: null, maHoaDon: null, soLuongMua: 1, hoanQty: 1 };

function openHoanVeModal(maVe, maHoaDon, soLuongMua, tenVe) {
    hoanVeData = { maVe, maHoaDon, soLuongMua, hoanQty: 1 };
    EventView.openHoanVeModal(maVe, maHoaDon, soLuongMua, tenVe);
}

function closeHoanVeModal() { EventView.closeHoanVeModal(); }

function changeHoanQty(delta) {
    const next = hoanVeData.hoanQty + delta;
    if (next < 1 || next > hoanVeData.soLuongMua) return;
    hoanVeData.hoanQty = next;
    EventView.setHoanQtyDisplay(next);
}

function confirmHoanVe() {
    EventView.setHoanBtnState(true);
    EventView.showHoanVeMsg("", "");
    OrderService.requestRefund({
        maHoaDon:    hoanVeData.maHoaDon,
        maVe:        hoanVeData.maVe,
        soLuongHoan: hoanVeData.hoanQty,
        lyDoHoan:    EventView.getHoanLyDo() || null,
    })
    .then(data => {
        EventView.showHoanVeMsg(`✅ Yêu cầu hoàn #${data.maHoanVe} đã được ghi nhận.`, "ok");
        EventView.setHoanBtnState(false);
        // Reset cache để load lại danh sách mới nhất
        setTimeout(() => { closeHoanVeModal(); _ticketsLoaded = false; loadMyTickets(); }, 2500);
    })
    .catch(err => {
        EventView.showHoanVeMsg(err.message, "err");
        EventView.setHoanBtnState(false);
    });
}