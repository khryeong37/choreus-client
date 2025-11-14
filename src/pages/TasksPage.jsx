import { useState } from 'react';

const initialTasks = [
  { id: 1, title: '거실 청소', date: '2025-02-25', done: true },
  { id: 2, title: '분리수거', date: '2025-02-26', done: false },
  { id: 3, title: '장보기 리스트 작성', date: '2025-02-27', done: false },
];

function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [formState, setFormState] = useState({ title: '', date: '', done: false });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formState.title.trim() || !formState.date) {
      return;
    }
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title: formState.title.trim(), date: formState.date, done: formState.done },
    ]);
    setFormState({ title: '', date: '', done: false });
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
        <h2 style={{ marginTop: 0 }}>할 일 목록</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map((task) => (
            <li
              key={task.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '12px 16px',
                backgroundColor: task.done ? '#ecfccb' : '#f8fafc',
              }}
            >
              <strong style={{ display: 'block', color: '#0f172a' }}>{task.title}</strong>
              <span style={{ fontSize: 13, color: '#475569' }}>예정일: {task.date}</span>
              <span style={{ fontSize: 13, color: task.done ? '#166534' : '#b45309', marginLeft: 8 }}>
                {task.done ? '완료' : '진행중'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>새 할 일 추가</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 14, color: '#1e293b' }}>
            제목
            <input
              type="text"
              name="title"
              value={formState.title}
              onChange={handleChange}
              style={{ marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #cbd5f5' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 14, color: '#1e293b' }}>
            예정일
            <input
              type="date"
              name="date"
              value={formState.date}
              onChange={handleChange}
              style={{ marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #cbd5f5' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1e293b' }}>
            <input type="checkbox" name="done" checked={formState.done} onChange={handleChange} />
            이미 완료했어요
          </label>
          <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 600 }}>
            추가하기
          </button>
        </form>
      </section>
    </div>
  );
}

export default TasksPage;
