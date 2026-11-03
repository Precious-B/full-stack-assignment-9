
const registerForm = document.getElementById('registerForm');

if (registerForm) {

    registerForm.addEventListener('submit', function(event) {

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password.length < 8) {
            event.preventDefault();
            alert('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            event.preventDefault();
            alert('Passwords do not match');
            return;
        }

    });

}
