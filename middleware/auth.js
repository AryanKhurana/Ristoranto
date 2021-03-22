module.exports = {
    ensureAuth: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.session.returnTo = req.originalUrl;
            console.log(req.originalUrl)
            res.redirect('/login');
        }
    },
    ensureGuest: (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect(req.session.returnTo || '/')
        } else {
            return next()
        }
    }
}