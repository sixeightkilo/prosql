(function () {
    'use strict';

    const DISABLED = [
        'grid-resizer',
        'query-db',
        //'query-finder',
    ];

    function Log(tag, str) {
        //if (!ENABLED.has(tag)) {
            //return
        //}
        //
        if (DISABLED.includes(tag)) {
            return;
        }

        let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/");
        let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);

        console.log(`${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`);
    }

    const TAG = "tabs";

    class Tabs {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                Log(TAG, 'DOMContentLoaded');
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
                    Log(TAG, target.className);
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
