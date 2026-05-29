package com.example.ticket.cli;

import java.text.DecimalFormat;
import java.util.Scanner;

/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  DynamicPricingInteractiveCli — Console Sandbox for Hybrid Dynamic Pricing
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  How to run:
 *    .\mvnw.cmd compile exec:java -Dexec.mainClass="com.example.ticket.cli.DynamicPricingInteractiveCli"
 * ══════════════════════════════════════════════════════════════════════════════
 */
public class DynamicPricingInteractiveCli {

    private static final DecimalFormat dfMoney = new DecimalFormat("#,###");
    private static final DecimalFormat dfPercent = new DecimalFormat("0.0%");
    private static final DecimalFormat dfDouble = new DecimalFormat("0.00");

    // Thang giá trị Beta
    private static final double BETA_BASE = 1.00;
    private static final double BETA_TIER1 = 1.15;
    private static final double BETA_TIER2 = 1.30;
    private static final double BETA_TIER3 = 1.50;
    private static final double BETA_CLEARANCE = 0.80;

    // Ngưỡng Fill Rate R
    private static final double R_TIER1 = 0.30;
    private static final double R_TIER2 = 0.60;
    private static final double R_TIER3 = 0.90;

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        printBanner();

        // 1. Cấu hình ban đầu
        System.out.print("💰 Nhập giá vé gốc (VND) [Mặc định: 1,000,000]: ");
        String line = scanner.nextLine().trim();
        double giaGoc = line.isEmpty() ? 1000000.0 : Double.parseDouble(line);

        System.out.print("🎫 Nhập tổng số lượng vé (V_total) [Mặc định: 1,000]: ");
        line = scanner.nextLine().trim();
        int vTotal = line.isEmpty() ? 1000 : Integer.parseInt(line);

        System.out.print("⏳ Nhập tổng thời gian bán vé (ngày) [Mặc định: 30]: ");
        line = scanner.nextLine().trim();
        int totalDays = line.isEmpty() ? 30 : Integer.parseInt(line);
        double tTotalHours = totalDays * 24.0;

        System.out.print("⚙️ Nhập hệ số nhạy cảm Gamma (γ) [Mặc định: 1.3]: ");
        line = scanner.nextLine().trim();
        double gamma = line.isEmpty() ? 1.3 : Double.parseDouble(line);

        System.out.print("🪂 Nhập số ngày bắt đầu xả hàng (Clearance) trước sự kiện [Mặc định: 3]: ");
        line = scanner.nextLine().trim();
        int clearanceDays = line.isEmpty() ? 3 : Integer.parseInt(line);

        // State variables
        int vSold = 0;
        double tPassedHours = 0.0;
        int vSpeed = 0;
        double currentBeta = BETA_BASE;
        double currentPrice = giaGoc;

        System.out.println("\n✅ Khởi tạo Sandbox thành công!");
        printHelp();

        while (true) {
            // Tính toán các chỉ số
            double r = (double) vSold / vTotal;
            double tRemainHours = Math.max(tTotalHours - tPassedHours, 0.0001);
            int vRemain = vTotal - vSold;

            double brr = tRemainHours > 0 ? (double) vRemain / tRemainHours : 0;
            double hav = tPassedHours < 1.0 ? brr : (double) vSold / tPassedHours;
            double tGate = Math.max(brr, hav) * gamma;

            // Kiểm tra điều kiện Clearance (Giải cứu)
            boolean clearanceTriggered = false;
            double daysRemain = tRemainHours / 24.0;
            if (daysRemain <= clearanceDays && r < 0.50 && vSpeed < brr * 0.5) {
                clearanceTriggered = true;
            }

            // In Dashboard
            printDashboard(giaGoc, vTotal, vSold, r, tTotalHours, tPassedHours, tRemainHours, vRemain, brr, hav, tGate, vSpeed, currentBeta, currentPrice, clearanceTriggered);

            System.out.print("\n💻 Nhập lệnh > ");
            String cmdLine = scanner.nextLine().trim();
            if (cmdLine.equalsIgnoreCase("exit")) {
                System.out.println("👋 Tạm biệt!");
                break;
            }
            if (cmdLine.equalsIgnoreCase("help")) {
                printHelp();
                continue;
            }

            String[] parts = cmdLine.split("\\s+");
            String action = parts[0].toLowerCase();

            try {
                switch (action) {
                    case "hold":
                    case "buy":
                        if (parts.length < 2) {
                            System.out.println("❌ Thiếu số lượng vé. Ví dụ: hold 50");
                            break;
                        }
                        int holdAmount = Integer.parseInt(parts[1]);
                        if (vSold + holdAmount > vTotal) {
                            System.out.println("❌ Vượt quá tổng số vé khả dụng!");
                        } else {
                            vSold += holdAmount;
                            System.out.println("🟢 Đã Giữ/Mua thêm " + holdAmount + " vé.");
                            // Chạy thuật toán định giá ngay lập tức
                            double targetBeta = betaFromR(r + (double) holdAmount / vTotal);
                            if (targetBeta > currentBeta) {
                                // Cần tăng giá -> Check V_speed
                                System.out.println("\n🔥 Phát hiện Fill Rate đạt ngưỡng TĂNG giá!");
                                System.out.println("⚠️ Thuật toán yêu cầu xác thực FOMO: T_gate = " + dfDouble.format(tGate) + " vé/giờ.");
                                System.out.println("👉 V_speed hiện tại đang là: " + vSpeed + " vé/giờ.");
                                if (vSpeed >= tGate) {
                                    System.out.println("🚀 ĐẠT YÊU CẦU: V_speed >= T_gate. Hệ số tăng từ " + currentBeta + " -> " + targetBeta);
                                    currentBeta = targetBeta;
                                    currentPrice = Math.round(giaGoc * currentBeta);
                                } else {
                                    System.out.println("🛡️ BẢO VỆ (Fakeout!): V_speed < T_gate. Giữ nguyên giá sàn để tránh FOMO ảo!");
                                }
                            } else if (targetBeta < currentBeta) {
                                // Tụt giá (không cần check v_speed)
                                currentBeta = targetBeta;
                                currentPrice = Math.round(giaGoc * currentBeta);
                            }
                        }
                        break;

                    case "cancel":
                    case "release":
                        if (parts.length < 2) {
                            System.out.println("❌ Thiếu số lượng hủy. Ví dụ: cancel 20");
                            break;
                        }
                        int cancelAmount = Integer.parseInt(parts[1]);
                        if (vSold - cancelAmount < 0) {
                            System.out.println("❌ Số lượng vé bán không thể âm!");
                        } else {
                            vSold -= cancelAmount;
                            System.out.println("🔴 Đã hủy giữ " + cancelAmount + " vé (ghế được trả về kho).");
                            // Chạy thuật toán định giá
                            double targetBeta = betaFromR((double) vSold / vTotal);
                            if (targetBeta < currentBeta) {
                                System.out.println("📉 Đảo chiều thành công! Giá giảm tự động từ bậc " + currentBeta + " -> " + targetBeta);
                                currentBeta = targetBeta;
                                currentPrice = Math.round(giaGoc * currentBeta);
                            }
                        }
                        break;

                    case "time":
                        if (parts.length < 2) {
                            System.out.println("❌ Thiếu số ngày trôi qua. Ví dụ: time 5");
                            break;
                        }
                        double daysPassed = Double.parseDouble(parts[1]);
                        tPassedHours = Math.min(tPassedHours + (daysPassed * 24.0), tTotalHours);
                        System.out.println("⏳ Đã trôi qua " + daysPassed + " ngày (" + (daysPassed * 24) + " giờ).");
                        
                        // Kiểm tra clearance sau khi nhảy thời gian
                        if (clearanceTriggered) {
                            currentBeta = BETA_CLEARANCE;
                            currentPrice = Math.round(giaGoc * currentBeta);
                        }
                        break;

                    case "speed":
                        if (parts.length < 2) {
                            System.out.println("❌ Thiếu chỉ số tốc độ bán vé. Ví dụ: speed 45");
                            break;
                        }
                        vSpeed = Integer.parseInt(parts[1]);
                        System.out.println("⚡ Đã cập nhật tốc độ bán vé V_speed = " + vSpeed + " vé/giờ.");
                        break;

                    default:
                        System.out.println("❌ Lệnh không hợp lệ! Gõ 'help' để xem hướng dẫn.");
                        break;
                }
            } catch (Exception e) {
                System.out.println("❌ Có lỗi xảy ra khi thực hiện lệnh: " + e.getMessage());
            }
        }
        scanner.close();
    }

    private static double betaFromR(double r) {
        if (r >= R_TIER3) return BETA_TIER3;
        if (r >= R_TIER2) return BETA_TIER2;
        if (r >= R_TIER1) return BETA_TIER1;
        return BETA_BASE;
    }

    private static void printBanner() {
        System.out.println("╔══════════════════════════════════════════════════════════════════════════════╗");
        System.out.println("║                DYNAMIC PRICING SERVICE — INTERACTIVE SANDBOX                 ║");
        System.out.println("║        Thuật Toán Định Giá Vé Động Lai (Hybrid) — Mô phỏng index.pdf         ║");
        System.out.println("╚══════════════════════════════════════════════════════════════════════════════╝");
    }

    private static void printHelp() {
        System.out.println("\n🛠️  DANH SÁCH LỆNH ĐIỀU KHIỂN SANDBOX:");
        System.out.println("  1. hold <so_luong>   : Khách đặt giữ/mua thêm vé (tăng V_sold, tăng Fill Rate R).");
        System.out.println("  2. cancel <so_luong> : Khách hủy vé (giảm V_sold, kích hoạt rollback giá).");
        System.out.println("  3. time <so_ngay>    : Thời gian trôi qua (giảm T_remain, đẩy sát ngày Clearance).");
        System.out.println("  4. speed <so_ve/gio> : Thay đổi tốc độ bán vé thực tế V_speed để test FOMO.");
        System.out.println("  5. help              : Xem lại danh sách lệnh.");
        System.out.println("  6. exit              : Thoát Sandbox.");
    }

    private static void printDashboard(double giaGoc, int vTotal, int vSold, double r, double tTotalHours,
                                       double tPassedHours, double tRemainHours, int vRemain, double brr,
                                       double hav, double tGate, int vSpeed, double currentBeta, double currentPrice,
                                       boolean clearanceTriggered) {
        System.out.println("\n🏁 ───────────────────────[ DYNAMIC PRICING STATE ]─────────────────────── 🏁");
        System.out.println("  💵 Giá gốc: " + dfMoney.format(giaGoc) + " VND | Giá hiện tại: " + dfMoney.format(currentPrice) + " VND");
        System.out.println("  📊 Hệ số β hiện tại: " + dfDouble.format(currentBeta) + "x | Phân hạng: " + getTierName(currentBeta));
        System.out.println(" ─────────────────────────────────────────────────────────────────────────────");
        System.out.println("  🎫 Tổng vé: " + vTotal + " | Đã bán/giữ (V_sold): " + vSold + " | Còn lại: " + vRemain);
        System.out.println("  📈 Tỷ lệ lấp đầy (Fill Rate R): " + dfPercent.format(r) + " (" + getProgressBar(r) + ")");
        System.out.println(" ─────────────────────────────────────────────────────────────────────────────");
        System.out.println("  📅 Tổng thời gian: " + dfDouble.format(tTotalHours / 24.0) + " ngày | Đã trôi qua: " + dfDouble.format(tPassedHours / 24.0) + " ngày");
        System.out.println("  ⏳ Thời gian còn lại (T_remain): " + dfDouble.format(tRemainHours / 24.0) + " ngày (" + dfDouble.format(tRemainHours) + " giờ)");
        System.out.println(" ─────────────────────────────────────────────────────────────────────────────");
        System.out.println("  ⚖️ Tốc độ tối thiểu yêu cầu (BRR): " + dfDouble.format(brr) + " vé/giờ");
        System.out.println("  ⚡ Tốc độ bán thực tế trung bình (HAV): " + dfDouble.format(hav) + " vé/giờ");
        System.out.println("  🛡️ Ranh giới chặn FOMO ảo (T_gate): " + dfDouble.format(tGate) + " vé/giờ (Gamma: " + (tGate / Math.max(brr, hav)) + "x)");
        System.out.println("  🚀 Tốc độ bán hiện tại (V_speed): " + vSpeed + " vé/giờ " + (vSpeed >= tGate ? "[🔥 FOMO THẬT]" : "[🛡️ FOMO ẢO]"));
        System.out.println(" ─────────────────────────────────────────────────────────────────────────────");
        System.out.println("  🚨 Trạng thái Giải Cứu (Clearance): " + (clearanceTriggered ? "🔴 ĐANG KÍCH HOẠT (Giảm 20% xả hàng!)" : "🟢 Không kích hoạt"));
        System.out.println("🏁 ───────────────────────────────────────────────────────────────────────── 🏁");
    }

    private static String getTierName(double beta) {
        if (beta == BETA_CLEARANCE) return "Giải Cứu (Clearance)";
        if (beta == BETA_BASE) return "Bậc Sàn (Base)";
        if (beta == BETA_TIER1) return "Bậc 1 (Surge Tier 1)";
        if (beta == BETA_TIER2) return "Bậc 2 (Surge Tier 2)";
        if (beta == BETA_TIER3) return "Bậc 3 (Surge Tier 3)";
        return "Tùy biến";
    }

    private static String getProgressBar(double r) {
        int length = 20;
        int filled = (int) (r * length);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            if (i < filled) sb.append("█");
            else sb.append("░");
        }
        return sb.toString();
    }
}
