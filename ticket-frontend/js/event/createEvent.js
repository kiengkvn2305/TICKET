/* ==========================================================
   js/event/createEvent.js
   ========================================================== */

window.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    // ── Hiện thông tin nhà tổ chức ────────────────────────────────────────────
    fetch(`${BASE_URL}/nhatochuc/taikhoan/${currentUser.maTaiKhoan}`)
        .then(r => r.ok ? r.json() : null)
        .then(org => {
            const nameEl = document.getElementById("orgName");
            const metaEl = document.getElementById("orgMeta");
            if (!org || !nameEl) return;
            nameEl.textContent = org.tenCongTy || "Chưa đặt tên công ty";
            const parts = [];
            if (org.tenNguoiDaiDien) parts.push("👤 " + org.tenNguoiDaiDien);
            if (org.email)           parts.push("✉️ " + org.email);
            if (org.soDienThoai)     parts.push("📞 " + org.soDienThoai);
            if (metaEl) metaEl.textContent = parts.join("  ·  ");
        })
        .catch(() => {
            const nameEl = document.getElementById("orgName");
            if (nameEl) nameEl.textContent = "Không lấy được thông tin nhà tổ chức";
        });

    // Set min date = hôm nay
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("thoiGianBatDau").min = today;
    document.getElementById("thoiGianKetThuc").min = today;
    document.getElementById("thoiGianBatDau").addEventListener("change", () => {
        document.getElementById("thoiGianKetThuc").min = document.getElementById("thoiGianBatDau").value;
    });
});

async function handleCreateEvent() {
    const btn = document.querySelector("button.create-btn");
    if (btn.disabled) return;

    const tenSuKien       = document.getElementById("tenSuKien").value.trim();
    const diaDiem         = document.getElementById("diaDiem")?.value.trim() || "";
    const moTa            = document.getElementById("moTa").value.trim();
    const thoiGianBatDau  = document.getElementById("thoiGianBatDau").value;
    const thoiGianKetThuc = document.getElementById("thoiGianKetThuc").value;

    const msgBox = document.getElementById("msgBox");

    if (!tenSuKien || !thoiGianBatDau || !thoiGianKetThuc) {
        showMsg("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc.", "err");
        return;
    }
    if (thoiGianKetThuc < thoiGianBatDau) {
        showMsg("⚠️ Ngày kết thúc phải sau ngày bắt đầu.", "err");
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    btn.disabled = true;
    btn.textContent = "Đang tạo...";

    try {
        const response = await fetch(`${BASE_URL}/sukien`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tenSuKien,
                moTa: diaDiem ? `[${diaDiem}] ${moTa}` : moTa,
                thoiGianBatDau,
                thoiGianKetThuc,
                maTaiKhoan: currentUser.maTaiKhoan
            })
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || "Tạo sự kiện thất bại");
        }

        showMsg("✅ Tạo sự kiện thành công! Đang chuyển hướng...", "ok");
        setTimeout(() => window.location.href = "loginCreator.html", 1200);

    } catch (error) {
        showMsg("❌ " + error.message, "err");
        btn.disabled = false;
        btn.textContent = "Tạo sự kiện";
    }
}

function showMsg(text, type) {
    const el = document.getElementById("msgBox");
    if (!el) return;
    el.textContent = text;
    el.style.color  = type === "ok" ? "#0d9488" : "#dc2626";
    el.style.fontWeight = "600";
}

function goBack() {
    window.location.href = "loginCreator.html";
}