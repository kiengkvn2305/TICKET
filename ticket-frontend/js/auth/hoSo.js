const user = JSON.parse(localStorage.getItem("user"));

window.addEventListener("DOMContentLoaded", () => {
    if (!user) { window.location.href = "loginpopup.html"; return; }

    // Hiện đúng section theo loại tài khoản
    if (user.loaiTaiKhoan === "customer") {
        document.getElementById("section-customer").classList.remove("hidden");
        document.getElementById("loaiTK").textContent = "Khách hàng";
    } else {
        document.getElementById("section-creator").classList.remove("hidden");
        document.getElementById("loaiTK").textContent = "Nhà tổ chức sự kiện";
    }

    // Load hồ sơ từ server
    fetch(`${BASE_URL}/taikhoan/${user.maTaiKhoan}/ho-so`)
    .then(res => {
        if (!res.ok) throw new Error("Không lấy được hồ sơ");
        return res.json();
    })
    .then(data => {
        document.getElementById("tenDangNhap").value = data.tenDangNhap || "";

        if (user.loaiTaiKhoan === "customer") {
            document.getElementById("tenKhachHang").value  = data.tenKhachHang  || "";
            document.getElementById("email-customer").value = data.email        || "";
            document.getElementById("sdt-customer").value   = data.soDienThoai  || "";
        } else {
            document.getElementById("tenCongTy").value       = data.tenCongTy       || "";
            document.getElementById("tenNguoiDaiDien").value = data.tenNguoiDaiDien || "";
            document.getElementById("diaChi").value          = data.diaChi          || "";
            document.getElementById("email-creator").value   = data.email           || "";
            document.getElementById("sdt-creator").value     = data.soDienThoai     || "";
        }
    })
    .catch(err => showMsg(err.message, "err"));
});

function luuHoSo() {
    if (!user) { window.location.href = "loginpopup.html"; return; }

    let body = {};

    if (user.loaiTaiKhoan === "customer") {
        body = {
            tenKhachHang: document.getElementById("tenKhachHang").value.trim(),
            email:        document.getElementById("email-customer").value.trim(),
            soDienThoai:  document.getElementById("sdt-customer").value.trim(),
        };
    } else {
        body = {
            tenCongTy:       document.getElementById("tenCongTy").value.trim(),
            tenNguoiDaiDien: document.getElementById("tenNguoiDaiDien").value.trim(),
            diaChi:          document.getElementById("diaChi").value.trim(),
            email:           document.getElementById("email-creator").value.trim(),
            soDienThoai:     document.getElementById("sdt-creator").value.trim(),
        };
    }

    const btn = document.querySelector(".btn-primary");
    btn.disabled = true;
    btn.textContent = "Đang lưu...";

    fetch(`${BASE_URL}/taikhoan/${user.maTaiKhoan}/ho-so`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t); });
        return res.json();
    })
    .then(() => {
        showMsg("Lưu hồ sơ thành công!", "ok");
    })
    .catch(err => showMsg(err.message, "err"))
    .finally(() => {
        btn.disabled = false;
        btn.textContent = "Lưu thay đổi";
    });
}

function showMsg(text, type) {
    const msg = document.getElementById("msg");
    msg.textContent = text;
    msg.className   = "msg " + type;
}

function goBack() {
    if (!user) { window.location.href = "index.html"; return; }
    const dest = { customer: "loginCustomer.html", creator: "loginCreator.html", admin: "loginAdmin.html" };
    window.location.href = dest[user.loaiTaiKhoan] || "index.html";
}