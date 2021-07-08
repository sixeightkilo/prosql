const columnTemplate = (createElement, column) => {
    return createElement('span', {
      style: {
        color: 'red'
      },
    }, createElement('div', {
        class: 'me'
    }, column.name));
};
export { columnTemplate }
