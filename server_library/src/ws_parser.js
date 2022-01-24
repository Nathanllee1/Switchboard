"use strict";
exports.__esModule = true;
exports.WS_Handler = void 0;
var ws_1 = require("ws");
var ws_user_1 = require("./ws_user");
var WS_Handler = /** @class */ (function () {
    function WS_Handler(port) {
        var _this = this;
        this.getters = {};
        this.channels = {};
        var wss = new ws_1.WebSocketServer({ port: port });
        console.log("WS Server listening on port $");
        wss.on('connection', function (ws) {
            new ws_user_1.WS_User(ws, _this);
        });
    }
    //////////////////////////////////////////////////////////////////////
    WS_Handler.prototype.get = function (type, handler) {
        if (!this.getters[type])
            this.getters[type] = handler;
        else
            throw ("Path ".concat(type, " already exists"));
    };
    WS_Handler.prototype.handle_get = function (get_request, ws) {
        if (this.getters[get_request.path]) {
            ws.send(JSON.stringify({
                type: "GET",
                body: {
                    data: this.getters[get_request.path](get_request.args),
                    uuid: get_request.uuid
                }
            }));
        }
        else
            throw ("Path ".concat(get_request.path, " doesn't exist"));
    };
    //////////////////////////////////////////////////////////////////////
    WS_Handler.prototype.setup_channel = function (channel_name) {
        if (!this.channels[channel_name])
            this.channels[channel_name] = {};
        else
            throw ("Channel ".concat(channel_name, " already exists"));
    };
    WS_Handler.prototype.add_subscription = function (sub, ws) {
        if (!this.channels[sub.channel]) {
            ws.send(JSON.stringify({
                type: "SUBSCRIPTION_STATUS",
                body: {
                    sub: sub.channel,
                    status: "Subscription ".concat(sub.channel, " doesn't exist"),
                    connected: false
                }
            }));
        }
        else {
            this.channels[sub.channel][ws.uuid] = ws;
            ws.send(JSON.stringify({
                type: "SUBSCRIPTION_STATUS",
                body: {
                    sub: sub.channel,
                    status: "Subscription to channel ".concat(sub.channel, " success"),
                    connected: true
                }
            }));
        }
    };
    WS_Handler.prototype.unsubscribe = function (unsub, ws) {
        if (!this.channels[unsub.channel]) {
            ws.send(JSON.stringify({
                type: "UNSUBSCRIPTION_STATUS",
                body: {
                    sub: unsub.channel,
                    status: "Subscription ".concat(unsub.channel, " doesn't exist"),
                    connected: false
                }
            }));
        }
        else {
            delete this.channels[unsub.channel][ws.uuid];
            ws.send(JSON.stringify({
                type: "UNSUBSCRIPTION_STATUS",
                body: {
                    sub: unsub.channel,
                    status: "Unsubscription from channel ".concat(unsub.channel, " success"),
                    connected: false
                }
            }));
        }
    };
    WS_Handler.prototype.push_subscription = function (channel_name, data) {
        var _this = this;
        Object.keys(this.channels[channel_name]).forEach(function (uuid) {
            _this.channels[channel_name][uuid].send(JSON.stringify({
                type: "SUBSCRIPTION_PUSH",
                body: {
                    data: data,
                    sub: channel_name
                }
            }));
        });
    };
    return WS_Handler;
}());
exports.WS_Handler = WS_Handler;
