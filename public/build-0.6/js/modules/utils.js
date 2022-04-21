import { Logger } from './logger.js'
import { Err } from './error.js'
import { QueryDB } from './query-db.js'
import { QueriesMetaDB } from './queries-meta-db.js'
import { ConnectionDB } from './connection-db.js'
import { ConnectionsMetaDB } from './connections-meta-db.js'
import { Constants } from './constants.js'

const TAG = "utils"
class Utils {
    static saveToSession(key, val) {
        window.sessionStorage.setItem(key, val)
    }

    static getFromSession(key) {
        return window.sessionStorage.getItem(key)
    }

    static saveToLocalStorage(key, value) {
        window.localStorage.setItem(key, value);
    }

    static getFromLocalStorage(key) {
        return window.localStorage.getItem(key) ?? null;
    }

    static removeFromLocalStorage(key) {
        return window.localStorage.removeItem(key);
    }

	static processTemplate(templ, data) {
		var re = new RegExp(/{(.*?)}/g);
		templ = templ.replace(re, function(match, p1) {
			if (data[p1] || data[p1] == 0 || data[p1] == '') {
				return data[p1];
			} else {
				return match;
			}
		});
		return templ;
	}

	//https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
	static generateNode(templ, data) {
        templ = Utils.processTemplate(templ, data);	
        let template = document.createElement('template');
        template.innerHTML = templ.trim()
        return template.content
    }

    static async get(url, handleError = true, headers = {}) {
        try {
            let hdrs = {
                'X-Request-ID': Utils.uuid()
            };
            hdrs = {...hdrs, ...headers}
            let response = await fetch(url, {
                headers: hdrs
            })

            let json = await response.json()
            Logger.Log(TAG, JSON.stringify(json));

            if (json.status == 'error') {
                throw json
            }

            return json
        } catch (e) {
            Logger.Log(TAG, JSON.stringify(e));
            let res = {
                'status' : 'error',
                'data': null,
            };

            if (e instanceof TypeError) {
                if (!handleError) {
                    res.msg = Err.ERR_NO_AGENT;
                    return res;
                }
                //user must install agent
                window.location = '/install';
                return;
            }

            res.msg = e.msg;
            if (res.msg == Err.ERR_INVALID_SESSION_ID) {
                //user must login
                window.location = '/connections';
                return;
            }

            //let client handle this
            if (!handleError) {
                return res
            }

            if (res.msg == Err.ERR_INVALID_CURSOR_ID) {
                //let caller handle this too
                return res
            }

            //common error handling
            if (res.msg) {
                //normal error. Display to user
                alert(res.msg)
                return res
            }
        }
    }

    static async post(url, body, handleError = true, headers = {}) {
        try {
            let hdrs = {
                'X-Request-ID': Utils.uuid()
            };
            hdrs = {...hdrs, ...headers}
            let formData = new FormData();

            for (let k in body) {
                formData.append(k, body[k]);
            }

            let response = await fetch(url, {
                headers: hdrs,
                body: formData,
                method: "post"
            })

            let json = await response.json()
            Logger.Log(TAG, JSON.stringify(json));

            if (json.status == 'error') {
                throw json
            }

            return json
        } catch (e) {
            Logger.Log(TAG, JSON.stringify(e));
            let res = {
                'status' : 'error',
                'data': null,
            };

            if (e instanceof TypeError) {
                if (!handleError) {
                    res.msg = Err.ERR_NO_AGENT;
                    return res;
                }
                //user must install agent
                window.location = '/install';
                return;
            }

            res.msg = e.msg;
            if (res.msg == Err.ERR_SIGNIN_REQUIRED) {
                window.location = '/signin';
                return;
            }

            //let client handle this
            if (!handleError) {
                return res
            }

            if (res.msg == Err.ERR_INVALID_CURSOR_ID) {
                //let caller handle this too
                return res
            }

            //common error handling
            if (res.msg) {
                //normal error. Display to user
                alert(res.msg)
                return res
            }
        }
    }

    static async setOptions($ctx, values, def) {
        $ctx.replaceChildren()

        let $ot = document.getElementById('option-template')
        let ot = $ot.innerHTML

        values.forEach((v) => {
            let h = Utils.generateNode(ot, {value: v});
            $ctx.append(h)
        })

        $ctx.value = def
    }

    static showAlert(msg, t) {
        let $alrt = document.getElementById('alert');
        let $msg = $alrt.querySelector('.msg');
        $msg.innerHTML = msg;
        $alrt.style.display = 'block';

        let bodyDims = document.querySelector('body').getBoundingClientRect()
        $alrt.style.left = (bodyDims.width / 2) + 'px';

        setTimeout(() => {
            $alrt.style.display = 'none';
        }, t)
    }

    static showNoData() {
        Logger.Log(TAG, "No data")
    }

    //https://gist.github.com/gordonbrander/2230317
    static uuid() {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    static getOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
        };
    }

   static extractColumns(arr) {
        let cols = []
        arr.forEach((e) => {
            cols.push(e[1])
        })

        return cols
    }

    static truncate(s, max) {
		if (s.length > max) {
			return s.substring(0, max) + '...';
		}
		return s;
	}

    static getTimestamp() {
        let d = (new Date()).toISOString();
        return d.replace(/T/, ' ').replace(/\..*$/, '');
    }

	static getRandomIntegerInclusive(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

    static isEmpty(obj) { 
        for (var x in obj) {
            return false; 
        }
        return true;
    }

    static async resetAll() {
        let connDb = new ConnectionDB(new Logger(), {version: Constants.CONN_DB_VERSION});
        await connDb.open();
        let conns = await connDb.getAll();
        Logger.Log(TAG, "Resetting connections..");
        for (let i = 0; i < conns.length; i++) {
            await connDb.reset(conns[i]);
        }
        Logger.Log(TAG, "Done.");

        let queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
        await queryDb.open();
        let queries = await queryDb.getAll();
        Logger.Log(TAG, "Resetting queries..");
        for (let i = 0; i < queries.length; i++) {
            await queryDb.reset(queries[i]);
        }
        Logger.Log(TAG, "Done.");

        Logger.Log(TAG, "Resetting QueriesMetaDB");
        let queriesMetaDb = new QueriesMetaDB(new Logger(), {version: Constants.QUERIES_META_DB_VERSION});
        await queriesMetaDb.open();
        await queriesMetaDb.destroy();
        Logger.Log(TAG, "Done.");

        Logger.Log(TAG, "Resetting connectionsMetaDb");
        let connectionsMetaDb = new ConnectionsMetaDB(new Logger(), {version: Constants.CONNECTIONS_META_DB_VERSION});
        await connectionsMetaDb.open();
        await connectionsMetaDb.destroy();
        Logger.Log(TAG, "Done.");
    }

    static async delay(t) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, t);
        });
    }

    static getTerms(query) {
        let terms = [];
        let tokens = sqlFormatter.format(query, {language: "mysql"}).tokens;
        //select only reserved*, string and number
        tokens.forEach((t) => {
            if (t.type == "string") {
                terms.push(t.value);
                return;
            }

            if (t.type == "number") {
                terms.push(t.value);
                return;
            }

            if (/^reserved/.test(t.type)) {
                terms.push(t.value);
                return;
            }
        });
        return terms;
    }
}
export { Utils }
