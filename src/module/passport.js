const generatePassword = require('password-generator');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const { googleAuth } = require('../config/socialLogin.json');
const User = require('../app/models/userModel.js');


module.exports = (passport) => {
  // ===================== Configuração do Passport ================//
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser( async (id, done) => {
    await User.findById(id, (err, user) => {
      done(err, user);
    });
  });
  // ===============================================================//

  // =================== Google Strategy de Cadastro e Login ===========//
  passport.use(new GoogleStrategy({
    clientID: googleAuth.googleCosumerKey,
    clientSecret: googleAuth.googleCosumerSecret,
    callbackURL: googleAuth.callbackURL,
  }, (accessToken, refreshToken, profile, done) => {
    process.nextTick( async () => {
      await User.findOne({ email: profile.emails[0].value }, async (err, user) => {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, user);
        }
        const newUser = new User();
        newUser.name = profile.displayName;
        newUser.email = profile.emails[0].value;
        newUser.password = generatePassword();
        newUser.verified = true;

        newUser.save((err) => {
          if (err) {
            throw err;
          }
          return done(null, newUser);
        });
      });
    });
  }));
  // ==================================================================//
};
