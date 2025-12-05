package com.deepShearch.deepShearch.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepShearch.deepShearch.Model.Document;
import com.deepShearch.deepShearch.repository.DocumentRepository;
import com.deepShearch.deepShearch.services.interfaces.DocumentService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private DocumentRepository documentRepository;

    @Override
    public List<Document> getAllDocuments() {

        return documentRepository.findAll();
    }

    @Override
    public Optional<Document> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    @Override
    public Document saveDocument(Document document) {
        return documentRepository.save(document);
    }

    @Override
    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

}
