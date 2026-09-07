(function(){
function fb(){
  if(typeof firebase==='undefined') throw new Error('Firebase SDK did not load.');
  if(!window.firebaseConfig) throw new Error('Firebase configuration did not load.');
  const app=(firebase.apps&&firebase.apps.length)?firebase.app():firebase.initializeApp(window.firebaseConfig);
  return {auth:app.auth(),db:app.firestore()};
}
function safe(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function show(id,text,type){const el=document.getElementById(id);if(el)el.innerHTML='<div class="'+type+'">'+text+'</div>}
window.registerOrg=async function(e){
 e.preventDefault();const form=e.target;
 try{
  const x=fb(),type=document.getElementById('orgType').value,name=document.getElementById('orgName').value.trim(),email=document.getElementById('orgEmail').value.trim().toLowerCase(),password=document.getElementById('orgPassword').value;
  const cred=await x.auth.createUserWithEmailAndPassword(email,password);let code=window.code?window.code():'RP-'+Math.random().toString(36).slice(2,7).toUpperCase();
  let q=await x.db.collection('organisations').where('code','==',code).limit(1).get();while(!q.empty){code=window.code();q=await x.db.collection('organisations').where('code','==',code).limit(1).get()}
  await x.db.collection('organisations').doc(cred.user.uid).set({uid:cred.user.uid,type,name,email,code,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  window.currentOrg={id:cred.user.uid,uid:cred.user.uid,type,name,email,code};
  show('registrationResult','<b>Registration successful.</b><br><br>Your unique passenger code: <strong style="font-size:24px">'+safe(code)+'</strong><br><small>Share this code with passengers.</small>','success');form.reset();
  if(typeof window.renderDashboard==='function'){window.dashboard=document.getElementById('dashboard');window.renderDashboard(window.currentOrg);document.getElementById('dashboard')?.scrollIntoView({behavior:'smooth',block:'start'})}
 }catch(error){show('registrationResult',safe(error.message||error),'error')}
};
window.adminLogin=async function(e){
 e.preventDefault();const result=document.getElementById('loginResult'),emailEl=document.getElementById('loginEmail'),passEl=document.getElementById('loginPassword');
 const email=(emailEl?.value||'').trim().toLowerCase(),password=passEl?.value||'';
 if(!email||!password){show('loginResult','Please enter your email and password.','error');return}
 show('loginResult','Signing in…','success');
 try{
  const x=fb();
  const cred=await x.auth.signInWithEmailAndPassword(email,password);
  let snap=await x.db.collection('organisations').doc(cred.user.uid).get();
  if(!snap.exists){
   const byEmail=await x.db.collection('organisations').where('email','==',email).limit(1).get();
   if(!byEmail.empty)snap=byEmail.docs[0];
  }
  if(!snap.exists){
   await x.auth.signOut();
   show('loginResult','<b>Login successful, but the organisation profile is missing.</b><br>This Firebase account is not linked to an organisation record yet. Please register the organisation again with a different email, or contact the site administrator.','error');return;
  }
  const data=snap.data()||{};window.currentOrg={id:snap.id,uid:cred.user.uid,...data};
  show('loginResult','<b>Login successful.</b> Loading '+safe(data.name||'organisation')+'…','success');
  window.dashboard=document.getElementById('dashboard');window.renderDashboard(window.currentOrg);
  setTimeout(()=>document.getElementById('dashboard')?.scrollIntoView({behavior:'smooth',block:'start'}),100);
 }catch(error){
  const m={'auth/invalid-credential':'Invalid email or password.','auth/user-not-found':'No account was found with this email address.','auth/wrong-password':'Invalid email or password.','auth/too-many-requests':'Too many attempts. Please try again later.','auth/network-request-failed':'Network error. Check your internet connection.','permission-denied':'Firestore permission denied. Check your Firebase Firestore rules.'};
  show('loginResult',safe(m[error.code]||error.message||'Unable to log in.')+'<br><small>Error: '+safe(error.code||'unknown')+'</small>','error');
 }
};
window.forgotPassword=async function(){
 const result=document.getElementById('loginResult'),emailEl=document.getElementById('loginEmail'),email=(emailEl?.value||'').trim().toLowerCase();
 if(!email){show('loginResult','Enter your admin email first.','error');emailEl?.focus();return}
 try{const x=fb();show('loginResult','Sending password reset email…','success');await x.auth.sendPasswordResetEmail(email);show('loginResult','<b>Password reset email sent.</b><br>Check your inbox, Spam/Junk and Promotions.','success')}
 catch(error){show('loginResult','<b>Password reset failed.</b><br>'+safe(error.message||error)+'<br><small>Error: '+safe(error.code||'unknown')+'</small>','error')}
};
})();