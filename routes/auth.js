
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Display registration page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// Display login page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Handle registration form
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Check empty fields
        if (!name || !email || !password || !confirmPassword) {
            return res.render('register', {
                error: 'All fields are required'
            });
        }

        // Check name length
        if (name.trim().length < 2) {
            return res.render('register', {
                error: 'Name must be at least 2 characters'
            });
        }

        // Check email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
            return res.render('register', {
                error: 'Please enter a valid email address'
            });
        }

        // Check password length
        if (password.length < 8) {
            return res.render('register', {
                error: 'Password must be at least 8 characters'
            });
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            return res.render('register', {
                error: 'Passwords do not match'
            });
        }

        // Check existing email
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.render('register', {
                error: 'Email is already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });

        await newUser.save();

        res.redirect('/login');

    } catch (error) {
        console.log(error);

        res.render('register', {
            error: 'Something went wrong. Please try again.'
        });
    }
});


// Handle login form
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check empty fields
        if (!email || !password) {
            return res.render('login', {
                error: 'Please enter your email and password'
            });
        }

        // Find user in MongoDB
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        // Check if user exists
        if (!user) {
            return res.render('login', {
                error: 'Invalid email or password'
            });
        }

        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.render('login', {
                error: 'Invalid email or password'
            });
        }

        // Create login session
        req.session.userId = user._id;

        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);

        res.render('login', {
            error: 'Something went wrong. Please try again.'
        });
    }
});

// Display dashboard
router.get('/dashboard', async (req, res) => {
    try {

        // Check if user is logged in
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        // Find logged-in user
        const user = await User.findById(req.session.userId);

        if (!user) {
            return req.session.destroy(() => {
                res.redirect('/login');
            });
        }

        res.render('dashboard', { user });

    } catch (error) {
        console.log(error);
        res.redirect('/login');
    }
});

// Handle logout
router.post('/logout', (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            console.log(error);
            return res.redirect('/dashboard');
        }

        res.clearCookie('connect.sid');
        res.redirect('/login');

    });

});

module.exports = router;
