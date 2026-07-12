# Portfolio Contact Form Integration & Deployment Guide

This guide provides instructions for setting up Google Gmail App Passwords, deploying your portfolio backend to Render, and troubleshooting common issues.

---

## 🔒 1. Gmail App Password Setup

To use Gmail as your SMTP server securely without exposing your main password, you **must** use a Google App Password.

### Steps to Generate:
1. Go to your **[Google Account Security Settings](https://myaccount.google.com/security)**.
2. Ensure **2-Step Verification** is turned **ON** (required to generate App Passwords).
3. Under the search bar or settings, search for **App Passwords**.
4. Click on **App Passwords**.
5. Enter a custom name for your app (e.g., `Portfolio Contact Website`).
6. Click **Create**.
7. Google will show a **16-character password** (e.g., `abcd efgh ijkl mnop`). Copy this code and remove any spaces.
8. Paste this 16-character code into the `SMTP_PASS` field in your `.env` file.

> [!NOTE]
> Keep this App Password secret. If it is ever compromised, you can delete it from your Google account settings and generate a new one.

---

## 🚀 2. Deployment Steps for Render

You can deploy the backend Node/Express server to **Render** as a Web Service.

### Step 2.1: Prepare GitHub Repository
1. Push your portfolio code to a GitHub repository. Make sure your `.env` file is in your `.gitignore` so that secret keys are **not** pushed to GitHub.

### Step 2.2: Create Render Web Service
1. Sign in to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Name:** `portfolio-backend` (or custom name)
   - **Region:** Choose the region closest to your target audience.
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend` (This is crucial! It tells Render to run commands inside the `backend` folder)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`

### Step 2.3: Configure Environment Variables on Render
1. Under the **Environment** tab in your Render Web Service dashboard, click **Add Environment Variable** and define:
   - `PORT` = `5000` (Render will override this, but it is good to configure)
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_SECURE` = `false`
   - `SMTP_USER` = `your-email@gmail.com` (Gmail address generating the App Password)
   - `SMTP_PASS` = `your-16-character-app-password`
   - `SMTP_TO` = `lovegurubaba1921@gmail.com` (Email where you want to receive contacts)
2. Click **Save Changes**. Render will automatically redeploy the service.

---

## 🛠️ 3. Common Troubleshooting

### Issue 3.1: CORS Errors
* **Symptom:** Browser console logs `Access to fetch at ... has been blocked by CORS policy`.
* **Fix:** The Express server is already configured with `cors()` middleware. Ensure your frontend makes requests using standard HTTP verbs and that headers are set correctly. If you deploy your frontend to a specific domain (like Vercel or Netlify), you can lock down access in `server.js`:
  ```javascript
  app.use(cors({ origin: 'https://your-portfolio.vercel.app' }));
  ```

### Issue 3.2: SMTP Authentication Failures (`EAUTH` / `535 5.7.8 Bad Credentials`)
* **Symptom:** Server console displays `SMTP Transporter Verification Failed` or `Username and Password not accepted`.
* **Fix:** 
  1. Verify you copied the 16-character App Password correctly without spaces.
  2. Confirm your `SMTP_USER` matches the Gmail account where you generated the App Password.
  3. Make sure **2-Step Verification** is still active on your Google account.
  4. Ensure your firewall or network allows outgoing traffic on port `587`.

### Issue 3.3: Render Environment Variables Missing
* **Symptom:** Form submissions respond with `Server configuration error: SMTP credentials are not set.`
* **Fix:** In the Render dashboard, check the spelling of your environment variables under the **Environment** tab. Remember, environment variables are case-sensitive (`SMTP_USER` is different from `smtp_user`).

### Issue 3.4: Host Connection Refused / Dynamic URL Falling Back to Production
* **Symptom:** Submitting the form locally attempts to send requests to your Render URL instead of `localhost`.
* **Fix:** The frontend checks `window.location.hostname`. If you test locally using URLs other than `localhost` or `127.0.0.1` (e.g., local IP address like `192.168.1.5`), the check might fallback to production. Update the check in `frontend/javaScript.js` to include your specific local IP address if necessary.
