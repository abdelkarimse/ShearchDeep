package com.deepShearch.deepShearch.services;

import java.time.Duration;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

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
    private final RestTemplate restTemplate;
    private final String mayanUrl;
    
    private  final String USERNAME;
    private  final String PASSWORD ;

    public MayanServiceImpl(@Value("${host.mayan.url}") String mayanUrl,
                            @Value("${host.mayan.username}") String username,
                            @Value("${host.mayan.password}") String password) {
        this.mayanUrl = mayanUrl;
        this.USERNAME = username;
        this.PASSWORD = password;
        
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
        
        // Initialize RestTemplate for multipart uploads
        this.restTemplate = new RestTemplate();
    }
    
    @Override
    public Mono<MayanDocumentsListResponse> getDocuments(String ordering, Integer page, Integer pageSize) {
        log.info("Fetching documents from Mayan EDMS - ordering: {}, page: {}, pageSize: {}", 
                ordering, page, pageSize);
        
        return webClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/api/v4/documents/");
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
        
        return Mono.fromCallable(() -> {
            byte[] fileBytes = request.getFile().getBytes();
            String originalFilename = request.getFile().getOriginalFilename();
            
            log.info("Preparing upload - File size: {} bytes, Filename: {}, DocumentTypeId: {}", 
                    fileBytes.length, originalFilename, request.getDocumentTypeId());
            
            // Build proper multipart body
            String boundary = "----FormBoundary" + System.currentTimeMillis();
            StringBuilder body = new StringBuilder();
            
            if (request.getLabel() != null && !request.getLabel().isEmpty()) {
                body.append("--").append(boundary).append("\r\n")
                    .append("Content-Disposition: form-data; name=\"label\"\r\n\r\n")
                    .append(request.getLabel()).append("\r\n");
            }
            
            if (request.getDescription() != null && !request.getDescription().isEmpty()) {
                body.append("--").append(boundary).append("\r\n")
                    .append("Content-Disposition: form-data; name=\"description\"\r\n\r\n")
                    .append(request.getDescription()).append("\r\n");
            }
            
            body.append("--").append(boundary).append("\r\n")
                .append("Content-Disposition: form-data; name=\"document_type_id\"\r\n\r\n")
                .append(request.getDocumentTypeId()).append("\r\n");
            

            body.append("--").append(boundary).append("\r\n")
                .append("Content-Disposition: form-data; name=\"file\"; filename=\"").append(originalFilename).append("\"\r\n")
                .append("Content-Type: application/octet-stream\r\n\r\n");

            // Convert string parts to bytes
            byte[] bodyStart = body.toString().getBytes();
            byte[] boundaryEnd = ("\r\n--" + boundary + "--\r\n").getBytes();
            
            // Create full body
            byte[] fullBody = new byte[bodyStart.length + fileBytes.length + boundaryEnd.length];
            System.arraycopy(bodyStart, 0, fullBody, 0, bodyStart.length);
            System.arraycopy(fileBytes, 0, fullBody, bodyStart.length, fileBytes.length);
            System.arraycopy(boundaryEnd, 0, fullBody, bodyStart.length + fileBytes.length, boundaryEnd.length);
            
            // Create HTTP request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("multipart/form-data; boundary=" + boundary));
            headers.set("Authorization", "Basic " + Base64.getEncoder()
                    .encodeToString((USERNAME + ":" + PASSWORD).getBytes()));
            headers.setContentLength(fullBody.length);
            
            HttpEntity<byte[]> entity = new HttpEntity<>(fullBody, headers);
            
            log.info("Sending multipart request to Mayan EDMS... (Body size: {} bytes)", fullBody.length);
            
            return restTemplate.postForObject(mayanUrl + "/api/v4/documents/upload/", 
                    entity, MayanDocumentResponse.class);
                    
        }).doOnSuccess(response -> log.info("Successfully uploaded document with ID: {}", 
                response != null ? response.getId() : null))
        .doOnError(error -> log.error("Error uploading document to Mayan EDMS", error));
    }
    
    @Override
    public Mono<Void> deleteDocument(String documentId) {
        log.info("Deleting document from Mayan EDMS - documentId: {}", documentId);
        
        return webClient.delete()
                .uri("/api/v4/documents/{document_id}/", documentId)
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
                    .uri("/api/v4/documents/{document_id}/versions/{document_version_id}/pages/{document_version_page_id}/ocr/",
                        documentId, documentVersionId, documentVersionPageId)
                .retrieve()
                .bodyToMono(MayanDocumentPageOCRResponse.class)
                .doOnSuccess(response -> log.info("Successfully fetched OCR content for document ID: {}, page ID: {}", 
                        documentId, documentVersionPageId))
                .doOnError(error -> log.error("Error fetching OCR content from Mayan EDMS - documentId: {}, pageId: {}", 
                        documentId, documentVersionPageId, error));
    }

}
