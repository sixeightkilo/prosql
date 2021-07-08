import { Log } from './logger.js'
import { Constants } from './constants.js'

const TAG = "index-db"
class IndexDB {
    async open() {
        return new Promise((resolve, reject) => {
            var req = indexedDB.open(Constants.DB_NAME, Constants.DB_VERSION);

            req.onsuccess = (e) => {
                Log(TAG, "open.onsuccess");
                this.db = req.result
                resolve(0)
            };

            req.onerror = (e) => {
                Log(TAG, "open.onerror");
                reject(e.target.errorCode);
            };

            req.onupgradeneeded = (e) => {
                Log(TAG, "open.onupgradeneeded");
                var store = e.currentTarget.result.createObjectStore(
                    Constants.CONNECTIONS, { keyPath: 'id', autoIncrement: true });
            };
        })
    }

	async save(conn) {
		return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([Constants.CONNECTIONS], "readwrite")

			transaction.oncomplete = (e) => {
				resolve(e.target.result)
			};

			transaction.onerror = (e) => {
                reject(e.target.error);
			};

			let objectStore = transaction.objectStore(Constants.CONNECTIONS)
            let request = objectStore.add(conn);
		})
	}
}
export { IndexDB }
