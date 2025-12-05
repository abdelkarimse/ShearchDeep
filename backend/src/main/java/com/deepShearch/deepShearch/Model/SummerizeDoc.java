package com.deepShearch.deepShearch.Model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummerizeDoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

        @Column(nullable = false)
    private String title;

    private String documentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;
    private List<String> keyWords;
    private String documentVersionId;
    private String documentVersionPageId;
    private String userId;
    private LocalDateTime createdAt;

}
