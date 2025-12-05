package com.deepShearch.deepShearch.services;

import com.deepShearch.deepShearch.Dto.AiSumarizeResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentPageOCRResponse;

import com.deepShearch.deepShearch.Model.SummerizeDoc;
import com.deepShearch.deepShearch.repository.SummerizeDocRepository;
import com.deepShearch.deepShearch.services.interfaces.Llmservice;
import com.deepShearch.deepShearch.services.interfaces.MayanService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;


import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class LlmServiceImpl implements Llmservice {
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final MayanService mayanService;
    private final SummerizeDocRepository    sumerizeDocRepository;


    public LlmServiceImpl(ChatClient.Builder chatClientBuilder,
                          ObjectMapper objectMapper,MayanService mayanService, SummerizeDocRepository sumerizeDocRepository) {
        this.mayanService = mayanService;
        this.objectMapper = objectMapper;
        this.chatClient = chatClientBuilder.build();
        this.sumerizeDocRepository = sumerizeDocRepository;
    }

    @Override
    public AiSumarizeResponse generateSummary(
            String docId,
            String documentVersionId,
            String documentVersionPageId,
            String userId
    ) {
        if (docId == null || documentVersionId == null || documentVersionPageId == null) {
            return new AiSumarizeResponse(
                    "Invalid document identifiers provided.",
                    List.of()
            );
        }
        Optional<SummerizeDoc> existingSummary = sumerizeDocRepository.findByDocumentIdAndDocumentVersionIdAndDocumentVersionPageId(docId,documentVersionId, documentVersionPageId);
        if (existingSummary.isPresent()) {
            SummerizeDoc summaryDoc = existingSummary.get();
            List<String> keywords = objectMapper.convertValue(summaryDoc.getKeyWords(), List.class);
            return new AiSumarizeResponse(summaryDoc.getSummary(), keywords);
        }

        Mono<MayanDocumentPageOCRResponse> contentMono =
                mayanService.getDocumentPageOCR(docId, documentVersionId, documentVersionPageId);

        String ocrContent = contentMono.block().getContent();

        String PROMPT = """
            Summarize the following text concisely:

            {content}

            Produce the result in **valid JSON only**, in the following structure:

            {
              "summary": "A brief summary of the content.",
              "keywords": ["keyword1", "keyword2", "keyword3"]
            }
            """;

        String finalPrompt = PROMPT.replace("{content}", ocrContent);

        String aiResult = chatClient
                .prompt()
                .user(finalPrompt)
                .call()
                .content();

        ObjectMapper mapper = new ObjectMapper();

        try {
            JsonNode json = mapper.readTree(aiResult);

            String summary = json.get("summary").asText();

            List<String> keywords = new ArrayList<>();
            json.get("keywords").forEach(node -> keywords.add(node.asText()));
            SummerizeDoc summerizeDoc = new SummerizeDoc();
            summerizeDoc.setDocumentId(docId);
            summerizeDoc.setDocumentVersionId(documentVersionId);
            summerizeDoc.setDocumentVersionPageId(documentVersionPageId);
            summerizeDoc.setSummary(summary);
            summerizeDoc.setKeyWords(keywords);
            summerizeDoc.setUserId(userId);
            sumerizeDocRepository.save(summerizeDoc);
            return new AiSumarizeResponse(summary, keywords);

        } catch (Exception e) {
            return new AiSumarizeResponse(
                    "Failed to parse AI response.",
                    List.of()
            );
        }
    }

    }
