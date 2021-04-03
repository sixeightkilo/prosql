class App {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            //this.$para = document.getElementById('main')
            //this.$para.innerHTML = 'Hello from JS!'

            let params = {
                user: 'server',
                pass: 'dev-server',
                ip: '127.0.0.1',
                port: 3306,
                db: 'test-generico'
            }

            let response = await fetch('http://localhost:23890/ping?' + new URLSearchParams(params))
            let json = await response.json()
            console.log(JSON.stringify(json))
            
            response = await fetch('http://localhost:23890/login?' + new URLSearchParams(params))
            json = await response.json()
            console.log(JSON.stringify(json))

            let sessionId = json.data['session-id']
            console.log(`sid: ${sessionId}`)

            params = {
                'session-id': sessionId
            }

            response = await fetch('http://localhost:23890/check?' + new URLSearchParams(params))
            json = await response.json()
            console.log(JSON.stringify(json))

            //let ws = new WebSocket("ws://localhost:23890/echo");
            //ws.onopen = function(evt) {
                //console.log("OPEN");
                //ws.send("Hi")
            //}
            //ws.onclose = function(evt) {
                //console.log("CLOSE");
                //ws = null;
            //}
            //ws.onmessage = function(evt) {
                //console.log("RESPONSE: " + evt.data);
            //}
            //ws.onerror = function(evt) {
                //console.log("ERROR: " + evt.data);
            //}
        })
    }
}

new App()
