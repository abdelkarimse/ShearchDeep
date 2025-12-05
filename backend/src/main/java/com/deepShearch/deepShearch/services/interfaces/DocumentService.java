package com.deepShearch.deepShearch.services.interfaces;

import java.util.List;
import java.util.Optional;

import com.deepShearch.deepShearch.Model.Document;

public interface DocumentService {
    
    List<Document> getAllDocuments();
    
    Optional<Document> getDocumentById(Long id);
    
    Document saveDocument(Document document);
    
    void deleteDocument(Long id);

}
