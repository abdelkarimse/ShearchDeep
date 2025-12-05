package com.deepShearch.deepShearch.repository;

import com.deepShearch.deepShearch.Model.SummerizeDoc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SummerizeDocRepository extends JpaRepository<SummerizeDoc, String> {
    Optional<SummerizeDoc> findByDocumentIdAndDocumentVersionIdAndDocumentVersionPageId(
            String documentId,
            String documentVersionId, 
            String documentVersionPageId
    );
}
