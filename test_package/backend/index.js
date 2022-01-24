import { WS_Handler } from "switchboards";

const app = new WS_Handler(5000);

app.get("root", (args) => {
    return(`Hello ${args["name"]}!`)
})

app.setup_channel("test_sub");

setInterval(() => {
    app.push_subscription("test_sub", "TEST_DATA");
}, 2000)
