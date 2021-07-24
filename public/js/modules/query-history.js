import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { QueryDB } from './query-db.js'
import { FileDownloader } from './file-downloader.js'

const TAG = "query-history"

class QueryHistory {
    constructor() {
        PubSub.subscribe(Constants.QUERY_DISPATCHED, async (query) => {
            Log(TAG, JSON.stringify(query));

            if (!this.queryDb) {
                this.queryDb = await this.init();
            }

            let id = await this.queryDb.save(query); 
            Log(TAG, `Saved to ${id}`);
            PubSub.publish(Constants.QUERY_SAVED, {id: id});
        });

        document.getElementById('download-history').addEventListener('click', async () => {
            let queries = await this.queryDb.filter({start: 10000, end: 0}, [], []);
            let csv = ''
            queries.forEach(function(q) {
                    let tags = q.tags.reduce((a, b) => `${a},${b}`);
                    csv += `"${q.query}","${q.created_at}","${tags}"\r\n`; 
            });

            FileDownloader.download(csv, 'data.csv');
        });
    }

    async init() {
        let db = new QueryDB({version: 1});
        await db.open();
        return db;
    }
}

export { QueryHistory }
