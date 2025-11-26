import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import './LoginPage.css';
import logoMark from '../../data/최종 로고.svg';
import { authApi, getAuthToken, setAuthToken } from '../api/client';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });
  const fromPath = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (getAuthToken()) {
      navigate(fromPath, { replace: true });
    }
  }, [navigate, fromPath]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setStatus((prev) => ({ ...prev, error: '이메일과 비밀번호를 입력해주세요.' }));
      return;
    }
    setStatus({ loading: true, error: '' });
    try {
      const { token, user } = await authApi.login(form);
      setAuthToken(token);
      localStorage.setItem('choreus_user', JSON.stringify(user));
      navigate(fromPath, { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-heading">
          <img src={logoMark} alt="chore:us" />
          <h1>로그인</h1>
          <p>chore:us (AI 맞춤형 집안일 플래너)</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>아이디</span>
            <input
              type="email"
              name="email"
              placeholder="아이디를 입력하세요."
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label>
            <span>비밀번호</span>
            <input
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요."
              value={form.password}
              onChange={handleChange}
            />
          </label>
          {status.error && <p className="login-error">{status.error}</p>}
          <button type="submit" className="auth-button" disabled={status.loading}>
            {status.loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="auth-links">
          <button type="button">아이디 찾기</button>
          <span>·</span>
          <button type="button">비밀번호 찾기</button>
          <span>·</span>
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
