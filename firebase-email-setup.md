# Route Tracker — organisation code email

The website now creates an email request in Firestore after registration. To actually send the email securely, install Firebase's **Trigger Email** extension and configure an SMTP provider.

## 1. Install Trigger Email
Firebase Console → Extensions → Trigger Email → Install.

Use `mail` as the collection that the extension watches.

Configure your SMTP provider in the extension setup. Do **not** put SMTP username/password in `index.html` or `app.js`.

## 2. Firestore rules
Only authenticated users should be allowed to create their own email request. Add a rule for the `mail` collection that permits a signed-in user to create a message where `to` contains their own authenticated email. Keep the rest of your Firestore rules locked down.

## 3. What registration does
After Firebase Authentication creates the organisation account and Firestore stores the organisation code, the app writes a message to `mail` containing the recipient email, organisation name, unique passenger code, and a safety reminder.

The registration screen initially shows **Sending email…**. When the Trigger Email extension reports delivery, it changes to **Email sent** and keeps the unique code visible on screen.

If the extension is not installed/configured, the registration still works, but the screen will show that email delivery is not configured instead of falsely claiming an email was sent.
