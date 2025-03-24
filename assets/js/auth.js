document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const recoveryForm = document.getElementById('recovery-form');
    const loginBtn = document.getElementById('login-btn');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const customAvatarInput = document.getElementById('custom-avatar');
    const passwordInput = document.getElementById('signup-password');
    const passwordStrength = document.querySelector('.password-strength');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        updateUIForLoggedInUser(currentUser);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email);
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }
        if (user.password !== password) {
            showNotification('Incorrect password', 'error');
            return;
        }
        loginUser(user);
        document.getElementById('login-modal').classList.remove('active');
        showNotification('Login successful!', 'success');
        if (window.isSoundEnabled) {
            window.playSound('success');
        }
        loginForm.reset();
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        if (!name || !email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        if (getPasswordStrength(password) === 'weak') {
            showNotification('Please choose a stronger password', 'error');
            return;
        }
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        if (!selectedAvatar) {
            showNotification('Please select an avatar', 'error');
            return;
        }
        const avatarId = selectedAvatar.getAttribute('data-avatar');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email)) {
            showNotification('Email already in use', 'error');
            return;
        }
        const profileCode = generateProfileCode();
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            avatar: avatarId,
            profileCode,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        loginUser(newUser);
        document.getElementById('login-modal').classList.remove('active');
        showNotification(`Account created! Your profile code is: ${profileCode}`, 'success', 5000);
        if (window.isSoundEnabled) {
            window.playSound('success');
        }
        window.showConfetti();
        signupForm.reset();
    });

    recoveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const profileCode = document.getElementById('profile-code').value.trim();
        if (!profileCode) {
            showNotification('Please enter your profile code', 'error');
            return;
        }
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.profileCode === profileCode);
        if (!user) {
            showNotification('Invalid profile code', 'error');
            return;
        }
        loginUser(user);
        document.getElementById('recovery-modal').classList.remove('active');
        showNotification('Account recovered successfully!', 'success');
        if (window.isSoundEnabled) {
            window.playSound('success');
        }
        recoveryForm.reset();
    });

    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            avatarOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            if (option.classList.contains('custom')) {
                customAvatarInput.click();
            }
        });
    });

    customAvatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const customOption = document.querySelector('.avatar-option.custom');
                customOption.style.backgroundImage = `url(${event.target.result})`;
                customOption.style.backgroundSize = 'cover';
                customOption.innerHTML = '';
            };
            reader.readAsDataURL(file);
        }
    });

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = getPasswordStrength(password);
        passwordStrength.className = 'password-strength';
        if (password) {
            passwordStrength.classList.add(strength);
        }
    });

    function loginUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIForLoggedInUser(user);
    }

    function updateUIForLoggedInUser(user) {
        loginBtn.textContent = user.name;
        loginBtn.classList.add('logged-in');
        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        if (user.avatar === 'custom' && user.avatarUrl) {
            avatar.style.backgroundImage = `url(${user.avatarUrl})`;
        } else {
            avatar.style.backgroundColor = getAvatarColor(user.avatar);
            avatar.textContent = user.name.charAt(0).toUpperCase();
        }
        loginBtn.prepend(avatar);
        loginBtn.removeEventListener('click', showLoginModal);
        loginBtn.addEventListener('click', showUserMenu);
    }

    function showLoginModal() {
        document.getElementById('login-modal').classList.add('active');
    }

    function showUserMenu() {
        showNotification('User menu coming soon!', 'info');
    }

    function getPasswordStrength(password) {
        if (!password) return '';
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        const isLongEnough = password.length >= 8;
        if (isLongEnough && hasLetter && hasNumber && hasSpecial) {
            return 'strong';
        } else if (isLongEnough && ((hasLetter && hasNumber) || (hasLetter && hasSpecial) || (hasNumber && hasSpecial))) {
            return 'medium';
        } else {
            return 'weak';
        }
    }

    function generateProfileCode() {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            if (i === 4) result += '-';
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    function getAvatarColor(avatarId) {
        const colors = [
            '#6c5ce7',
            '#00cec9',
            '#fd79a8',
            '#fdcb6e'
        ];
        return colors[parseInt(avatarId) - 1] || colors[0];
    }
});