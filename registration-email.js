// Sends a welcome email immediately after a new organisation is registered.
// EmailJS is used only for this custom registration email. Firebase Auth continues
// to handle the actual password-reset email when the admin clicks "Forgot password?".
(function(){
  function safe(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;')}
  function show(id,text,type){const el=document.getElementById(id);if(el)el.innerHTML='<div class="'+type+'">'+text+'</div>'}
  function configured(){
    const c=window.routeTrackerEmailConfig;
    return c && c.publicKey && c.serviceId && c.templateId && !String(c.publicKey).startsWith('YOUR_') && !String(c.serviceId).startsWith('YOUR_') && !String(c.templateId).startsWith('YOUR_');
  }
  async function sendWelcomeEmail(email,name,code){
    if(!configured() || typeof emailjs==='undefined') throw new Error('Registration email is not configured yet.');
    const c=window.routeTrackerEmailConfig;
    const resetLink=window.routeTrackerForgotPasswordUrl || (window.location.origin+window.location.pathname+'#login');
    return emailjs.send(c.serviceId,c.templateId,{
      to_email:email,
      to_name:name,
      admin_email:email,
      org_name:name,
      passenger_code:code,
      reset_link:resetLink,
      forgot_password_link:resetLink
    });
  }
  window.registerOrg=async function(e){
    e.preventDefault();
    const result=document.getElementById('registrationResult');
    if(!window.routeTrackerFirebaseReady || typeof auth==='undefined' || typeof db==='undefined') return show('registrationResult','Firebase is not connected. Please refresh the page.','error');
    try{
      const type=document.getElementById('orgType').value;
      const name=document.getElementById('orgName').value.trim();
      const email=document.getElementById('orgEmail').value.trim().toLowerCase();
      const password=document.getElementById('orgPassword').value;
      const cred=await auth.createUserWithEmailAndPassword(email,password);
      let passengerCode='RP-'+Math.random().toString(36).slice(2,5).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
      let q=await db.collection('organisations').where('code','==',passengerCode).limit(1).get();
      while(!q.empty){passengerCode='RP-'+Math.random().toString(36).slice(2,5).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();q=await db.collection('organisations').where('code','==',passengerCode).limit(1).get()}
      await db.collection('organisations').doc(cred.user.uid).set({uid:cred.user.uid,type,name,email,code:passengerCode,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
      window.currentOrg={id:cred.user.uid,uid:cred.user.uid,type,name,email,code:passengerCode};
      e.target.reset();
      let emailMessage='<small>Your welcome email is being sent to <b>'+safe(email)+'</b>.</small>';
      try{
        await sendWelcomeEmail(email,name,passengerCode);
        emailMessage='<small>Welcome email sent to <b>'+safe(email)+'</b>. Check Inbox, Spam/Junk and Promotions.</small>';
      }catch(mailError){
        console.warn('Route Tracker registration email failed:',mailError);
        emailMessage='<small>Account created, but the welcome email could not be sent yet. The passenger code is shown below.</small>';
      }
      show('registrationResult','<b>Registration successful.</b><br><br>Your unique passenger code: <strong style="font-size:24px">'+safe(passengerCode)+'</strong><br>'+emailMessage,'success');
      if(typeof window.renderDashboard==='function')window.renderDashboard(window.currentOrg);
    }catch(error){
      const m={'auth/email-already-in-use':'This email is already registered. Use Admin Login.','auth/invalid-email':'Enter a valid email address.','auth/weak-password':'Password must be at least 6 characters.','auth/operation-not-allowed':'Enable Email/Password in Firebase Authentication.','permission-denied':'Firestore permission denied. Check your Firebase rules.','auth/network-request-failed':'Network error. Check your internet connection.'};
      show('registrationResult',safe(m[error.code]||error.message||'Registration failed.')+'<br><small>Error: '+safe(error.code||'unknown')+'</small>','error');
    }
  };
})();
