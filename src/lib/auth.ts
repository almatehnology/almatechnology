import 'server-only';

import crypto from 'node:crypto';
import { betterAuth } from 'better-auth';
import { admin, username } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/lib/db';

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:7800';
// A configured value keeps sessions valid between container restarts. The random fallback
// makes local development usable while deliberately invalidating sessions after a restart.
const secret = process.env.BETTER_AUTH_SECRET || crypto.randomBytes(32).toString('hex');

export const auth = betterAuth({
  database: db,
  baseURL,
  secret,
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
  },
  disabledPaths: ['/sign-up/email', '/is-username-available'],
  plugins: [
    username({
      displayUsername: false,
      immutableUsername: true,
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
    admin(),
    nextCookies(),
  ],
});
