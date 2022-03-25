import { Logger } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { QueryDB } from './query-db.js'

const TAG = "query-finder"
const MAX_DAYS = 10000;
const VIEW_DAYS = 10;

class QueryFinder {
    constructor() {
        this.$queries = document.getElementById('queries');
        this.queryTemplate = document.getElementById('query-template').innerHTML;
        this.tootipTemplate = document.getElementById('tooltip-template').innerHTML;
    }

    async init() {
        this.queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
        await this.queryDb.open();

        let queries = await this.queryDb.filter({start: VIEW_DAYS, end: 0}, [], []);
        this.showQueries(queries);
        Logger.Log(TAG, JSON.stringify(queries));

        PubSub.subscribe(Constants.QUERY_SAVED, async () => {
            this.reload();
        });

        PubSub.subscribe(Constants.NEW_QUERIES, async () => {
            this.reload();
        });

        this.initTermInput();
        this.initTagInput();
        this.initTagEditor();
        this.initTooltip();
    }

    async reload() {
        let queries = await this.queryDb.filter({start: VIEW_DAYS, end: 0}, [], []);
        this.showQueries(queries);
        Logger.Log(TAG, JSON.stringify(queries));
    }

    initTooltip() {
        //show tootip on clicking the query
        this.$queries.addEventListener('click', async (e) => {
            if (!e.target.classList.contains('query-text')) {
                return;
            }
            Logger.Log(TAG, e.target.classList);
            let id = parseInt(e.target.dataset.id);

            //todo: why just get does not work ??
            let recs = await this.queryDb.findByIds([id]);
            let r = recs[0];
            let t = tippy(document.querySelector(`.query[data-id="${id}"]`), {
                onHidden(instance) {
                    Logger.Log(TAG, "destroying");
                    instance.destroy()
                }
            });

            let q = sqlFormatter.format(r.query, {language: 'mysql'});

            t.setProps({
                content: Utils.processTemplate(this.tootipTemplate, {id: id, query: q.query}),
                placement: 'right',
                delay: 0,
                allowHTML: true,
                interactive: true,
            });

            t.show();
        });

        //copy to clipboard 
        this.$queries.addEventListener('click', async (e) => {
            if (!e.target.classList.contains('copy-query')) {
                return;
            }

            let id = parseInt(e.target.dataset.id);
            Logger.Log(TAG, `Copying ${id}`);
            let recs = await this.queryDb.findByIds([id]);
            let r = recs[0];
            let q = sqlFormatter.format(r.query, {language: 'mysql'});
            await navigator.clipboard.writeText(q.query);
            e.target.nextElementSibling.innerHTML = "&nbsp;&nbsp;&nbsp;Copied.";
        });
    }

    //set up term input
    initTermInput() {
        let input = document.querySelector('#term-input');
        let tagify = new Tagify(input, {placeholder: 'Search queries'});

        tagify.on('input', async (e) => {
			var value = e.detail.value

			tagify.whitelist = null // reset the whitelist
			tagify.loading(true).dropdown.hide()

            let terms = await this.queryDb.listTerms(value);
            Logger.Log(TAG, terms);

            tagify.whitelist = terms;
			tagify.loading(false).dropdown.show(value) // render the suggestions dropdown
		});

        input.addEventListener('change', async (e) => {
            let terms = [];

            if (e.target.value == '') {
                let queries = await this.queryDb.filter({start: VIEW_DAYS, end: 0}, [], []);
                this.showQueries(queries);
                return;
            }

            Logger.Log(TAG, e.target.value);
            let json = JSON.parse(e.target.value);

            for (let i = 0; i < json.length; i++) {
                terms.push(json[i].value);
            }
            Logger.Log(TAG, terms);

            let queries = await this.queryDb.filter({start: MAX_DAYS, end: 0}, [], terms);
            this.showQueries(queries);
        });
    }

    //set up tag input
    initTagInput() {
        let input = document.querySelector('#tags-input');
        let tagify = new Tagify(input, {placeholder: 'Search tags'});

        tagify.on('input', async (e) => {
			var value = e.detail.value

			tagify.whitelist = null // reset the whitelist
			tagify.loading(true).dropdown.hide()

            let tags = await this.queryDb.listTags(value);
            Logger.Log(TAG, tags);

            tagify.whitelist = tags;
			tagify.loading(false).dropdown.show(value) // render the suggestions dropdown
		});

        input.addEventListener('change', async (e) => {
            let tags = [];

            if (e.target.value == '') {
                let queries = await this.queryDb.filter({start: VIEW_DAYS, end: 0}, [], []);
                this.showQueries(queries);
                return;
            }

            Logger.Log(TAG, e.target.value);
            let json = JSON.parse(e.target.value);

            for (let i = 0; i < json.length; i++) {
                tags.push(json[i].value);
            }
            Logger.Log(TAG, tags);

            let queries = await this.queryDb.filter({start: MAX_DAYS, end: 0}, tags, []);
            this.showQueries(queries);
        });
    }

    async showQueries(queries) {
        this.$queries.replaceChildren();
        queries.forEach((q) => {
            let n = Utils.generateNode(this.queryTemplate, {
                id: q.id,
                query: Utils.truncate(q.query, 50),
                timestamp: q.created_at.toLocaleString(),
                time: q.time ?? '',
                rows: q.rows ?? '',
            });

            q.tags.forEach((t) => {
                let tag = Utils.generateNode(`<span class=tag>${t}</span>`, {});
                n.querySelector('.query-tags').append(tag);
            });
            this.$queries.append(n);
        });
    }

    initTagEditor() {
        document.addEventListener('mouseover', (e) => {
            Logger.Log(TAG, "mouseover:" + e.classList);

            if (e.target.classList.contains('query-tags')) {
                //this is just hover actually
                Logger.Log(TAG, "on query");
                let $el = e.target;
                let $tags = $el;

                if ($tags.querySelector('.new-tag')) {
                    //new tag already present on this query
                    //we have to handle this because mouseover may be triggered multiple times
                    return;
                }

                let id = parseInt($el.dataset.id);

                let $tag = Utils.generateNode(`<span class="tag new-tag" contenteditable>click to add new</span>`, {});
                $tags.append($tag);

                //save new tag when user hits tab or enter
                let $newTag = $tags.querySelector('.new-tag');
                ((id, $newTag) => {
                    $newTag.addEventListener('keyup', async (e) => {
                        if (e.key == "Tab" || e.key == "Enter") {
                            let tag = $newTag.innerText.trim();
                            if (tag == '') {
                                $newTag.blur();
                                return;
                            }

                            Logger.Log(TAG, `Setting tag ${tag} on id ${id}`);
                            $newTag.classList.remove('new-tag');
                            $newTag.blur();
                            //get the record, update tags and save. Probably not very efficient
                            let recs = await this.queryDb.findByIds([id]);
                            let newRec = recs[0];
                            newRec.tags.push(tag);
                            Logger.Log(TAG, newRec);

                            await this.queryDb.updateTags(newRec);
                            PubSub.publish(Constants.QUERY_UPDATED, {id: id});
                        }

                        if (e.key == "Escape") {
                            $newTag.innerHTML = 'click to add new';
                            $newTag.blur();
                        }
                    });

                    $newTag.addEventListener('click', (e) => {
                        $newTag.innerHTML = '<span>&nbsp</span>';
                    });

                })(id, $newTag);

                //delete new tag if user leaves card without editing
                (($el) => {
                    $el.addEventListener('mouseleave', () => {
                        Logger.Log(TAG, "outside query");
                        let $tag = $el.querySelector('.new-tag'); 
                        if ($tag) {
                            $tag.remove();
                        }
                    });
                })($el);
            }
        });
    }
}

export { QueryFinder }
