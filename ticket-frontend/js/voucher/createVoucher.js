/* =========================
   LOAD DANH SÁCH SỰ KIỆN VÀO SELECT
========================= */

window.addEventListener("DOMContentLoaded", function () {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginPopup.html";
        return;
    }

    fetch(`${BASE_URL}/sukien/creator/${currentUser.maTaiKhoan}`)

    .then(response => {
        if (!response.ok) throw new Error("Không lấy được sự kiện");
        return response.json();
    })

    .then(data => {
        const select = document.getElementById("maSuKien");
        data.forEach(sk => {
            select.innerHTML += `<option value="${sk.maSuKien}">${sk.tenSuKien}</option>`;
        });
    })

    .catch(error => {
        alert(error.message);
    });

});

/* =========================
   TẠO KHUYẾN MÃI
========================= */

function createVoucher() {

    const maCode       = document.getElementById("maCode") ? document.getElementById("maCode").value.trim() : "";
    const dieuKien     = document.getElementById("dieuKien") ? document.getElementById("dieuKien").value.trim() : "";
    const mucKhuyenMai = document.getElementById("mucKhuyenMai") ? document.getElementById("mucKhuyenMai").value : "";
    const trangThai    = document.getElementById("trangThai").value.trim();
    const maSuKien     = document.getElementById("maSuKien").value;

    if (trangThai === "" || maSuKien === "") {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    fetch(`${BASE_URL}/voucher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maCode, dieuKien, mucKhuyenMai, trangThai, maSuKien })
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
