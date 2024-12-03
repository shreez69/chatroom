(function () {
  const app = document.querySelector(".app");

  // Navigate to Sign In or Sign Up
  document.getElementById("show-signin").addEventListener("click", function () {
    document.querySelector(".heading-screen").classList.remove("active");
    document.querySelector(".signin-screen").classList.add("active");
  });

  document.getElementById("show-signup").addEventListener("click", function () {
    document.querySelector(".heading-screen").classList.remove("active");
    document.querySelector(".signup-screen").classList.add("active");
  });

  // Go Back to Main Screen
  document.getElementById("back-to-main-1").addEventListener("click", function () {
    document.querySelector(".signin-screen").classList.remove("active");
    document.querySelector(".heading-screen").classList.add("active");
  });

  document.getElementById("back-to-main-2").addEventListener("click", function () {
    document.querySelector(".signup-screen").classList.remove("active");
    document.querySelector(".heading-screen").classList.add("active");
  });

  // Open OTP Modal
  function openOtpModal() {
    const otpModal = document.getElementById("otp-modal");
    otpModal.style.display = "block";
  }

  // Close OTP Modal
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "none";
  }

  // Handle Sign In
  document.getElementById("signin-send-otp").addEventListener("click", function () {
    const username = document.getElementById("signin-username").value;
    const password = document.getElementById("signin-password").value;

    if (!username || !password) {
      alert("Please enter your username and password.");
      return;
    }

    // Backend Call to Validate Username and Password
    fetch("http://localhost:5000/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("OTP sent to your email!");
          openOtpModal();
        } else {
          alert(data.error || "Invalid credentials.");
        }
      })
      .catch((error) => console.error("Error during sign-in:", error));
  });

  // Handle Sign Up
  document.getElementById("signup-send-otp").addEventListener("click", function () {
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    if (!username || !email || !password) {
      alert("Please fill out all fields.");
      return;
    }

    // Backend Call to Register User and Send OTP
    fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("OTP sent to your email!");
          openOtpModal();
        } else {
          alert(data.error || "Sign-up failed.");
        }
      })
      .catch((error) => console.error("Error during sign-up:", error));
  });

  // Close Modal when clicking on the Close button
  document.querySelectorAll(".close").forEach((closeButton) => {
    closeButton.addEventListener("click", function () {
      closeModal("otp-modal");
    });
  });
})();
