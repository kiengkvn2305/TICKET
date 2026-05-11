function openPopup() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popup").style.display = "block";
}

function closePopup() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popup").style.display = "none";
}

function register(){
  window.location.href = "registerPopup.html";
}

function forget(){
  window.location.href = "forgetPassword.html";
}

function cancelRF(){
  window.location.href = "loginPopup.html";
}

function acceptRegister() {

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const role = document.querySelector('input[name="role"]:checked');

  // kiểm tra rỗng
  if (username === "" || password === "" || role === null) {
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  const roleValue = role.value;
  // gọi API đăng ký
  fetch("http://localhost:8080/api/taikhoan", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
        tenTaiKhoan: username,
        matKhau: password,
        loaiTaiKhoan: roleValue
    })

  })

  .then(async response => {

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      return JSON.parse(message);

  })


  .then(data => {

    console.log(data);

    alert("Đăng ký thành công");

    // chuyển về login
    window.location.href = "loginPopup.html";

  })

  .catch(error => {

    console.error(error);

    alert(error.message);

  });

}

function toggleMenu(event) {
  event.stopPropagation();

  const menu = document.getElementById("menu");

  if (!menu) {
    console.error("Không tìm thấy #menu");
    return;
  }

  menu.classList.toggle("show");
}

window.addEventListener("click", function(event) {
  if (!event.target.closest(".dropdown")) {
    const menu = document.getElementById("menu");

    if (menu) {
      menu.classList.remove("show");
    }
  }
});


function logout() {
    window.parent.location.href = "index.html";
}


function login() {

  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value.trim();

  if (username === "" || password === "") {
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  fetch("http://localhost:8080/api/taikhoan/login", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      tenTaiKhoan: username,
      matKhau: password
    })

  })

  .then(response => {

    if (!response.ok) {
      throw new Error("Sai tài khoản hoặc mật khẩu");
    }

    return response.json();
  })

  .then(data => {
    console.log("DATA:", data);
    console.log("ROLE:", data.loaiTaiKhoan);
    console.log(data);

    alert("Đăng nhập thành công");

    // kiểm tra role
    if (data.loaiTaiKhoan === "customer") {

      window.parent.location.href = "loginCustomer.html";

    }

    else if (data.loaiTaiKhoan === "creator") {

      window.parent.location.href = "loginCreator.html";

    }

    else if (data.loaiTaiKhoan === "admin") {

      window.parent.location.href = "loginAdmin.html";

    }
    else {

      alert("Không xác định loại tài khoản");

    }

  })

  .catch(error => {

    console.error(error);

    alert(error.message);

  });

}

function cancelLogin() {
  parent.closePopup();
}
