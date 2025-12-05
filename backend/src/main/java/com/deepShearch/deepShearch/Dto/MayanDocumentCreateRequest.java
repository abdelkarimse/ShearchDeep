package com.deepShearch.deepShearch.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MayanDocumentCreateRequest {
    
    private String label;
    
    private String description;
    
    @JsonProperty("document_type")
    private Long documentType;
    
    private String language;
    
    private String file;
}
