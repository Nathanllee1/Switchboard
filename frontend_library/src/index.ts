import { WS_Interface } from "./ws_interface";
import { Sub } from "./sub";


async function init() {
    console.time("Get");
    let ws_client = new WS_Interface("ws://localhost:5000");

    await ws_client.initialize()

    console.log(await ws_client.get("root", {name: "Nathan"}));

    console.timeEnd("Get");
    const sub:Sub = await ws_client.subscribe("test_sub");

    console.log("Subscribed!");

    sub.onMessage((message) => {
        console.log("sub", message);
    })

    const sub2:Sub = await ws_client.subscribe("test_sub2");

    sub2.onMessage((message) => {
        console.log("sub2", message);
    })
}

init();