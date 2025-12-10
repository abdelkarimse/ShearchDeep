package com.deepShearch.deepShearch.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepShearch.deepShearch.Model.SummerizeDoc;

public interface SummerizeDocRepository extends JpaRepository<SummerizeDoc, String> {
    Optional<SummerizeDoc> findFirstByDocumentIdAndDocumentVersionIdAndDocumentVersionPageIdOrderByCreatedAtDesc(
            String documentId,
            String documentVersionId, 
            String documentVersionPageId
    );
}
