import { Logger } from './logger.js'

const TAG = "main-menu"
class MainMenu {
    static init() {
		let elementsArray = document.querySelectorAll('[id$="-menu"]');

        elementsArray.forEach((elem) => {
            elem.addEventListener("click", (e) => {
                Logger.Log(TAG, `${e.currentTarget.id} clicked `)
                MainMenu.handleMenu(e.currentTarget.id)
            });
        });
    }

	static handleMenu(id) {
		switch (id) {
		case 'query-menu':
			window.location = '/app/queries';
			break;

		case 'content-menu':
			window.location = '/app/tables';
			break;

		case 'help-menu':
			window.location = '/app/help';
			break;

		case 'about-menu':
			window.location = '/app/about';
			break;
		}
	}
}

export { MainMenu }
