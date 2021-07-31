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
    'query-finder',
    'query-history',
]

export function Log(tag, str) {
    //if (!ENABLED.has(tag)) {
        //return
    //}
    //
    if (DISABLED.includes(tag)) {
        return;
    }

    let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/")
    let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /)

    console.log(`${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`)
}
