import dotenv from 'dotenv';
// Must be the first import so env vars are available to all subsequent module imports.
// override: true ensures .env values beat any pre-existing system environment variables.
dotenv.config({ override: true });
