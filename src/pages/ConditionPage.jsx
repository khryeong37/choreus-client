import { useState } from 'react';

function ConditionPage() {
  const [condition, setCondition] = useState({
    mood: '좋음',
    notes: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCondition((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Condition submitted:', condition);
  };

  return (
    <section style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.08)', maxWidth: 600 }}>
      <h2 style={{ marginTop: 0 }}>오늘 컨디션</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
          기분 상태
          <select
            name="mood"
            value={condition.mood}
            onChange={handleChange}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5f5' }}
          >
            <option value="최고">최고</option>
            <option value="좋음">좋음</option>
            <option value="보통">보통</option>
            <option value="피곤">피곤</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
          메모
          <textarea
            name="notes"
            value={condition.notes}
            onChange={handleChange}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5f5', minHeight: 100, resize: 'vertical' }}
            placeholder="오늘 컨디션에 영향을 준 일들을 적어주세요."
          />
        </label>

        <button type="submit" style={{ padding: '12px 16px', borderRadius: 8, border: 'none', backgroundColor: '#22c55e', color: '#fff', fontWeight: 600 }}>
          기록하기
        </button>
      </form>
    </section>
  );
}

export default ConditionPage;
