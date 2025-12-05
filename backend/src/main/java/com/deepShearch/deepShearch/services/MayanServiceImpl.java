package com.deepShearch.deepShearch.services;

import java.io.IOException;
import java.time.Duration;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.deepShearch.deepShearch.Dto.MayanDocumentCreateRequest;
import com.deepShearch.deepShearch.Dto.MayanDocumentPageOCRResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentResponse;
import com.deepShearch.deepShearch.Dto.MayanDocumentUploadRequest;
import com.deepShearch.deepShearch.Dto.MayanDocumentsListResponse;
import com.deepShearch.deepShearch.services.interfaces.MayanService;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

@Service
@Slf4j
public class MayanServiceImpl implements MayanService {
    
    private final WebClient webClient;
    
    private static final String USERNAME = "admin";
    private static final String PASSWORD = "anYRqN8wX5";

    public MayanServiceImpl(@Value("${host.mayan.url}") String mayanUrl) {
        // Configure HttpClient with proper settings for file uploads
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 60000)
                .responseTimeout(Duration.ofMinutes(5))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(5, TimeUnit.MINUTES))
                        .addHandlerLast(new WriteTimeoutHandler(5, TimeUnit.MINUTES)));
        
        // Create Basic Auth header
        String auth = USERNAME + ":" + PASSWORD;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        String authHeader = "Basic " + encodedAuth;
        
        this.webClient = WebClient.builder()
                .baseUrl(mayanUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("Authorization", authHeader)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(50 * 1024 * 1024)) // 50MB
                .build();
    }
    
    @Override
    public Mono<MayanDocumentsListResponse> getDocuments(String ordering, Integer page, Integer pageSize) {
        log.info("Fetching documents from Mayan EDMS - ordering: {}, page: {}, pageSize: {}", 
                ordering, page, pageSize);
        
        return webClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/api/documents/");
                    if (ordering != null) {
                        builder.queryParam("_ordering", ordering);
                    }
                    if (page != null) {
                        builder.queryParam("page", page);
                    }
                    if (pageSize != null) {
                        builder.queryParam("page_size", pageSize);
                    }
                    return builder.build();
                })
                .retrieve()
                .bodyToMono(MayanDocumentsListResponse.class)
                .doOnSuccess(response -> log.info("Successfully fetched {} documents", 
                        response != null ? response.getCount() : 0))
                .doOnError(error -> log.error("Error fetching documents from Mayan EDMS", error));
    }
    
    @Override
    public Mono<MayanDocumentResponse> createDocument(MayanDocumentCreateRequest request) {
        log.info("Creating document in Mayan EDMS - label: {}", request.getLabel());
        
        return webClient.post()
                .uri("/api/documents")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(MayanDocumentResponse.class)
                .doOnSuccess(response -> log.info("Successfully created document with ID: {}", 
                        response != null ? response.getId() : null))
                .doOnError(error -> log.error("Error creating document in Mayan EDMS", error));
    }
    
    @Override
    public Mono<MayanDocumentResponse> uploadDocument(MayanDocumentUploadRequest request) {

        log.info("Uploading document to Mayan EDMS - label: {}, filename: {}, documentTypeId: {}",
                request.getLabel(), 
                request.getFile() != null ? request.getFile().getOriginalFilename() : "unknown",
                request.getDocumentTypeId());
        
        if (request.getFile() == null || request.getFile().isEmpty()) {
            return Mono.error(new IllegalArgumentException("File is required for upload"));
        }
        
        if (request.getDocumentTypeId() == null) {
            return Mono.error(new IllegalArgumentException("document_type_id is required"));
        }
        
        try {
            // Read file content
            byte[] fileBytes = request.getFile().getBytes();
            String originalFilename = request.getFile().getOriginalFilename();
            String contentType = request.getFile().getContentType();
            
            log.info("Preparing upload - File size: {} bytes, Filename: {}, ContentType: {}, DocumentTypeId: {}", 
                    fileBytes.length, originalFilename, contentType, request.getDocumentTypeId());
            
            // Use MultiValueMap with proper Resource wrapping
            MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
            
            // Add document_type_id as plain string
            parts.add("document_type_id", String.valueOf(request.getDocumentTypeId()));
            log.debug("Added document_type_id part: {}", request.getDocumentTypeId());
            
            // Add file as ByteArrayResource with filename
            Resource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return originalFilename;
                }
            };
            parts.add("file", fileResource);
            log.debug("Added file part: {} ({} bytes, type: {})", originalFilename, fileBytes.length, contentType);
            
            // Add optional text fields as plain strings
            if (request.getLabel() != null && !request.getLabel().isEmpty()) {
                parts.add("label", request.getLabel());
                log.debug("Added label part: {}", request.getLabel());
            }
            
            if (request.getDescription() != null && !request.getDescription().isEmpty()) {
                parts.add("description", request.getDescription());
                log.debug("Added description part");
            }
            
            if (request.getLanguage() != null && !request.getLanguage().isEmpty()) {
                parts.add("language", request.getLanguage());
                log.debug("Added language part: {}", request.getLanguage());
            }

            log.info("Sending multipart request to Mayan EDMS...");
            
            return webClient.post()
                    .uri("/api/v4/documents/upload/")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(parts))
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> {
                                        log.error("Error response from Mayan EDMS: Status={}, Body={}", 
                                                clientResponse.statusCode(), errorBody);
                                        return Mono.error(new RuntimeException(
                                                String.format("Mayan API error: %s - %s", 
                                                        clientResponse.statusCode(), errorBody)));
                                    }))
                    .bodyToMono(MayanDocumentResponse.class)
                    .doOnSuccess(response -> log.info("Successfully uploaded document with ID: {}", 
                            response != null ? response.getId() : null))
                    .doOnError(error -> log.error("Error uploading document to Mayan EDMS", error));

        } catch (IOException e) {
            log.error("Error reading file content", e);
            return Mono.error(new RuntimeException("Failed to read file content", e));
        } catch (Exception e) {
            log.error("Error preparing multipart request", e);
            return Mono.error(new RuntimeException("Failed to prepare upload request", e));
        }
    }
    
    @Override
    public Mono<Void> deleteDocument(String documentId) {
        log.info("Deleting document from Mayan EDMS - documentId: {}", documentId);
        
        return webClient.delete()
                .uri("/api/documents/{document_id}/", documentId)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(response -> log.info("Successfully deleted document with ID: {}", documentId))
                .doOnError(error -> log.error("Error deleting document from Mayan EDMS - documentId: {}", 
                        documentId, error));
    }
    
    @Override
    public Mono<MayanDocumentPageOCRResponse> getDocumentPageOCR(String documentId, String documentVersionId, String documentVersionPageId) {
        log.info("Fetching OCR content from Mayan EDMS - documentId: {}, versionId: {}, pageId: {}", 
                documentId, documentVersionId, documentVersionPageId);
        
        return webClient.get()
                .uri("/api/documents/{document_id}/versions/{document_version_id}/pages/{document_version_page_id}/ocr/",
                        documentId, documentVersionId, documentVersionPageId)
                .retrieve()
                .bodyToMono(MayanDocumentPageOCRResponse.class)
                .doOnSuccess(response -> log.info("Successfully fetched OCR content for document ID: {}, page ID: {}", 
                        documentId, documentVersionPageId))
                .doOnError(error -> log.error("Error fetching OCR content from Mayan EDMS - documentId: {}, pageId: {}", 
                        documentId, documentVersionPageId, error));
    }
}
