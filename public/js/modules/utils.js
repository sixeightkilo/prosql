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
        //let html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = templ.trim()
        return template.content.firstChild;
    }

}
export { Utils }
