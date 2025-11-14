import { useEffect, useState } from 'react';

function DashboardPage() {
  const [today, setToday] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    setToday(formatted);
  }, []);

  return (
    <section style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
      <h2 style={{ marginTop: 0, fontSize: 20 }}>오늘의 요약</h2>
      <p style={{ margin: '8px 0', color: '#475569' }}>{today}</p>
      <p style={{ margin: '16px 0 0', fontSize: 16 }}>
        가족 모두가 공정하게 집안일을 나눌 수 있도록 chore:us가 오늘의 미션을 정리해 두었어요.
      </p>
    </section>
  );
}

export default DashboardPage;
