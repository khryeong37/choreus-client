import { useMemo, useState } from 'react';
import { taskApi } from '../api/client';
import useHouseholdTasks from '../hooks/useHouseholdTasks';
import useHouseholdMembers from '../hooks/useHouseholdMembers';

const formatDisplayDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

function TasksPage() {
  const { tasks, loading, error, refresh } = useHouseholdTasks();
  const { members } = useHouseholdMembers();
  const [actionError, setActionError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const memberMap = useMemo(() => {
    const map = {};
    members.forEach((member) => {
      map[member.userId] = member.nickname || member.email;
    });
    return map;
  }, [members]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.date === b.date) {
        return (a.order || 0) - (b.order || 0);
      }
      return a.date < b.date ? -1 : 1;
    });
  }, [tasks]);

  const upcoming = sortedTasks.filter((task) => !task.isDone);
  const completedCount = tasks.filter((task) => task.isDone).length;

  const handleToggle = async (taskId) => {
    setActionError('');
    setActionLoadingId(taskId);
    try {
      await taskApi.toggle(taskId);
      await refresh();
    } catch (err) {
      console.error('상태 변경 실패', err);
      setActionError(err.message || '상태 변경에 실패했습니다.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('이 작업을 삭제할까요?')) {
      return;
    }
    setActionError('');
    setActionLoadingId(taskId);
    try {
      await taskApi.remove(taskId);
      await refresh();
    } catch (err) {
      console.error('삭제 실패', err);
      setActionError(err.message || '작업을 삭제하지 못했습니다.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>가족 할 일 현황</h2>
            <p style={{ margin: '4px 0 0', color: '#475569', fontSize: 14 }}>
              완료 {completedCount}건 · 진행 중 {tasks.length - completedCount}건
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
        {loading && <p style={{ color: '#475569' }}>불러오는 중...</p>}
        {error && <p style={{ color: '#b42318' }}>{error}</p>}
        {actionError && <p style={{ color: '#b42318' }}>{actionError}</p>}
        {!loading && !error && sortedTasks.length === 0 && (
          <p style={{ color: '#475569' }}>등록된 작업이 없습니다.</p>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedTasks.map((task) => (
            <li
              key={task.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '14px 16px',
                backgroundColor: task.isDone ? '#f0fdf4' : '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ color: '#0f172a' }}>{task.title}</strong>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                  {formatDisplayDate(task.date)} · {memberMap[task.partnerId] || '미지정'} · {task.points}P
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleToggle(task.id)}
                  disabled={actionLoadingId === task.id}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '8px 14px',
                    backgroundColor: task.isDone ? '#86efac' : '#e0e7ff',
                    color: '#0f172a',
                    fontWeight: 600,
                  }}
                >
                  {task.isDone ? '완료 취소' : '완료하기'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  disabled={actionLoadingId === task.id}
                  style={{
                    border: '1px solid #fecaca',
                    borderRadius: 999,
                    padding: '8px 14px',
                    backgroundColor: '#fff',
                    color: '#b91c1c',
                    fontWeight: 600,
                  }}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>다가오는 일정</h3>
        {upcoming.length === 0 ? (
          <p style={{ color: '#475569' }}>예정된 작업이 없습니다.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {upcoming.slice(0, 4).map((task) => (
              <div
                key={task.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#0f172a' }}>{task.title}</strong>
                  <span style={{ fontSize: 13, color: '#475569' }}>{formatDisplayDate(task.date)}</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569' }}>
                  담당: {memberMap[task.partnerId] || '미지정'} · {task.points}P
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TasksPage;
