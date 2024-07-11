import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';
import bcryptjs from 'bcryptjs';

passport.use(new LocalStrategy(
    { usernameField: 'identifier' }, // 'identifier' can be either username or email
    async (identifier, password, done) => {
        try {
            const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
            if (!user) {
                return done(null, false, { message: 'Incorrect email or username.' });
            }

            const isMatch = await bcryptjs.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;
