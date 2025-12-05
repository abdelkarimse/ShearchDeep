package com.deepShearch.deepShearch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.deepShearch.deepShearch.Model.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

}
