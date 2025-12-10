package com.deepShearch.deepShearch.Dto;

import java.util.List;

import org.keycloak.representations.idm.UserRepresentation;

import lombok.Data;

@Data
public class WebsocketMessagae {
    private String SenderId ;
    private String ReceiverId ;
    private TypeMessage typeMessage ;
    private String DocumentId ;
    private UserRepresentationwithBloced user ;
    private List<UserRepresentationwithBloced> users ;


    public enum TypeMessage {
    DOCUMENT8Viewed,
        Bloc_VIEWED,
        GETBOOKSVIWER,
        CLOSEBOOKSVIWER

    }
}
