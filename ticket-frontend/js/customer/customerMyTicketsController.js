/* ==========================================================
   js/customer/myTicketsController.js
   Quản lý tab "Vé của tôi" — dành riêng cho khách hàng.
   Phụ thuộc: common/api, common/eventService (OrderService),
              common/myTicketsView (MyTicketsView),
              common/ui (EventView)
   ========================================================== */



// ── LOAD & RENDER ─────────────────────────────────────────
function loadMyTickets() {
    MyTicketsView.showLoading();
    OrderService.getByCustomer(currentUser.maTaiKhoan)
        .then(data => { allMyTickets = data; activeMyFilter = "all"; renderMyTickets(); })
        .catch(err  => MyTicketsView.showError(err.message));
}

function applyMyTicketFilter(filter) {
    activeMyFilter = filter;
    renderMyTickets();
}

function renderMyTickets() {
    MyTicketsView.render(
        allMyTickets,
        activeMyFilter,
        (filter) => applyMyTicketFilter(filter),
        (maVe, maHoaDon, maGheList, lyDo, tenVe) => {
            OrderService.requestRefund({
                maHoaDon:    maHoaDon,
                maVe:        maVe,
                maGheList:   maGheList,
                lyDoHoan:    lyDo || null,
            })
            .then(data => {
                alert(`✅ Yêu cầu hoàn #${data.maHoanVe} đã được ghi nhận.`);
                loadMyTickets();
            })
            .catch(err => alert(err.message));
        }
    );
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
        setTimeout(() => { closeHoanVeModal(); loadMyTickets(); }, 2500);
    })
    .catch(err => {
        EventView.showHoanVeMsg(err.message, "err");
        EventView.setHoanBtnState(false);
    });
}