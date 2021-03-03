const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')
const mongoose = require('mongoose')
const LocalStrategy = require('passport-local')

module.exports = (passport) =>{
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }
        try{
            let user = await User.findOne({ googleId: profile.id })
            if(user) {
                done(null, user)
            }
            else{
                // user = await User.create(newUser)
                // done(null, user)
                done(null, false)
            }
        } catch(err){
            console.log(err)
        }
    }))

    // passport.use('local.signup', new LocalStrategy({
    //     userNameField: 'username',
    //     password: 'password',
    //     passReqToCallback: true 
    // }, (req, email, password, done) => {
    //     User.findOne({ 'email': email }, (err, user) => {
    //         if(err){
    //             return done(err)
    //         }
    //         if(user){
    //             return done(null, false, { message: 'Email is already in use.' })
    //         }
    //         newUser.email = email
    //         newUser.password = password
    //     })
    // }))

    passport.serializeUser( (user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}