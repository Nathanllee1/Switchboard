"use strict";
exports.__esModule = true;
exports.WS_User = void 0;
var uuid_1 = require("uuid");
var WS_User = /** @class */ (function () {
    function WS_User(ws_obj, server) {
        var _this = this;
        this.server = server;
        this.ws_obj = ws_obj;
        ws_obj.on("message", function (message) {
            _this.handle_message(message.toString(), _this.server);
        });
        this.uuid = (0, uuid_1.v4)();
    }
    WS_User.prototype.handle_message = function (data, server) {
        var parsed;
        parsed = JSON.parse(data);
        console.log(parsed);
        switch (parsed.type) {
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
                throw ("".concat(parsed.type, " is not a valid data type"));
        }
    };
    WS_User.prototype.send = function (data) {
        this.ws_obj.send(data);
    };
    return WS_User;
}());
exports.WS_User = WS_User;
