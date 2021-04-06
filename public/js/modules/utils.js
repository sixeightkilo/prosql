import { Err } from './error.js'

class Utils {
    static saveToSession(key, val) {
        sessionStorage.setItem(key, val)
    }

    static getFromSession(key, val) {
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
        return template.content.firstChild;
    }

    static async fetch(url) {
        try {
            let response = await fetch(url)
            let json = await response.json()
            if (json.status == 'error') {
                throw json
            }

            return json
        } catch (e) {
            console.log(e)
            if (e['error-code'] == Err.ERR_INVALID_SESSION_ID) {
                window.location = '/';
                return
            }

            if (e.msg) {
                //normal error
                alert(e.msg)
                return e
            }

            //something terrible happened
            alert("Unrecoverable error. Most likely prosql agent is dead :-(")
            return {
                'status' : 'error',
                'msg': e,
                'data': null,
            }
        }
    }
}
export { Utils }
