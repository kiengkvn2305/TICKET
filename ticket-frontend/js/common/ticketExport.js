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
                width:min(560px,95vw);max-height:85vh;
                overflow-y:auto;z-index:9001;padding:32px;">
                <button onclick="window._closeHoaDonDetail()" style="
                    position:absolute;top:16px;right:16px;background:none;
                    border:none;font-size:1.4rem;cursor:pointer;color:#888;
                    line-height:1;">✕</button>
                <div id="hdDetailContent"></div>
            </div>
        `);
    }

    /* ── MỞ MODAL CHI TIẾT HÓA ĐƠN ─────────────────────── */
    window.openHoaDonDetail = function (group) {
        _injectModal();

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

        const rows = group.tickets.map(ve => `
            <div style="display:flex;justify-content:space-between;align-items:center;
                        padding:12px 0;border-bottom:1px solid #f0f0f0;gap:12px;flex-wrap:wrap">
                <div>
                    <div style="font-weight:700;color:#1a1a2e;font-size:.95rem">${_esc(ve.tenVe || "—")}</div>
                    <div style="font-size:.8rem;color:#888;margin-top:3px">
                        ${_esc(ve.loaiVe || "—")} · SL: <strong>${ve.soLuong}</strong>
                        · ${fmt(ve.gia)}/vé
                    </div>
                </div>
                <div style="text-align:right">
                    <div style="font-weight:700;font-size:1rem">${fmt(ve.gia * ve.soLuong)}</div>
                    <button onclick="window.exportTickets(${JSON.stringify(group).replace(/"/g,'&quot;')}, ${ve.maVe})"
                        style="margin-top:6px;padding:5px 14px;background:#0d9488;color:#fff;
                               border:none;border-radius:20px;font-size:.78rem;font-weight:700;
                               cursor:pointer;font-family:'Inter',sans-serif">
                        🎫 Xuất vé
                    </button>
                </div>
            </div>`).join("");

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

            <div style="text-align:center">
                <button onclick="window.exportTickets(${JSON.stringify(group).replace(/"/g,'&quot;')}, null)"
                    style="padding:11px 28px;background:#0d9488;color:#fff;border:none;
                           border-radius:12px;font-size:.95rem;font-weight:700;cursor:pointer;
                           font-family:'Inter',sans-serif;width:100%">
                    🎫 Xuất tất cả vé trong hóa đơn
                </button>
            </div>
        `;

        document.getElementById("hdDetailOverlay").style.display = "block";
        document.getElementById("hdDetailModal").style.display   = "block";
    };

    window._closeHoaDonDetail = function () {
        document.getElementById("hdDetailOverlay").style.display = "none";
        document.getElementById("hdDetailModal").style.display   = "none";
    };

    /* ── XUẤT VÉ RA CỬA SỔ IN ───────────────────────────── */
    window.exportTickets = function (group, filterMaVe) {
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

        // Tạo N tấm vé (1 tấm / 1 vé, nhân soLuong)
        const cards = tickets.flatMap(ve =>
            Array.from({ length: ve.soLuong }, (_, i) => _buildTicketCard(ve, group, i + 1, fmtDate, fmt))
        ).join("");

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
  @media print {
      body { background:#fff; padding:0; }
      .page-title { display:none; }
      .ticket-wrap { page-break-after:always; margin:0; }
      .ticket { box-shadow:none; border:1px solid #e5e7eb; }
  }
</style>
</head>
<body>
<div class="page-title">🎫 Vé sự kiện — In hoặc lưu PDF</div>
${cards}
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script>
  // Tạo QR cho tất cả vé
  document.querySelectorAll('.qr-box[id^="qr-"]').forEach(function(el) {
    var code = el.id.replace('qr-', '');
    el.style.padding = '0';
    el.style.background = '#fff';
    new QRCode(el, {
      text: code,
      width: 86,
      height: 86,
      colorDark: '#0f766e',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  });
  // Mở in sau khi QR render xong
  setTimeout(() => window.print(), 800);
<\/script>
</body>
</html>`);
        win.document.close();
    };

    /* ── BUILD 1 TẤM VÉ ─────────────────────────────────── */
    function _buildTicketCard(ve, group, idx, fmtDate, fmt) {
        const ticketCode = `TK-${group.maHoaDon}-${ve.maVe}-${idx}`;
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

    /* ── HELPERS ─────────────────────────────────────────── */
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