import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import './SignupPage.css';
import chorePreferenceOptions from '../data/chorePreferences';
import logoMark from '../../data/최종 로고.svg';
import { authApi, getAuthToken } from '../api/client';

const colorPalette = [
  '#f8a8c2',
  '#f6c98d',
  '#f1e08a',
  '#96d6d9',
  '#9fc5ff',
  '#c5bfd9',
  '#f597b2',
  '#f0b972',
  '#c0d26f',
  '#7bd1c0',
  '#7fb0f3',
  '#98a3b3',
  '#d5adf4',
  '#f2c458',
  '#f88d74',
  '#3d4f55',
];

const steps = ['account', 'profile', 'favorites'];

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(steps[0]);
  const [accountForm, setAccountForm] = useState({
    email: '',
    password: '',
    confirm: '',
    householdInviteCode: '',
  });
  const [profileForm, setProfileForm] = useState({
    nickname: '',
    role: '',
    color: colorPalette[0],
  });
  const [favoriteSelection, setFavoriteSelection] = useState(() => new Set());
  const [customFavorite, setCustomFavorite] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    if (getAuthToken()) {
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location.state]);

  const isFirstStep = activeStep === steps[0];
  const isLastStep = activeStep === steps[steps.length - 1];

  const favoriteList = useMemo(() => Array.from(favoriteSelection), [favoriteSelection]);

  const goNext = () => {
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1]);
    }
  };

  const handleAccountChange = (event) => {
    const { name, value } = event.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFavorite = (item) => {
    setFavoriteSelection((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const handleAccountSubmit = (event) => {
    event.preventDefault();
    if (!accountForm.email.trim() || !accountForm.password.trim()) {
      setStatus((prev) => ({ ...prev, error: '이메일과 비밀번호를 입력해주세요.' }));
      return;
    }
    if (accountForm.password !== accountForm.confirm) {
      setStatus((prev) => ({ ...prev, error: '비밀번호가 일치하지 않습니다.' }));
      return;
    }
    setStatus({ loading: false, error: '', success: '' });
    goNext();
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    if (!profileForm.nickname.trim()) {
      setStatus((prev) => ({ ...prev, error: '닉네임을 입력해주세요.' }));
      return;
    }
    setStatus({ loading: false, error: '', success: '' });
    goNext();
  };

  const handleFavoritesSubmit = async (event) => {
    event.preventDefault();
    const preferredChores = [
      ...favoriteList,
      ...(customFavorite.trim() ? [customFavorite.trim()] : []),
    ];
    setStatus({ loading: true, error: '', success: '' });
    try {
      await authApi.signup({
        email: accountForm.email.trim(),
        password: accountForm.password,
        nickname: profileForm.nickname.trim(),
        role: profileForm.role.trim(),
        color: profileForm.color,
        preferredChores,
        householdInviteCode: accountForm.householdInviteCode.trim()
          ? accountForm.householdInviteCode.trim()
          : undefined,
      });
      setStatus({
        loading: false,
        error: '',
        success: '회원가입이 완료되었습니다! 로그인 화면으로 이동합니다.',
      });
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: '' });
    }
  };

  const renderStep = () => {
    if (activeStep === 'account') {
      return (
        <form className="signup-form" onSubmit={handleAccountSubmit}>
          <label>
              <span>이메일</span>
              <input
                type="email"
                name="email"
                placeholder="이메일을 입력하세요."
                value={accountForm.email}
                onChange={handleAccountChange}
              />
            </label>
          <label>
            <span>비밀번호</span>
            <input
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요."
              value={accountForm.password}
              onChange={handleAccountChange}
            />
          </label>
          <label>
            <span>비밀번호 확인</span>
            <input
              type="password"
              name="confirm"
              placeholder="비밀번호를 다시 입력하세요."
              value={accountForm.confirm}
              onChange={handleAccountChange}
            />
          </label>
          <label>
            <span>초대 코드 (선택)</span>
            <input
              type="text"
              name="householdInviteCode"
              placeholder="가족이 보낸 코드를 입력하세요."
              value={accountForm.householdInviteCode}
              onChange={handleAccountChange}
            />
          </label>
          <p className="form-hint" style={{ marginTop: -10 }}>
            초대 코드가 없다면 비워두고 새 가족 그룹을 만들 수 있어요.
          </p>
          {status.error && activeStep === 'account' && (
            <p className="signup-error">{status.error}</p>
          )}
          <button type="submit" className="signup-primary">
            다음
          </button>
        </form>
      );
    }
    if (activeStep === 'profile') {
      return (
        <form className="signup-form" onSubmit={handleProfileSubmit}>
          <div className="profile-preview">🙂</div>
          <label>
            <span>닉네임</span>
            <input
              type="text"
              name="nickname"
              placeholder="닉네임을 입력하세요."
              value={profileForm.nickname}
              onChange={handleProfileChange}
            />
          </label>
          <label>
            <span>역할</span>
            <input
              type="text"
              name="role"
              placeholder="엄마 / 아빠 / 큰딸 ..."
              value={profileForm.role}
              onChange={handleProfileChange}
            />
          </label>
          <div className="color-picker">
            <span>컬러 선택</span>
            <div className="color-grid">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-cell${
                    profileForm.color === color ? ' is-active' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    setProfileForm((prev) => ({ ...prev, color }))
                  }
                >
                  {profileForm.color === color && '✓'}
                </button>
              ))}
            </div>
          </div>
          {status.error && activeStep === 'profile' && (
            <p className="signup-error">{status.error}</p>
          )}
          <button type="submit" className="signup-primary">
            다음
          </button>
        </form>
      );
    }
    return (
      <form className="signup-form" onSubmit={handleFavoritesSubmit}>
        <div>
          <p className="favorites-title">어떤 집안일을 선호하시나요?</p>
          <span className="favorites-sub">
            선택한 집안일을 기준으로 우선 추천해 드릴게요. (중복 선택)
          </span>
        </div>
        <div className="favorite-list">
          {chorePreferenceOptions.map((item) => (
            <label key={item} className="favorite-row">
              <span>{item}</span>
              <input
                type="checkbox"
                checked={favoriteSelection.has(item)}
                onChange={() => toggleFavorite(item)}
              />
            </label>
          ))}
          <label className="favorite-row is-custom">
            <span>기타</span>
            <input
              type="text"
              placeholder="직접 입력해주세요."
              value={customFavorite}
              onChange={(event) => setCustomFavorite(event.target.value)}
            />
          </label>
        </div>
        {status.error && <p className="signup-error">{status.error}</p>}
        {status.success && <p className="signup-success">{status.success}</p>}
        <button type="submit" className="signup-primary" disabled={status.loading}>
          {status.loading ? '저장 중...' : '확인'}
        </button>
      </form>
    );
  };

  return (
    <div className="auth-shell signup">
      <div className="auth-card">
        <div className="auth-heading">
          <img src={logoMark} alt="chore:us" />
          <h1>
            {activeStep === 'account'
              ? '회원가입'
              : activeStep === 'profile'
              ? '프로필 설정'
              : '선호 집안일'}
          </h1>
          <p>chore:us (AI 맞춤형 집안일 플래너)</p>
        </div>
        <main className="signup-card">
          <div className="step-indicator">
            {steps.map((step) => (
              <span
                key={step}
                className={`indicator-dot${
                  activeStep === step ? ' is-active' : ''
                }`}
              />
            ))}
          </div>
          {renderStep()}
        </main>
        <p className="signup-hint">
          이미 계정이 있다면 <Link to="/login">로그인</Link>으로 이동하세요.
        </p>
        {isLastStep && (
          <p className="signup-hint">
            설정한 정보는 가사파트너 &gt; 본인 프로필에서 언제든 수정할 수 있어요.
          </p>
        )}
      </div>
    </div>
  );
}

export default SignupPage;
