function acceptRegister() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role     = document.querySelector('input[name="role"]:checked');

    if (username === "" || password === "" || role === null) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    fetch(`${BASE_URL}/taikhoan/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tenDangNhap:  username,
            matKhau:      password,
            loaiTaiKhoan: role.value
        })
    })

    .then(async response => {
        const message = await response.text();
        if (!response.ok) throw new Error(message);
        alert("Đăng ký thành công");
        window.location.href = "loginPopup.html";
    })

    .catch(error => {
        alert(error.message);
    });
}
