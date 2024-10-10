const SMTPServer = require('smtp-server').SMTPServer;
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const spamc = require('spamc');
const ClamAV = require('clamav.js');
const winston = require('winston');

// Define valid credentials (email and password)
const users = {
  'user@example.com': 'yourpassword', // Add users and their passwords here
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later."
});

const client = new spamc.Client({ host: 'localhost', port: 783 });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'smtp-server' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const server = new SMTPServer({
  authOptional: false,
  secure: true,
  key: fs.readFileSync('path/to/your/private-key.pem'), // Add path to your private key
  cert: fs.readFileSync('path/to/your/certificate.pem'), // Add path to your certificate

  // Apply rate limiter to incoming connections
  onConnect(session, callback) {
    limiter({ ip: session.remoteAddress }, {}, (err) => {
      if (err) {
        logger.error(`Rate limit exceeded for ${session.remoteAddress}`);
        return callback(new Error('Too many requests, please try again later.'));
      }
      logger.info(`Connection from ${session.remoteAddress}`);
      callback();
    });
  },

  onAuth(auth, session, callback) {
    const { username, password } = auth;
    if (users[username] === password) {
      return callback(null, { user: username });
    }
    logger.error('Invalid email or password');
    return callback(new Error('Invalid email or password'));
  },

  onData(stream, session, callback) {
    const scanner = ClamAV.createScanner(3310, 'localhost');
    const emailStream = client.reportIfSpam();

    stream.pipe(scanner).pipe(emailStream).pipe(process.stdout);

    emailStream.on('end', (result) => {
      if (result.isInfected) {
        logger.error('Email contains a virus and was rejected');
        return callback(new Error('Email contains a virus and was rejected.'));
      }

      logger.info(`Email from ${session.envelope.mailFrom.address} to ${session.envelope.rcptTo.map(rcpt => rcpt.address).join(', ')}`);
      callback();
    });
  },
});

// Start the server on port 10000
server.listen(10000, () => {
  console.log('SMTP server listening on port 10000 with advanced features');
});
