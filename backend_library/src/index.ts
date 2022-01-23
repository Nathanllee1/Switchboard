import { WS_Handler } from "./ws_parser";

const handler = new WS_Handler(5000);


handler.get("root", (args) => {
    return(`Hello ${args["name"]}!`)
})

handler.setup_channel("test_sub");

setInterval(() => {
    handler.push_subscription("test_sub", "TEST_DATA");
}, 2000)
