// EmailJS configuration for Route Tracker registration emails.
// Replace these three values with the IDs from your EmailJS account.
window.routeTrackerEmailConfig = {
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID'
};

// This is the page opened by the "Forgot password" link in the registration email.
window.routeTrackerForgotPasswordUrl = window.location.origin + window.location.pathname + '#login';
