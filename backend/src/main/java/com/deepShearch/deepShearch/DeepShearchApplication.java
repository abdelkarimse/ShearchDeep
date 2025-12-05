package com.deepShearch.deepShearch;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DeepShearchApplication {

    private static final String SYSTEM_PROMPT = """
            You are an AI assistant specialized in text analysis.
            
            Your task for every user input is:
            1. Generate a **clear, concise summary** of the text.
            2. Extract **the most relevant keywords** (5–15 keywords).
            3. Output the result in **JSON format**:
            
            {
              "summary": "<short summary>",
              "keywords": ["keyword1", "keyword2", ...]
            }
            
            Guidelines:
            - The summary must be factual, neutral, and capture the core meaning.
            - Keywords must be meaningful, not stopwords, and related to the main topics.
            - Keep the output strictly in valid JSON with no extra text.
            """;

    public static void main(String[] args) {
		SpringApplication.run(DeepShearchApplication.class, args);
	}

    @Bean
    public ChatClient chatClient(ChatClient.Builder chatClientBuilder) { // (2)
        return chatClientBuilder.defaultSystem(SYSTEM_PROMPT).build();
    }
}
