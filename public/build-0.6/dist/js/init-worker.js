(function () {
    'use strict';

    const DISABLED = [
        'grid-resizer',
        'query-db',
        //'query-finder',
    ];

    function Log(tag, str, port = null) {
        //if (!ENABLED.has(tag)) {
            //return
        //}
        //
        if (DISABLED.includes(tag)) {
            return;
        }

        if (tag == "worker") {
            port.postMessage(`${tag}: ${str}`);
            return
        }

        let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/");
        let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);

        let o = `${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`;
        console.log(o);
    }

    const TAG = "worker";
    const URL = '/browser-api/sqlite';

    class Worker {
        constructor(port) {
            this.port = port;
            //this.port.postMessage(Constants.USER);
        }

        async init() {
            let res = await fetch(`${URL}/about`);
            res = await res.json();
            Log(TAG, JSON.stringify(res), this.port);
        }
    }

    onconnect = async (e) => {
        let port = e.ports[0];
        let w = new Worker(port);
        w.init();
    };

}());
