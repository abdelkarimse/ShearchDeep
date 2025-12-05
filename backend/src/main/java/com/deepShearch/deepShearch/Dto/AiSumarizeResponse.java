package com.deepShearch.deepShearch.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiSumarizeResponse {
    private String summary;
    private List<String> keywords;

}
