const user = JSON.parse(localStorage.getItem("user"));

window.addEventListener("DOMContentLoaded", () => {
    if (!user) {
        window.location.href = "loginpopup.html";
        return;
    }

    // ==============================
    // HIỂN THỊ SECTION THEO ROLE
    // ==============================
    if (user.loaiTaiKhoan === "Khách hàng") {
        document.getElementById("section-customer").classList.remove("hidden");
        document.getElementById("loaiTK").textContent = "Khách hàng";
    } else if (user.loaiTaiKhoan === "Nhà tổ chức") {
        document.getElementById("section-creator").classList.remove("hidden");
        document.getElementById("loaiTK").textContent = "Nhà tổ chức sự kiện";
    } else if (user.loaiTaiKhoan === "Nhân viên") {
        document.getElementById("section-employee").classList.remove("hidden");
        document.getElementById("loaiTK").textContent = "Nhân viên";
    }

    // ==============================
    // LOAD HỒ SƠ
    // ==============================
    fetch(`${BASE_URL}/taikhoan/${user.maTaiKhoan}/ho-so`)
        .then(res => {
            if (!res.ok) throw new Error("Không lấy được hồ sơ");
            return res.json();
        })
        .then(data => {
            document.getElementById("tenDangNhap").value = data.tenDangNhap || "";

            if (user.loaiTaiKhoan === "Khách hàng") {
                document.getElementById("tenKhachHang").value  = data.tenKhachHang || "";
                document.getElementById("email-customer").value = data.email || "";
                document.getElementById("sdt-customer").value   = data.soDienThoai || "";
            }
            else if (user.loaiTaiKhoan === "Nhà tổ chức") {
                document.getElementById("tenCongTy").value        = data.tenCongTy || "";
                document.getElementById("tenNguoiDaiDien").value  = data.tenNguoiDaiDien || "";
                document.getElementById("diaChi").value           = data.diaChi || "";
                document.getElementById("email-creator").value    = data.email || "";
                document.getElementById("sdt-creator").value      = data.soDienThoai || "";

                // ✅ Hiển thị ảnh QR nếu đã có
                if (data.maQR) {
                    const preview = document.getElementById("qr-preview");
                    if (preview) {
                        preview.src = data.maQR;
                        preview.style.display = "block";
                    }
                }
            }
            else if (user.loaiTaiKhoan === "Nhân viên") {
                document.getElementById("tenNhanVien").value    = data.tenNhanVien || "";
                document.getElementById("ngayVaoLam").value     = data.ngayVaoLam || "";
                document.getElementById("email-employee").value = data.email || "";
                document.getElementById("sdt-employee").value   = data.soDienThoai || "";
            }
        })
        .catch(err => showMsg(err.message, "err"));
});


// ======================================
// PREVIEW ẢNH KHI CHỌN FILE
// ======================================
function previewQR(input) {
    const file = input.files[0];
    if (!file) return;

    const preview = document.getElementById("qr-preview");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
}


// ======================================
// LƯU HỒ SƠ
// ======================================
async function luuHoSo() {
    if (!user) {
        window.location.href = "loginpopup.html";
        return;
    }

    const btn = document.querySelector(".btn-primary");
    btn.disabled = true;
    btn.textContent = "Đang lưu...";

    try {
        let body = {};

        if (user.loaiTaiKhoan === "Khách hàng") {
            body = {
                tenKhachHang: document.getElementById("tenKhachHang").value.trim(),
                email:        document.getElementById("email-customer").value.trim(),
                soDienThoai:  document.getElementById("sdt-customer").value.trim()
            };
        }
        else if (user.loaiTaiKhoan === "Nhà tổ chức") {
            // ✅ Upload ảnh QR trước nếu có chọn file mới
            let maQR = null;
            const fileInput = document.getElementById("qr-file");
            if (fileInput && fileInput.files[0]) {
                const formData = new FormData();
                formData.append("file", fileInput.files[0]);

                const uploadRes = await fetch(`${BASE_URL}/upload/qr`, {
                    method: "POST",
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Upload ảnh thất bại");
                const uploadData = await uploadRes.json();
                maQR = uploadData.path;
            }

            body = {
                tenCongTy:       document.getElementById("tenCongTy").value.trim(),
                tenNguoiDaiDien: document.getElementById("tenNguoiDaiDien").value.trim(),
                diaChi:          document.getElementById("diaChi").value.trim(),
                email:           document.getElementById("email-creator").value.trim(),
                soDienThoai:     document.getElementById("sdt-creator").value.trim(),
                ...(maQR && { maQR }) // chỉ gửi nếu có upload ảnh mới
            };
        }
        else if (user.loaiTaiKhoan === "Nhân viên") {
            body = {
                tenNhanVien: document.getElementById("tenNhanVien").value.trim(),
                ngayVaoLam:  document.getElementById("ngayVaoLam").value.trim(),
                email:       document.getElementById("email-employee").value.trim(),
                soDienThoai: document.getElementById("sdt-employee").value.trim()
            };
        }

        const res = await fetch(`${BASE_URL}/taikhoan/${user.maTaiKhoan}/ho-so`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
        }

        showMsg("Lưu hồ sơ thành công!", "ok");

    } catch (err) {
        showMsg(err.message, "err");
    } finally {
        btn.disabled = false;
        btn.textContent = "Lưu thay đổi";
    }
}


// ======================================
// HIỂN THỊ MESSAGE
// ======================================
function showMsg(text, type) {
    const msg = document.getElementById("msg");
    msg.textContent = text;
    msg.className = "msg " + type;
}


// ======================================
// QUAY LẠI
// ======================================
function goBack() {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    const dest = {
        "Khách hàng":  "loginCustomer.html",
        "Nhà tổ chức": "loginCreator.html",
        "Nhân viên":   "loginEmployee.html"
    };
    window.location.href = dest[user.loaiTaiKhoan] || "index.html";
}