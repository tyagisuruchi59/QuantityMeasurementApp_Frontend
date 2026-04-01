const API = 'http://localhost:5167/api/v1';

// Switch between Login / Signup tabs
function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginForm').style.display  = isLogin ? 'block' : 'none';
  document.getElementById('signupForm').style.display = isLogin ? 'none'  : 'block';
  document.getElementById('loginTab').classList.toggle('active', isLogin);
  document.getElementById('signupTab').classList.toggle('active', !isLogin);
  hideAlert();
}

function showAlert(msg, type) {
  const box = document.getElementById('alertBox');
  box.textContent = msg;
  box.className = `alert ${type}`;
  box.style.display = 'block';
}

function hideAlert() {
  document.getElementById('alertBox').style.display = 'none';
}

function showErr(id, show) {
  document.getElementById(id).style.display = show ? 'block' : 'none';
}

function togglePw(inputId, eye) {
  const input = document.getElementById(inputId);
  input.type = input.type === 'password' ? 'text' : 'password';
  eye.textContent = input.type === 'password' ? '👁' : '🙈';
}

// ─── SIGNUP ───────────────────────────────────────────────
async function handleSignup() {
  const username = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  // Validate
  let valid = true;
  showErr('signupNameErr', username.length < 3); if (username.length < 3) valid = false;
  showErr('signupEmailErr', !email.includes('@')); if (!email.includes('@')) valid = false;
  showErr('signupPwErr', password.length < 8); if (password.length < 8) valid = false;
  if (!valid) return;

  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (res.ok || res.status === 201) {
      showAlert('✅ Account created! Please login.', 'success');
      // Clear form
      document.getElementById('signupName').value = '';
      document.getElementById('signupEmail').value = '';
      document.getElementById('signupPassword').value = '';
      // Switch to login after 1.5s
      setTimeout(() => switchTab('login'), 1500);
    } else {
      showAlert('❌ ' + (data.message || 'Signup failed'), 'error');
    }
  } catch (err) {
    showAlert('❌ Cannot connect to server. Is your backend running?', 'error');
  }
}

// ─── LOGIN ────────────────────────────────────────────────
async function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Validate
  let valid = true;
  showErr('loginEmailErr', !email.includes('@')); if (!email.includes('@')) valid = false;
  showErr('loginPwErr', password.length === 0); if (password.length === 0) valid = false;
  if (!valid) return;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.data) {
      // Save token and user info
      localStorage.setItem('accessToken',  data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('username',     data.data.username);
      localStorage.setItem('email',        data.data.email);
      // Go to dashboard
      window.location.href = 'dashboard.html';
    } else {
      showAlert('❌ ' + (data.message || 'Invalid credentials'), 'error');
    }
  } catch (err) {
    showAlert('❌ Cannot connect to server. Is your backend running?', 'error');
  }
}