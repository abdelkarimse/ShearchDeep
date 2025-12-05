package com.deepShearch.deepShearch.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MayanDocumentResponse {
    
    private Long id;
    
    private String uuid;
    
    private String label;
    
    private String description;
    
    @JsonProperty("datetime_created")
    private LocalDateTime datetimeCreated;
    
    private String language;
    
    @JsonProperty("document_type")
    private DocumentTypeDto documentType;
    
    @JsonProperty("file_latest")
    private DocumentFileDto fileLatest;
    
    @JsonProperty("version_active")
    private DocumentVersionDto versionActive;
    
    private String url;
    
    @JsonProperty("document_change_type_url")
    private String documentChangeTypeUrl;
    
    @JsonProperty("file_list_url")
    private String fileListUrl;
    
    @JsonProperty("version_list_url")
    private String versionListUrl;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DocumentTypeDto {
        private Long id;
        private String label;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DocumentFileDto {
        private Long id;
        private String filename;
        private String encoding;
        @JsonProperty("mimetype")
        private String mimeType;
        private Long size;
        private String checksum;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DocumentVersionDto {
        private Long id;
        private String comment;
        @JsonProperty("version_number")
        private Integer versionNumber;
    }
}
