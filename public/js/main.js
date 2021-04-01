class App {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.$para = document.getElementById('main')
            this.$para.innerHTML = 'Hello from JS!'
            const response = await fetch('http://localhost:23890')
            const json = await response.json()
            console.log(JSON.stringify(json))
        })
    }
}

new App()
