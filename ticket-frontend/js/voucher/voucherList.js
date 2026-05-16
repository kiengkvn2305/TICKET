let allVouchers = [];

function loadVouchers() {

    clearContent();

    const voucherList = document.getElementById("voucherList");

    voucherList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateVoucher()">Tạo khuyến mãi</button>
        </div>
        <div class="filter-panel">
            <input type="text" id="filterMaCode" placeholder="Tìm theo mã voucher..." oninput="applyVoucherFilter()" />
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
    const maCode   = document.getElementById("filterMaCode").value.trim().toLowerCase();
    const filtered = allVouchers.filter(v =>
        v.maCode.toLowerCase().includes(maCode)
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

    let html = "";
    data.forEach(voucher => {
        html += `
            <div class="event-card">
                <h2>${voucher.maCode}</h2>
                <p>Điều kiện: ${voucher.dieuKien}</p>
                <p>Mức giảm: ${voucher.mucKhuyenMai}%</p>
                <p>Trạng thái: ${voucher.trangThai}</p>
                <p>Lượt sử dụng: ${voucher.luotSuDung}</p>
            </div>
        `;
    });

    container.innerHTML = html;
}