document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.primary-nav');

    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!expanded));
            navigation.classList.toggle('primary-nav--open', !expanded);
        });
    }

    document.querySelectorAll('[data-password-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.passwordToggle);
            if (!input) return;

            const reveal = input.type === 'password';
            input.type = reveal ? 'text' : 'password';
            button.textContent = reveal ? 'Hide' : 'Show';
            button.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} password`);
            button.setAttribute('aria-pressed', String(reveal));
        });
    });

    const swapButton = document.querySelector('[data-swap-stations]');
    if (swapButton) {
        swapButton.addEventListener('click', () => {
            const from = document.getElementById('from-station');
            const to = document.getElementById('to-station');
            if (!from || !to) return;

            [from.value, to.value] = [to.value, from.value];
            from.focus();
        });
    }

    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            const from = document.getElementById('from-station');
            const to = document.getElementById('to-station');
            const date = document.getElementById('journey-date');
            if (!from || !to || !date) return;

            to.setCustomValidity(
                from.value.trim() && to.value.trim()
                && from.value.trim().toLocaleLowerCase() === to.value.trim().toLocaleLowerCase()
                    ? 'Choose a destination different from your departure station.'
                    : ''
            );

            if (!searchForm.checkValidity()) {
                event.preventDefault();
                searchForm.reportValidity();
            } else {
                const submitButton = searchForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Checking demo…';
                }
            }
        });
    }

    const signupForm = document.querySelector('[data-signup-form]');
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            const email = signupForm.querySelector('[name="email"]');
            const mobile = signupForm.querySelector('[name="mobile"]');
            const password = signupForm.querySelector('[name="password"]');
            const confirmation = signupForm.querySelector('[name="confirm_password"]');
            const cleanMobile = mobile.value.replace(/[\s()-]/g, '');

            mobile.setCustomValidity(/^[6-9]\d{9}$/.test(cleanMobile)
                ? ''
                : 'Enter a valid 10-digit Indian mobile number.');
            password.setCustomValidity(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/us.test(password.value)
                ? ''
                : 'Use at least 8 characters, including uppercase, lowercase and a number.');
            confirmation.setCustomValidity(confirmation.value === password.value
                ? ''
                : 'Your passwords do not match.');

            email.setCustomValidity('');
            if (!email.validity.valid) {
                email.setCustomValidity('Enter a valid email address.');
            }

            if (!signupForm.checkValidity()) {
                event.preventDefault();
                signupForm.reportValidity();
                return;
            }

            const submitButton = signupForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Creating account…';
            }
        });
    }
});
