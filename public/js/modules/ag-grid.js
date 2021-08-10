class AgGrid {
    static init() {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = 'https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.noStyle.js';
            document.head.appendChild(script);

			let link = document.createElement("link");
			link.href = "https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css";
			link.type = "text/css";
			link.rel = "stylesheet";
			document.getElementsByTagName("head")[0].appendChild(link);

			link = document.createElement("link");
			link.href = "https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css";
			link.type = "text/css";
			link.rel = "stylesheet";
			document.getElementsByTagName("head")[0].appendChild(link);

			script.onload = () => {
				resolve(agGrid.Grid);
			};
		});
	}
}

export { AgGrid }
