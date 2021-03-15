const express = require("express");
const router = express.Router();
const passport = require('passport')

router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/menu')
})

router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/admin/')
})

module.exports = router;