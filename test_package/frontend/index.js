import { WS_Interface } from "switchboards_client"

async function init() {
    let client = new WS_Interface("ws://localhost:5000");
    await client.initialize()
    console.log(await client.get("root", { name: "Nathan" }));

    const sub = await client.subscribe("test_sub");
    sub.onMessage((message) => {
        console.log("sub", message);
    })
}

init();