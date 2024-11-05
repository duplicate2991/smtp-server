const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser; // To parse incoming mail

// Create the SMTP server
const server = new SMTPServer({
  // Allow valid email addresses and authentication (if needed)
  authOptional: true, // Set to false if you want to enforce authentication

  // Event handler for processing incoming mail
  onData(stream, session, callback) {
    simpleParser(stream)
      .then(parsed => {
        console.log('From:', parsed.from.value);
        console.log('To:', parsed.to.value);
        console.log('Subject:', parsed.subject);
        console.log('Body:', parsed.text);
      })
      .catch(err => {
        console.error('Error parsing mail:', err);
      });

    stream.on('end', callback);
  },

  // Optional authentication (uncomment if needed)
  // onAuth(auth, session, callback) {
  //   if (auth.username === 'your-username' && auth.password === 'your-password') {
  //     callback(null, { user: 'authorized' });
  //   } else {
  //     return callback(new Error('Invalid credentials'));
  //   }
  // }
});

// Start listening on port 587 (or another if necessary)
server.listen(8001, () => {
  console.log('SMTP server is listening on port 587');
  let app = require("express")();

  app.listen(3000);

  app.get("/", (req, res) => {
res.send(true);
  });
});


/*
setTimeout(() => {
const nodemailer = require('nodemailer');

// Create a transporter to connect to the SMTP server
let transporter = nodemailer.createTransport({
  host: 'simple-test-smtp.onrender.com', // Replace with your server's IP if hosted remotely
  port: 587, // Use the same port your SMTP server is listening on
  secure: false, // Use TLS or SSL if your server requires it
  tls: {
    rejectUnauthorized: false // For testing, disable certificate validation
  }
});

// Define the email options
let mailOptions = {
  from: '"Test Sender" <sender@example.com>', // Sender address
  to: 'recipient@example.com', // List of receivers (use a dummy email for testing)
  subject: 'Test Email', // Subject line
  text: 'This is a test email sent using Node.js and nodemailer.', // Plain text body
  html: '<b>This is a test email sent using Node.js and nodemailer.</b>' // HTML body
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Error:', error);
  }
  console.log('Email sent:', info.response);
});
}, 5000);*/
