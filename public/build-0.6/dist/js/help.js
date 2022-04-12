(function () {
    'use strict';

    class Help {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                let $email = document.querySelector('.email');
                $email.classList.remove('is-hidden');
            });
        }
    }

    new Help();

})();
