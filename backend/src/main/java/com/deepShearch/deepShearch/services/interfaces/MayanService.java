package com.deepShearch.deepShearch.services.interfaces;

import com.deepShearch.deepShearch.Dto.MayanDocumentCreateRequest;
import com.deepShearch.deepShearch.Dto.MayanDocumentPageOCRResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentUploadRequest;
import com.deepShearch.deepShearch.Dto.MayanDocumentsListResponse;
import reactor.core.publisher.Mono;

public interface MayanService {
    
    /**
     * Get paginated list of documents from Mayan EDMS
     * @param ordering Field to use when ordering the results
     * @param page Page number within the paginated result set
     * @param pageSize Number of results to return per page
     * @return Mono of MayanDocumentsListResponse
     */
    Mono<MayanDocumentsListResponse> getDocuments(String ordering, Integer page, Integer pageSize);
    
    /**
     * Create a new document in Mayan EDMS
     * @param request Document creation request
     * @return Mono of created MayanDocumentResponse
     */
    Mono<MayanDocumentResponse> createDocument(MayanDocumentCreateRequest request);
    

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
