import { useMemo } from 'react';
import useHouseholdTasks from '../hooks/useHouseholdTasks';
import useHouseholdMembers from '../hooks/useHouseholdMembers';

const todayIso = new Date().toISOString().split('T')[0];

const formatFriendlyDate = (iso) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

function DashboardPage() {
  const { tasks, loading, error, refresh } = useHouseholdTasks();
  const { members } = useHouseholdMembers();

  const memberMap = useMemo(() => {
    const map = {};
    members.forEach((member) => {
      map[member.userId] = member.nickname || member.email;
    });
    return map;
  }, [members]);

  const todaysTasks = tasks.filter((task) => task.date === todayIso);
  const todaysCompleted = todaysTasks.filter((task) => task.isDone);
  const todaysPending = todaysTasks.filter((task) => !task.isDone);

  const nextTasks = useMemo(() => {
    return tasks
      .filter((task) => !task.isDone)
      .sort((a, b) => {
        if (a.date === b.date) {
          return (a.order || 0) - (b.order || 0);
        }
        return a.date < b.date ? -1 : 1;
      })
      .slice(0, 5);
  }, [tasks]);

  const weekWindow = (() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { start, end: now };
  })();

  const weeklyPoints = tasks.reduce((sum, task) => {
    if (!task.isDone) return sum;
    const date = new Date(task.date);
    if (date >= weekWindow.start && date <= weekWindow.end) {
      return sum + (task.points || 0);
    }
    return sum;
  }, 0);

  return (
    <section style={{ display: 'grid', gap: 20 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>오늘의 요약</h2>
            <p style={{ margin: '4px 0 0', color: '#475569' }}>
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </div>
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
        {loading && <p style={{ color: '#475569', marginTop: 16 }}>일정을 불러오는 중...</p>}
        {error && <p style={{ color: '#b42318', marginTop: 16 }}>{error}</p>}
        {!loading && !error && (
          <>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <div style={{ flex: 1, borderRadius: 16, padding: 16, background: '#dcfce7' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#166534' }}>오늘 남은 일</p>
                <strong style={{ fontSize: 32 }}>{todaysPending.length}</strong>
              </div>
              <div style={{ flex: 1, borderRadius: 16, padding: 16, background: '#e0f2fe' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#1d4ed8' }}>오늘 완료</p>
                <strong style={{ fontSize: 32 }}>{todaysCompleted.length}</strong>
              </div>
              <div style={{ flex: 1, borderRadius: 16, padding: 16, background: '#fef3c7' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#b45309' }}>이번주 포인트</p>
                <strong style={{ fontSize: 32 }}>{weeklyPoints}P</strong>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <h3 style={{ margin: '0 0 12px' }}>다가오는 일정</h3>
              {nextTasks.length === 0 ? (
                <p style={{ color: '#475569' }}>예정된 작업이 없습니다.</p>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {nextTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#0f172a' }}>{task.title}</strong>
                        <p style={{ margin: '4px 0 0', color: '#475569', fontSize: 13 }}>
                          {memberMap[task.partnerId] || '미지정'} · {task.points}P
                        </p>
                      </div>
                      <span style={{ fontSize: 13, color: '#475569' }}>{formatFriendlyDate(task.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default DashboardPage;
