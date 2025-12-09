package com.deepShearch.deepShearch.Dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentFilesResponse {
    private Integer count;
    private String next;
    private String previous;
    private List<DocumentFileDto> results;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DocumentFileDto {
        private Integer document_file_id;
        private String document_file_url;
        private Integer id;
        private String image_url;
        private Integer page_number;
        private String url;
    }
}
