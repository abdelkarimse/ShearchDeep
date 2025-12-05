package com.deepShearch.deepShearch.controller;

import java.util.List;

import com.deepShearch.deepShearch.Dto.AiSumarizeResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentCreateRequest;
import com.deepShearch.deepShearch.Dto.MayanDocumentPageOCRResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentUploadRequest;
import com.deepShearch.deepShearch.Dto.MayanDocumentsListResponse;
import com.deepShearch.deepShearch.services.interfaces.Llmservice;
import com.deepShearch.deepShearch.services.interfaces.MayanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import lombok.AllArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@AllArgsConstructor
@RequestMapping("/api/V1/documents")
public class DocumentController {
    private Llmservice llmservice;
    private MayanService mayanService;


    @PostMapping("/Summrize")
    public ResponseEntity<AiSumarizeResponse> SummrizeDocument(@PathVariable String documentId,
                                                               @PathVariable String documentVersionId,
                                                               @PathVariable String documentVersionPageId, @PathVariable String userId) {
        return ResponseEntity.ok(llmservice.generateSummary(documentId, documentVersionId, documentVersionPageId, userId));
    }

    // Mayan EDMS Integration Endpoints

    /**
     * Get list of documents from Mayan EDMS
     *
     * @param ordering Field to use when ordering the results
     * @param page     Page number within the paginated result set
     * @param pageSize Number of results to return per page
     * @return Mono of paginated documents list
     */
    @GetMapping("/mayan")
    public Mono<MayanDocumentsListResponse> getMayanDocuments(
            @RequestParam(required = false) String ordering,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize) {
        return mayanService.getDocuments(ordering, page, pageSize);
    }

    /**
     * Upload a new document with file to Mayan EDMS
     *
     * @param label          Label for the document (optional)
     * @param description    Description of the document (optional)
     * @param documentTypeId Required document type ID
     * @param language       Language code (optional)
     * @param file           The file to upload (required)
     * @return Mono of created document
     */
    @PostMapping(value = "/mayan/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Mono<MayanDocumentResponse> uploadMayanDocument(
            @RequestParam(required = false) String label,
            @RequestParam(required = false) String description,
            @RequestParam("document_type_id") Integer documentTypeId,
            @RequestParam(required = false) String language,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        MayanDocumentUploadRequest request = MayanDocumentUploadRequest.builder()
                .label(label)
                .description(description)
                .documentTypeId(documentTypeId)
                .language(language)
                .file(file)
                .build();

        return mayanService.uploadDocument(request);
    }

    /**
     * Delete a document (move to trash) from Mayan EDMS
     *
     * @param documentId The ID of the document to delete
     * @return Mono of Void with 204 status
     */
    @DeleteMapping("/mayan/{documentId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Mono<Void> deleteMayanDocument(@PathVariable String documentId) {
        return mayanService.deleteDocument(documentId);
    }


    @GetMapping("/mayan/{documentId}/versions/{documentVersionId}/pages/{documentVersionPageId}/ocr")
    public Mono<MayanDocumentPageOCRResponse> getDocumentPageOCR(
            @PathVariable String documentId,
            @PathVariable String documentVersionId,
            @PathVariable String documentVersionPageId) {
        return mayanService.getDocumentPageOCR(documentId, documentVersionId, documentVersionPageId);
    }

    /**
     * Test upload endpoint - Upload a document with file to Mayan EDMS
     *
     * @param label          Label for the document (optional)
     * @param description    Description of the document (optional)
     * @param documentTypeId Required document type ID
     * @param language       Language code (optional)
     * @param file           The file to upload (required)
     * @return Mono of created document
     */
    @PostMapping(value = "/mayan/uplodes", consumes = "multipart/form-data")
    public Mono<MayanDocumentResponse> testUpload(
            @RequestParam(required = false) String label,
            @RequestParam(required = false) String description,
            @RequestParam("document_type_id") Integer documentTypeId,
            @RequestParam(required = false) String language,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        MayanDocumentUploadRequest request = MayanDocumentUploadRequest.builder()
                .label(label)
                .description(description)
                .documentTypeId(documentTypeId)
                .language(language)
                .file(file)
                .build();

        return mayanService.uploadDocument(request);
    }


}
