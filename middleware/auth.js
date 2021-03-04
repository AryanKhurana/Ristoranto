module.exports = {
    ensureAuth: (req, res, next) => {
        if(req.isAuthenticated()){
            return next();
        } else {
            res.redirect('/admin/')
        }
    },
    ensureGuest: (req, res, next) => {
        if (req.isAuthenticated()){
            res.redirect('/admin/dashboard/')
        } else{
            return next()
        }
    }
}