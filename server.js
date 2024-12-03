<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chatroom</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="app">
      <!-- Chatroom Heading -->
      <h1 class="heading">Chatroom</h1>

      <!-- Options for Sign In and Sign Up -->
      <div class="screen options-screen active">
        <button id="show-signin">Sign In</button>
        <button id="show-signup">Sign Up</button>
      </div>

      <!-- Sign In Form -->
      <div class="screen signin-screen">
        <h2>Sign In</h2>
        <div class="form">
          <div class="form-input">
            <label>Username</label>
            <input type="text" id="signin-username" placeholder="Enter your username" />
          </div>
          <div class="form-input">
            <label>Password</label>
            <input type="password" id="signin-password" placeholder="Enter your password" />
          </div>
          <div class="form-input">
            <button id="signin-send-otp">Send OTP</button>
          </div>
        </div>
      </div>

      <!-- Sign Up Form -->
      <div class="screen signup-screen">
        <h2>Sign Up</h2>
        <div class="form">
          <div class="form-input">
            <label>Username</label>
            <input type="text" id="signup-username" placeholder="Create a username" />
          </div>
          <div class="form-input">
            <label>Email</label>
            <input type="email" id="signup-email" placeholder="Enter your email" />
          </div>
          <div class="form-input">
            <label>Password</label>
            <input type="password" id="signup-password" placeholder="Create a password" />
          </div>
          <div class="form-input">
            <button id="signup-send-otp">Send OTP</button>
          </div>
        </div>
      </div>

      <!-- OTP Modal -->
      <div id="otp-modal" class="modal">
        <div class="modal-content">
          <span class="close" onclick="closeModal('otp-modal')">&times;</span>
          <h2>Enter OTP</h2>
          <input type="text" id="otp-input" placeholder="Enter OTP" required />
          <button id="verify-otp">Verify OTP</button>
        </div>
      </div>

      <!-- Chatroom Screen -->
      <div class="screen chatroom-screen">
        <div class="header">
          <div class="logo">Welcome to Chatroom</div>
          <button id="exit-chat">Exit</button>
        </div>
        <div class="messages"></div>
        <div class="typebox">
          <input type="text" id="message-input" placeholder="Type your message..." />
          <button id="send-message">Send</button>
        </div>
      </div>
    </div>

    <script src="socket.io/socket.io.js"></script>
    <script src="code.js"></script>
  </body>
</html>
