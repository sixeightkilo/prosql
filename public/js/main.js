class App {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.$para = document.getElementById('main')
            this.$para.innerHTML = 'Hello from JS!'
            const response = await fetch('http://localhost:23890/ping')
            const json = await response.json()
            console.log(JSON.stringify(json))

            let ws = new WebSocket("ws://localhost:23890/echo");
            ws.onopen = function(evt) {
                console.log("OPEN");
                ws.send("Hi")
            }
            ws.onclose = function(evt) {
                console.log("CLOSE");
                ws = null;
            }
            ws.onmessage = function(evt) {
                console.log("RESPONSE: " + evt.data);
            }
            ws.onerror = function(evt) {
                console.log("ERROR: " + evt.data);
            }

        })
    }
}

new App()
