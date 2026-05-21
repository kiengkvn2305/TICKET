/* ==========================================================
   js/customer/myTicketsView.js  (View)
   Render tab "Vé của tôi" — danh sách hoá đơn + filter.
   Phụ thuộc: common/helpers.js
   ========================================================== */

const MyTicketsView = {
    showLoading() {
        document.getElementById("myTicketsList").innerHTML =
            `<div class="loading-state"><div class="spinner"></div><p>Đang tải...</p></div>`;
    },

    showError(msg) {
        document.getElementById("myTicketsList").innerHTML = errorState(msg);
    },

    render(allMyTickets, activeFilter, onFilter, onHoanVe) {
        const container = document.getElementById("myTicketsList");

        const counts = {
            all:      allMyTickets.length,
            normal:   allMyTickets.filter(v => !v.trangThaiHoan).length,
            pending:  allMyTickets.filter(v => v.trangThaiHoan === "pending").length,
            approved: allMyTickets.filter(v => v.trangThaiHoan === "approved").length,
            rejected: allMyTickets.filter(v => v.trangThaiHoan === "rejected").length,
        };

        const filterBar = `<div class="my-filter-bar">${[
            { key: "all",      label: "🎫 Tất cả",          cnt: counts.all },
            { key: "normal",   label: "✅ Đã thanh toán",   cnt: counts.normal },
            { key: "pending",  label: "⏳ Đang chờ hoàn",   cnt: counts.pending },
            { key: "approved", label: "💚 Hoàn thành công", cnt: counts.approved },
            { key: "rejected", label: "❌ Hoàn thất bại",   cnt: counts.rejected },
        ].map(t => `<button class="my-filter-btn ${activeFilter === t.key ? "active" : ""}"
            data-filter="${t.key}" onclick="${onFilter}('${t.key}')">
            ${t.label}${t.cnt > 0 ? ` <span class="filter-count">${t.cnt}</span>` : ""}
        </button>`).join("")}</div>`;

        let filtered = allMyTickets;
        if (activeFilter !== "all") {
            filtered = allMyTickets.filter(v =>
                activeFilter === "normal" ? !v.trangThaiHoan : v.trangThaiHoan === activeFilter
            );
        }

        if (!filtered.length) {
            container.innerHTML = filterBar + emptyState(
                "🎫",
                activeFilter === "all" ? "Bạn chưa có vé nào." : "Không có vé trong mục này."
            );
            return;
        }

        // Gom theo hoá đơn
        const groups = new Map();
        filtered.forEach(ve => {
            if (!groups.has(ve.maHoaDon)) {
                groups.set(ve.maHoaDon, {
                    maHoaDon: ve.maHoaDon, ngayMua: ve.ngayMua, tenSuKien: ve.tenSuKien, thoiGianBatDau: ve.thoiGianBatDau, thoiGianKetThuc: ve.thoiGianKetThuc,
                    thanhTien: ve.thanhTien, thanhTienGoc: ve.thanhTienGoc, tickets: [],
                });
            }
            groups.get(ve.maHoaDon).tickets.push(ve);
        });

        const blocksHtml = [...groups.values()].map((g, idx) => {
            const hasPending  = g.tickets.some(v => v.trangThaiHoan === "pending");
            const hasRejected = g.tickets.some(v => v.trangThaiHoan === "rejected");
            const hasApproved = g.tickets.some(v => v.trangThaiHoan === "approved");
            const hasNormal   = g.tickets.some(v => !v.trangThaiHoan);

            const hdBadge = hasPending  ? `<span class="hd-badge badge-pending">⏳ Có yêu cầu đang chờ</span>`
                          : hasRejected ? `<span class="hd-badge badge-rejected">❌ Có hoàn bị từ chối</span>`
                          : hasApproved && !hasNormal ? `<span class="hd-badge badge-approved">💚 Đã hoàn thành công</span>`
                          : hasApproved ? `<span class="hd-badge badge-approved">💚 Một phần đã hoàn</span>`
                          : `<span class="hd-badge badge-paid">✅ Đã thanh toán</span>`;

            const showDiscount = g.thanhTienGoc && g.thanhTien && g.thanhTien < g.thanhTienGoc;
            const priceHtml = showDiscount
                ? `<span class="hd-price-old">${formatPrice(g.thanhTienGoc)}</span><span class="hd-price-new">${formatPrice(g.thanhTien)}</span>`
                : `<span class="hd-price-new">${formatPrice(g.thanhTien || 0)}</span>`;

            const rows = g.tickets.map(ve => `
                <div class="ticket-line ${ve.trangThaiHoan ? "ticket-line-hoan" : ""}">
                    <div class="ticket-line-left">
                        <span class="ticket-line-icon">🎟️</span>
                        <div class="ticket-line-info">
                            <div class="ticket-line-name">${escHtml(ve.tenVe || "—")}</div>
                            <div class="ticket-line-meta">${escHtml(ve.loaiVe || "—")} · SL: <strong>${ve.soLuong}</strong> · ${formatPrice(ve.gia)}/vé</div>
                        </div>
                    </div>
                    <div class="ticket-line-right">
                        <div class="ticket-line-subtotal">${formatPrice(ve.gia * ve.soLuong)}</div>
                        ${this._buildHoanSection(ve, onHoanVe)}
                    </div>
                </div>`).join("");

            const groupJson = encodeURIComponent(JSON.stringify(g));
            return `<div class="hoadon-block" style="animation-delay:${idx * 0.07}s;cursor:pointer" onclick="window.openHoaDonDetail(JSON.parse(decodeURIComponent('${groupJson}')))">
                <div class="hoadon-header">
                    <div class="hoadon-header-left">
                        <span class="hoadon-num">Hóa đơn #${g.maHoaDon}</span>
                        <span class="hoadon-date">📅 ${formatDate(g.ngayMua)}</span>
                        <span class="hoadon-event">📍 ${escHtml(g.tenSuKien || "—")}</span>
                    </div>
                    <div class="hoadon-header-right">${hdBadge}<div class="hoadon-total">${priceHtml}</div>${!hasNormal ? "" : `<button class="export-ticket-btn" onclick="event.stopPropagation();exportTickets(JSON.parse(decodeURIComponent('${groupJson}')))">🖨️ Xuất vé</button>`}</div>
                </div>
                <div class="ticket-lines">${rows}</div>
            </div>`;
        }).join("");

        container.innerHTML = filterBar + blocksHtml;
        this._injectCSS();
    },

    _buildHoanSection(ve, onHoanVe) {
        if (ve.trangThaiHoan === "approved") return `<span class="hoan-badge hoan-approved">💚 Đã hoàn</span>`;
        if (ve.trangThaiHoan === "pending")  return `<span class="hoan-badge hoan-pending">⏳ Chờ duyệt</span>`;
        if (ve.trangThaiHoan === "rejected") return `
            <span class="hoan-badge hoan-rejected">❌ Bị từ chối</span>
            <button class="hoan-ve-btn" style="margin-top:6px"
                onclick="event.stopPropagation();${onHoanVe}(${ve.maVe},${ve.maHoaDon},${ve.soLuong},'${escHtml(ve.tenVe || "")}')">🔄 Gửi lại</button>`;
        return `<button class="hoan-ve-btn"
            onclick="event.stopPropagation();${onHoanVe}(${ve.maVe},${ve.maHoaDon},${ve.soLuong},'${escHtml(ve.tenVe || "")}')">🔄 Hoàn vé</button>`;
    },

    _injectCSS() {
        if (document.getElementById("my-ticket-style")) return;
        const s = document.createElement("style");
        s.id = "my-ticket-style";
        s.textContent = `
        .my-filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
        .my-filter-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;border:1.5px solid #e0e0e0;background:#f8f9fb;font-size:.83rem;font-weight:600;color:#666;cursor:pointer;font-family:'Inter',sans-serif;transition:.18s}
        .my-filter-btn:hover{border-color:#0d9488;color:#0d9488}
        .my-filter-btn.active{background:#0d9488;border-color:#0d9488;color:#fff}
        .filter-count{background:rgba(0,0,0,.12);font-size:.75rem;font-weight:700;padding:1px 7px;border-radius:20px;min-width:20px;text-align:center}
        .my-filter-btn.active .filter-count{background:rgba(255,255,255,.25)}
        .hoadon-block{background:#fff;border-radius:18px;box-shadow:0 2px 12px rgba(0,0,0,.07);overflow:hidden;margin-bottom:18px;animation:fadeUp .4s ease both}
        .hoadon-header{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;flex-wrap:wrap;gap:10px;border-bottom:1px solid #f0f0f0;background:#fafafa}
        .hoadon-header-left{display:flex;flex-direction:column;gap:4px}
        .hoadon-num{font-size:1rem;font-weight:800;color:#1a1a2e;font-family:'Inter',sans-serif}
        .hoadon-date,.hoadon-event{font-size:.82rem;color:#888;font-family:'Inter',sans-serif}
        .hoadon-event{color:#555;font-weight:600}
        .hoadon-header-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
        .hoadon-total{display:flex;align-items:baseline;gap:8px}
        .hd-price-old{font-size:.82rem;color:#bbb;text-decoration:line-through;font-family:'Inter',sans-serif}
        .hd-price-new{font-size:1.15rem;font-weight:800;color:#0d9488;font-family:'Inter',sans-serif}
        .hd-badge{font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px;font-family:'Inter',sans-serif}
        .badge-paid{background:#dcfce7;color:#15803d}.badge-pending{background:#fef3c7;color:#92400e}
        .badge-rejected{background:#fee2e2;color:#991b1b}.badge-approved{background:#d1fae5;color:#065f46}
        .ticket-lines{padding:0 22px 6px}
        .ticket-line{display:flex;align-items:flex-start;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f5f5f5;gap:12px;flex-wrap:wrap}
        .ticket-line:last-child{border-bottom:none}
        .ticket-line-hoan{background:#fffbf0;border-radius:10px;padding:14px 12px;margin:4px -12px}
        .ticket-line-left{display:flex;align-items:flex-start;gap:12px;flex:1}
        .ticket-line-icon{font-size:1.5rem;min-width:28px}
        .ticket-line-name{font-size:.95rem;font-weight:700;color:#1a1a2e;font-family:'Inter',sans-serif;margin-bottom:3px}
        .ticket-line-meta{font-size:.8rem;color:#888;font-family:'Inter',sans-serif}
        .ticket-line-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;min-width:120px}
        .ticket-line-subtotal{font-size:1rem;font-weight:700;color:#1a1a2e;font-family:'Inter',sans-serif}
        .hoan-badge{font-size:.75rem;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;font-family:'Inter',sans-serif}
        .hoan-approved{background:#d1fae5;color:#065f46}.hoan-pending{background:#fef3c7;color:#92400e}.hoan-rejected{background:#fee2e2;color:#991b1b}
        .card-organizer{margin-bottom:6px;min-height:18px}
        .export-ticket-btn{background:#0d9488;color:#fff;border:none;border-radius:12px;padding:6px 14px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:.18s;white-space:nowrap}
        .export-ticket-btn:hover{background:#0f766e}`;
        document.head.appendChild(s);
    },
};