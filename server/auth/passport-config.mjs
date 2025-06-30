import { Strategy as LocalStrategy } from "passport-local";
import getUser from "../dao/userDao.mjs";

export default function initialize(passport) {
  passport.use(
    new LocalStrategy(async function verify(username, password, cb) {
      const user = await getUser(username, password);
      if (!user) return cb(null, false, "Incorrect username or password.");

      return cb(null, user);
    })
  );

  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (user, cb) {
    return cb(null, user);
  });
}