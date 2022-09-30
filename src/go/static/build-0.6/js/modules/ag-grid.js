class AgGrid {
    static init() {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = '/build-0.6/js/ag-grid-community.min.noStyle.js';
            document.head.appendChild(script);

			let link = document.createElement("link");
			link.href = "/build-0.6/css/ag-grid.css";
			link.type = "text/css";
			link.rel = "stylesheet";
			document.getElementsByTagName("head")[0].appendChild(link);

			link = document.createElement("link");
			link.href = "/build-0.6/css/ag-theme-alpine.css";
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
