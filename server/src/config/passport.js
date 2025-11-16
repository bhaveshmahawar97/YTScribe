const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/userModel');

// Configure Passport strategies for Google and GitHub OAuth
// This function should be called once during app startup
function configurePassport() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL,
  } = process.env;

  // GOOGLE OAUTH STRATEGY
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
    console.warn('⚠️ Google OAuth env vars are not fully set. Google login will be disabled.');
  } else {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails && profile.emails[0] && profile.emails[0].value
              ? profile.emails[0].value.toLowerCase()
              : undefined;
            const providerId = profile.id;

            // 1. Try to find existing user by providerId
            let user = await User.findOne({ provider: 'google', providerId });

            // 2. If not found, try to find by email and then attach provider data
            if (!user && email) {
              user = await User.findOne({ email });
              if (user) {
                user.provider = 'google';
                user.providerId = providerId;
                await user.save();
              }
            }

            // 3. If still not found, create a new user
            if (!user) {
              user = await User.create({
                name: profile.displayName || 'Google User',
                email,
                provider: 'google',
                providerId,
                role: 'user',
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );
  }

  // GITHUB OAUTH STRATEGY
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
    console.warn('⚠️ GitHub OAuth env vars are not fully set. GitHub login will be disabled.');
  } else {
    passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: GITHUB_CALLBACK_URL,
          scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const primaryEmail =
              profile.emails && profile.emails[0] && profile.emails[0].value
                ? profile.emails[0].value.toLowerCase()
                : undefined;
            const providerId = profile.id;

            let user = await User.findOne({ provider: 'github', providerId });

            if (!user && primaryEmail) {
              user = await User.findOne({ email: primaryEmail });
              if (user) {
                user.provider = 'github';
                user.providerId = providerId;
                await user.save();
              }
            }

            if (!user) {
              user = await User.create({
                name: profile.displayName || profile.username || 'GitHub User',
                email: primaryEmail,
                provider: 'github',
                providerId,
                role: 'user',
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );
  }

  // How Passport stores user info in the session (we are stateless, but this is still required by Passport)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || undefined);
    } catch (error) {
      done(error, undefined);
    }
  });
}

module.exports = {
  passport,
  configurePassport,
};
