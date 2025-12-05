package com.deepShearch.deepShearch.Dto;

import lombok.Data;

@Data
public class WebsocketMessagae {
    private String SenderId ;
    private String ReceiverId ;
    private TypeMessage typeMessage ;
    private String DocumentId ;


    public enum TypeMessage {
    DOCUMENT8Viewed,
        Bloc_VIEWED,

    }
}
