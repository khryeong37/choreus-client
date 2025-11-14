import { useMemo } from 'react';

function StatsPage() {
  const stats = useMemo(
    () => [
      { label: '이번주 포인트', value: '120점' },
      { label: '가족 공정성 지표', value: '88%' },
      { label: '완료된 미션', value: '15건' },
    ],
    []
  );

  return (
    <section style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
      <h2 style={{ marginTop: 0 }}>통계</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        {stats.map((item) => (
          <div
            key={item.label}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 14, color: '#475569' }}>{item.label}</span>
            <strong style={{ fontSize: 18, color: '#0f172a' }}>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsPage;
