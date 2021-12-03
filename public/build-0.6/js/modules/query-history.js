import { Logger } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { QueryDB } from './query-db.js'
import { FileDownloader } from './file-downloader.js'
import { FileUploader } from './file-uploader.js'
import ProgressBar from './progress-bar.js'

const TAG = "query-history"
const MAX_DAYS = 10000;

class QueryHistory {
    constructor() {
        PubSub.subscribe(Constants.QUERY_DISPATCHED, async (query) => {
            Logger.Log(TAG, JSON.stringify(query));

            if (!this.queryDb) {
                await this.init();
            }

            let id = await this.queryDb.save(query); 
            Logger.Log(TAG, `Saved to ${id}`);
            PubSub.publish(Constants.QUERY_SAVED, {id: id});
        });

        PubSub.subscribe(Constants.FILE_UPLOADED, async (data) => {
            await this.handleUpload(data);
        });

        let $download = document.getElementById('download-history');
        if ($download) {
            //download icon is not present on content page
            $download.addEventListener('click', async () => {
                await this.handleDownload();
            });

            document.getElementById('import-file').addEventListener('click', async () => {
                let uploader = new FileUploader();
                uploader.show();
            });
        }
    }

    async init() {
        this.queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
        try {
            await this.queryDb.open();
        } catch (e) {
            Logger.Log(TAG, "Unable to open DB");
            this.queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION}, true);
            await this.queryDb.open();
            await this.queryDb.removeDuplicates();
            Logger.Log(TAG, "Removed duplicates");
        }
    }

    async handleDownload() {
        let queries = await this.queryDb.filter({start: MAX_DAYS, end: 0}, [], []);
        for (let i = 0; i < queries.length; i++) {
            let q = queries[i];
            let year = q.created_at.getFullYear();
            let month = q.created_at.getMonth();
            let date = q.created_at.getDate();
            let hours = q.created_at.getHours();
            let minutes = q.created_at.getMinutes();
            let seconds = q.created_at.getSeconds();

            queries[i]['year'] = year;
            queries[i]['month'] = month;
            queries[i]['date'] = date;
            queries[i]['hours'] = hours;
            queries[i]['minutes'] = minutes;
            queries[i]['seconds'] = seconds;

            delete(queries[i].created_at);
        }

        FileDownloader.download(JSON.stringify(queries), 'data.json', 'application/json');
    }

    async handleUpload(data) {
        ProgressBar.setOptions({});//no buttons
        PubSub.publish(Constants.INIT_PROGRESS, {});
        PubSub.publish(Constants.START_PROGRESS, {});

        for (let i = 0; i < data.length; i++) {
            let d = data[i];
            if (d.id) {
                delete(d.id);
            }

            let createdAt = new Date();
            createdAt.setFullYear(d.year);
            createdAt.setMonth(d.month);
            createdAt.setDate(d.date);
            createdAt.setHours(d.hours);
            createdAt.setMinutes(d.minutes);
            createdAt.setSeconds(d.seconds);

            delete(d.year);
            delete(d.month);
            delete(d.date);
            delete(d.hours);
            delete(d.minutes);
            delete(d.seconds);
            d.created_at = createdAt;
            let id = await this.queryDb.save(d);

            PubSub.publish(Constants.UPDATE_PROGRESS, {
                message: `Imported ${i + 1} of ${data.length}`
            });

            Logger.Log(TAG, `Saved to ${id}`);
        }
        PubSub.publish(Constants.STOP_PROGRESS, {});
    }
}

export { QueryHistory }
