import { Log } from './logger.js'

const TAG = 'cell-template';
const cellTemplate = (createElement, props) => {
    let p = props.model[props.prop]
    return createElement('span', {
      style: {
        color: 'red'
      },
    }, createElement('div', {
        class: 'me'
    }, p['v']));
};
export { cellTemplate }
