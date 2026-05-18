-- =========================================================
-- TICKET DATABASE — Oracle SQL
-- =========================================================

-- =========================================================
-- SEQUENCES
-- =========================================================
CREATE SEQUENCE TAIKHOAN_SEQ  START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE NHANVIEN_SEQ  START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE KHACHHANG_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE NHATOCHUC_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SUKIEN_SEQ    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE VE_SEQ        START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE VOUCHER_SEQ   START WITH 1 INCREMENT BY 1;  -- FIX 5: thiếu sequence này
CREATE SEQUENCE HOADON_SEQ    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE DIADIEM_SEQ   START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE GHE_SEQ       START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE THANHTOAN_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE HOANVE_SEQ    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE BAOCAO_SEQ    START WITH 1 INCREMENT BY 1;

-- =========================
-- 1. TÀI KHOẢN
-- =========================
CREATE TABLE TAIKHOAN (
    MaTaiKhoan      NUMBER PRIMARY KEY,
    LoaiTaiKhoan    VARCHAR2(50) NOT NULL,
    MatKhau         VARCHAR2(255) NOT NULL,
    TenTaiKhoan     VARCHAR2(255) UNIQUE
);

-- =========================
-- 2. KHÁCH HÀNG
-- =========================
CREATE TABLE KHACHHANG (
    MaKhachHang     NUMBER PRIMARY KEY,
    TenKhachHang    VARCHAR2(100),
    Email           VARCHAR2(100),
    SoDienThoai     VARCHAR2(20),
    MaTaiKhoan      NUMBER,
    CONSTRAINT fk_kh_tk FOREIGN KEY (MaTaiKhoan)
        REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 3. NHÂN VIÊN
-- =========================
CREATE TABLE NHANVIEN (
    MaNhanVien      NUMBER PRIMARY KEY,
    TenNhanVien     VARCHAR2(100),
    Email           VARCHAR2(100),
    SoDienThoai     VARCHAR2(20),
    NgayVaoLam      DATE,
    Luong           NUMBER,
    MaTaiKhoan      NUMBER,
    CONSTRAINT fk_nv_tk FOREIGN KEY (MaTaiKhoan)
        REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 4. NHÀ TỔ CHỨC
-- =========================
CREATE TABLE NHATOCHUC (
    MaCongTy            NUMBER PRIMARY KEY,
    TenCongTy           VARCHAR2(150),
    TenNguoiDaiDien     VARCHAR2(100),
    DiaChi              VARCHAR2(200),
    Email               VARCHAR2(100),
    SoDienThoai         VARCHAR2(20),
    MaTaiKhoan          NUMBER,
    CONSTRAINT fk_ct_tk FOREIGN KEY (MaTaiKhoan)
        REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 5. SỰ KIỆN
-- =========================
ALTER TABLE SUKIEN
ADD CONSTRAINT unique_sukien
UNIQUE (TenSuKien);
CREATE TABLE SUKIEN (
    MaSuKien            NUMBER PRIMARY KEY,
    TenSuKien           VARCHAR2(150) UNIQUE,
    MoTa               VARCHAR2(500),
    ThoiGianBatDau      DATE,
    ThoiGianKetThuc     DATE,
    MaCongTy            NUMBER,
    CONSTRAINT fk_sk_ct FOREIGN KEY (MaCongTy)
        REFERENCES NHATOCHUC(MaCongTy)
);
INSERT INTO SUKIEN
VALUES(
    1,
    'Rap Viet Concert',
    'Concert rap',
    DATE '2026-06-20',
    DATE '2026-06-21',
    1
);

COMMIT;
INSERT INTO SUKIEN
VALUES(
    4,
    'Muu Le Dau Doi',
    'Nhạc điện tử',
    DATE '2026-07-01',
    DATE '2026-07-02',
    1
);

COMMIT;
-- =========================
-- 6. ĐỊA ĐIỂM
-- =========================
CREATE TABLE DIADIEM (
    MaDiaDiem       NUMBER PRIMARY KEY,
    TenDiaDiem      VARCHAR2(100),
    DiaChi          VARCHAR2(200),
    SucChua        NUMBER
);

-- =========================
-- 7. GHẾ
-- =========================
CREATE TABLE GHE (
    MaGhe           NUMBER PRIMARY KEY,
    KhuVuc          VARCHAR2(50),
    MaDiaDiem       NUMBER,
    CONSTRAINT fk_ghe_dd FOREIGN KEY (MaDiaDiem)
        REFERENCES DIADIEM(MaDiaDiem)
);

-- =========================
-- 8. VÉ
-- =========================
CREATE TABLE VE (
    MaVe            NUMBER PRIMARY KEY,
    TenVe           VARCHAR2(100),
    LoaiVe          VARCHAR2(50),
    Gia             NUMBER,
    TrangThai       VARCHAR2(50),
    MoTa            VARCHAR2(3000),
    MaSuKien        NUMBER,
    CONSTRAINT fk_ve_sk FOREIGN KEY (MaSuKien)
        REFERENCES SUKIEN(MaSuKien),
);
-- =========================
-- 9. VOUCHER
-- =========================
CREATE TABLE VOUCHER (
    MaVoucher       NUMBER PRIMARY KEY,
    MaCode          VARCHAR2(50),
    DieuKien        VARCHAR2(255),
    MucKhuyenMai    NUMBER,
    NgayBatDau      DATE,
    NgayKetThuc     DATE,
    TrangThai       VARCHAR2(50),
    LuotSuDung      NUMBER
);

-- =========================
-- 10. HÓA ĐƠN
-- =========================
CREATE TABLE HOADON (
    MaHoaDon        NUMBER PRIMARY KEY,
    NgayLap         DATE,
    TrangThai       VARCHAR2(50),
    ThanhTien       NUMBER,
    MaKhachHang     NUMBER,
    MaNhanVien      NUMBER,
    MaVoucher       NUMBER,

    CONSTRAINT fk_hd_kh FOREIGN KEY (MaKhachHang)
        REFERENCES KHACHHANG(MaKhachHang),
    CONSTRAINT fk_hd_nv FOREIGN KEY (MaNhanVien)
        REFERENCES NHANVIEN(MaNhanVien),
    CONSTRAINT fk_hd_vc FOREIGN KEY (MaVoucher)
        REFERENCES VOUCHER(MaVoucher)
);

-- =========================
-- 11. CHI TIẾT HÓA ĐƠN
-- =========================
CREATE TABLE CHITIETHOADON (
    MaVe            NUMBER,
    MaHoaDon        NUMBER,
    DonGia          NUMBER,
    SoLuong         NUMBER,

    PRIMARY KEY (MaVe, MaHoaDon),

    CONSTRAINT fk_cthd_ve FOREIGN KEY (MaVe)
        REFERENCES VE(MaVe),
    CONSTRAINT fk_cthd_hd FOREIGN KEY (MaHoaDon)
        REFERENCES HOADON(MaHoaDon)
);

-- =========================
-- 12. THANH TOÁN
-- =========================
CREATE TABLE THANHTOAN (
    MaThanhToan     NUMBER PRIMARY KEY,
    SoTien          NUMBER,
    ThoiGian        DATE,
    PhuongThuc      VARCHAR2(50),
    TrangThai       VARCHAR2(50),
    MaHoaDon        NUMBER,
    CONSTRAINT fk_tt_hd FOREIGN KEY (MaHoaDon)
        REFERENCES HOADON(MaHoaDon)
);

-- =========================
-- 13. HOÀN VÉ
-- =========================
CREATE SEQUENCE HOANVE_SEQ START WITH 1 INCREMENT BY 1;

CREATE TABLE HOANVE (
    MaHoanVe        NUMBER PRIMARY KEY,
    MaHoaDon        NUMBER,
    MaVe            NUMBER,
    ThoiGianHoan    DATE,
    SoLuongHoan     NUMBER,
    LyDoHoan        VARCHAR2(255),
    TrangThaiHoan   VARCHAR2(50),
    CONSTRAINT fk_hv_hd FOREIGN KEY (MaHoaDon) REFERENCES HOADON(MaHoaDon),
    CONSTRAINT fk_hv_ve FOREIGN KEY (MaVe)     REFERENCES VE(MaVe)
);

-- =========================
-- 14. BÁO CÁO
-- =========================
CREATE TABLE BAOCAO (
    MaBaoCao        NUMBER PRIMARY KEY,
    DoanhThu        NUMBER,
    NgayBatDau      DATE,
    NgayKetThuc     DATE,
    SoVeDaBan       NUMBER,
    SoVeTon         NUMBER,
    MaNhanVien      NUMBER,
    CONSTRAINT fk_bc_nv FOREIGN KEY (MaNhanVien)
        REFERENCES NHANVIEN(MaNhanVien)
)

CREATE TABLE DIENRATAI (
    MaSuKien        NUMBER,
    MaDiaDiem       NUMBER,
    TrangThai       VARCHAR2(150),
    
    PRIMARY KEY(MaSuKien, MaDiaDiem),
    
    CONSTRAINT fk_tt_sk FOREIGN KEY (MaSuKien)
        REFERENCES SUKIEN(MaSuKien),
        
    CONSTRAINT fk_tt_dd FOREIGN KEY (MaDiaDiem)
        REFERENCES DIADIEM(MaDiaDiem)
    
)


