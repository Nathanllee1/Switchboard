import { v4 as uuidv4 } from 'uuid';
import { message } from '../../backend_library/src/ws_user';
import { get_return, get_request, sub_response, data_push } from "../../backend_library/src/ws_parser";
import { Sub } from './sub';

class prom_wrapper {
    promise: Promise<any>;
    reject: any;
    resolve: any;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        })
    }
}

interface get_list {
    [uuid: string]: prom_wrapper
}

interface sub_pending {
    [channel: string]: prom_wrapper
}

interface sub_list {
    [sub: string] : Sub
}

export class WS_Interface {

    ws_interface: WebSocket;
    url: string;
    gets: get_list = {};

    pending_subs: sub_pending = {};
    subs: sub_list = {}

    constructor(url: string) {
        this.url = url;
    }

    async initialize() {
        this.ws_interface = new WebSocket(this.url);

        this.ws_interface.addEventListener("message", (data) => {
            this.handle_message(data.data);
        })

        return (new Promise<null>((resolve, reject) => {
            this.ws_interface.addEventListener("open", () => {
                resolve(null)
            })
        }))
    }

    get(path: string, args: object = {}) {
        let request_id = uuidv4();
        this.ws_interface.send(JSON.stringify({
            type: "GET",
            body: {
                path: path,
                uuid: request_id,
                args: args
            }
        }))

        let prom_obj = new prom_wrapper();

        this.gets[request_id] = prom_obj;

        return prom_obj.promise;

    }

    handle_message(message: string) {
        // console.log(message);
        const parsed: message = JSON.parse(message);

        switch (parsed.type) {
            case "GET":
                this.handle_get_return(parsed.body);
                break;

            case "SUBSCRIPTION_STATUS":
                this.handle_sub_return(parsed.body);
                break;

            case "SUBSCRIPTION_PUSH":
                this.handle_push(parsed.body);
                break;

            default:
                throw(`Message type ${parsed.type} not valid`);
        }
    }

    handle_get_return(get_return: get_return) {

        this.gets[get_return.uuid].resolve(get_return.data);

    }

    subscribe(sub_name: string) {

        if (this.pending_subs[sub_name]) {
            throw (`Subscription ${sub_name} still pending`);
        }

        this.ws_interface.send(JSON.stringify({
            type: "SUBSCRIPTION",
            body: {
                channel: sub_name
            }
        }));

        let prom_obj = new prom_wrapper();

        this.pending_subs[sub_name] = prom_obj;

        return prom_obj.promise;
    }

    handle_sub_return(response: sub_response) {

        if (response.connected) {
            const sub = new Sub();

            this.subs[response.sub] = sub;

            this.pending_subs[response.sub].resolve(sub);

            delete this.pending_subs[response.sub];

        } else {

            console.error(response.status);

        }

    }

    handle_push(data_meta:data_push) {
        this.subs[data_meta.sub].pushMessage(data_meta.data);
    }
}
