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
    TenTaiKhoan     VARCHAR2(255) UNIQUE,
    TrangThai       VARCHAR(255) DEFAULT 'ACTIVE'
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
    MaQR                VARCHAR(150),
    CONSTRAINT fk_ct_tk FOREIGN KEY (MaTaiKhoan)
        REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 5. SỰ KIỆN
-- =========================
CREATE TABLE SUKIEN (
    MaSuKien            NUMBER PRIMARY KEY,
    TenSuKien           VARCHAR2(150) UNIQUE,
    MoTa                VARCHAR2(500),
    ThoiGianBatDau      DATE,
    ThoiGianKetThuc     DATE,
    MaCongTy            NUMBER,
    
    TrangThai           VARCHAR(150),
    MaDiaDiem            NUMBER,
    
    CONSTRAINT fk_sk_dd FOREIGN KEY (MaDiaDiem)
        REFERENCES DIADIEM(MaDiaDiem),
    CONSTRAINT fk_sk_ct FOREIGN KEY (MaCongTy)
        REFERENCES NHATOCHUC(MaCongTy)
);


COMMIT;
-- =========================
-- 6. ĐỊA ĐIỂM
-- =========================
CREATE TABLE DIADIEM (
    MaDiaDiem       NUMBER PRIMARY KEY,
    TenDiaDiem      VARCHAR2(100),
    DiaChi          VARCHAR2(200),
    SucChua         NUMBER,
    LoaiSoDo        VARCHAR2(200)
);

-- =========================
-- 7. VÉ
-- =========================
CREATE TABLE VE (
    MaVe            NUMBER PRIMARY KEY,
    TenVe           VARCHAR2(100),
    LoaiVe          VARCHAR2(50),
    Gia             NUMBER,
    SoLuong         NUMBER(10,0),
    DaBan           NUMBER(10,0),
    TrangThai       VARCHAR2(50),
    MoTa            VARCHAR2(3000),
    MaSuKien        NUMBER,
    CONSTRAINT fk_ve_sk FOREIGN KEY (MaSuKien)
        REFERENCES SUKIEN(MaSuKien),

    CONSTRAINT CK_VE_LV CHECK(LoaiVe IN ('Thường', 'VIP'))
);

-- =========================
-- 8. GHẾ
-- =========================
CREATE TABLE GHE (
    MaGhe           NUMBER PRIMARY KEY,
    KhuVuc          VARCHAR2(50),
    TrangThai       VARCHAR(50),
    MaVe            NUMBER,
    MaDiaDiem       NUMBER,
    MaHoaDon        NUMBER,
    CONSTRAINT fk_ghe_mv FOREIGN KEY (MaVe)
        REFERENCES VE(MaVe),

    CONSTRAINT fk_ghe_hd FOREIGN KEY (MaHoaDon)
        REFERENCES HOADON(MaHoaDon),

    CONSTRAINT fk_ghe_dd FOREIGN KEY (MaDiaDiem)
        REFERENCES DIADIEM(MaDiaDiem)
);

DELETE FROM BAOCAO;
DELETE FROM CHITIETHOADON;
DELETE FROM THANHTOAN;
DELETE FROM HOANVE;
DELETE FROM GHE;
DELETE FROM HOADON;
DELETE FROM VE;
COMMIT;
DELETE FROM VOUCHER;
DELETE FROM SUKIEN;
DELETE FROM NHANVIEN;
DELETE FROM KHACHHANG;
DELETE FROM NHATOCHUC;
DELETE FROM TAIKHOAN;

-- =========================
-- 9. VOUCHER
-- =========================
CREATE TABLE VOUCHER (
    MaVoucher       NUMBER PRIMARY KEY,
    MaCode          VARCHAR2(50),
    DanhSachSuKien  VARCHAR2(500),
    MucKhuyenMai    NUMBER,
    NgayBatDau      DATE,
    NgayKetThuc     DATE,
    TrangThai       VARCHAR2(50),
    SoLuong         NUMBER DEFAULT 0,
    LuotSuDung      NUMBER,
    MaCongTy        NUMBER,
    CONSTRAINT fk_vc_ct FOREIGN KEY (MaCongTy)
        REFERENCES NHATOCHUC(MaCongTy)  
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
CREATE TABLE HOANVE (
    MaHoanVe        NUMBER PRIMARY KEY,
    MaHoaDon        NUMBER,
    MaGhe           NUMBER,
    ThoiGianHoan    DATE,
    LyDoHoan        VARCHAR2(255),
    TrangThaiHoan   VARCHAR2(50),
    CONSTRAINT fk_hv_hd FOREIGN KEY (MaHoaDon) REFERENCES HOADON(MaHoaDon),
    CONSTRAINT fk_hv_ghe FOREIGN KEY (MaGhe)     REFERENCES Ghe(MaGhe)
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

//Có gì để xóa hết bảng cho nó dễ
BEGIN
   FOR t IN (
      SELECT table_name
      FROM user_tables
   )
   LOOP
      EXECUTE IMMEDIATE
         'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
   END LOOP;
END;
/
BEGIN
   FOR s IN (
      SELECT sequence_name
      FROM user_sequences
   )
   LOOP
      EXECUTE IMMEDIATE
         'DROP SEQUENCE ' || s.sequence_name;
   END LOOP;
END;
/

ALTER TABLE GHE DROP COLUMN MAHOADON;
-- FK liên kết với HoaDon
ALTER TABLE GHE ADD CONSTRAINT fk_ghe_hd
    FOREIGN KEY (MaHoaDon) REFERENCES HOADON(MaHoaDon);


    
----------Nháp--------------------------
UPDATE SUKIEN
SET TRANGTHAI = 'Đã tổ chức'
WHERE TRANGTHAI = 'Đã kết thúc';
commit;

SELECT *
FROM GHE
WHERE MaHoaDon = 107;