package com.example.ticket.service;

import com.example.ticket.model.ChatMessage;
import com.example.ticket.repository.ChatMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);
    private static final int MAX_HISTORY = 10;

    @Autowired
    private GeminiService geminiService;  // <-- đổi từ OpenAIService sang GeminiService

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    private static final String SYSTEM_PROMPT = """
            Ban la tro ly ho tro khach hang cua he thong ban ve su kien.

            Nhiem vu cua ban:
            - Giai dap thac mac ve dat ve, huy ve, hoan tien
            - Tra cuu thong tin su kien (thoi gian, dia diem, gia ve)
            - Huong dan quy trinh mua ve
            - Ho tro xu ly su co don hang

            Quy tac:
            - Luon tra loi bang tieng Viet
            - Ngan gon, than thien, chuyen nghiep
            - Neu khong biet hoac cau hoi nam ngoai pham vi, hay de nghi khach goi hotline: 1900-xxxx
            - Khong bia thong tin ve su kien cu the
            """;

    @Transactional
    public String processMessage(String sessionId, Long userId, String userMessage) throws Exception {
        // 1. Luu tin nhan cua user
        ChatMessage userMsg = new ChatMessage();
        userMsg.setSessionId(sessionId);
        userMsg.setUserId(userId);
        userMsg.setRole("user");
        userMsg.setContent(userMessage);
        chatMessageRepository.save(userMsg);

        // 2. Lay lich su gan nhat
        List<ChatMessage> recentHistory = chatMessageRepository
                .findRecentBySessionId(sessionId, MAX_HISTORY);

        // 3. Chuyen sang format cho Gemini (giong OpenAI)
        List<Map<String, String>> historyForAI = recentHistory.stream()
                .map(msg -> Map.of("role", msg.getRole(), "content", msg.getContent()))
                .collect(Collectors.toList());

        // 4. Goi Gemini
        log.info("Calling Gemini for session: {}", sessionId);
        String aiReply = geminiService.chat(SYSTEM_PROMPT, historyForAI);

        // 5. Luu cau tra loi cua AI
        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setSessionId(sessionId);
        aiMsg.setUserId(userId);
        aiMsg.setRole("assistant");
        aiMsg.setContent(aiReply);
        chatMessageRepository.save(aiMsg);

        return aiReply;
    }

    public List<ChatMessage> getHistory(String sessionId) {
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public void clearHistory(String sessionId) {
        chatMessageRepository.deleteBySessionId(sessionId);
    }
}