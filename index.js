const SMTPServer = require('smtp-server').SMTPServer;

// Define valid credentials (email and password)
const users = {
  'user@example.com': 'yourpassword', // Add users and their passwords here
};

const server = new SMTPServer({
  // Require authentication
  authOptional: false,

  // Authenticate user
  onAuth(auth, session, callback) {
    const { username, password } = auth;
    
    // Validate credentials
    if (users[username] === password) {
      return callback(null, { user: username });
    }

    // If authentication fails
    return callback(new Error('Invalid email or password'));
  },

  // Handle incoming emails
  onData(stream, session, callback) {
    stream.pipe(process.stdout); // Log email to console or process as needed
    stream.on('end', callback);
  },
});

// Start the server on port 10000
server.listen(10000, () => {
  console.log('SMTP server listening on port 10000');
});
