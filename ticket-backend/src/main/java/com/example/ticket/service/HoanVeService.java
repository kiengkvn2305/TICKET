package com.example.ticket.service;

import com.example.ticket.dto.request.HoanVeRequest;
import com.example.ticket.dto.response.HoanVeDetailResponse;
import com.example.ticket.dto.response.HoanVeResponse;

import java.util.List;

public interface HoanVeService {
    HoanVeResponse hoanVe(HoanVeRequest request);

    /** Nhà tổ chức lấy danh sách yêu cầu hoàn vé của sự kiện mình */
    List<HoanVeDetailResponse> getByCreator(Long maTaiKhoan);

    /** Nhà tổ chức duyệt hoặc từ chối yêu cầu hoàn vé */
    HoanVeDetailResponse duyetHoanVe(Long maHoanVe, String trangThai);
}
