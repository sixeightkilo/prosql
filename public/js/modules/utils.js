import { Log } from './logger.js'
import { Err } from './error.js'

const TAG = "utils"
class Utils {
    static saveToSession(key, val) {
        sessionStorage.setItem(key, val)
    }

    static getFromSession(key) {
        return sessionStorage.getItem(key)
    }

    //https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
    static generateNode(templ, data) {
        let re = new RegExp(/{(.*?)}/g);

        templ = templ.replace(re, function(match, p1) {
            if (data[p1] || data[p1] == 0 || data[p1] == '') {
                return data[p1];
            } else {
                return match;
            }
        });

        let template = document.createElement('template');
        template.innerHTML = templ.trim()
        return template.content
    }

    static async fetch(url, handleError = true) {
        try {
            let response = await fetch(url, {
                headers: {
                    'X-Request-ID': Utils.uuid()
                }
            })

            Log(TAG, response)

            let json = await response.json()

            if (json.status == 'error') {
                throw json
            }

            return json
        } catch (e) {
            Log(TAG, e)
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
                window.location = '/login';
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
        Log(TAG, "No data")
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
}
export { Utils }
