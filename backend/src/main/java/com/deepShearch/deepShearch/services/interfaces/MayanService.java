package com.deepShearch.deepShearch.services.interfaces;

import org.springframework.http.ResponseEntity;

import com.deepShearch.deepShearch.Dto.DocumentFilesResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentPageOCRResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentUploadRequest;
import com.deepShearch.deepShearch.Dto.MayanDocumentsListResponse;

import reactor.core.publisher.Mono;

public interface MayanService {
    

    Mono<MayanDocumentsListResponse> getDocuments(String ordering, Integer page, Integer pageSize);
    Mono<DocumentFilesResponse> getDocumentsById(String docId);

    Mono<ResponseEntity<byte[]>> getDocumentsByIdwithPageId(String documentId, String fileId, String pageId);

 

    Mono<MayanDocumentResponse> uploadDocument(MayanDocumentUploadRequest request);
    
    /**
     * Delete a document (move to trash) in Mayan EDMS
     * @param documentId The ID of the document to delete
     * @return Mono of Void indicating completion
     */
    Mono<Void> deleteDocument(String documentId);
    
    /**
     * Get OCR content of a specific document version page
     * @param documentId The ID of the document
     * @param documentVersionId The ID of the document version
     * @param documentVersionPageId The ID of the document version page
     * @return Mono of MayanDocumentPageOCRResponse containing the OCR content
     */
    Mono<MayanDocumentPageOCRResponse> getDocumentPageOCR(String documentId, String documentVersionId, String documentVersionPageId);
}
