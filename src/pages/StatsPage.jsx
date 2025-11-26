import { useMemo } from 'react';
import useHouseholdTasks from '../hooks/useHouseholdTasks';
import useHouseholdMembers from '../hooks/useHouseholdMembers';

function StatsPage() {
  const { tasks, loading, error, refresh } = useHouseholdTasks();
  const { members } = useHouseholdMembers();

  const weekWindow = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { start, end: now };
  }, []);

  const weeklyCompleted = useMemo(
    () =>
      tasks.filter((task) => {
        if (!task.isDone) return false;
        const date = new Date(task.date);
        return date >= weekWindow.start && date <= weekWindow.end;
      }),
    [tasks, weekWindow]
  );

  const weeklyPoints = weeklyCompleted.reduce(
    (sum, task) => sum + (task.points || 0),
    0
  );

  const completionRate = tasks.length
    ? Math.round((tasks.filter((task) => task.isDone).length / tasks.length) * 100)
    : 0;

  const partnerStats = useMemo(() => {
    const map = {};
    members.forEach((member) => {
      map[member.userId] = {
        name: member.nickname || member.email,
        tasks: 0,
        points: 0,
      };
    });
    tasks.forEach((task) => {
      if (!map[task.partnerId]) {
        map[task.partnerId] = {
          name: task.partnerId,
          tasks: 0,
          points: 0,
        };
      }
      if (task.isDone) {
        map[task.partnerId].tasks += 1;
        map[task.partnerId].points += task.points || 0;
      }
    });
    return Object.values(map).sort((a, b) => b.points - a.points);
  }, [members, tasks]);

  return (
    <section style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>통계</h2>
        <button
          type="button"
          onClick={refresh}
          style={{
            border: '1px solid #cbd5f5',
            background: '#f8fafc',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 14,
          }}
        >
          새로고침
        </button>
      </div>
      {loading && <p style={{ color: '#475569' }}>데이터를 불러오는 중...</p>}
      {error && <p style={{ color: '#b42318' }}>{error}</p>}
      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 14, color: '#475569' }}>이번주 완료된 작업</span>
              <strong style={{ fontSize: 18 }}>{weeklyCompleted.length}건</strong>
            </div>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 14, color: '#475569' }}>이번주 획득 포인트</span>
              <strong style={{ fontSize: 18 }}>{weeklyPoints}P</strong>
            </div>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 14, color: '#475569' }}>전체 완료율</span>
              <strong style={{ fontSize: 18 }}>{completionRate}%</strong>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <h3 style={{ margin: '0 0 12px' }}>가족별 기여도</h3>
            {partnerStats.length === 0 ? (
              <p style={{ color: '#475569' }}>기록된 데이터가 없습니다.</p>
            ) : (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: '#475569' }}>가족 구성원</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 13, color: '#475569' }}>완료 건수</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 13, color: '#475569' }}>포인트</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerStats.map((stat) => (
                      <tr key={stat.name} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 16px' }}>{stat.name}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{stat.tasks}건</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{stat.points}P</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default StatsPage;
