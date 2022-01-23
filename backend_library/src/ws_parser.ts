import { WebSocket, WebSocketServer } from "ws";
import { WS_User } from "./ws_user";

interface getters {
    [type: string]: Function
}

interface channels {
    [type: string]: { // channel name
        [type: string]: WS_User // uuid
    }
}

export interface get_request {
    path: string,
    uuid: string,
    args: object
}

export interface get_return {
    data: any,
    uuid: string
}

export interface add_subscription {
    channel: string
}

export interface sub_response {

    sub: string,
    status: string,
    connected: boolean

}

export interface data_push {
    sub: string,
    data: any
}

export interface unsubscription {
    channel: string
}

interface get_function {
    (args: any): any;
}

export class WS_Handler {

    getters: getters = {};
    channels: channels = {};

    constructor(port: number) {
        const wss = new WebSocketServer({ port: port });

        console.log(`WS Server listening on port $`)

        wss.on('connection', (ws) => {
            new WS_User(ws, this);
        })
    }

    //////////////////////////////////////////////////////////////////////

    get(type: string, handler: get_function) {
        if (!this.getters[type])
            this.getters[type] = handler;
        else
            throw (`Path ${type} already exists`);
    }

    handle_get(get_request: get_request, ws: WebSocket) {

        if (this.getters[get_request.path]) {

            ws.send(JSON.stringify({
                type: "GET",
                body: {
                    data: this.getters[get_request.path](get_request.args),
                    uuid: get_request.uuid
                }
            }));

        } else
            throw (`Path ${get_request.path} doesn't exist`);

    }


    //////////////////////////////////////////////////////////////////////

    setup_channel(channel_name: string) {
        if (!this.channels[channel_name])
            this.channels[channel_name] = {};
        else
            throw (`Channel ${channel_name} already exists`)
    }

    add_subscription(sub: add_subscription, ws: WS_User) {
        if (!this.channels[sub.channel]) {
            ws.send(JSON.stringify({
                type: "SUBSCRIPTION_STATUS",
                body: {
                    sub: sub.channel,
                    status: `Subscription ${sub.channel} doesn't exist`,
                    connected: false
                }
            }))

        } else {

            this.channels[sub.channel][ws.uuid] = ws;

            ws.send(JSON.stringify({
                type: "SUBSCRIPTION_STATUS",
                body: {
                    sub: sub.channel,
                    status: `Subscription to channel ${sub.channel} success`,
                    connected: true
                }
            }))

        }
    }

    unsubscribe(unsub: unsubscription, ws: WS_User) {
        if (!this.channels[unsub.channel]) {
            ws.send(JSON.stringify({
                type: "UNSUBSCRIPTION_STATUS",
                body: {
                    sub: unsub.channel,
                    status: `Subscription ${unsub.channel} doesn't exist`,
                    connected: false
                }
            }))
        } else {

            delete this.channels[unsub.channel][ws.uuid];

            ws.send(JSON.stringify({
                type: "UNSUBSCRIPTION_STATUS",
                body: {
                    sub: unsub.channel,
                    status: `Unsubscription from channel ${unsub.channel} success`,
                    connected: false
                }
            }));
        }

    }

    push_subscription(channel_name: string, data: any) {
        Object.keys(this.channels[channel_name]).forEach((uuid) => {
            this.channels[channel_name][uuid].send(JSON.stringify({
                type: "SUBSCRIPTION_PUSH",
                body: {
                    data: data,
                    sub: channel_name
                }
            }));
        })
    }
}
