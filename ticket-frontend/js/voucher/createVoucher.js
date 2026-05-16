const currentUser = JSON.parse(localStorage.getItem("user"));

window.addEventListener("DOMContentLoaded", function () {
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }
});

function createVoucher() {

    const maCode       = document.getElementById("maCode").value.trim();
    const dieuKien     = document.getElementById("dieuKien").value.trim();
    const mucKhuyenMai = document.getElementById("mucKhuyenMai").value;
    const luotSuDung   = document.getElementById("luotSuDung").value;
    const ngayBatDau   = document.getElementById("ngayBatDau").value;
    const ngayKetThuc  = document.getElementById("ngayKetThuc").value;

    if (maCode === "" || mucKhuyenMai === "" || luotSuDung === ""
            || ngayBatDau === "" || ngayKetThuc === "") {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (ngayKetThuc < ngayBatDau) {
        alert("Ngày kết thúc phải sau ngày bắt đầu");
        return;
    }

    fetch(`${BASE_URL}/voucher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maCode,
            dieuKien,
            mucKhuyenMai,
            luotSuDung,
            ngayBatDau,
            ngayKetThuc,
            trangThai: "active",
            maTaiKhoan: currentUser.maTaiKhoan
        })
    })

    .then(async response => {
        const message = await response.text();
        if (!response.ok) throw new Error(message);
        return message;
    })

    .then(() => {
        alert("Tạo khuyến mãi thành công");
        window.location.href = "loginCreator.html";
    })

    .catch(error => {
        alert(error.message);
    });
}

function goBack() {
    window.location.href = "loginCreator.html";
}