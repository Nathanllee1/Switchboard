import { WebSocket } from "ws";
import { WS_Handler } from "./ws_parser";
import { v4 as uuidv4 } from 'uuid';

export interface message {
    type: string
    body: any
}

export class WS_User {

    server:WS_Handler;
    ws_obj:WebSocket;
    uuid:string;

    constructor(ws_obj:WebSocket, server:WS_Handler) {

        this.server = server;
        this.ws_obj = ws_obj;

        ws_obj.on("message", (message) => {
            this.handle_message(message.toString(), this.server)
        });

        this.uuid = uuidv4();
    }

    handle_message(data:string, server:WS_Handler) {
        let parsed:message;

        parsed = JSON.parse(data)

        console.log(parsed);

        switch(parsed.type) {
            case "GET":
                server.handle_get(parsed.body, this.ws_obj);

                break;

            case "SUBSCRIPTION":
                server.add_subscription(parsed.body, this);

                break;

            case "UNSUBSCRIPTION":
                server.unsubscribe(parsed.body, this);

                break;

            default:
                throw(`${parsed.type} is not a valid data type`)
        }
    }

    send(data:any) {
        this.ws_obj.send(data);
    }
}
