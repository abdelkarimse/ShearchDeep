package com.deepShearch.deepShearch.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummerizeDoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;
    private String documentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;
    private List<String> KeyWords;
    private String documentVersionId;
    private String documentVersionPageId;
    private String userId;
    private LocalDateTime createdAt;

}
