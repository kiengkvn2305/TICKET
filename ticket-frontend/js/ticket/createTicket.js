/* ==========================================================
   js/ticket/createTicket.js
   ========================================================== */

window.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    // ── Load danh sách sự kiện của creator ────────────────────────────────────
    fetch(`${BASE_URL}/sukien/creator/${currentUser.maTaiKhoan}`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được sự kiện"); return r.json(); })
        .then(data => {
            const select = document.getElementById("maSuKien");
            if (!data.length) {
                select.innerHTML = `<option value="">-- Chưa có sự kiện nào --</option>`;
                showMsg("⚠️ Bạn chưa tạo sự kiện nào. Hãy tạo sự kiện trước.", "err");
                return;
            }
            // Chỉ cho tạo vé cho sự kiện chưa kết thúc
            const active = data.filter(sk => sk.trangThai !== "Đã tổ chức");
            if (!active.length) {
                select.innerHTML = `<option value="">-- Không có sự kiện hoạt động --</option>`;
                showMsg("⚠️ Tất cả sự kiện đã kết thúc. Không thể thêm vé.", "err");
                return;
            }
            active.forEach(sk => {
                select.innerHTML += `<option value="${sk.maSuKien}">${sk.tenSuKien} (${sk.trangThai})</option>`;
            });
        })
        .catch(err => showMsg("❌ " + err.message, "err"));
});

function onEventChange() {
    // Reset preview khi đổi sự kiện
    const preview = document.getElementById("stockPreview");
    if (preview) { preview.style.display = "none"; preview.textContent = ""; }
}

function previewStock() {
    const val     = parseInt(document.getElementById("soLuong").value);
    const preview = document.getElementById("stockPreview");
    if (!preview) return;
    if (!val || val <= 0) { preview.style.display = "none"; return; }
    preview.style.display = "block";
    preview.textContent   = `📦 Sẽ niêm yết ${val.toLocaleString("vi-VN")} vé cho loại vé này`;
}

function createTicket() {
    const tenVe    = document.getElementById("tenVe").value.trim();
    const loaiVe   = document.getElementById("loaiVe").value.trim();
    const gia      = parseFloat(document.getElementById("gia").value);
    const soLuong  = parseInt(document.getElementById("soLuong").value);
    const moTa     = document.getElementById("moTa").value.trim();
    const maSuKien = document.getElementById("maSuKien").value;

    if (!tenVe || !loaiVe || !maSuKien) {
        showMsg("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc.", "err"); return;
    }
    if (isNaN(gia) || gia < 0) {
        showMsg("⚠️ Giá vé không hợp lệ.", "err"); return;
    }
    if (!soLuong || soLuong < 1) {
        showMsg("⚠️ Số lượng niêm yết phải ít nhất là 1.", "err"); return;
    }

    const btn = document.querySelector("button.create-btn");
    btn.disabled = true; btn.textContent = "Đang tạo...";

    fetch(`${BASE_URL}/ve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenVe, loaiVe, gia, soLuong, moTa, maSuKien, trangThai: "Còn vé" })
    })
    .then(async res => {
        if (!res.ok) { const msg = await res.text(); throw new Error(msg); }
        return res.json();
    })
    .then(data => {
        showMsg(`✅ Tạo vé thành công! Đã niêm yết ${data.soLuong?.toLocaleString("vi-VN") || soLuong} vé. Đang chuyển hướng...`, "ok");
        setTimeout(() => window.location.href = "loginCreator.html", 1400);
    })
    .catch(err => {
        showMsg("❌ " + err.message, "err");
        btn.disabled = false; btn.textContent = "Tạo vé";
    });
}

function showMsg(text, type) {
    const el = document.getElementById("msgBox");
    if (!el) return;
    el.textContent = text;
    el.style.color = type === "ok" ? "#0d9488" : "#dc2626";
    el.style.fontWeight = "600";
}

function goBack() {
    window.location.href = "loginCreator.html";
}