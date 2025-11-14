import { useEffect, useMemo, useState } from 'react';
import logoMark from '../data/최종 로고.svg';
import iconHome from '../data/home.png';
import iconSofa from '../data/sofa.png';
import iconFridge from '../data/fridge.png';
import iconBed from '../data/bed.png';
import iconBath from '../data/bath.png';
import iconLaundry from '../data/laundry.png';

const partners = [
  {
    id: 'p1',
    name: '조은진',
    color: '#7cb6ff',
    accent: '#2e7bd1',
    email: 'joeunjin@chore.us',
    inviteId: '#chore01',
    condition: '수면 7시간, 컨디션 좋음',
  },
  {
    id: 'p2',
    name: '김혜령',
    color: '#f5a1d8',
    accent: '#d14ea1',
    email: 'khr0330@ajou.ac.kr',
    inviteId: '#asssw04',
    condition: '수면 5시간, 컨디션 보통',
  },
];
const partnerMap = partners.reduce((acc, partner) => {
  acc[partner.id] = partner;
  return acc;
}, {});

const roomOptions = [
  { id: 'all', label: '집 전체', icon: iconHome },
  { id: 'living', label: '거실', icon: iconSofa },
  { id: 'kitchen', label: '주방', icon: iconFridge },
  { id: 'bed', label: '침실', icon: iconBed },
  { id: 'bath', label: '욕실', icon: iconBath },
  { id: 'laundry', label: '세탁', icon: iconLaundry },
];

const roomSuggestions = {
  all: [
    { title: '집안 전체 환기', cadence: '매일' },
    { title: '공용 공간 정리', cadence: '매주' },
    { title: '쓰레기 배출', cadence: '매일' },
    { title: '공기청정기 필터 확인', cadence: '한 달마다' },
  ],
  living: [
    { title: '거실 먼지 털기', cadence: '매주' },
    { title: '쿠션 세탁', cadence: '매달' },
    { title: 'TV 주변 정리', cadence: '매주' },
    { title: '바닥 물걸레질', cadence: '매주' },
  ],
  kitchen: [
    { title: '싱크대 청소', cadence: '매일' },
    { title: '냉장고 정리', cadence: '매주' },
    { title: '식탁 닦기', cadence: '매일' },
    { title: '설거지', cadence: '매일' },
  ],
  bed: [
    { title: '침구 교체', cadence: '1주일마다' },
    { title: '옷장 정리', cadence: '매달' },
    { title: '침대 아래 청소', cadence: '매달' },
  ],
  bath: [
    { title: '세면대 물때 제거', cadence: '주 2회' },
    { title: '배수구 청소', cadence: '매주' },
    { title: '욕실 매트 세탁', cadence: '매주' },
  ],
  laundry: [
    { title: '세탁물 분류', cadence: '필요시' },
    { title: '건조대 정리', cadence: '매일' },
    { title: '다림질', cadence: '필요시' },
  ],
};

const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const baseFont =
  'system-ui, -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif';

const formatISO = (date) => date.toISOString().slice(0, 10);

const formatKoreanDate = (iso) =>
  new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

const buildTaskTemplate = (isoDate) => ({
  title: '',
  participantId: partners[0].id,
  roomId: roomOptions[0].id,
  repeat: '없음',
  date: isoDate,
  endDate: isoDate,
  memo: '',
  tip: '',
  points: 40,
});

const buildConditionTemplate = (isoDate) => ({
  partnerId: partners[0].id,
  date: isoDate,
  sleepHours: '',
  laborHours: '',
  steps: '',
  workoutHours: '',
  mood: 5,
});

const initialTasks = [
  {
    id: 1,
    title: '점심요리',
    participantId: 'p1',
    participantName: '조은진',
    roomId: 'kitchen',
    repeat: '없음',
    date: '2025-03-01',
    endDate: '2025-03-01',
    memo: '',
    tip: '체질 건강 팁',
    points: 60,
    color: partnerMap.p1?.color || '#7cb6ff',
  },
  {
    id: 2,
    title: '설거지',
    participantId: 'p1',
    participantName: '조은진',
    roomId: 'kitchen',
    repeat: '없음',
    date: '2025-03-01',
    endDate: '2025-03-01',
    memo: '',
    tip: '효율 팁',
    points: 45,
    color: partnerMap.p1?.color || '#7cb6ff',
  },
  {
    id: 3,
    title: '청소기 돌리기',
    participantId: 'p2',
    participantName: '김혜령',
    roomId: 'all',
    repeat: '없음',
    date: '2025-03-01',
    endDate: '2025-03-01',
    memo: '',
    tip: '청소기 팁',
    points: 40,
    color: partnerMap.p2?.color || '#f5a1d8',
  },
];

const suggestionPool = [
  { title: '이불 털기', points: 30, tone: '추가' },
  { title: '저녁요리', points: 60, tone: '추가' },
  { title: '화장실 청소', points: 50, tone: '추가' },
  { title: '스탠드형 에어컨 청소', points: 80, tone: '긴급' },
];

const tipLibrary = [
  '체질 건강 팁',
  '효율 팁',
  '정리 팁',
  '청소기 팁',
  '집중력 팁',
];

const generateTip = (roomLabel) => {
  const tip = tipLibrary[Math.floor(Math.random() * tipLibrary.length)];
  return roomLabel ? `${roomLabel} ${tip}` : tip;
};

function App() {
  const defaultDate = formatISO(new Date(2025, 2, 1));
  const [viewMode, setViewMode] = useState('month');
  const [anchorDate, setAnchorDate] = useState(new Date(2025, 2, 1));
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [tasks, setTasks] = useState(initialTasks);
  const [modal, setModal] = useState(null);
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState(buildTaskTemplate(defaultDate));
  const [conditionForm, setConditionForm] = useState(
    buildConditionTemplate(defaultDate)
  );

  useEffect(() => {
    setTaskForm((prev) => ({
      ...prev,
      date: selectedDate,
      endDate: selectedDate,
    }));
    setConditionForm((prev) => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const scheduleMap = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      if (!map.has(task.date)) {
        map.set(task.date, []);
      }
      map.get(task.date).push(task);
    });
    return map;
  }, [tasks]);

  const todayIso = formatISO(new Date());

  const monthLabel = anchorDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth(),
      1
    );
    const startOffset = firstOfMonth.getDay();
    const firstCellDate = new Date(firstOfMonth);
    firstCellDate.setDate(firstCellDate.getDate() - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const cellDate = new Date(firstCellDate);
      cellDate.setDate(firstCellDate.getDate() + index);
      const iso = formatISO(cellDate);
      return {
        iso,
        label: cellDate.getDate(),
        isCurrentMonth: cellDate.getMonth() === anchorDate.getMonth(),
        isToday: iso === todayIso,
      };
    });
  }, [anchorDate, todayIso]);

  useEffect(() => {
    const current = new Date(selectedDate);
    if (
      current.getMonth() !== anchorDate.getMonth() ||
      current.getFullYear() !== anchorDate.getFullYear()
    ) {
      setSelectedDate(
        formatISO(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1))
      );
    }
  }, [anchorDate, selectedDate]);

  const selectedTasks = scheduleMap.get(selectedDate) || [];
  const sortedDailyTasks = useMemo(
    () => [...selectedTasks].sort((a, b) => (b.points || 0) - (a.points || 0)),
    [selectedTasks]
  );
  const dailySuggestions = useMemo(() => {
    const base = suggestionPool.map((item, index) => ({
      ...item,
      urgency: item.tone === '긴급' || index === suggestionPool.length - 1,
    }));
    return base;
  }, []);

  const partnerStats = useMemo(() => {
    const totals = {};
    tasks.forEach((task) => {
      const { participantId, points = 40 } = task;
      if (!totals[participantId]) {
        totals[participantId] = { points: 0, taskCount: 0 };
      }
      totals[participantId].points += points;
      totals[participantId].taskCount += 1;
    });
    const overallPoints = Object.values(totals).reduce(
      (sum, data) => sum + data.points,
      0
    );
    partners.forEach((partner) => {
      if (!totals[partner.id]) {
        totals[partner.id] = { points: 0, taskCount: 0 };
      }
      totals[partner.id].percentage = overallPoints
        ? Math.round((totals[partner.id].points / overallPoints) * 100)
        : 0;
    });
    return totals;
  }, [tasks]);

  const handleMonthChange = (direction) => {
    setAnchorDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1)
    );
  };

  const handleToday = () => {
    const now = new Date();
    setAnchorDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(formatISO(now));
  };

  const handleTaskInput = (event) => {
    const { name, value } = event.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConditionInput = (event) => {
    const { name, value } = event.target;
    if (name === 'reset') {
      setConditionForm(buildConditionTemplate(selectedDate));
      return;
    }
    setConditionForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitTask = (event) => {
    event.preventDefault();
    if (!taskForm.title.trim()) {
      return;
    }
    const partner = partners.find((item) => item.id === taskForm.participantId);
    const room = roomOptions.find((item) => item.id === taskForm.roomId);
    const generatedPoints = 30 + Math.floor(Math.random() * 40);
    const generatedTip = generateTip(room?.label);
    const newTask = {
      id: Date.now(),
      title: taskForm.title.trim(),
      participantId: taskForm.participantId,
      participantName: partner?.name || '미지정',
      color: partner?.color || '#7cd4b6',
      roomLabel: room?.label || '',
      repeat: taskForm.repeat,
      date: taskForm.date,
      endDate: taskForm.endDate,
      memo: taskForm.memo.trim(),
      tip: generatedTip,
      points: generatedPoints,
      roomId: taskForm.roomId,
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskForm(buildTaskTemplate(selectedDate));
    setModal(null);
    setRoomPickerOpen(false);
  };

  const submitCondition = (event) => {
    event.preventDefault();
    const partner = partners.find(
      (item) => item.id === conditionForm.partnerId
    );
    const entry = {
      id: Date.now(),
      ...conditionForm,
      partnerName: partner?.name || '',
    };
    console.log('Condition entry saved', entry);
    setConditionForm(buildConditionTemplate(selectedDate));
    setModal(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#e7ebe3',
        padding: 24,
        fontFamily: baseFont,
      }}
    >
      <aside
        style={{
          width: 280,
          backgroundColor: '#c7dfbc',
          borderRadius: 24,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          color: '#1d3b2c',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 12 }}>6:26 3월 01일</span>
          <img
            src={logoMark}
            alt="chore:us 로고"
            style={{ width: 140, height: 'auto', objectFit: 'contain' }}
          />
          <button
            type="button"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 16,
              border: 'none',
              backgroundColor: '#b1cfaa',
              fontSize: 20,
              fontWeight: 600,
              color: '#183322',
              cursor: 'default',
            }}
          >
            우리집 <span style={{ fontSize: 16 }}>⌄</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SidebarButton label="캘린더" />
          <SidebarButton
            label="모든 할일"
            badge={tasks.length.toString()}
            onClick={() => setModal('allTasks')}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <strong style={{ fontSize: 18 }}>가사 파트너</strong>
            <span style={{ fontSize: 20 }}>＋</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {partners.map((partner) => (
              <button
                key={partner.id}
                type="button"
                onClick={() => {
                  setSelectedPartner(partner);
                  setModal('partner');
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#f4fff0',
                  borderRadius: 16,
                  padding: '12px 8px',
                  border: `1px solid ${partner.color}`,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: `2px solid ${partner.color}`,
                    margin: '0 auto 8px',
                  }}
                />
                <span style={{ fontSize: 13 }}>{partner.name}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          marginLeft: 24,
          backgroundColor: '#fdfdfd',
          borderRadius: 32,
          padding: 32,
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          position: 'relative',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={() => setModal('chooser')}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '1px solid #d3d7db',
              backgroundColor: '#f5f7fa',
              fontSize: 28,
              color: '#2f4b3e',
              cursor: 'pointer',
            }}
          >
            ＋
          </button>
          <div
            style={{
              display: 'inline-flex',
              borderRadius: 999,
              border: '1px solid #d6dadd',
              overflow: 'hidden',
              fontSize: 14,
            }}
          >
            {['day', 'month'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '8px 18px',
                  border: 'none',
                  backgroundColor:
                    viewMode === mode ? '#2f4b3e' : 'transparent',
                  color: viewMode === mode ? '#fff' : '#5c6168',
                  cursor: 'pointer',
                }}
              >
                {mode === 'day' ? '일' : '월'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              style={navButtonStyle}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleToday}
              style={todayButtonStyle}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              style={navButtonStyle}
            >
              ›
            </button>
          </div>
        </header>

        <section style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 32, color: '#111827' }}>
            {monthLabel}
          </h1>
        </section>

        {viewMode === 'month' ? (
          <section
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                color: '#6b7280',
                fontSize: 13,
              }}
            >
              {dayLabels.map((label) => (
                <div
                  key={label}
                  style={{ textAlign: 'center', padding: '8px 0' }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 4,
              }}
            >
              {calendarCells.map((cell) => {
                const cellTasks = scheduleMap.get(cell.iso) || [];
                const isSelected = cell.iso === selectedDate;
                return (
                  <button
                    type="button"
                    key={cell.iso}
                    onClick={() => setSelectedDate(cell.iso)}
                    style={{
                      minHeight: 110,
                      borderRadius: 16,
                      border: isSelected
                        ? '2px solid #2f4b3e'
                        : '1px solid #e5e7eb',
                      backgroundColor: cell.isCurrentMonth ? '#fff' : '#f0f2f5',
                      padding: 12,
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        color: '#6b7280',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: cell.isCurrentMonth ? '#111827' : '#9ca3af',
                        }}
                      >
                        {cell.label}
                      </span>
                      {cell.isToday && (
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: 999,
                            backgroundColor: '#2f4b3e',
                            color: '#fff',
                            fontSize: 10,
                          }}
                        >
                          오늘
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      {cellTasks.slice(0, 3).map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedTask(task);
                            setModal('taskDetail');
                          }}
                          style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: 8,
                            fontSize: 11,
                            color: '#fff',
                            backgroundColor: task.color,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {task.title}
                        </button>
                      ))}
                      {cellTasks.length > 3 && (
                        <span style={{ fontSize: 11, color: '#6b7280' }}>
                          +{cellTasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div
              style={{
                border: '1px solid #e4e8eb',
                borderRadius: 28,
                padding: 24,
                backgroundColor: '#fff',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, color: '#6b7585', fontSize: 14 }}>
                    오늘 일정
                  </p>
                  <h2 style={{ margin: '4px 0 0' }}>
                    {formatKoreanDate(selectedDate)}
                  </h2>
                </div>
                <span style={{ color: '#6b7280', fontSize: 14 }}>
                  {sortedDailyTasks.length}개의 할일
                </span>
              </div>
              {sortedDailyTasks.length === 0 ? (
                <p style={{ margin: 0, color: '#9ca3af' }}>
                  이 날짜에는 아직 할일이 없어요.
                </p>
              ) : (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  {sortedDailyTasks.map((task, index) => {
                    const partner = partnerMap[task.participantId];
                    const borderColor = partner?.color || '#cbd5f5';
                    return (
                      <article
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setModal('taskDetail');
                        }}
                        style={{
                          border: `2px solid ${borderColor}`,
                          borderRadius: 24,
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: borderColor,
                            color: '#fff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: 18 }}>{task.title}</strong>
                          <p
                            style={{
                              margin: '4px 0 0',
                              fontSize: 13,
                              color: '#5f6b7c',
                            }}
                          >
                            {
                              roomOptions.find(
                                (room) => room.id === task.roomId
                              )?.label
                            }
                          </p>
                          {task.tip && (
                            <p
                              style={{
                                margin: '6px 0 0',
                                fontSize: 12,
                                color: '#94a3b8',
                              }}
                            >
                              [{task.tip}]
                            </p>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 13,
                              color: '#1f3f2a',
                            }}
                          >
                            {partner?.name}
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: borderColor,
                                display: 'inline-block',
                              }}
                            />
                          </span>
                          <span
                            style={{
                              padding: '6px 12px',
                              borderRadius: 999,
                              border: `1px solid ${borderColor}`,
                              color: '#1f3f2a',
                              fontWeight: 600,
                              fontSize: 14,
                              backgroundColor: `${borderColor}22`,
                            }}
                          >
                            {task.points || 40}P
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
            <section
              style={{
                border: '1px solid #d9e1d8',
                borderRadius: 28,
                padding: 20,
                backgroundColor: '#f6faf3',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <strong>할일 추천</strong>
                <span style={{ fontSize: 12, color: '#7b8794' }}>
                  AI 맞춤 제안
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {dailySuggestions.map((rec, idx) => (
                  <div
                    key={`${rec.title}-${idx}`}
                    style={{
                      minWidth: 140,
                      padding: '12px 16px',
                      borderRadius: 20,
                      border: rec.urgency
                        ? '1px solid #f87171'
                        : '1px solid #d3dbcf',
                      backgroundColor: rec.urgency ? '#fff5f5' : '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{rec.title}</span>
                    <span
                      style={{
                        color: rec.urgency ? '#d12f2f' : '#4b5563',
                        fontSize: 12,
                      }}
                    >
                      {rec.points}P {rec.urgency ? '긴급 추가' : '추가'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </section>
        )}

        {modal && (
          <ModalSurface onClose={() => setModal(null)}>
            {modal === 'chooser' && (
              <ChoiceModal
                onClose={() => setModal(null)}
                onSelect={(type) => setModal(type)}
              />
            )}
            {modal === 'task' && (
              <TaskModal
                form={taskForm}
                onChange={handleTaskInput}
                onSubmit={submitTask}
                onBack={() => setModal('chooser')}
                rooms={roomOptions}
                onRoomSelect={(roomId) => {
                  setTaskForm((prev) => ({ ...prev, roomId }));
                  setRoomPickerOpen(false);
                }}
                roomPickerOpen={roomPickerOpen}
                openRoomPicker={() => setRoomPickerOpen(true)}
                closeRoomPicker={() => setRoomPickerOpen(false)}
              />
            )}
            {modal === 'condition' && (
              <ConditionModal
                form={conditionForm}
                onChange={handleConditionInput}
                onSubmit={submitCondition}
                onBack={() => setModal('chooser')}
              />
            )}
            {modal === 'allTasks' && (
              <AllTasksModal
                tasks={tasks}
                stats={partnerStats}
                onClose={() => setModal(null)}
              />
            )}
            {modal === 'partner' && selectedPartner && (
              <PartnerModal
                partner={selectedPartner}
                stats={partnerStats[selectedPartner.id]}
                onClose={() => setModal(null)}
              />
            )}
            {modal === 'taskDetail' && selectedTask && (
              <TaskDetailModal
                task={selectedTask}
                onClose={() => setModal(null)}
                onDelete={handleDeleteTask}
              />
            )}
          </ModalSurface>
        )}
      </main>
    </div>
  );
}

function SidebarButton({ label, badge, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        border: 'none',
        borderRadius: 20,
        padding: '12px 16px',
        backgroundColor: '#e6f0df',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 16,
        color: '#1f3526',
      }}
    >
      {label}
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {badge && (
          <span
            style={{
              minWidth: 28,
              padding: '2px 8px',
              borderRadius: 999,
              backgroundColor: '#fff',
              border: '1px solid #c0d7b7',
              fontSize: 14,
            }}
          >
            {badge}
          </span>
        )}
        <span style={{ fontSize: 18 }}>›</span>
      </span>
    </button>
  );
}

const navButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: '1px solid #d3d7db',
  backgroundColor: '#f8fafb',
  fontSize: 18,
  cursor: 'pointer',
};

const todayButtonStyle = {
  padding: '6px 16px',
  borderRadius: 999,
  border: '1px solid #d3d7db',
  backgroundColor: '#f6f7fb',
  cursor: 'pointer',
};

function ModalSurface({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fefefe',
          borderRadius: 32,
          padding: 32,
          minWidth: 640,
          maxWidth: 960,
          width: '80%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '2px solid #1f3f2a',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ChoiceModal({ onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <button
        type="button"
        onClick={() => onSelect('task')}
        style={choiceButtonStyle}
      >
        새 작업 추가하기
      </button>
      <button
        type="button"
        onClick={() => onSelect('condition')}
        style={choiceButtonStyle}
      >
        컨디션 입력
      </button>
    </div>
  );
}

const choiceButtonStyle = {
  flex: 1,
  padding: '40px 24px',
  borderRadius: 24,
  border: '2px dashed #1f3f2a',
  backgroundColor: '#f6fbf1',
  fontSize: 24,
  fontWeight: 600,
  color: '#1f3f2a',
  cursor: 'pointer',
};

function TaskModal({
  form,
  onChange,
  onSubmit,
  onBack,
  rooms,
  onRoomSelect,
  roomPickerOpen,
  openRoomPicker,
  closeRoomPicker,
}) {
  return (
    <div style={{ position: 'relative' }}>
      <header style={modalHeaderStyle}>
        <button type="button" onClick={onBack} style={backButtonStyle}>
          ‹
        </button>
        <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>
          새 작업 추가하기
        </h2>
        <span style={{ width: 36 }} />
      </header>
      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <LabeledRow label="제목">
          <div style={{ position: 'relative' }}>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              style={{ ...inputStyle, paddingRight: 110 }}
              placeholder="예) 청소기 돌리기"
            />
            <button
              type="button"
              onClick={roomPickerOpen ? closeRoomPicker : openRoomPicker}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                borderRadius: 999,
                border: '1px dashed #b0b7b5',
                padding: '6px 12px',
                backgroundColor: '#f6f8f4',
                fontSize: 13,
                fontWeight: 600,
                color: '#506057',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {rooms.find((room) => room.id === form.roomId)?.label ||
                '카테고리'}
              <span style={{ fontSize: 16 }}>⋯</span>
            </button>
            {roomPickerOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 12,
                  width: 360,
                  zIndex: 20,
                }}
              >
                <CategorySelector
                  rooms={rooms}
                  selectedRoomId={form.roomId}
                  onRoomSelect={onRoomSelect}
                  onClose={closeRoomPicker}
                  onSelectTask={(taskName) => {
                    onChange({ target: { name: 'title', value: taskName } });
                    closeRoomPicker();
                  }}
                />
              </div>
            )}
          </div>
        </LabeledRow>
        <LabeledRow label="참여자">
          <select
            name="participantId"
            value={form.participantId}
            onChange={onChange}
            style={inputStyle}
          >
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </LabeledRow>
        <LabeledRow label="반복">
          <input
            name="repeat"
            value={form.repeat}
            onChange={onChange}
            style={inputStyle}
            placeholder="없음"
          />
        </LabeledRow>
        <LabeledRow label="날짜">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            style={inputStyle}
          />
        </LabeledRow>
        <LabeledRow label="종료일">
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            style={inputStyle}
          />
        </LabeledRow>
        <LabeledRow label="메모">
          <textarea
            name="memo"
            value={form.memo}
            onChange={onChange}
            style={{ ...inputStyle, minHeight: 60 }}
            placeholder="세부 지시사항을 남겨주세요."
          />
        </LabeledRow>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 12,
          }}
        >
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              borderRadius: 16,
              border: '1px solid #d0d7cb',
              backgroundColor: '#fff',
              color: '#1f3f2a',
              fontWeight: 600,
              boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
              cursor: 'pointer',
            }}
          >
            완료하기
          </button>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '12px 24px',
              borderRadius: 16,
              border: '1px solid #ffd1d1',
              backgroundColor: '#fff',
              color: '#cc2b2b',
              fontWeight: 600,
              boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
              cursor: 'pointer',
            }}
          >
            삭제하기
          </button>
        </div>
      </form>
    </div>
  );
}

function ConditionModal({ form, onChange, onSubmit, onBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header style={modalHeaderStyle}>
        <button type="button" onClick={onBack} style={backButtonStyle}>
          ‹
        </button>
        <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>
          컨디션 입력하기
        </h2>
        <span style={{ width: 36 }} />
      </header>
      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <LabeledRow label="가사 파트너">
          <select
            name="partnerId"
            value={form.partnerId}
            onChange={onChange}
            style={inputStyle}
          >
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </LabeledRow>
        <LabeledRow label="날짜">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            style={inputStyle}
          />
        </LabeledRow>
        <LabeledRow label="오늘의 수면 시간">
          <input
            name="sleepHours"
            value={form.sleepHours}
            onChange={onChange}
            style={inputStyle}
            placeholder="예: 6시간 30분"
          />
        </LabeledRow>
        <LabeledRow label="어제의 노동시간">
          <input
            name="laborHours"
            value={form.laborHours}
            onChange={onChange}
            style={inputStyle}
            placeholder="예: 8시간 25분"
          />
        </LabeledRow>
        <LabeledRow label="어제의 걸음수">
          <input
            name="steps"
            value={form.steps}
            onChange={onChange}
            style={inputStyle}
            placeholder="예: 5455걸음"
          />
        </LabeledRow>
        <LabeledRow label="어제의 운동시간">
          <input
            name="workoutHours"
            value={form.workoutHours}
            onChange={onChange}
            style={inputStyle}
            placeholder="예: 2시간"
          />
        </LabeledRow>
        <div style={{ padding: '12px 0', borderBottom: '1px solid #d2d7dc' }}>
          <strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
            본인이 생각한 오늘의 컨디션
          </strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12 }}>0</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: 11 }).map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() =>
                    onChange({ target: { name: 'mood', value: index } })
                  }
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '1px solid #9ba3af',
                    backgroundColor:
                      Number(form.mood) === index ? '#1f3f2a' : '#fff',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 12 }}>10</span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 16,
          }}
        >
          <button type="submit" style={primaryButtonStyle}>
            완료하기
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                target: {
                  name: 'reset',
                  value: null,
                },
              })
            }
            style={dangerButtonStyle}
          >
            삭제하기
          </button>
        </div>
      </form>
    </div>
  );
}

function CategorySelector({
  rooms,
  selectedRoomId,
  onRoomSelect,
  onSelectTask,
  onClose,
}) {
  const [view, setView] = useState('rooms');
  const [search, setSearch] = useState('');
  const [focusedRoom, setFocusedRoom] = useState(selectedRoomId);

  useEffect(() => {
    setFocusedRoom(selectedRoomId);
  }, [selectedRoomId]);

  const filteredRooms = rooms.filter((room) => room.label.includes(search));
  const activeRoom = rooms.find((room) => room.id === focusedRoom) || rooms[0];
  const roomTasks = roomSuggestions[activeRoom?.id] || [];
  const filteredTasks = roomTasks.filter((task) => task.title.includes(search));

  const openTasks = (roomId) => {
    setFocusedRoom(roomId);
    onRoomSelect(roomId);
    setView('tasks');
    setSearch('');
  };

  const pickTask = (taskTitle) => {
    onSelectTask(taskTitle);
    setView('rooms');
    setSearch('');
    onClose();
  };

  const headerLabel =
    view === 'rooms' ? '작업 선택' : `${activeRoom?.label} 작업`;

  return (
    <section
      style={{
        border: '2px solid #1f3f2a',
        borderRadius: 28,
        padding: 16,
        backgroundColor: '#fefefe',
        boxShadow: '0 18px 36px rgba(0,0,0,0.22)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 320,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={view === 'rooms' ? onClose : () => setView('rooms')}
          style={backButtonStyle}
        >
          ‹
        </button>
        <strong style={{ flex: 1, textAlign: 'center' }}>{headerLabel}</strong>
        <span style={{ width: 36 }} />
      </header>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 16,
          padding: '6px 10px',
          border: '1px solid #d7dfd2',
          backgroundColor: '#f3f6f2',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16, color: '#94a3b8' }}>🔍</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="검색"
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            flex: 1,
            fontSize: 14,
          }}
        />
      </div>
      {view === 'rooms' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredRooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => openTasks(room.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 18,
                border: '1px solid #d2d7dc',
                backgroundColor: '#fff',
                fontSize: 14,
                fontWeight: 600,
                color: '#1f3f2a',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={room.icon} alt="" style={{ width: 22, height: 22 }} />
                {room.label}
              </span>
              <span style={{ fontSize: 20, color: '#1f3f2a' }}>›</span>
            </button>
          ))}
        </div>
      ) : (
        <div
          style={{
            border: '1px solid #e2e7e1',
            borderRadius: 20,
            padding: 12,
            backgroundColor: '#fbfdfa',
            maxHeight: 280,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {filteredTasks.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
              검색 결과가 없습니다.
            </p>
          ) : (
            filteredTasks.map((task) => (
              <button
                key={task.title}
                type="button"
                onClick={() => pickTask(task.title)}
                style={{
                  border: '1px solid #d5ded1',
                  borderRadius: 16,
                  padding: '10px 14px',
                  textAlign: 'left',
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  fontSize: 14,
                }}
              >
                <span style={{ fontWeight: 600, color: '#1f3f2a' }}>
                  {task.title}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {task.cadence}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </section>
  );
}

function AllTasksModal({ tasks, stats, onClose }) {
  const [search, setSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => task.title.toLowerCase().includes(search.toLowerCase()))
      .filter((task) =>
        partnerFilter === 'all' ? true : task.participantId === partnerFilter
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks, search, partnerFilter]);

  const grouped = useMemo(() => {
    const map = new Map();
    filteredTasks.forEach((task) => {
      if (!map.has(task.date)) {
        map.set(task.date, []);
      }
      map.get(task.date).push(task);
    });
    return Array.from(map.entries());
  }, [filteredTasks]);

  const formatGroupedDate = (iso) =>
    new Date(iso).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>모든 할일</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
            {filteredTasks.length}개의 기록
          </p>
        </div>
        <button type="button" onClick={onClose} style={backButtonStyle}>
          ✕
        </button>
      </header>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {partners.map((partner) => {
          const data = stats[partner.id] || { points: 0, percentage: 0 };
          return (
            <div
              key={partner.id}
              style={{
                flex: '1 1 160px',
                border: `1px solid ${partner.color}`,
                borderRadius: 18,
                padding: 12,
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                {partner.name}
              </span>
              <strong style={{ fontSize: 18 }}>{data.points || 0}P</strong>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                {data.percentage || 0}%
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="제목 검색"
          style={{ ...inputStyle, flex: 1 }}
        />
        <select
          value={partnerFilter}
          onChange={(event) => setPartnerFilter(event.target.value)}
          style={{ ...inputStyle, maxWidth: 200 }}
        >
          <option value="all">전체 파트너</option>
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {grouped.length === 0 ? (
          <p style={{ margin: 0, color: '#9ca3af' }}>
            조건에 맞는 할일이 없어요.
          </p>
        ) : (
          grouped.map(([date, items]) => (
            <section
              key={date}
              style={{
                border: '1px solid #e2e7eb',
                borderRadius: 20,
                padding: 16,
                backgroundColor: '#fff',
              }}
            >
              <strong style={{ display: 'block', marginBottom: 8 }}>
                {formatGroupedDate(date)}
              </strong>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {items.map((task) => {
                  const partner = partnerMap[task.participantId];
                  return (
                    <div
                      key={task.id}
                      style={{
                        border: `1px solid ${partner?.color || '#cbd5f5'}`,
                        borderRadius: 16,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: '#fff',
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: partner?.color || '#cbd5f5',
                          display: 'inline-block',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong>{task.title}</strong>
                        <p
                          style={{
                            margin: '2px 0 0',
                            fontSize: 12,
                            color: '#6b7280',
                          }}
                        >
                          {partner?.name ?? '미지정'} ·{' '}
                          {roomOptions.find((room) => room.id === task.roomId)
                            ?.label || task.roomLabel}
                        </p>
                      </div>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {task.tip || '팁 준비중'}
                      </span>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          border: `1px solid ${partner?.color || '#cbd5f5'}`,
                          backgroundColor: `${partner?.color || '#cbd5f5'}22`,
                          fontSize: 12,
                        }}
                      >
                        {task.points || 40}P
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function PartnerModal({ partner, stats, onClose }) {
  const workload =
    (stats?.percentage || 0) > 60
      ? '가사 비중이 많아요'
      : (stats?.percentage || 0) < 30
      ? '여유가 있어요'
      : '균형잡힌 상태';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 20,
            border: '1px solid #e2e7eb',
            backgroundColor: '#fff',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: `2px solid ${partner.color}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: partner.color,
              fontSize: 20,
            }}
          >
            🙂
          </div>
          <strong style={{ fontSize: 18 }}>{partner.name} 프로필</strong>
        </div>
        <button type="button" onClick={onClose} style={backButtonStyle}>
          ✕
        </button>
      </header>
      <div
        style={{
          border: '1px solid #dbe2d8',
          borderRadius: 24,
          padding: 16,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <PartnerRow label="프로필 이름" value={partner.name} />
        <PartnerRow label="이메일" value={partner.email} />
        <PartnerRow
          label="컬러"
          value={
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {partner.color}
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: partner.color,
                  border: '1px solid #cfd3d8',
                }}
              />
            </span>
          }
        />
        <PartnerRow label="초대 아이디" value={partner.inviteId} />
        <PartnerRow label="획득 포인트" value={`${stats?.points || 0}P`} />
        <PartnerRow label="퍼센트" value={`${stats?.percentage || 0}%`} />
        <PartnerRow label="가사 노동 현황" value={workload} hasArrow />
        <PartnerRow label="컨디션" value={partner.condition} hasArrow />
      </div>
    </div>
  );
}

function PartnerRow({ label, value, hasArrow }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 4px',
        borderBottom: '1px solid #e5e9ec',
      }}
    >
      <span style={{ color: '#6b7280', fontSize: 13 }}>{label}</span>
      <span
        style={{
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {value}
        {hasArrow && <span style={{ fontSize: 18 }}>›</span>}
      </span>
    </div>
  );
}

function TaskDetailModal({ task, onClose, onDelete }) {
  const partner = partnerMap[task.participantId];
  const roomLabel =
    roomOptions.find((room) => room.id === task.roomId)?.label ||
    task.roomLabel;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button type="button" onClick={onClose} style={backButtonStyle}>
          ‹
        </button>
        <strong style={{ flex: 1, textAlign: 'center' }}>할일 상세보기</strong>
        <span style={{ width: 36 }} />
      </header>
      <div
        style={{
          border: `2px solid ${partner?.color || '#dbe2d8'}`,
          borderRadius: 28,
          padding: 20,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <strong style={{ fontSize: 20 }}>{task.title}</strong>
            <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
              {partner?.name}
            </p>
          </div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: `1px solid ${partner?.color || '#cbd5f5'}`,
              backgroundColor: `${partner?.color || '#cbd5f5'}22`,
              fontWeight: 600,
            }}
          >
            {task.points || 40}P
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <DetailColumn label="방" value={roomLabel} />
          <DetailColumn label="반복" value={task.repeat || '반복없음'} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <DetailColumn label="날짜" value={task.date} />
          <DetailColumn label="미루기" value="-" />
        </div>
        {task.tip && (
          <div style={{ borderTop: '1px solid #e5e9ec', paddingTop: 10 }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>
              [{task.tip}]
            </strong>
            <p style={{ margin: 0, color: '#4b5563', fontSize: 14 }}>
              이번 주에는 {task.tip}에 맞춰 집안일을 진행해 보세요!
            </p>
          </div>
        )}
        {task.memo && (
          <div style={{ borderTop: '1px solid #e5e9ec', paddingTop: 10 }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>메모</strong>
            <p style={{ margin: 0, color: '#4b5563', fontSize: 14 }}>
              {task.memo}
            </p>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 18px',
            borderRadius: 14,
            border: '1px solid #cad2c6',
            backgroundColor: '#fff',
            color: '#14402c',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          완료하기
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          style={{
            padding: '10px 18px',
            borderRadius: 14,
            border: '1px solid #ffd1d1',
            backgroundColor: '#fff',
            color: '#d83b3b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          삭제하기
        </button>
      </div>
    </div>
  );
}

function DetailColumn({ label, value }) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#f8fafb',
        borderRadius: 16,
        padding: '12px 16px',
        border: '1px solid #e3e7ec',
      }}
    >
      <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
      <p style={{ margin: '6px 0 0', fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function LabeledRow({ label, children }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        borderBottom: '1px solid #d2d7dc',
        paddingBottom: 8,
      }}
    >
      <span style={{ fontSize: 14, color: '#1f3f2a' }}>{label}</span>
      {children}
    </label>
  );
}

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 16,
};

const backButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: '1px solid #d3d7db',
  backgroundColor: '#fff',
  cursor: 'pointer',
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid #cfd3d8',
  fontSize: 14,
  width: '100%',
};

const primaryButtonStyle = {
  padding: '12px 20px',
  borderRadius: 999,
  border: 'none',
  backgroundColor: '#1f3f2a',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};

const dangerButtonStyle = {
  padding: '12px 20px',
  borderRadius: 999,
  border: 'none',
  backgroundColor: '#ff6666',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};

export default App;
const handleDeleteTask = (taskId) => {
  setTasks((prev) => prev.filter((task) => task.id !== taskId));
  setSelectedTask(null);
  setModal(null);
};
