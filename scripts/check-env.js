require('dotenv').config({ path: '.env.local' });

console.log('Current working directory:', process.cwd());
console.log('Looking for .env.local in:', process.cwd());

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL is not set in .env.local');
  console.log('Available environment variables:', Object.keys(process.env));
  process.exit(1);
}

// Log a sanitized version of the connection string (hiding credentials)
const sanitizedConnection = connectionString.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
console.log('Database URL found:', sanitizedConnection);
console.log('Environment variables loaded successfully!'); 