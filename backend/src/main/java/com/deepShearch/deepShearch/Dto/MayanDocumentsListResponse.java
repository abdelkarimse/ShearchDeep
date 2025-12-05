package com.deepShearch.deepShearch.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MayanDocumentsListResponse {
    
    private Integer count;
    
    private String next;
    
    private String previous;
    
    private List<MayanDocumentResponse> results;
}
