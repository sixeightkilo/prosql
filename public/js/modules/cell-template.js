import { Log } from './logger.js'

const TAG = 'cell-template';
const cellTemplate = (createElement, props) => {
    let p = props.model[props.prop]
    //let e = createElement('span', {
      //style: {
        //color: 'red'
      //},
    //}, createElement('div', {
        //class: 'me'
    //}, p['v']));
//
    //return e;
    let nullClass = '';
    if (p['v'] == "NULL") {
        nullClass = 'null'
    }

    if (p['ref-table']) {
        return createElement('div', {},
                                createElement('span', {}, p['v']),
                                createElement('i', {
                                    'class': 'icon-new-tab',
                                    'data-table': p['ref-table'],
                                    'data-column': p['ref-column'],
                                }));
    }

    return createElement('div', {class: nullClass}, p['v']);
};
export { cellTemplate }
