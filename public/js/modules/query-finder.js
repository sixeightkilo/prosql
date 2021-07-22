import { defineCustomElements } from '/node_modules/@revolist/revogrid/dist/esm/loader.js'
import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { QueryDB } from './query-db.js'

const TAG = "query-finder"

class QueryFinder {
    constructor() {
        defineCustomElements();
        //create search panel
        this.$root = document.getElementById('app-left-panel')
        this.rootTemplate = document.getElementById('query-search-template').innerHTML
        this.$root.replaceChildren()
        let n = Utils.generateNode(this.rootTemplate, {})
        this.$root.append(n)
        //this.$root.style.width = '30vw';
        this.$queries = document.getElementById('queries');
        this.queryTemplate = document.getElementById('query-template').innerHTML;

        this.init();

            }

    async init() {
        this.queryDb = new QueryDB("queries", 1);
        await this.queryDb.open();

        let queries = await this.queryDb.filter({start: 2, end: 0}, [], []);
        this.showQueries(queries);
        Log(TAG, JSON.stringify(queries));

        PubSub.subscribe(Constants.QUERY_SAVED, async (query) => {
            let queries = await this.queryDb.filter({start: 2, end: 0}, [], []);
            this.showQueries(queries);
            Log(TAG, JSON.stringify(queries));
        });
    }

    async showQueries(queries) {
        this.$queries.replaceChildren();
        queries.forEach((q) => {
            let n = Utils.generateNode(this.queryTemplate, {
                query: q.query,
                timestamp: q.created_at.toLocaleString(),
            });

            q.tags.forEach((t) => {
                let tag = Utils.generateNode(`<span class=tag>${t}</span>`, {});
                n.querySelector('.tags').append(tag);
            });
            this.$queries.append(n);
        });
    }
}

export { QueryFinder }
