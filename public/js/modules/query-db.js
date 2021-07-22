import { Log } from './logger.js'
import { Constants } from './constants.js'
import { BaseDB } from './base-db.js'

const TAG = "query-db"
const CREATED_AT_INDEX = "created-at-index";
const QUERY_INDEX = "query-index";
const TERM_INDEX = "term-index";
const TAG_INDEX = "tag-index";

class QueryDB extends BaseDB {
    constructor(db, version) {
        super(db, version);
        this.store = "queries";
        this.searchIndex = "search-index";
        this.tagIndex = "tag-index";
    }

    onUpgrade(evt) {
        Log(TAG, "open.onupgradeneeded");
        let store = evt.target.result.createObjectStore(
            this.store, { keyPath: 'id', autoIncrement: true });
        store.createIndex(CREATED_AT_INDEX, "created_at", { unique : false });

        store = evt.target.result.createObjectStore(
            this.searchIndex, { keyPath: 'id', autoIncrement: true });
        store.createIndex(TERM_INDEX, "term", { unique : true });

        store = evt.target.result.createObjectStore(
            this.tagIndex, { keyPath: 'id', autoIncrement: true });
        store.createIndex(TAG_INDEX, "tag", { unique : true });
    }

    async save(rec) {
        return new Promise(async (resolve, reject) => {
            //remove all new lines
            rec.query = rec.query.replace(/\r?\n|\r/g, " ");
            let terms = rec.query.split(' ');

            //get all unique terms
            //https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
            terms = [...new Set(terms)];

            Log(TAG, JSON.stringify(terms));
            let id = -1;
            try {
                //apppend timestamp if required
                if (!rec.created_at) {
                    rec.created_at = new Date();
                }

                id = await super.save(this.store, rec);
                if (id == -1) {
                    resolve(-1);
                    return;
                }

                await this.updateSearchIndex(id, terms);
                await this.updateTagIndex(id, rec.tags);

                resolve(id);
            } catch (e) {
                Log(TAG, `error: ${JSON.stringify(e.message)}`);
                reject(e.message);
            }
        })
    }

    async updateSearchIndex(id, terms) {
        //add id to each of the tags
        for (let i = 0; i < terms.length; i++) {
            let t = terms[i];
            t = t.trim();

            if (t.length <= 1) {
                continue;
            }

			t = this.cleanup(t);
            try {
                let rec = await this.findByTerm(t);
                //add a new tag
                if (rec == null) {
                    await super.save(this.searchIndex, {
                        term: t,
                        queries:[id]
                    });
                    continue;
                }

                //update tag
                rec['queries'].push(id);
                Log(TAG, JSON.stringify(rec));
                super.update(this.searchIndex, {
                    id: rec.id,
                    term: t,
                    queries: rec['queries']
                });

            } catch (e) {
                Log(TAG, `error: e.message`);
            }
        }
    }

    async findByTerm(term) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(this.searchIndex);
            let objectStore = transaction.objectStore(this.searchIndex);
            let index = objectStore.index(TERM_INDEX);

            let key = IDBKeyRange.only(term);
            index.openCursor(key).onsuccess = (ev) => {
                let cursor = ev.target.result;
                if (cursor) {
                    Log(TAG, JSON.stringify(cursor.value));
                    resolve(cursor.value);
                    return;
                }

                resolve(null);
            };
        })
    }

    async updateTagIndex(id, tags) {
        //add id to each of the tags
        for (let i = 0; i < tags.length; i++) {
            let t = tags[i];
            t = t.trim();

            if (t.length <= 1) {
                continue;
            }

            t = this.cleanup(t);
            try {
                let rec = await this.findByTag(t);
                //add a new tag
                if (rec == null) {
                    await super.save(this.tagIndex, {
                        tag: t,
                        queries:[id]
                    });
                    continue;
                }

                //update tag
                rec['queries'].push(id);
                Log(TAG, JSON.stringify(rec));
                super.update(this.tagIndex, {
                    id: rec.id,
                    tag: t,
                    queries: rec['queries']
                });

            } catch (e) {
                Log(TAG, `error: e.message`);
            }
        }
    }

    async findByTag(tag) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(this.tagIndex);
            let objectStore = transaction.objectStore(this.tagIndex);
            let index = objectStore.index(TAG_INDEX);

            let key = IDBKeyRange.only(tag);
            index.openCursor(key).onsuccess = (ev) => {
                let cursor = ev.target.result;
                if (cursor) {
                    Log(TAG, JSON.stringify(cursor.value));
                    resolve(cursor.value);
                    return;
                }

                resolve(null);
            };
        })
    }

    async findByQuery(query) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(this.dbName);
            let objectStore = transaction.objectStore(this.store);
            let index = objectStore.index(QUERY_INDEX);

            let key = IDBKeyRange.only(query);
            index.openCursor(key).onsuccess = (ev) => {
                let cursor = ev.target.result;
                if (cursor) {
                    Log(TAG, JSON.stringify(cursor.value));
                    resolve(cursor.value);
                    return;
                }

                resolve([]);
            };
        })
    }

    //https://stackoverflow.com/questions/26156292/trim-specific-character-from-a-string
    cleanup(str) {
        //remove table qualifiers like table_name.<...>
        str = str.replace(/^\S+\./, "");

        let chars = ['`', '`', ' '];
        var start = 0, 
            end = str.length;

        while(start < end && chars.indexOf(str[start]) >= 0)
            ++start;

        while(end > start && chars.indexOf(str[end - 1]) >= 0)
            --end;

        return (start > 0 || end < str.length) ? str.substring(start, end) : str;
    }

    async filter(days, tags, terms) {
        //days supercedes everything
        //if days are provided get queries by days first
        //then filter by terms and tags if provided
        let start, end;
        if (days.hasOwnProperty('start')) {
            start = new Date(Date.now() - (days.start * 24 * 60 * 60 * 1000));
            start.setHours(0);
            start.setMinutes(0);
            start.setSeconds(0);
        }

        if (days.hasOwnProperty('end')) {
            end = new Date(Date.now() - (days.end * 24 * 60 * 60 * 1000));
            end.setHours(23);
            end.setMinutes(59);
            end.setSeconds(59);
        }

        let result = [];
        if (start || end) {
            Log(TAG, 'filtering');
            result = await this.searchByCreatedAt(start, end);

            if (result.length == 0) {
                //if days were provided and we did not find anything
                //no need to process further
                return [];
            }
        }

        if (tags.length > 0) {
            let idsByTag = await this.searchByTags(tags);

            result = result.filter(x => idsByTag.includes(x));
            if (result.length == 0) {
                //no need to process further
                return [];
            }
        }

        if (terms.length > 0) {
            let idsByTerm = await this.searchByTerms(terms);

            result = result.filter(x => idsByTerm.includes(x));
            if (result.length == 0) {
                //no need to process further
                return [];
            }
        }

        return await this.findByIds(result);
    }

    findByIds(ids) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(this.store);
            let objectStore = transaction.objectStore(this.store);
            let queries = [];

            objectStore.openCursor().onsuccess = (ev) => {
                let cursor = ev.target.result;
                if (cursor) {
                    if (ids.includes(cursor.value.id)) {
                        queries.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(queries);
                }
            };
        });
    }

    searchByTerms(terms) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(this.searchIndex);
            let objectStore = transaction.objectStore(this.searchIndex);
            let ids = [];

            objectStore.openCursor().onsuccess = (ev) => {
                let cursor = ev.target.result;
                if (cursor) {
                    if (terms.includes(cursor.value.term)) {
                        ids = ids.concat(cursor.value.queries);
                    }
                    cursor.continue();
                } else {
                    resolve(ids);
                }
            };
        });
    }

    searchByTags(tags) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(this.tagIndex);
            let objectStore = transaction.objectStore(this.tagIndex);
            let ids = [];

            objectStore.openCursor().onsuccess = (ev) => {
                let cursor = ev.target.result;
                if (cursor) {
                    if (tags.includes(cursor.value.tag)) {
                        ids = ids.concat(cursor.value.queries);
                    }
                    cursor.continue();
                } else {
                    resolve(ids);
                }
            };
        });
    } 

    searchByCreatedAt(s, e) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(this.store);
            let objectStore = transaction.objectStore(this.store);
            let index = objectStore.index(CREATED_AT_INDEX);

            // s -----> e ----> now
            let key
            if (s && e) {
                key = IDBKeyRange.bound(s, e);
            } else if (s) {
                key = IDBKeyRange.lowerBound(s);
            } else if (e) {
                key = IDBKeyRange.upperBound(e);
            } else {
                resolve([]);
                return;
            }

            let queries = []
            index.openCursor(key).onsuccess = (ev) => {
                let cursor = ev.target.result;
                if (cursor) {
                    queries.push(cursor.value.id);
                    cursor.continue();
                } else {
                    resolve(queries);
                }
            };
        });
    }
} 

export { QueryDB }
