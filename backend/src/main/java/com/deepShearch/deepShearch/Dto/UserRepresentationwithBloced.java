package com.deepShearch.deepShearch.Dto;

import lombok.Data;

@Data
public class UserRepresentationwithBloced {

    private String id;
    private String username;
    private String email;
    private Integer readTime; // in minutes
    private String lastAccessed; // ISO 8601 format
    private boolean isBlocked;
    private String documentId;

}
