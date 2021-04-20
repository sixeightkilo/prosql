import { Constants } from './constants.js'

class Db {
    async openDb() {
        return new Promise((resolve, reject) => {
            var req = indexedDB.open(Constants.DB_NAME, Constants.DB_VERSION);

            req.onsuccess = (evt) => {
                console.log("openDb.onsuccess");
                this.db = req.result
                resolve(0)
            };

            req.onerror = (evt) => {
                console.log("openDb.onerror");
                reject(evt.target.errorCode);
            };

            req.onupgradeneeded = (evt) => {
                console.log("openDb.onupgradeneeded");
                var store = evt.currentTarget.result.createObjectStore(
                    Constants.CONNECTIONS, { keyPath: 'id', autoIncrement: true });

                store.createIndex('name', 'name', { unique: true });
            };
        })
    }

	async save(conn) {
		return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([Constants.CONNECTIONS], "readwrite")

			transaction.oncomplete = (event) => {
				resolve(0)
			};

			transaction.onerror = (event) => {
                reject(evt.target.errorCode);
			};

			let objectStore = transaction.objectStore(Constants.CONNECTIONS)
            let request = objectStore.add(conn);
		})
	}
}
export { Db }
