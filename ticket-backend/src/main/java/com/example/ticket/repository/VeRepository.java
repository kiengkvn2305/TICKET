package com.example.ticket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.ticket.model.Ve;

import jakarta.persistence.LockModeType;

@Repository
public interface VeRepository extends JpaRepository<Ve, Long> {

    List<Ve> findByMaSuKien(Long maSuKien);
    List<Ve> findByTrangThai(String trangThai);
    List<Ve> findByMaSuKienIn(List<Long> maSuKienIds);
    boolean existsByTenVeAndMaSuKien(String tenVe, Long maSuKien);
    boolean existsByLoaiVeAndMaSuKien(String loaiVe, Long maSuKien);

    /**
     * Lock nhiều vé cùng lúc — dùng khi cần validate batch trước khi mua.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Ve v where v.maVe in :ids")
    List<Ve> findAllByIdWithLock(@Param("ids") List<Long> ids);

    /**
     * Lock 1 vé — dùng trong decreaseDaBan / increaseDaBan.
     * PESSIMISTIC_WRITE đảm bảo chỉ 1 transaction được đọc-ghi tại 1 thời điểm,
     * tránh oversell race condition.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Ve v where v.maVe = :id")
    Optional<Ve> findByIdWithLock(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM VE WHERE MASUKIEN IN " +
                   "(SELECT MASUKIEN FROM SUKIEN WHERE MACONGTY = :id)",
           nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);

    /**
     * Tổng số vé còn tồn (dùng cho dashboard KPI).
     */
    @Query(value = "SELECT SUM(SOLUONG - DABAN) FROM VE WHERE SOLUONG > DABAN",
           nativeQuery = true)
    Integer sumVeTon();

    // ── Định giá động ─────────────────────────────────────────────────────────

    /**
     * Lock hạng vé theo sự kiện để cập nhật giá an toàn (tránh race condition).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Ve v where v.maSuKien = :maSuKien")
    List<Ve> findByMaSuKienWithLock(@Param("maSuKien") Long maSuKien);

    /**
     * V_sold = COUNT(SOLD) + COUNT(HOLD) trong bảng GHE cho một hạng vé.
     * Dùng để tính Fill Rate R = V_sold / V_total.
     * (GHE.TRANGTHAI: 'da_dat' = SOLD, 'dang_giu' = HOLD)
     */
    @Query(value = """
        SELECT COUNT(g.MAGHE)
        FROM GHE g
        WHERE g.MAVE = :maVe
          AND g.TRANGTHAI IN ('da_dat', 'dang_giu')
        """, nativeQuery = true)
    int countVSold(@Param("maVe") Long maVe);

    /**
     * V_speed = số ghế bán/hold trong cửa sổ thời gian động (giờ).
     * Cửa sổ = 5% T_total, clamp [1h, 24h] — truyền vào :hours.
     * Dùng cột THOIGIANMUA trong bảng GHE (nếu có) hoặc HOADON.NGAYTAO.
     */
    @Query(value = """
        SELECT COUNT(g.MAGHE)
        FROM GHE g
        JOIN HOADON h ON g.MAHOADON = h.MAHOADON
        WHERE g.MAVE = :maVe
          AND g.TRANGTHAI IN ('da_dat', 'dang_giu')
          AND h.NGAYLAP >= SYSDATE - (:hours / 24.0)
        """, nativeQuery = true)
    int countVSpeed(@Param("maVe") Long maVe, @Param("hours") double hours);
}