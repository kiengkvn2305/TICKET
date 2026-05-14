const params =
    new URLSearchParams(window.location.search);

const maSuKien =
    params.get("id");

/* =========================
   LOAD EVENT
========================= */

fetch(
    `http://localhost:8080/api/sukien/${maSuKien}`
)

.then(response => {

    if (!response.ok) {

        throw new Error(
            "Không lấy được sự kiện"
        );

    }

    return response.json();

})

.then(data => {

    document.getElementById(
        "tenSuKien"
    ).value = data.tenSuKien;

    document.getElementById(
        "moTa"
    ).value = data.moTa;

    document.getElementById(
        "thoiGianBatDau"
    ).value = data.thoiGianBatDau;

    document.getElementById(
        "thoiGianKetThuc"
    ).value = data.thoiGianKetThuc;

})

.catch(error => {

    console.error(error);

    alert(error.message);

});

/* =========================
   UPDATE EVENT
========================= */

function updateEvent() {

    const tenSuKien =
        document.getElementById(
            "tenSuKien"
        ).value.trim();

    const moTa =
        document.getElementById(
            "moTa"
        ).value.trim();

    const thoiGianBatDau =
        document.getElementById(
            "thoiGianBatDau"
        ).value;

    const thoiGianKetThuc =
        document.getElementById(
            "thoiGianKetThuc"
        ).value;

    fetch(
        `http://localhost:8080/api/sukien/${maSuKien}`,
        {

            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                tenSuKien:
                    tenSuKien,

                moTa:
                    moTa,

                thoiGianBatDau:
                    thoiGianBatDau,

                thoiGianKetThuc:
                    thoiGianKetThuc

            })

        }
    )

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Cập nhật thất bại"
            );

        }

        return response.json();

    })

    .then(data => {

        alert(
            "Cập nhật thành công"
        );

        window.location.href =
            "loginCreator.html";

    })

    .catch(error => {

        console.error(error);

        alert(error.message);

    });

}

/* =========================
   BACK
========================= */

function goBack() {

    window.location.href =
        "loginCreator.html";

}