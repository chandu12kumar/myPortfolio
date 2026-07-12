const heading = document.getElementById("heading");
const icon = document.getElementById("icon");
const X = document.getElementById("x");

icon.addEventListener("click", function (e) {
  e.preventDefault();
  // alert("clicked ");
  icon.style.display = "none";
  heading.style.display = "flex";
});
X.addEventListener("click", function (e) {
  e.preventDefault();
  // alert("clicked ");
  icon.style.display = "flex";
  heading.style.display = "none";
});

// second part
const roles = [
  "Developer",
  "Web Developer",
  "Frontend Developer",
  "UI Designer",
  "Problem Solver",
  "Video Editor",
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

const roleSpan = document.getElementById("role");

function typeRole() {
  const current = roles[roleIndex];

  if (!deleting) {
    roleSpan.textContent = current.slice(0, charIndex + 1);
    charIndex++;

    if (charIndex === current.length) {
      setTimeout(() => (deleting = true), 2000);
    }
  } else {
    roleSpan.textContent = current.slice(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeRole, deleting ? 70 : 120);
}

typeRole();
// Third part: Contact Form handler
const form = document.getElementById("contactForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Gather values from form inputs
  const data = {
    Name: form.Name.value,
    email: form.email.value,
    phone: form.number.value,
    City: form.City.value,
    message: form.message.value,
  };

  // Determine active API server URL. If running locally, target local Express server (port 5000)
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const backendUrl = isLocal
    ? "http://localhost:5000/api/contact"
    : "https://myportfolio-1bw1.onrender.com/api/contact";

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.success) {
      alert("Message Sent Successfully!");
      form.reset(); // Clear the form fields automatically on success
    } else {
      alert(result.msg || "Failed to send message.");
    }
  } catch (err) {
    alert("Failed to send message.");
  }
});
