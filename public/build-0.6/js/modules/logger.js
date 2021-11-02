const TAGS = [
    'query-finder',
    'query-history',
    'index-db',
    'query-db',
    'connection-db',
    'file-uploader'
]

const DISABLED = [
    'grid-resizer',
    'query-db',
    //'query-finder',
]

export function Log(tag, str, port = null) {
    //if (!ENABLED.has(tag)) {
        //return
    //}
    //
    if (DISABLED.includes(tag)) {
        return;
    }

    if (tag == "worker") {
        port.postMessage(`${tag}: ${str}`)
        return
    }

    let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/")
    let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /)

    let o = `${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`;
    console.log(o)
}
