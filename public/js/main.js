class App {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.$para = document.getElementById('main')
            this.$para.innerHTML = 'Hello from JS!'
        })
    }
}

new App()
