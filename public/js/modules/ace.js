class Ace {
    static init() {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = '/ace-builds/src-min/ace.js'
            document.head.appendChild(script);

            script.onload = () => {
                resolve(ace)
            };
        });
	}
}

export { Ace }
