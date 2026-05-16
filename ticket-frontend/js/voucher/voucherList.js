function loadVouchers() {

    clearContent();

    const voucherList = document.getElementById("voucherList");

    voucherList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateVoucher()">Tạo khuyến mãi</button>
        </div>
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

        if (data.length === 0) {
            voucherList.innerHTML += "<p>Không có khuyến mãi nào</p>";
            return;
        }

        data.forEach(voucher => {
            voucherList.innerHTML += `
                <div class="event-card">
                    <h2>${voucher.maCode}</h2>
                    <p>Điều kiện: ${voucher.dieuKien}</p>
                    <p>Mức giảm: ${voucher.mucKhuyenMai}</p>
                    <p>Trạng thái: ${voucher.trangThai}</p>
                    <p>Lượt sử dụng: ${voucher.luotSuDung}</p>
                </div>
            `;
        });

    })

    .catch(error => {
        alert(error.message);
    });
}
