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
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            button.textContent = show ? 'Hide' : 'Show';
            button.setAttribute('aria-label', `${show ? 'Hide' : 'Show'} password`);
            button.setAttribute('aria-pressed', String(show));
        });
    });

    const swap = document.querySelector('[data-swap-stations]');
    if (swap) {
        swap.addEventListener('click', () => {
            const from = document.getElementById('from');
            const to = document.getElementById('to');
            if (!from || !to) return;
            [from.value, to.value] = [to.value, from.value];
            from.focus();
        });
    }

    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            const from = document.getElementById('from');
            const to = document.getElementById('to');
            if (from && to) {
                to.setCustomValidity(from.value.trim() && to.value.trim()
                    && from.value.trim().toLocaleLowerCase() === to.value.trim().toLocaleLowerCase()
                    ? 'Choose a destination different from your departure station.'
                    : '');
            }
            if (!searchForm.checkValidity()) {
                event.preventDefault();
                searchForm.reportValidity();
            } else {
                const submit = searchForm.querySelector('[type="submit"]');
                if (submit) {
                    submit.disabled = true;
                    submit.textContent = 'Checking demo…';
                }
            }
        });
    }

    const signupForm = document.querySelector('[data-signup-form]');
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            const mobile = signupForm.querySelector('[name="mobile"]');
            const password = signupForm.querySelector('[name="password"]');
            const confirm = signupForm.querySelector('[name="confirmPassword"]');
            const email = signupForm.querySelector('[name="email"]');

            mobile.setCustomValidity(/^[6-9]\d{9}$/.test(mobile.value.replace(/[\s()-]/g, ''))
                ? '' : 'Enter a valid 10-digit Indian mobile number.');
            password.setCustomValidity(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/us.test(password.value)
                ? '' : 'Use at least 8 characters with uppercase, lowercase and a number.');
            confirm.setCustomValidity(confirm.value === password.value ? '' : 'Your passwords do not match.');
            email.setCustomValidity('');
            if (!email.validity.valid) email.setCustomValidity('Enter a valid email address.');

            if (!signupForm.checkValidity()) {
                event.preventDefault();
                signupForm.reportValidity();
                return;
            }
            const submit = signupForm.querySelector('[type="submit"]');
            if (submit) {
                submit.disabled = true;
                submit.textContent = 'Creating account…';
            }
        });
    }
});
