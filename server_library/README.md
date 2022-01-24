# Switchboard.js

**A framework for building dynamic and performant web applications on top of the Websocket protocol.**

Has a backend server library with an accompanying frontend browser library. This abstracts away a lot of repetitive patterns behind an extremely easy to use interface.  

Has Typescript support!

```
npm i switchboards
```

**Note:** this is highly experimental and should be used with caution

## Core Components
### Requests
Designed to be very similiar to Express js, but completely implemented in websockets. <br>
#### Client
```javascript
import { WS_Handler } from "switchboard";

const app = new WS_Handler(5000);

app.get("root", (args) => {
    return(`Hello ${args["name"]}!`)
})
```

#### Server
```javascript
let client = new WS_Interface("ws://localhost:5000");
await client.initialize()
await client.get("root", {name: "Nathan"})
// Hello Nathan!
```

**Why not just use Express?**  
I've found that trying to make a hybrid webapp with Express and Websockets gets clumsy, and often I just need basic response endpoints. Websockets are more flexible, with bidirectional communication and unlimited request times

### Pub Sub
A basic pub sub implementation that allows the server to push events to clients.
#### Client
```javascript
const sub:Sub = await ws_client.subscribe("test_sub");
sub.onMessage((message) => {
    console.log("sub", message);
})
```
#### Server
```javascript
handler.setup_channel("test_sub");
handler.push_subscription("test_sub", "TEST_DATA");
// client logs "TEST_DATA"
```
