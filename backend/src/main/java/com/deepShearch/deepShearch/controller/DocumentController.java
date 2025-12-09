package com.deepShearch.deepShearch.controller;
import com.deepShearch.deepShearch.Dto.*;
import org.apache.james.mime4j.dom.Multipart;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepShearch.deepShearch.services.interfaces.Llmservice;
import com.deepShearch.deepShearch.services.interfaces.MayanService;

import lombok.AllArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@AllArgsConstructor
    @RequestMapping("/api/v1/documents")
 public class DocumentController {
    private Llmservice llmservice;
    private MayanService mayanService;


    @PostMapping("/Summrize/{documentId}/versions/{documentVersionId}/pages/{documentVersionPageId}/user/{userId}")
    public ResponseEntity<AiSumarizeResponse> SummrizeDocument(@PathVariable String documentId,
                                                               @PathVariable String documentVersionId,
                                                               @PathVariable String documentVersionPageId, @PathVariable String userId) {
        return ResponseEntity.ok(llmservice.generateSummary(documentId, documentVersionId, documentVersionPageId, userId));
    }


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
    @GetMapping("/mayan/{documentId}")
    public Mono<DocumentFilesResponse> getDocumentById(@PathVariable String documentId) {
        return mayanService.getDocumentsById(documentId);
    }
    @GetMapping("/mayan/{documentId}/files/{fileId}/pages/{pageId}/image/")
    public Mono<ResponseEntity<byte[]>> getDocumentByIdwithpage(@PathVariable String documentId, @PathVariable String fileId, @PathVariable String pageId) {
        return mayanService.getDocumentsByIdwithPageId(documentId, fileId, pageId);
    }


    @PostMapping(value = "/mayan/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Mono<MayanDocumentResponse> testUpload(
            @RequestParam(required = false) String label,
            @RequestParam(required = false) String description,
            @RequestParam("document_type_id") Integer documentTypeId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        MayanDocumentUploadRequest request = MayanDocumentUploadRequest.builder()
                .label(label)
                .description(description)
                .documentTypeId(documentTypeId)
                .file(file)
                .build();

        return mayanService.uploadDocument(request);
    }


}
