(function () {
    'use strict';

    const DISABLED = [
        'grid-resizer',
        'query-db',
        //'query-finder',
    ];

    //workers do not support console.log. How to debug ? 
    // We send a message to the module that initiated worker and 
    // have it print the debug log
    // But sending message requires port which is available only in 
    // worker. How to use a common logger for entire system?
    // We create static "Log" method which can use used for all code that 
    // does not get directly called from worker. For any code that gets
    // called from worker we use the "log" method.

    class Logger {
        constructor(port = null) {
            this.port = port;
        }

        log(tag, str) {
            if (DISABLED.includes(tag)) {
                return;
            }

            if (this.port) {
                this.port.postMessage(`${tag}: ${str}`);
                return
            }

            Logger.print(tag, str);
        }

        static Log(tag, str) {
            if (DISABLED.includes(tag)) {
                return;
            }

            Logger.print(tag, str);
        }

        static print(tag, str) {
            let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/");
            let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);

            let o = `${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`;
            console.log(o);
        }
    }

    const TAG = "tabs";

    class Tabs {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                Logger.Log(TAG, 'DOMContentLoaded');
                this.$tabs = document.querySelector('.tabs');
                this.$contents = document.querySelectorAll('.tab-content');
                this.init();
            });
        }

        init() {
            let list = this.$tabs.querySelectorAll('li');
            list.forEach((t) => {
                t.addEventListener('click', (e) => {
                    let li = e.target.parentElement;
                    if (li.classList.contains('is-active')) {
                        return;
                    }

                    //disable currently active tab
                    this.$tabs.querySelector('.is-active').classList.remove('is-active');
                    this.$contents.forEach((e) => {
                        e.style.display = "none";
                    });

                    //activate current tab
                    li.classList.add('is-active');

                    //and the content
                    let target = e.target;
                    Logger.Log(TAG, target.className);
                    this.$contents.forEach(($c) => {
                        if ($c.classList.contains(`${target.className}`)) {
                            $c.style.display = "block";
                        }
                    });
                });
            });
        }
    }

    class Help {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                let $contact = document.querySelector('.contact');
                $contact.classList.remove('is-hidden');
            });

            new Tabs();
        }
    }

    new Help();

}());
