package com.deepShearch.deepShearch.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MayanDocumentUploadRequest {
    
    private String label;
    
    private String description;
    
    @JsonProperty("document_type_id")
    private Integer documentTypeId;
    
    private String language;
    
    // The actual file to upload
    private MultipartFile file;
}
