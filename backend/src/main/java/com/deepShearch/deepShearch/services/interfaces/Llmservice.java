package com.deepShearch.deepShearch.services.interfaces;

import com.deepShearch.deepShearch.Dto.AiSumarizeResponse;
public interface Llmservice {

    AiSumarizeResponse generateSummary(String documentId, String documentVersionId,
                                        String documentVersionPageId ,String userId);
}
