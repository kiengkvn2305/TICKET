let allVouchers = [];

function loadVouchers() {

    clearContent();

    const voucherList = document.getElementById("voucherList");

    voucherList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateVoucher()">Tạo khuyến mãi</button>
        </div>
        <div class="filter-panel">
            <input type="text" id="filterMaCode"    placeholder="Tìm theo mã voucher..."  oninput="applyVoucherFilter()" />
            <input type="text" id="filterTenSuKien" placeholder="Tìm theo sự kiện..."     oninput="applyVoucherFilter()" />
        </div>
        <div id="voucherContent"></div>
    `;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }

    fetch(`${BASE_URL}/voucher/creator/${currentUser.maTaiKhoan}`)

    .then(response => {
        if (!response.ok) throw new Error("Không lấy được khuyến mãi");
        return response.json();
    })

    .then(data => {
        allVouchers = data;
        renderVouchers(data);
    })

    .catch(error => {
        alert(error.message);
    });
}

function applyVoucherFilter() {
    const maCode    = document.getElementById("filterMaCode").value.trim().toLowerCase();
    const tenSuKien = document.getElementById("filterTenSuKien").value.trim().toLowerCase();

    const filtered = allVouchers.filter(v =>
        v.maCode.toLowerCase().includes(maCode) &&
        (v.tenSuKien || "").toLowerCase().includes(tenSuKien)
    );

    renderVouchers(filtered);
}

function renderVouchers(data) {

    const container = document.getElementById("voucherContent");
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = "<p>Không có khuyến mãi nào</p>";
        return;
    }

    // Group theo sự kiện — giống ticketList.js
    const grouped = {};
    data.forEach(v => {
        const key = v.maSuKien || "other";
        if (!grouped[key]) {
            grouped[key] = { tenSuKien: v.tenSuKien || "Chưa gán sự kiện", vouchers: [] };
        }
        grouped[key].vouchers.push(v);
    });

    let html = "";
    Object.values(grouped).forEach(group => {
        html += `<div class="event-group"><h2>Sự kiện: ${group.tenSuKien}</h2>`;
        group.vouchers.forEach(v => {
            html += `
                <div class="ticket-card">
                    <p><strong>Mã voucher: ${v.maCode}</strong></p>
                    <p>Điều kiện: ${v.dieuKien || "—"}</p>
                    <p>Mức giảm: ${v.mucKhuyenMai}%</p>
                    <p>Lượt sử dụng: ${v.luotSuDung}</p>
                    <p>Trạng thái: ${v.trangThai}</p>
                    <p>Từ: ${v.ngayBatDau} → ${v.ngayKetThuc}</p>
                    <div class="event-actions">
                        <button class="edit-btn"   onclick="editVoucher(${v.maVoucher})">Chỉnh sửa</button>
                        <button class="delete-btn" onclick="deleteVoucher(${v.maVoucher})">Xóa</button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    });

    container.innerHTML = html;
}

function editVoucher(maVoucher) {
    window.location.href = `editVoucher.html?id=${maVoucher}`;
}

function deleteVoucher(maVoucher) {

    if (!confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;

    fetch(`${BASE_URL}/voucher/${maVoucher}`, { method: "DELETE" })

    .then(response => {
        if (!response.ok) throw new Error("Xóa thất bại");
        alert("Xóa khuyến mãi thành công");
        loadVouchers();
    })

    .catch(error => {
        alert(error.message);
    });
}
