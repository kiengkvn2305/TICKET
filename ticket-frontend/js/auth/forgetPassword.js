/* Hàm được gọi bởi forgetPassword.html: onclick="acceptForget()" */
function acceptForget() {

    const username = document.getElementById("username").value.trim();

    if (username === "") {
        alert("Vui lòng nhập tên đăng nhập");
        return;
    }

    fetch(`${BASE_URL}/taikhoan/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenDangNhap: username })
    })

    .then(async response => {
        const message = await response.text();
        if (!response.ok) throw new Error(message);
        return message;
    })

    .then(message => {
        alert(message);
        window.location.href = "loginPopup.html";
    })

    .catch(error => {
        alert(error.message);
    });
}
