(function () {
    'use strict';

    class Help {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                let $contact = document.querySelector('.contact');
                $contact.classList.remove('is-hidden');
            });
        }
    }

    new Help();

}());
