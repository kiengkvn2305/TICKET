/* ==========================================================
   js/common/ticketExport.js
   Dùng chung cho cả trang nhân viên lẫn khách hàng.
   Cung cấp:
     - openHoaDonDetail(group)  — mở modal chi tiết hóa đơn
     - exportTickets(group)     — xuất vé ra cửa sổ in
   ========================================================== */

(function () {

    /* ── INJECT MODAL VÀO DOM (1 lần) ───────────────────── */
    function _injectModal() {
        if (document.getElementById("hdDetailModal")) return;
        document.body.insertAdjacentHTML("beforeend", `
            <div id="hdDetailOverlay" style="
                display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);
                z-index:9000;backdrop-filter:blur(3px);"
                onclick="window._closeHoaDonDetail()">
            </div>
            <div id="hdDetailModal" style="
                display:none;position:fixed;top:50%;left:50%;
                transform:translate(-50%,-50%);
                background:#fff;border-radius:20px;
                box-shadow:0 20px 60px rgba(0,0,0,.2);
                width:min(680px,96vw);max-height:90vh;
                overflow-y:auto;z-index:9001;padding:32px;">
                <button onclick="window._closeHoaDonDetail()" style="
                    position:absolute;top:16px;right:16px;background:none;
                    border:none;font-size:1.4rem;cursor:pointer;color:#888;
                    line-height:1;">✕</button>
                <div id="hdDetailContent"></div>
            </div>
        `);
    }

    /* ── BUILD SEAT MAP HTML (dùng trong modal & xuất vé) ── */
    function _buildSeatMapHtml(allSeats, takenSeats) {
        // allSeats: Set of all seat IDs in the ticket(s) being viewed
        // takenSeats: Set of all booked seat IDs (from API or from tickets)
        const ROWS = 10, COLS = 10;
        let cells = "";
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const id = `${String.fromCharCode(65 + r)}${c + 1}`;
                const isVip     = r < 3;
                const isMine    = allSeats.has(id);
                const isBooked  = !isMine && takenSeats.has(id);
                let cls, title;
                if (isMine) {
                    cls   = "sm-mine";
                    title = `${id} · ${isVip ? "VIP" : "Thường"} · Ghế của bạn`;
                } else if (isBooked) {
                    cls   = "sm-booked";
                    title = `${id} · Đã đặt`;
                } else {
                    cls   = isVip ? "sm-vip" : "sm-normal";
                    title = `${id} · ${isVip ? "VIP" : "Thường"} · Còn trống`;
                }
                cells += `<div class="sm-cell ${cls}" title="${title}">${id}</div>`;
            }
        }
        return `
        <div class="sm-wrap">
            <div class="sm-screen">🎬 SÂN KHẤU</div>
            <div class="sm-grid">${cells}</div>
            <div class="sm-legend">
                <span class="sm-dot sm-mine"></span> Ghế của bạn &nbsp;
                <span class="sm-dot sm-booked"></span> Đã đặt &nbsp;
                <span class="sm-dot sm-vip"></span> VIP trống &nbsp;
                <span class="sm-dot sm-normal"></span> Thường trống
            </div>
        </div>`;
    }

    /* ── CSS SƠ ĐỒ GHẾ ──────────────────────────────────── */
    const SEAT_CSS = `
        .sm-wrap{margin:18px 0 6px}
        .sm-screen{text-align:center;background:linear-gradient(90deg,#0d9488,#0f766e);
            color:#fff;border-radius:8px;padding:6px;font-size:.72rem;
            font-weight:700;letter-spacing:1px;margin-bottom:10px}
        .sm-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:3px}
        .sm-cell{aspect-ratio:1;border-radius:4px;display:flex;align-items:center;
            justify-content:center;font-size:.52rem;font-weight:700;
            border:1px solid transparent;cursor:default}
        .sm-cell.sm-mine{background:linear-gradient(135deg,#22c55e,#15803d);
            color:#fff;border-color:#14532d;box-shadow:0 0 0 2px rgba(34,197,94,.4)}
        .sm-cell.sm-booked{background:#e5e7eb;color:#d1d5db;border-color:#d1d5db}
        .sm-cell.sm-vip{background:linear-gradient(135deg,#fde68a,#d97706);
            color:#78350f;border-color:#b45309}
        .sm-cell.sm-normal{background:linear-gradient(135deg,#bae6fd,#0284c7);
            color:#fff;border-color:#0369a1}
        .sm-legend{display:flex;align-items:center;flex-wrap:wrap;gap:10px;
            margin-top:8px;font-size:.72rem;color:#666}
        .sm-dot{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:middle}
        .sm-dot.sm-mine{background:#22c55e}
        .sm-dot.sm-booked{background:#e5e7eb;border:1px solid #d1d5db}
        .sm-dot.sm-vip{background:#fde68a;border:1px solid #d97706}
        .sm-dot.sm-normal{background:#bae6fd;border:1px solid #0284c7}
    `;

    function _injectSeatCSS() {
        if (document.getElementById("_smCSS")) return;
        const s = document.createElement("style");
        s.id = "_smCSS";
        s.textContent = SEAT_CSS;
        document.head.appendChild(s);
    }

    /* ── LẤY GHẾ ĐÃ ĐẶT TỪ API ─────────────────────────── */
    async function _fetchBookedSeats(maSuKien) {
        if (!maSuKien) return new Set();
        try {
            const data = await apiFetch(`/ghe/sukien/${maSuKien}`);
            return new Set((data || []).map(g => g.soThuTu || g.khuVuc || g.id).filter(Boolean));
        } catch {
            return new Set();
        }
    }

    /* ── LẤY TẤT CẢ GHẾ TRONG VÉ ─────────────────────────── */
    function _getAllMySeats(group) {
        const seats = new Set();
        (group.tickets || []).forEach(ve => {
            _parseSeatList(ve).forEach(s => seats.add(s));
        });
        return seats;
    }

    /* ── MỞ MODAL CHI TIẾT HÓA ĐƠN ─────────────────────── */
    window.openHoaDonDetail = async function (group) {
        _injectModal();
        _injectSeatCSS();

        const fmt = n => Number(n || 0).toLocaleString("vi-VN") + " ₫";
        const fmtDate = v => {
            if (!v) return "—";
            if (Array.isArray(v)) {
                const [y, m, d] = v;
                return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
            }
            const d = new Date(v);
            return isNaN(d) ? v : d.toLocaleDateString("vi-VN");
        };

        const showDiscount = group.thanhTienGoc && group.thanhTien &&
                             group.thanhTien < group.thanhTienGoc;

        const rows = group.tickets.map(ve => {
            const seatLabel = _formatSeatLabel(ve);
            return `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;
                        padding:12px 0;border-bottom:1px solid #f0f0f0;gap:12px;flex-wrap:wrap">
                <div>
                    <div style="font-weight:700;color:#1a1a2e;font-size:.95rem">${_esc(ve.tenVe || "—")}</div>
                    <div style="font-size:.8rem;color:#888;margin-top:3px">
                        ${_esc(ve.loaiVe || "—")} · SL: <strong>${ve.soLuong}</strong>
                        · ${fmt(ve.gia)}/vé
                    </div>
                    ${seatLabel ? `
                    <div style="margin-top:5px;display:inline-flex;align-items:center;gap:5px;
                                 background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                                 padding:3px 9px;font-size:.78rem;font-weight:700;color:#15803d">
                        💺 Ghế: ${_esc(seatLabel)}
                    </div>` : ""}
                </div>
                <div style="text-align:right">
                    <div style="font-weight:700;font-size:1rem">${fmt(ve.gia * ve.soLuong)}</div>
                    ${ve.trangThaiHoan === "approved" ? `
                    <span style="margin-top:6px;display:inline-block;padding:5px 14px;
                                 background:#d1fae5;color:#065f46;border-radius:20px;
                                 font-size:.78rem;font-weight:700;font-family:'Inter',sans-serif">
                        💚 Đã hoàn
                    </span>` : `
                    <button onclick="window.exportTickets(${JSON.stringify(group).replace(/"/g,'&quot;')}, ${ve.maVe})"
                        style="margin-top:6px;padding:5px 14px;background:#0d9488;color:#fff;
                               border:none;border-radius:20px;font-size:.78rem;font-weight:700;
                               cursor:pointer;font-family:'Inter',sans-serif">
                        🎫 Xuất vé
                    </button>`}
                </div>
            </div>`;
        }).join("");

        // Lấy ghế đã đặt từ API, sau đó render sơ đồ
        const mySeats    = _getAllMySeats(group);
        const bookedSeats = await _fetchBookedSeats(group.maSuKien);
        // Các ghế của mình cũng được xem là "đã đặt" với người khác
        mySeats.forEach(s => bookedSeats.add(s));
        const seatMapHtml = mySeats.size > 0
            ? `<div style="margin-bottom:18px">
                <div style="font-weight:700;font-size:.9rem;color:#1a1a2e;margin-bottom:6px">
                    🗺️ Sơ đồ ghế ngồi
                </div>
                ${_buildSeatMapHtml(mySeats, bookedSeats)}
               </div>`
            : "";

        document.getElementById("hdDetailContent").innerHTML = `
            <div style="text-align:center;margin-bottom:20px">
                <div style="font-size:1.8rem">🧾</div>
                <h2 style="margin:4px 0;font-size:1.2rem;font-family:'Inter',sans-serif">
                    Chi tiết hóa đơn #${group.maHoaDon}
                </h2>
                <p style="color:#888;font-size:.85rem;margin:0">
                    📅 ${fmtDate(group.ngayMua)} &nbsp;·&nbsp; 📍 ${_esc(group.tenSuKien || "—")}
                </p>
            </div>

            <div style="background:#f9fafb;border-radius:12px;padding:14px;margin-bottom:18px;
                        font-size:.85rem;color:#555;display:flex;justify-content:space-between;
                        flex-wrap:wrap;gap:8px">
                <div>
                    Tổng gốc:
                    <strong style="color:#1a1a2e">${fmt(group.thanhTienGoc || group.thanhTien)}</strong>
                </div>
                ${showDiscount ? `<div style="color:#16a34a">
                    Sau giảm giá: <strong>${fmt(group.thanhTien)}</strong>
                </div>` : ""}
                <div>
                    Thanh toán:
                    <strong style="color:#dc2626;font-size:1rem">${fmt(group.thanhTien)}</strong>
                </div>
            </div>

            <div style="margin-bottom:18px">${rows}</div>

            ${seatMapHtml}

            ${group.tickets.every(v => v.trangThaiHoan === "approved") ? "" : `
            <div style="text-align:center">
                <button onclick="window.exportTickets(${JSON.stringify(group).replace(/"/g,'&quot;')}, null)"
                    style="padding:11px 28px;background:#0d9488;color:#fff;border:none;
                           border-radius:12px;font-size:.95rem;font-weight:700;cursor:pointer;
                           font-family:'Inter',sans-serif;width:100%">
                    🎫 Xuất tất cả vé trong hóa đơn
                </button>
            </div>`}
        `;

        document.getElementById("hdDetailOverlay").style.display = "block";
        document.getElementById("hdDetailModal").style.display   = "block";
    };

    window._closeHoaDonDetail = function () {
        document.getElementById("hdDetailOverlay").style.display = "none";
        document.getElementById("hdDetailModal").style.display   = "none";
    };

    /* ── XUẤT VÉ RA CỬA SỔ IN ───────────────────────────── */
    window.exportTickets = async function (group, filterMaVe) {
        const tickets = filterMaVe != null
            ? group.tickets.filter(v => v.maVe == filterMaVe)
            : group.tickets;

        const fmtDate = v => {
            if (!v) return "—";
            if (Array.isArray(v)) {
                const [y, m, d] = v;
                return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
            }
            const d = new Date(v);
            return isNaN(d) ? v : d.toLocaleDateString("vi-VN");
        };
        const fmt = n => Number(n || 0).toLocaleString("vi-VN") + " ₫";

        // Lấy ghế đã đặt từ API
        const bookedSeats = await _fetchBookedSeats(group.maSuKien);
        // Tất cả ghế của mình (trong group, không chỉ vé đang xuất)
        const allGroupSeats = _getAllMySeats(group);
        allGroupSeats.forEach(s => bookedSeats.add(s));

        // Tạo N tấm vé
        const cards = tickets.flatMap(ve => {
            const seats = _parseSeatList(ve);
            return Array.from({ length: ve.soLuong }, (_, i) => {
                const mySeat = seats[i] || null;
                // Ghế của vé này
                const mySeatSet = mySeat ? new Set([mySeat]) : new Set();
                return _buildTicketCard(ve, group, i + 1, fmtDate, fmt, mySeat, mySeatSet, bookedSeats);
            });
        }).join("");

        // Xây dựng sơ đồ ghế tổng hợp (tất cả ghế của hóa đơn này)
        const groupSeatSet = new Set();
        tickets.forEach(ve => _parseSeatList(ve).forEach(s => groupSeatSet.add(s)));
        const overviewMapHtml = groupSeatSet.size > 0
            ? `<div class="overview-map">
                <h3 style="text-align:center;margin:0 0 8px;font-size:.95rem;color:#555">
                    🗺️ Sơ đồ ghế — Tất cả vé trong hóa đơn #${group.maHoaDon}
                </h3>
                ${_buildSeatMapHtmlRaw(groupSeatSet, bookedSeats)}
               </div>`
            : "";

        const win = window.open("", "_blank", "width=700,height=600");
        win.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Vé — ${_escRaw(group.tenSuKien || "Sự kiện")}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#f0f4f8; padding:24px; }
  .page-title {
      text-align:center; font-size:1.1rem; color:#555; margin-bottom:24px;
      font-weight:600; letter-spacing:.5px;
  }
  .ticket-wrap { break-inside:avoid; margin-bottom:24px; }
  .ticket {
      width:100%; max-width:620px; margin:0 auto;
      background:#fff; border-radius:18px;
      box-shadow:0 4px 20px rgba(0,0,0,.12);
      overflow:hidden; display:flex; flex-direction:column;
  }
  .ticket-header {
      background: linear-gradient(135deg,#0d9488,#0f766e);
      color:#fff; padding:22px 28px 18px;
  }
  .ticket-header .event-name {
      font-size:1.3rem; font-weight:800; line-height:1.3; margin-bottom:6px;
  }
  .ticket-header .event-dates {
      font-size:.82rem; opacity:.85; display:flex; gap:16px; flex-wrap:wrap;
  }
  .ticket-body {
      padding:20px 28px; display:flex;
      justify-content:space-between; gap:16px; align-items:flex-start;
      flex-wrap:wrap;
  }
  .ticket-info { flex:1; min-width:200px; }
  .info-row { margin-bottom:10px; }
  .info-label { font-size:.72rem; color:#888; font-weight:700;
                text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
  .info-value { font-size:.95rem; color:#1a1a2e; font-weight:600; }
  .info-value.seat-value {
      display:inline-flex; align-items:center; gap:6px;
      background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:10px;
      padding:4px 12px; color:#15803d; font-size:1rem; font-weight:800;
      letter-spacing:.5px;
  }
  .ticket-qr {
      display:flex; flex-direction:column; align-items:center; gap:8px;
      min-width:100px;
  }
  .qr-box {
      width:90px; height:90px; border:2px solid #e5e7eb; border-radius:10px;
      overflow:hidden; background:#fff;
      display:flex; align-items:center; justify-content:center;
  }
  .qr-box img, .qr-box canvas {
      width:86px !important; height:86px !important;
      display:block;
  }
  .ticket-id {
      font-size:.7rem; color:#888; font-family:monospace; text-align:center;
  }
  .ticket-footer {
      border-top: 2px dashed #e5e7eb;
      padding:12px 28px; background:#fafafa;
      display:flex; justify-content:space-between; align-items:center;
      flex-wrap:wrap; gap:8px;
  }
  .ticket-footer .price {
      font-size:1.2rem; font-weight:800; color:#0d9488;
  }
  .ticket-footer .badge {
      background:#dcfce7; color:#15803d; font-size:.75rem;
      font-weight:700; padding:4px 12px; border-radius:20px;
  }
  .serial { font-size:.72rem; color:#aaa; }

  /* ── Seat map in print ── */
  .seat-map-section { padding:14px 28px 18px; border-top:1px dashed #e5e7eb; }
  .seat-map-title { font-size:.78rem; font-weight:700; color:#555; margin-bottom:8px; text-align:center; }
  .sm-wrap-print { }
  .sm-screen-print { text-align:center; background:linear-gradient(90deg,#0d9488,#0f766e);
      color:#fff; border-radius:6px; padding:5px; font-size:.65rem;
      font-weight:700; letter-spacing:1px; margin-bottom:8px; max-width:300px; margin-left:auto; margin-right:auto; }
  .sm-grid-print { display:grid; grid-template-columns:repeat(10,1fr); gap:2px; max-width:300px; margin:0 auto; }
  .sm-cell-print { aspect-ratio:1; border-radius:3px; display:flex; align-items:center;
      justify-content:center; font-size:.42rem; font-weight:700; border:1px solid transparent; }
  .sm-mine-print  { background:#22c55e; color:#fff; border-color:#14532d; }
  .sm-booked-print { background:#e5e7eb; color:#d1d5db; border-color:#d1d5db; }
  .sm-vip-print   { background:#fde68a; color:#78350f; border-color:#b45309; }
  .sm-normal-print { background:#bae6fd; color:#0c4a6e; border-color:#0369a1; }
  .sm-legend-print { display:flex; align-items:center; flex-wrap:wrap; gap:8px;
      margin-top:6px; font-size:.65rem; color:#666; justify-content:center; }
  .sm-dot-print { display:inline-block; width:10px; height:10px; border-radius:2px; vertical-align:middle; }

  /* Overview seat map */
  .overview-map {
      max-width:620px; margin:0 auto 28px; background:#fff; border-radius:14px;
      padding:20px 24px; box-shadow:0 4px 16px rgba(0,0,0,.1);
  }

  @media print {
      body { background:#fff; padding:0; }
      .page-title { display:none; }
      .ticket-wrap { page-break-after:always; margin:0; }
      .ticket { box-shadow:none; border:1px solid #e5e7eb; }
      .overview-map { box-shadow:none; border:1px solid #e5e7eb; page-break-after:always; }
  }
</style>
</head>
<body>
<div class="page-title">🎫 Vé sự kiện — In hoặc lưu PDF</div>
${overviewMapHtml}
${cards}
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script>
  document.querySelectorAll('.qr-box[id^="qr-"]').forEach(function(el) {
    var code = el.id.replace('qr-', '');
    el.style.padding = '0';
    el.style.background = '#fff';
    new QRCode(el, {
      text: code,
      width: 86, height: 86,
      colorDark: '#0f766e', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  });
  setTimeout(() => window.print(), 800);
<\/script>
</body>
</html>`);
        win.document.close();
    };

    /* ── BUILD SƠ ĐỒ CHO CỬA SỔ IN (class riêng) ─────── */
    function _buildSeatMapHtmlRaw(mySeats, takenSeats) {
        let cells = "";
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                const id = `${String.fromCharCode(65 + r)}${c + 1}`;
                const isVip    = r < 3;
                const isMine   = mySeats.has(id);
                const isBooked = !isMine && takenSeats.has(id);
                let cls;
                if (isMine)        cls = "sm-mine-print";
                else if (isBooked) cls = "sm-booked-print";
                else               cls = isVip ? "sm-vip-print" : "sm-normal-print";
                cells += `<div class="sm-cell-print ${cls}" title="${id}">${id}</div>`;
            }
        }
        return `
        <div class="sm-wrap-print">
            <div class="sm-screen-print">🎬 SÂN KHẤU</div>
            <div class="sm-grid-print">${cells}</div>
            <div class="sm-legend-print">
                <span class="sm-dot-print" style="background:#22c55e"></span> Ghế của bạn &nbsp;
                <span class="sm-dot-print" style="background:#e5e7eb;border:1px solid #d1d5db"></span> Đã đặt &nbsp;
                <span class="sm-dot-print" style="background:#fde68a;border:1px solid #d97706"></span> VIP trống &nbsp;
                <span class="sm-dot-print" style="background:#bae6fd;border:1px solid #0369a1"></span> Thường trống
            </div>
        </div>`;
    }

    /* ── BUILD 1 TẤM VÉ ─────────────────────────────────── */
    function _buildTicketCard(ve, group, idx, fmtDate, fmt, seatLabel, mySeatSet, bookedSeats) {
        const ticketCode = `TK-${group.maHoaDon}-${ve.maVe}-${idx}`;
        const seatRow = seatLabel ? `
                    <div class="info-row">
                        <div class="info-label">💺 Ghế ngồi</div>
                        <div class="info-value seat-value">${_escRaw(seatLabel)}</div>
                    </div>` : "";

        // Sơ đồ ghế nhỏ trong từng tấm vé (nếu có ghế)
        const seatMapSection = mySeatSet.size > 0 ? `
            <div class="seat-map-section">
                <div class="seat-map-title">🗺️ Vị trí ghế của bạn</div>
                ${_buildSeatMapHtmlRaw(mySeatSet, bookedSeats)}
            </div>` : "";

        return `
        <div class="ticket-wrap">
          <div class="ticket">
            <div class="ticket-header">
                <div class="event-name">${_escRaw(group.tenSuKien || "Sự kiện")}</div>
                <div class="event-dates">
                    <span>📅 Bắt đầu: ${fmtDate(group.thoiGianBatDau || ve.thoiGianBatDau)}</span>
                    <span>🏁 Kết thúc: ${fmtDate(group.thoiGianKetThuc || ve.thoiGianKetThuc)}</span>
                </div>
            </div>
            <div class="ticket-body">
                <div class="ticket-info">
                    <div class="info-row">
                        <div class="info-label">Loại vé</div>
                        <div class="info-value">${_escRaw(ve.tenVe || "—")}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Phân loại</div>
                        <div class="info-value">${_escRaw(ve.loaiVe || "—")}</div>
                    </div>
                    ${seatRow}
                    <div class="info-row">
                        <div class="info-label">Mã hóa đơn</div>
                        <div class="info-value">#${group.maHoaDon}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Ngày mua</div>
                        <div class="info-value">${fmtDate(group.ngayMua)}</div>
                    </div>
                    ${ve.soLuong > 1 ? `
                    <div class="info-row">
                        <div class="info-label">Vé số</div>
                        <div class="info-value">${idx} / ${ve.soLuong}</div>
                    </div>` : ""}
                </div>
                <div class="ticket-qr">
                    <div class="qr-box" id="qr-${ticketCode}"></div>
                    <div class="ticket-id">${ticketCode}</div>
                </div>
            </div>
            ${seatMapSection}
            <div class="ticket-footer">
                <div>
                    <div class="price">${fmt(ve.gia)}</div>
                    <div class="serial">HĐ #${group.maHoaDon} · Vé #${ve.maVe}</div>
                </div>
                <span class="badge">✅ ĐÃ THANH TOÁN</span>
            </div>
          </div>
        </div>`;
    }

    /* ── HELPERS GHẾ ─────────────────────────────────────── */

    function _parseSeatList(ve) {
        const raw = ve.gheDat ?? ve.khuVuc ?? ve.soGhe ?? ve.gheSo ?? null;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw.map(String);
        if (typeof raw === "string") return raw.split(",").map(s => s.trim()).filter(Boolean);
        return [String(raw)];
    }

    function _formatSeatLabel(ve) {
        const list = _parseSeatList(ve);
        if (!list.length) return "";
        return list.join(", ");
    }

    /* ── ESCAPE HELPERS ──────────────────────────────────── */
    function _esc(s) {
        return String(s || "")
            .replace(/&/g,"&amp;").replace(/</g,"&lt;")
            .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }
    function _escRaw(s) {
        return String(s || "")
            .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

})();
