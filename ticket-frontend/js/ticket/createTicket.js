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

function createTicket() {

    const tenVe    = document.getElementById("tenVe").value.trim();
    const loaiVe   = document.getElementById("loaiVe").value.trim();
    const gia      = document.getElementById("gia").value;
    const moTa     = document.getElementById("moTa").value.trim();
    const maSuKien = document.getElementById("maSuKien").value;

    if (tenVe === "" || loaiVe === "" || gia === "" || moTa === "" || maSuKien === "") {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (gia < 0) {
        alert("Giá vé không hợp lệ");
        return;
    }

    fetch(`${BASE_URL}/ve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tenVe, loaiVe, gia, moTa, maSuKien,
            trangThai: "available" // ✅ Set mặc định
        })
    })

    .then(async response => {
        const message = await response.text();
        if (!response.ok) throw new Error(message);
        return JSON.parse(message);
    })

    .then(() => {
        alert("Tạo vé thành công");
        window.location.href = "loginCreator.html";
    })

    .catch(error => {
        alert(error.message);
    });
}

function goBack() {
    window.location.href = "loginCreator.html";
}