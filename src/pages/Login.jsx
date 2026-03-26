import { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admino') {
      localStorage.setItem('creative_hub_auth', 'true');
      onLogin();
    } else {
      setError('Invalid credentials');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-overlay" />
      <div className={`login-box${shaking ? ' shake' : ''}`}>
        <div className="login-title-wrap">
          <h1 className="login-title">FOR YOU SAFETY</h1>
          <p className="login-subtitle">Enter your credentials to continue</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">USERNAME</label>
            <input
              className="login-input"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              autoComplete="username"
              spellCheck={false}
            />
          </div>
          <div className="login-field">
            <label className="login-label">PASSWORD</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="login-btn" type="submit">ENTER</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
