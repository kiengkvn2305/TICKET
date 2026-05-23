/* ==========================================================
   js/employee/employeeKpiController.js
   Báo cáo KPI theo ngày — dành riêng cho nhân viên.

   Cấu trúc dữ liệu thực tế (từ model Java):
   HoaDon   : { maHoaDon, ngayLap (YYYY-MM-DD), thanhTien, maNhanVien, trangThai }
   ChiTiet  : { maHoaDon, maVe, tenVe?, loaiVe?, donGia, soLuong }
   → API /hoadon/nhanvien/{maNV}   → mảng HoaDon (flat, không kèm chiTiet)
   → API /chitiethoadon/{maHoaDon} → mảng ChiTietHoaDon của hóa đơn đó
   ========================================================== */

// ── STATE ─────────────────────────────────────────────────
let _kpiDate      = new Date();   // ngày đang xem
let _kpiOrders    = [];           // mảng HoaDon thuần (flat)
let _kpiDetailMap = {};           // { maHoaDon: [ChiTietHoaDon, ...] }
let _kpiLoaded    = false;

// ── ENTRY POINT ───────────────────────────────────────────
async function loadKpi() {
    const root = document.getElementById("kpiRoot");
    root.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Đang tải báo cáo...</p></div>`;

    try {
        if (!_kpiLoaded) {
            const maNV = (typeof currentUser !== "undefined") ? currentUser.maNhanVien : null;
            if (!maNV) throw new Error("Không tìm thấy thông tin nhân viên.");

            // 1. Lấy danh sách hóa đơn
            _kpiOrders = await OrderService.getByEmployee(maNV);

            // 2. Lấy chi tiết song song cho tất cả hóa đơn
            await _loadAllDetails();

            _kpiLoaded = true;
        }
        _kpiDate = new Date();
        renderKpi();
    } catch (err) {
        root.innerHTML = `<div class="kpi-empty">❌ ${err.message || "Không thể tải dữ liệu."}</div>`;
    }
}

/**
 * Fetch chi tiết tất cả hóa đơn song song (Promise.all).
 * Endpoint: GET /chitiethoadon/{maHoaDon}
 * Nếu endpoint không tồn tại, fallback về mảng rỗng.
 */
async function _loadAllDetails() {
    _kpiDetailMap = {};
    const fetches = _kpiOrders.map(async (o) => {
        const id = o.maHoaDon;
        if (!id) return;
        try {
            const details = await apiFetch(`/chitiethoadon/${id}`);
            _kpiDetailMap[id] = Array.isArray(details) ? details : [];
        } catch (_) {
            _kpiDetailMap[id] = [];
        }
    });
    await Promise.all(fetches);
}

// ── HELPERS ───────────────────────────────────────────────
function _toDateStr(d) {
    // Trả về "YYYY-MM-DD" theo giờ local (tránh lệch timezone khi dùng toISOString)
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Lấy ngày "YYYY-MM-DD" từ field ngayLap của HoaDon */
function _getOrderDate(order) {
    const raw = order.ngayLap || order.ngayMua || order.thoiGian;
    if (!raw) return null;
    // LocalDate serialized thành "YYYY-MM-DD" hoặc ISO datetime
    if (typeof raw === "string") return raw.slice(0, 10);
    if (Array.isArray(raw)) {
        // Jackson có thể serialize LocalDate thành [2026, 5, 23]
        const [y, m, d] = raw;
        return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    }
    return null;
}

function _fmt(n) {
    return Number(n || 0).toLocaleString("vi-VN") + " ₫";
}

/** Tổng số vé từ _kpiDetailMap cho một mảng hóa đơn */
function _countTickets(orders) {
    return orders.reduce((sum, o) => {
        const details = _kpiDetailMap[o.maHoaDon] || [];
        if (details.length > 0) {
            return sum + details.reduce((s, t) => s + (t.soLuong || 1), 0);
        }
        // Fallback: nếu chưa fetch được chi tiết
        return sum + (o.soVe || o.tongSoLuong || 1);
    }, 0);
}

function _sumRevenue(orders) {
    return orders.reduce((s, o) => s + (o.thanhTien || o.thanhTienSau || 0), 0);
}

function _groupByDay(orders) {
    const map = {};
    orders.forEach(o => {
        const key = _getOrderDate(o);
        if (!key) return;
        if (!map[key]) map[key] = [];
        map[key].push(o);
    });
    return map;
}

function _last7Days(baseDate) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - i);
        days.push(_toDateStr(d));
    }
    return days;
}

function _dayLabel(dateStr) {
    const [, m, day] = dateStr.split("-");
    return `${day}/${m}`;
}

function _navDateLabel(d) {
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

// ── NAVIGATE DATE ─────────────────────────────────────────
function kpiPrevDay() {
    _kpiDate.setDate(_kpiDate.getDate() - 1);
    renderKpi();
}
function kpiNextDay() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (_kpiDate >= tomorrow) return;
    _kpiDate.setDate(_kpiDate.getDate() + 1);
    renderKpi();
}

// ── MODAL CHI TIẾT HÓA ĐƠN KPI ───────────────────────────
function _ensureKpiModal() {
    if (document.getElementById("kpiInvoiceModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
        <div id="kpiInvoiceOverlay" onclick="closeKpiInvoiceModal()" style="
            display:none;position:fixed;inset:0;
            background:rgba(0,0,0,.45);z-index:9000"></div>
        <div id="kpiInvoiceModal" style="
            display:none;position:fixed;top:50%;left:50%;
            transform:translate(-50%,-50%);
            background:#fff;border-radius:18px;
            box-shadow:0 8px 40px rgba(0,0,0,.18);
            width:min(520px,94vw);max-height:82vh;
            overflow-y:auto;z-index:9001;padding:28px 24px 20px">
          <button onclick="closeKpiInvoiceModal()" style="
              position:absolute;top:14px;right:18px;background:none;border:none;
              font-size:1.3rem;cursor:pointer;color:#aaa">✕</button>
          <div id="kpiInvoiceContent"></div>
          <div style="text-align:right;margin-top:18px">
            <button onclick="closeKpiInvoiceModal()" style="
                background:#0d9488;color:#fff;border:none;
                padding:9px 24px;border-radius:10px;
                font-size:.9rem;font-weight:700;cursor:pointer">Đóng</button>
          </div>
        </div>
    `);
}

window.closeKpiInvoiceModal = function () {
    const m = document.getElementById("kpiInvoiceModal");
    const o = document.getElementById("kpiInvoiceOverlay");
    if (m) m.style.display = "none";
    if (o) o.style.display = "none";
};

/**
 * Mở modal chi tiết hóa đơn.
 * @param {number} idx — index trong _kpiOrders
 */
window.openKpiOrderDetail = async function (idx) {
    _ensureKpiModal();
    const order = _kpiOrders[idx];
    if (!order) return;

    const maHD = order.maHoaDon;
    const content = document.getElementById("kpiInvoiceContent");

    // Hiện modal với loading trước
    document.getElementById("kpiInvoiceOverlay").style.display = "block";
    document.getElementById("kpiInvoiceModal").style.display   = "block";
    content.innerHTML = `<div style="text-align:center;padding:30px;color:#888">
        <div style="font-size:2rem;margin-bottom:8px">⏳</div>Đang tải chi tiết...
    </div>`;

    // Fetch chi tiết nếu chưa có (hoặc rỗng)
    let details = _kpiDetailMap[maHD];
    if (!details || details.length === 0) {
        try {
            details = await apiFetch(`/chitiethoadon/${maHD}`);
            _kpiDetailMap[maHD] = Array.isArray(details) ? details : [];
        } catch (_) {
            _kpiDetailMap[maHD] = [];
        }
        details = _kpiDetailMap[maHD];
    }

    // Build nội dung
    const ngay  = _getOrderDate(order) || "";
    const total = order.thanhTien || 0;

    const rows = details.length > 0
        ? details.map(t => {
            const tenVe  = t.tenVe || t.ten || ("Vé #" + (
                // ChiTietHoaDonID là embedded: có thể serialize thành { maHoaDon, maVe }
                (t.id && t.id.maVe) || t.maVe || "?"
            ));
            const loai   = t.loaiVe || t.loai || "";
            const don    = t.donGia  || 0;
            const sl     = t.soLuong || 1;
            return `
            <tr>
                <td style="padding:9px 10px">
                    <div style="font-weight:600;color:#111">${escHtml(String(tenVe))}</div>
                    ${loai ? `<div style="font-size:.76rem;color:#888;margin-top:2px">${escHtml(loai)}</div>` : ""}
                </td>
                <td style="padding:9px 10px;text-align:center">
                    <span style="background:#dbeafe;color:#1d4ed8;padding:3px 10px;
                                 border-radius:20px;font-weight:700;font-size:.82rem">${sl}</span>
                </td>
                <td style="padding:9px 10px;text-align:right;color:#555">${_fmt(don)}</td>
                <td style="padding:9px 10px;text-align:right;font-weight:700;color:#0d9488">
                    ${_fmt(don * sl)}
                </td>
            </tr>`;
        }).join("")
        : `<tr><td colspan="4" style="padding:20px;text-align:center;color:#aaa;font-size:.88rem">
               Không tìm thấy chi tiết vé 🗂️
           </td></tr>`;

    content.innerHTML = `
        <div style="text-align:center;margin-bottom:20px">
            <div style="font-size:2.2rem">🧾</div>
            <h2 style="margin:6px 0 4px;font-size:1.2rem;color:#111">
                Chi tiết hóa đơn #${maHD}
            </h2>
            <p style="color:#888;font-size:.82rem;margin:0">
                📅 ${ngay} &nbsp;·&nbsp;
                <span style="color:${order.trangThai === 'DA_HUY' ? '#dc2626' : '#16a34a'};font-weight:700">
                    ${order.trangThai === "DA_HUY" ? "❌ Đã huỷ" : "✅ Đã thanh toán"}
                </span>
            </p>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:.87rem">
            <thead>
                <tr style="background:#f3f4f6;color:#374151">
                    <th style="padding:9px 10px;text-align:left">Loại vé</th>
                    <th style="padding:9px 10px;text-align:center">SL</th>
                    <th style="padding:9px 10px;text-align:right">Đơn giá</th>
                    <th style="padding:9px 10px;text-align:right">Thành tiền</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
                <tr style="border-top:2px solid #e5e7eb">
                    <td colspan="3" style="padding:10px;text-align:right;font-weight:700">Tổng cộng</td>
                    <td style="padding:10px;text-align:right;font-weight:800;
                               color:#0d9488;font-size:1.05rem">${_fmt(total)}</td>
                </tr>
            </tfoot>
        </table>`;
};

// ── RENDER ────────────────────────────────────────────────
function renderKpi() {
    const root    = document.getElementById("kpiRoot");
    const today   = _toDateStr(_kpiDate);
    const grouped = _groupByDay(_kpiOrders);

    // Dữ liệu ngày đang xem
    const dayOrders   = grouped[today] || [];
    const dayTickets  = _countTickets(dayOrders);
    const dayRevenue  = _sumRevenue(dayOrders);
    const dayInvoices = dayOrders.length;

    // Dữ liệu tháng
    const monthKey    = today.slice(0, 7); // "2026-05"
    const monthOrders = _kpiOrders.filter(o => {
        const d = _getOrderDate(o);
        return d && d.startsWith(monthKey);
    });
    const monthTickets = _countTickets(monthOrders);
    const monthRevenue = _sumRevenue(monthOrders);

    // Tổng tất cả
    const totalTickets = _countTickets(_kpiOrders);
    const totalRevenue = _sumRevenue(_kpiOrders);

    // 7 ngày cho biểu đồ
    const days7    = _last7Days(_kpiDate);
    const maxCount = Math.max(...days7.map(d => _countTickets(grouped[d] || [])), 1);

    const barColors = [
        "#0d9488","#0891b2","#7c3aed","#d97706","#dc2626","#16a34a","#0d9488"
    ];

    const isToday      = today === _toDateStr(new Date());
    const nextDisabled = isToday ? 'disabled style="opacity:.4;cursor:not-allowed"' : '';

    root.innerHTML = `
    <div class="kpi-wrapper">

      <!-- Header + điều hướng ngày -->
      <div class="kpi-header">
        <div class="kpi-title">📊 Báo cáo KPI nhân viên</div>
        <div class="kpi-date-nav">
          <button onclick="kpiPrevDay()">◀</button>
          <span>${_navDateLabel(_kpiDate)}${isToday ? " (hôm nay)" : ""}</span>
          <button onclick="kpiNextDay()" ${nextDisabled}>▶</button>
        </div>
      </div>

      <!-- Cards -->
      <div class="kpi-cards">
        <div class="kpi-card">
          <div class="kpi-card-icon">🎫</div>
          <div class="kpi-card-val">${dayTickets}</div>
          <div class="kpi-card-label">Vé bán trong ngày</div>
          <div class="kpi-card-sub">${dayInvoices} hóa đơn</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-icon">💰</div>
          <div class="kpi-card-val" style="font-size:1.2rem">${_fmt(dayRevenue)}</div>
          <div class="kpi-card-label">Doanh thu trong ngày</div>
          <div class="kpi-card-sub">&nbsp;</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-icon">📅</div>
          <div class="kpi-card-val">${monthTickets}</div>
          <div class="kpi-card-label">Vé bán tháng ${monthKey.slice(5)}</div>
          <div class="kpi-card-sub">${_fmt(monthRevenue)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-icon">🏆</div>
          <div class="kpi-card-val">${totalTickets}</div>
          <div class="kpi-card-label">Tổng vé đã bán</div>
          <div class="kpi-card-sub">${_fmt(totalRevenue)}</div>
        </div>
      </div>

      <!-- Biểu đồ 7 ngày -->
      <div class="kpi-chart-wrap">
        <div class="kpi-section-title">📈 7 ngày gần nhất (số vé bán)</div>
        ${days7.map((d, i) => {
            const cnt  = _countTickets(grouped[d] || []);
            const pct  = Math.round(cnt / maxCount * 100);
            const isSel = d === today;
            return `
            <div class="kpi-bar-row">
              <div class="kpi-bar-label" style="${isSel ? "color:#0d9488;font-weight:800" : ""}">
                ${_dayLabel(d)}
              </div>
              <div class="kpi-bar-track">
                <div class="kpi-bar-fill"
                     style="width:${pct}%;background:${isSel ? "#0d9488" : barColors[i]}">
                </div>
              </div>
              <div class="kpi-bar-count" style="${isSel ? "color:#0d9488;font-weight:800" : ""}">
                ${cnt}
              </div>
            </div>`;
        }).join("")}
      </div>

      <!-- Bảng hóa đơn trong ngày -->
      <div class="kpi-table-wrap">
        <div class="kpi-section-title">
          🧾 Hóa đơn ngày ${_navDateLabel(_kpiDate)}
        </div>
        ${dayOrders.length === 0
          ? `<div class="kpi-empty">Không có hóa đơn nào trong ngày này 🗂️</div>`
          : `<table class="kpi-table">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th style="text-align:center">Số vé</th>
                  <th style="text-align:right">Doanh thu</th>
                  <th style="text-align:center">Trạng thái</th>
                  <th style="text-align:center">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                ${dayOrders.map((o, localIdx) => {
                    const globalIdx = _kpiOrders.indexOf(o);
                    const cnt  = _countTickets([o]);
                    const rev  = _sumRevenue([o]);
                    const maHD = o.maHoaDon || "—";
                    const status = o.trangThai;
                    const statusBadge = status === "DA_HUY"
                        ? `<span class="kpi-badge" style="background:#fee2e2;color:#dc2626">❌ Đã huỷ</span>`
                        : `<span class="kpi-badge green">✅ Hoàn thành</span>`;
                    return `
                    <tr>
                        <td style="font-size:.82rem;color:#888;font-weight:600">#${maHD}</td>
                        <td style="text-align:center">
                            <span class="kpi-badge blue">${cnt} vé</span>
                        </td>
                        <td style="text-align:right;font-weight:700;color:#0d9488">
                            ${_fmt(rev)}
                        </td>
                        <td style="text-align:center">${statusBadge}</td>
                        <td style="text-align:center">
                            <button
                                onclick="openKpiOrderDetail(${globalIdx})"
                                style="background:#f0fdfa;color:#0d9488;
                                       border:1.5px solid #0d9488;
                                       padding:4px 14px;border-radius:8px;
                                       font-size:.8rem;font-weight:700;
                                       cursor:pointer;white-space:nowrap;
                                       transition:background .15s"
                                onmouseover="this.style.background='#ccfbf1'"
                                onmouseout="this.style.background='#f0fdfa'"
                            >🔍 Xem</button>
                        </td>
                    </tr>`;
                }).join("")}
              </tbody>
             </table>`}
      </div>

    </div>`;
}