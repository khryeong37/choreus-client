import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import chorePreferenceOptions from '../data/chorePreferences';
import { getAuthToken, requestApi, setAuthToken, taskApi, userApi, conditionApi, tipApi, templateApi } from '../api/client';
import logoMark from '../../data/최종 로고.svg';
import iconHome from '../../data/home.png';
import iconSofa from '../../data/sofa.png';
import iconFridge from '../../data/fridge.png';
import iconBed from '../../data/bed.png';
import iconBath from '../../data/bath.png';
import iconLaundry from '../../data/laundry.png';

const navItems = [
  { id: 'calendar', label: '캘린더' },
  { id: 'tasks', label: '모든 할일', badge: 6 },
  { id: 'requests', label: '요청 목록', badge: 2 },
];

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

const partnerTemplates = [
  {
    id: 'p1',
    name: '조은진',
    email: 'zzin@home.com',
    color: '#7cb6ff',
    accent: '#2e7bd1',
    inviteCode: 'HOME-8321',
    points: 420,
    condition: '컨디션 좋음, 아침형 루틴 유지 중',
    favorites: ['주방', '정리정돈'],
  },
  {
    id: 'p2',
    name: '김혜령',
    email: 'hyeryeong@home.com',
    color: '#f5a1d8',
    accent: '#cc5ea4',
    inviteCode: 'HOME-9440',
    points: 480,
    condition: '집중력 최고, 점심 이후 살짝 피곤',
    favorites: ['거실', '청소기 돌리기'],
  },
];


const adaptServerRequest = (entry) => {
  const approvals = entry.approvals || {};
  return {
    id: entry.id,
    requester: entry.requester,
    requesterId: entry.requesterId,
    taskId: entry.taskId,
    taskTitle: entry.taskTitle,
    taskDate: entry.taskDate,
    delta: entry.delta,
    direction: entry.direction,
    status: entry.status,
    approvals,
  };
};

const defaultRoomOptions = [
  { id: 'all', label: '집 전체', icon: iconHome },
  { id: 'living', label: '거실', icon: iconSofa },
  { id: 'kitchen', label: '주방', icon: iconFridge },
  { id: 'bed', label: '침실', icon: iconBed },
  { id: 'bath', label: '욕실', icon: iconBath },
  { id: 'laundry', label: '세탁', icon: iconLaundry },
];

const defaultRoomTaskLibrary = {
  all: ['집안 전체 환기', '쓰레기 배출', '공용 공간 정리'],
  living: ['거실 먼지 털기', '쿠션 정리', 'TV 주변 정리'],
  kitchen: ['점심요리', '설거지', '싱크대 청소'],
  bed: ['이불 빨래', '침구 교체', '옷장 정리'],
  bath: ['욕실 청소', '세면대 물때 제거', '배수구 청소'],
  laundry: ['빨래 개기', '건조대 정리', '세탁물 분류'],
};

const durationOptions = [
  { id: '15', label: '15분 이하', weight: 5 },
  { id: '30', label: '30분 내', weight: 10 },
  { id: '45', label: '45분', weight: 15 },
  { id: '60', label: '1시간', weight: 20 },
  { id: '90', label: '1시간 30분 이상', weight: 25 },
];

const effortOptions = [
  { id: 'easy', label: '쉬움', weight: 5 },
  { id: 'normal', label: '보통', weight: 10 },
  { id: 'focus', label: '집중 필요', weight: 15 },
  { id: 'hard', label: '힘듦', weight: 20 },
  { id: 'extreme', label: '아주 힘듦', weight: 30 },
];

const recommendationList = [
  {
    id: 'rec1',
    title: '저녁요리',
    points: 60,
    category: 'daily',
    room: '주방',
    partnerId: 'p1',
  },
  {
    id: 'rec2',
    title: '설거지',
    points: 60,
    category: 'daily',
    room: '주방',
    partnerId: 'p1',
  },
  {
    id: 'rec3',
    title: '이불 빨래',
    points: 30,
    category: 'today',
    room: '침실',
    partnerId: 'p2',
  },
  {
    id: 'rec4',
    title: '화장실 청소',
    points: 50,
    category: 'today',
    room: '욕실',
    partnerId: 'p2',
  },
].map((item) => ({
  ...item,
  assignedPartnerId: item.partnerId,
}));

const favoriteChoreOptions = chorePreferenceOptions;

const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const today = new Date();

const formatSimpleDate = (isoDate) => {
  if (!isoDate || typeof isoDate !== 'string') {
    return '-';
  }
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${month.padStart(2, '0')}. ${day.padStart(2, '0')}.`;
};

const parseIsoDate = (iso) => {
  if (!iso) {
    return null;
  }
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const diffFromToday = (iso) => {
  const target = parseIsoDate(iso);
  if (!target) {
    return null;
  }
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(
    (target.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const shouldDisableToggle = (iso) => {
  const diff = diffFromToday(iso);
  if (diff === null) {
    return true;
  }
  if (diff > 0) {
    return true;
  }
  if (diff < -7) {
    return true;
  }
  return false;
};

const conditionKeywordScores = [
  { keywords: ['최고', '매우 좋', '최상'], score: 9 },
  { keywords: ['좋', '양호', '쾌적'], score: 7 },
  { keywords: ['보통', '무난', '괜찮'], score: 5 },
  { keywords: ['피곤', '지침', '힘들', '낮'], score: 3 },
  { keywords: ['휴식', '아픔', '못 함', '못함', '나쁨'], score: 2 },
];

const parseConditionTextScore = (text = '') => {
  const normalized = text.toLowerCase();
  for (const entry of conditionKeywordScores) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return entry.score;
    }
  }
  return 5;
};

const getIntensityFromPoints = (points = 0) => {
  if (points >= 60) return 'high';
  if (points >= 40) return 'medium';
  return 'low';
};

const conditionThresholdByIntensity = {
  high: 7,
  medium: 5,
  low: 3,
};

const roomIconMap = {
  all: iconHome,
  living: iconSofa,
  kitchen: iconFridge,
  bed: iconBed,
  bath: iconBath,
  laundry: iconLaundry,
  '집 전체': iconHome,
  '거실': iconSofa,
  '주방': iconFridge,
  '침실': iconBed,
  '욕실': iconBath,
  '세탁': iconLaundry,
};

const slugifyRoom = (label = '') => {
  const normalized = String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-');
  return normalized.replace(/^-+|-+$/g, '') || 'room';
};

const tipPlaceholders = new Set([
  '자율 추가',
  '추천 할일',
  '식단 밸런스 팁',
  '정리 루틴 팁',
  '침구 관리 팁',
  '살균 관리 팁',
]);

const normalizeTip = (text) => {
  if (!text) {
    return '';
  }
  const trimmed = text.trim();
  if (!trimmed || tipPlaceholders.has(trimmed)) {
    return '';
  }
  return trimmed;
};

const getSeasonFromDate = (date) => {
  if (!date) {
    return '';
  }
  const month = Number(date.split('-')[1]);
  if (Number.isNaN(month)) {
    return '';
  }
  if ([12, 1, 2].includes(month)) {
    return '겨울';
  }
  if ([3, 4, 5].includes(month)) {
    return '봄';
  }
  if ([6, 7, 8].includes(month)) {
    return '여름';
  }
  return '가을';
};
const initialAnchorDate = new Date(today.getFullYear(), today.getMonth(), 1);
const todayIso = today.toISOString().split('T')[0];

const formatISO = (date) => {
  if (!(date instanceof Date)) {
    return '';
  }
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().split('T')[0];
};

const buildTaskForm = (date, participantId = '') => ({
  title: '',
  roomId: 'all',
  participantId,
  repeat: '없음',
  date,
  endDate: date,
  memo: '',
  category: '',
  durationId: durationOptions[1].id,
  effortId: effortOptions[1].id,
});

const buildRequestForm = (taskKey = '', requesterId = '') => ({
  requesterId,
  taskKey,
  delta: 10,
  direction: 'increase',
});

const sortTasksByOrder = (tasks) =>
  [...tasks].sort((a, b) => {
    if (a.order === b.order) {
      return a.title.localeCompare(b.title);
    }
    return a.order - b.order;
  });

const groupTasksByDate = (tasks = []) => {
  const grouped = {};
  tasks.forEach((task) => {
    if (!task.date) {
      return;
    }
    if (!grouped[task.date]) {
      grouped[task.date] = [];
    }
    grouped[task.date].push(task);
  });
  Object.keys(grouped).forEach((date) => {
    grouped[date] = sortTasksByOrder(grouped[date]);
  });
  return grouped;
};

const applyTaskToMap = (prevMap, task, previousDate) => {
  const nextMap = { ...prevMap };
  if (previousDate && previousDate !== task.date && nextMap[previousDate]) {
    nextMap[previousDate] = nextMap[previousDate].filter(
      (item) => item.id !== task.id
    );
    if (!nextMap[previousDate].length) {
      delete nextMap[previousDate];
    }
  }
  const currentList = (nextMap[task.date] || []).filter(
    (item) => item.id !== task.id
  );
  currentList.push(task);
  nextMap[task.date] = sortTasksByOrder(currentList);
  return nextMap;
};

const removeTaskFromMap = (prevMap, date, taskId) => {
  const nextMap = { ...prevMap };
  const currentList =
    nextMap[date]?.filter((item) => item.id !== taskId) || [];
  if (!currentList.length) {
    delete nextMap[date];
  } else {
    nextMap[date] = currentList;
  }
  return nextMap;
};

const scoreToLabel = (score) => {
  if (score >= 9) return '최고예요';
  if (score >= 7) return '좋아요';
  if (score >= 5) return '괜찮아요';
  if (score >= 3) return '조금 피곤해요';
  return '휴식이 필요해요';
};

const buildConditionForm = (date, existing) => ({
  id: existing?.id,
  date,
  morningScore: existing?.morningScore ?? 5,
  preChoreScore: existing?.preChoreScore ?? 5,
  morningLabel: existing?.morningLabel ?? scoreToLabel(existing?.morningScore ?? 5),
  preChoreLabel: existing?.preChoreLabel ?? scoreToLabel(existing?.preChoreScore ?? 5),
  note: existing?.note ?? '',
  preChoreDisabled: existing?.preChoreDisabled ?? false,
});

const mapConditionsByDate = (list = []) =>
  list.reduce((acc, entry) => {
    acc[entry.date] = entry;
    return acc;
  }, {});

function CalendarPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const currentUserId = currentUser?.userId || '';
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [viewMode, setViewMode] = useState('month');
  const [activeNav, setActiveNav] = useState('calendar');
  const [showRequests, setShowRequests] = useState(false);
  const [scheduleMap, setScheduleMap] = useState({});
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState('');
  const [taskActionError, setTaskActionError] = useState('');
  const [conditionsMap, setConditionsMap] = useState({});
  const [conditionsLoading, setConditionsLoading] = useState(true);
  const [conditionListError, setConditionListError] = useState('');
  const [activeRecommendation, setActiveRecommendation] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(() => buildTaskForm(todayIso));
  const [taskModalStatus, setTaskModalStatus] = useState({
    loading: false,
    error: '',
  });
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [conditionForm, setConditionForm] = useState(() =>
    buildConditionForm(todayIso)
  );
  const [conditionStatus, setConditionStatus] = useState({
    loading: false,
    error: '',
  });
  const [categoryRooms, setCategoryRooms] = useState(defaultRoomOptions);
  const [categoryLibrary, setCategoryLibrary] = useState(defaultRoomTaskLibrary);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [actionPickerOpen, setActionPickerOpen] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [anchorDate, setAnchorDate] = useState(initialAnchorDate);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState(buildRequestForm('', ''));
  const [activePartner, setActivePartner] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const latestConditionEntry = useMemo(() => {
    if (!conditionsMap) {
      return null;
    }
    const entries = Object.values(conditionsMap);
    if (!entries.length) {
      return null;
    }
    return entries
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  }, [conditionsMap]);
  const currentUserConditionScore = useMemo(() => {
    if (!latestConditionEntry) {
      return 6;
    }
    const morning =
      typeof latestConditionEntry.morningScore === 'number'
        ? latestConditionEntry.morningScore
        : 5;
    const preChore =
      latestConditionEntry.preChoreDisabled ||
      typeof latestConditionEntry.preChoreScore !== 'number'
        ? morning
        : latestConditionEntry.preChoreScore;
    return Math.round((morning + preChore) / 2);
  }, [latestConditionEntry]);
  const updatePartnerProfile = (partnerId, updates) => {
    const normalizedUpdates =
      updates && updates.color && !updates.accent
        ? { ...updates, accent: updates.color }
        : updates;
    setPartners((prev) =>
      prev.map((partner) =>
        partner.id === partnerId ? { ...partner, ...normalizedUpdates } : partner
      )
    );
    setCurrentUser((prev) => {
      if (prev && prev.userId === partnerId) {
        const nextUser = { ...prev, ...normalizedUpdates };
        localStorage.setItem('choreus_user', JSON.stringify(nextUser));
        return nextUser;
      }
      return prev;
    });
    setActivePartner((prev) =>
      prev && prev.id === partnerId ? { ...prev, ...normalizedUpdates } : prev
    );
  };
  const handleColorUpdate = async (partnerId, color) => {
    if (!partnerId || !color) {
      throw new Error('컬러를 선택해주세요.');
    }
    if (partnerId !== currentUserId) {
      throw new Error('본인 프로필에서만 변경할 수 있어요.');
    }
    try {
      const updatedUser = await userApi.updateMe({ color });
      updatePartnerProfile(partnerId, { color: updatedUser.color });
    } catch (error) {
      console.error('색상을 변경하지 못했습니다.', error);
      throw error;
    }
  };
const toPartnerCard = (member, index, share = 0) => {
  const template = partnerTemplates[index % partnerTemplates.length] || {};
  const baseColor = member.color || template.color || '#6fb377';
  const accent = template.accent || baseColor;
  return {
    id: member.userId,
      name: member.nickname || member.email,
      email: member.email,
      color: baseColor,
      accent,
      inviteCode: member.inviteCode || template.inviteCode || '',
      role: member.role || template.role || '가족 구성원',
    share,
      condition: template.condition || '컨디션 정보가 아직 없어요.',
      favorites: member.preferredChores || [],
    };
  };
  const loadTasks = useCallback(
    async (showSpinner = true) => {
      if (!getAuthToken() || !currentUserId) {
        setScheduleMap({});
        setTasksLoading(false);
        return;
      }
      if (showSpinner) {
        setTasksLoading(true);
      }
      setTasksError('');
      try {
        const { tasks } = await taskApi.list();
        setScheduleMap(groupTasksByDate(tasks));
      } catch (error) {
        console.error('가사 일정을 불러오지 못했습니다.', error);
        setTasksError(error.message || '할 일 정보를 불러오지 못했습니다.');
        setScheduleMap({});
      } finally {
        if (showSpinner) {
          setTasksLoading(false);
        }
      }
    },
    [currentUserId]
  );
  const loadConditions = useCallback(async () => {
    if (!getAuthToken() || !currentUserId) {
      setConditionsMap({});
      setConditionsLoading(false);
      return;
    }
    setConditionsLoading(true);
    setConditionListError('');
    try {
      const { conditions } = await conditionApi.listMine();
      setConditionsMap(mapConditionsByDate(conditions));
    } catch (error) {
      console.error('컨디션 정보를 불러오지 못했습니다.', error);
      setConditionListError(error.message || '컨디션 정보를 불러오지 못했습니다.');
      setConditionsMap({});
    } finally {
      setConditionsLoading(false);
    }
  }, [currentUserId]);
  useEffect(() => {
    const stored = localStorage.getItem('choreus_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.userId) {
          setCurrentUser(parsed);
        }
      } catch (error) {
        console.error('저장된 사용자 정보를 불러오는 데 실패했습니다.', error);
      }
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    const fetchHouseholdData = async () => {
      if (!getAuthToken()) {
        setPartners([]);
        setPartnersLoading(false);
        return;
      }
      try {
        const me = await userApi.fetchMe();
        if (cancelled) {
          return;
        }
        setCurrentUser(me);
        localStorage.setItem('choreus_user', JSON.stringify(me));
        const { members } = await userApi.fetchHousehold();
        if (cancelled) {
          return;
        }
        const sourceMembers = members && members.length ? members : [me];
        const normalized = sourceMembers.map((member, index) =>
          toPartnerCard(member, index)
        );
        setPartners(normalized);
      } catch (error) {
        if (!cancelled) {
          console.error('가족 정보를 불러오지 못했습니다.', error);
        }
      } finally {
        if (!cancelled) {
          setPartnersLoading(false);
        }
      }
    };
    fetchHouseholdData();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    loadTasks(true);
  }, [loadTasks]);
  useEffect(() => {
    loadConditions();
  }, [loadConditions]);
  useEffect(() => {
    let cancelled = false;
    const loadTemplates = async () => {
      try {
        const { templates } = await templateApi.list();
        if (
          cancelled ||
          !templates ||
          !Array.isArray(templates) ||
          !templates.length
        ) {
          return;
        }
        const grouped = templates.reduce((acc, template) => {
          const label = template.room?.trim() || '기타';
          const id = slugifyRoom(label);
          if (!acc[id]) {
            acc[id] = { label, tasks: [] };
          }
          if (template.title) {
            acc[id].tasks.push(template.title);
          }
          return acc;
        }, {});
        if (!Object.keys(grouped).length) {
          return;
        }
        const allTasksSet = new Set();
        Object.values(grouped).forEach((group) => {
          group.tasks = Array.from(new Set(group.tasks)).sort((a, b) =>
            a.localeCompare(b, 'ko')
          );
          group.tasks.forEach((task) => allTasksSet.add(task));
        });
        const dynamicRooms = Object.entries(grouped)
          .filter(([id]) => id !== 'all')
          .map(([id, info]) => ({
            id,
            label: info.label,
            icon: roomIconMap[info.label] || roomIconMap[id] || iconHome,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, 'ko'));
        const mergedRooms = [defaultRoomOptions[0], ...dynamicRooms];
        const allTasksList = Array.from(allTasksSet).sort((a, b) =>
          a.localeCompare(b, 'ko')
        );
        const mergedLibrary = {
          ...defaultRoomTaskLibrary,
          ...Object.fromEntries(
            Object.entries(grouped).map(([id, info]) => [id, info.tasks])
          ),
          all: allTasksSet.size ? allTasksList : defaultRoomTaskLibrary.all,
        };
        if (!cancelled) {
          setCategoryRooms(mergedRooms);
          setCategoryLibrary(mergedLibrary);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('작업 템플릿을 불러오지 못했습니다.', error);
        }
      }
    };
    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const fallbackId = partners[0]?.id || currentUserId;
    if (!fallbackId) {
      return;
    }
    setTaskForm((prev) =>
      prev.participantId ? prev : buildTaskForm(selectedDate, fallbackId)
    );
    setRequestForm((prev) =>
      prev.requesterId ? prev : buildRequestForm(prev.taskKey, fallbackId)
    );
  }, [partners, currentUserId, selectedDate]);
  useEffect(() => {
    if (!currentUserId) {
      return;
    }
    setRequestForm((prev) =>
      prev.requesterId === currentUserId ? prev : { ...prev, requesterId: currentUserId }
    );
  }, [currentUserId]);
  useEffect(() => {
    let cancelled = false;
    const loadRequests = async () => {
      if (!getAuthToken() || !currentUserId) {
        setRequests([]);
        setRequestsLoading(false);
        return;
      }
      setRequestsLoading(true);
      setRequestsError('');
      try {
        const { requests: serverRequests } = await requestApi.list();
        if (cancelled) {
          return;
        }
        const mapped = (serverRequests || [])
          .map(adaptServerRequest)
          .filter((request) => request.status === 'pending');
        setRequests(mapped);
      } catch (error) {
        if (!cancelled) {
          console.error('요청 목록을 불러오지 못했습니다.', error);
          setRequestsError(error.message || '요청 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setRequestsLoading(false);
        }
      }
    };
    loadRequests();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);
  const persistFavoritesToServer = async (favorites) => {
    if (!getAuthToken()) {
      return null;
    }
    try {
      const updatedUser = await userApi.updateMe({ preferredChores: favorites });
      setCurrentUser((prev) =>
        prev ? { ...prev, preferredChores: updatedUser.preferredChores } : prev
      );
      localStorage.setItem('choreus_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('선호 집안일 저장 실패:', error);
      throw error;
    }
  };
  const reassignOrder = (list) =>
    list.map((task, index) => ({
      ...task,
      order: index + 1,
    }));
  const openTaskDetail = (date, taskId) => {
    const target = (scheduleMap[date] || []).find((task) => task.id === taskId);
    if (!target) {
      return;
    }
    setDetailTask({ ...target, date });
  };

  const handleLogout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem('choreus_user');
    setCurrentUser(null);
    setPartners([]);
    setScheduleMap({});
    setRequests([]);
    setActivePartner(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const rescheduleTask = async (taskInfo, days) => {
    const amount = Number(days);
    if (!taskInfo || Number.isNaN(amount) || amount <= 0) {
      return;
    }
    const sourceDate = taskInfo.date;
    const nextDate = new Date(sourceDate);
    nextDate.setDate(nextDate.getDate() + amount);
    const targetDate = formatISO(nextDate);
    setTaskActionError('');
    try {
      const updated = await taskApi.update(taskInfo.id, { date: targetDate });
      setScheduleMap((prev) => applyTaskToMap(prev, updated, sourceDate));
      setDetailTask((prev) =>
        prev && prev.id === taskInfo.id ? { ...prev, ...updated } : prev
      );
    } catch (error) {
      console.error('할 일 이동 실패:', error);
      setTaskActionError(
        error.message || '할 일을 다른 날로 옮기지 못했습니다.'
      );
    }
  };

  const deleteTask = async (taskInfo) => {
    if (!taskInfo) {
      return;
    }
    setTaskActionError('');
    try {
      await taskApi.remove(taskInfo.id);
      setScheduleMap((prev) =>
        removeTaskFromMap(prev, taskInfo.date, taskInfo.id)
      );
      setDetailTask(null);
    } catch (error) {
      console.error('할 일 삭제 실패:', error);
      setTaskActionError(error.message || '할 일을 삭제하지 못했습니다.');
    }
  };

  const toggleTaskCompletion = async (date, taskId) => {
    if (shouldDisableToggle(date)) {
      return;
    }
    setTaskActionError('');
    try {
      const updated = await taskApi.toggle(taskId);
      setScheduleMap((prev) => applyTaskToMap(prev, updated, date));
      setDetailTask((prev) =>
        prev && prev.id === taskId ? { ...prev, isDone: updated.isDone } : prev
      );
    } catch (error) {
      console.error('할 일 상태 변경 실패:', error);
      setTaskActionError(error.message || '할 일 상태를 변경하지 못했습니다.');
    }
  };

  const generateTipForTask = useCallback(
    async (taskInfo) => {
      if (!taskInfo?.title) {
        throw new Error('할 일 정보를 찾지 못했습니다.');
      }
      const context = [
        taskInfo.room && `공간: ${taskInfo.room}`,
        taskInfo.repeat && `반복: ${taskInfo.repeat}`,
        taskInfo.note && `메모: ${taskInfo.note}`,
        taskInfo.date && `일자: ${taskInfo.date}`,
        taskInfo.date && `계절: ${getSeasonFromDate(taskInfo.date)}`,
      ]
        .filter(Boolean)
        .join('\n');
      const { tip } = await tipApi.generate({
        title: taskInfo.title,
        context,
      });
      const normalized = normalizeTip(tip);
      if (!normalized) {
        throw new Error('생성된 팁이 비어 있어요.');
      }
      try {
        const updated = await taskApi.update(taskInfo.id, { tip: normalized });
        setScheduleMap((prev) => applyTaskToMap(prev, updated, taskInfo.date));
        setDetailTask((prev) =>
          prev && prev.id === taskInfo.id ? { ...prev, tip: normalized } : prev
        );
      } catch (error) {
        console.error('팁 저장 실패:', error);
        throw new Error(error.message || '팁을 저장하지 못했습니다.');
      }
      return normalized;
    },
    [setDetailTask]
  );

  const partnerMap = useMemo(() => {
    const map = {};
    partners.forEach((partner) => {
      map[partner.id] = partner;
    });
    return map;
  }, [partners]);
  const getPartnerConditionScore = useCallback(
    (partner) => {
      if (!partner) {
        return 5;
      }
      if (partner.id === currentUserId) {
        return currentUserConditionScore;
      }
      if (typeof partner.conditionScore === 'number') {
        return partner.conditionScore;
      }
      return parseConditionTextScore(partner.condition || '');
    },
    [currentUserConditionScore, currentUserId]
  );

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
  }, [anchorDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    Object.entries(scheduleMap).forEach(([date, tasks]) => {
      if (!map.has(date)) {
        map.set(date, []);
      }
      tasks.forEach((task) => {
        map.get(date).push({
          date,
          label: task.title,
          partnerId: task.partnerId,
          taskId: task.id,
        });
      });
    });
    return map;
  }, [scheduleMap]);
  const allTasks = useMemo(() => {
    const entries = [];
    Object.entries(scheduleMap).forEach(([date, tasks]) => {
      tasks.forEach((task) => {
        entries.push({ ...task, date });
      });
    });
    return entries.sort((a, b) => {
      if (a.date === b.date) {
        return b.order - a.order;
      }
      return a.date < b.date ? 1 : -1;
    });
  }, [scheduleMap]);
  const partnerHistories = useMemo(() => {
    const historyMap = {};
    partners.forEach((partner) => {
      historyMap[partner.id] = [];
    });
    allTasks.forEach((task) => {
      if (!task.isDone) {
        return;
      }
      if (!historyMap[task.partnerId]) {
        historyMap[task.partnerId] = [];
      }
      historyMap[task.partnerId].push(task);
    });
    return historyMap;
  }, [allTasks, partners]);

  const rollingPointsMap = useMemo(() => {
    const startWindow = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - 2, 1);
    const endWindow = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
    const totals = {};
    Object.entries(scheduleMap).forEach(([date, tasks]) => {
      const currentDate = new Date(date);
      if (currentDate < startWindow || currentDate > endWindow) {
        return;
      }
      tasks.forEach((task) => {
        if (!task.isDone) {
          return;
        }
        totals[task.partnerId] =
          (totals[task.partnerId] || 0) + (task.points || 0);
      });
    });
    return totals;
  }, [scheduleMap, anchorDate]);
  const personalizedRecommendations = useMemo(() => {
    if (!partners.length) {
      return recommendationList;
    }
    return recommendationList.map((rec) => {
      const intensity = getIntensityFromPoints(rec.points || 0);
      const minCondition = conditionThresholdByIntensity[intensity] ?? 3;
      const scores = partners.map((partner) => {
        const conditionScore = getPartnerConditionScore(partner);
        const load = rollingPointsMap[partner.id] || 0;
        const eligible = conditionScore >= minCondition;
        return { partner, load, conditionScore, eligible };
      });
      const pickPool = scores
        .filter((entry) => entry.eligible)
        .sort((a, b) => {
          if (a.load === b.load) {
            return b.conditionScore - a.conditionScore;
          }
          return a.load - b.load;
        });
      const fallbackPool = scores
        .slice()
        .sort((a, b) => {
          if (a.load === b.load) {
            return b.conditionScore - a.conditionScore;
          }
          return a.load - b.load;
        });
      const chosen = pickPool[0] || fallbackPool[0];
      const assignedPartnerId =
        chosen?.partner?.id ||
        rec.assignedPartnerId ||
        rec.partnerId ||
        partners[0]?.id ||
        '';
      if (rec.assignedPartnerId === assignedPartnerId) {
        return rec;
      }
      return { ...rec, assignedPartnerId };
    });
  }, [partners, getPartnerConditionScore, rollingPointsMap]);

const partnerContributionMap = useMemo(() => {
  const totalPoints = Object.values(rollingPointsMap).reduce(
    (sum, points) => sum + points,
    0
  );
  if (totalPoints === 0) {
    return partners.reduce((acc, partner) => {
      acc[partner.id] = 0;
      return acc;
    }, {});
  }
  return partners.reduce((acc, partner) => {
    const points = rollingPointsMap[partner.id] || 0;
    acc[partner.id] = Math.round((points / totalPoints) * 100);
    return acc;
  }, {});
}, [rollingPointsMap, partners]);

  useEffect(() => {
    setPartners((prev) => {
      if (!prev.length) {
        return prev;
      }
      let changed = false;
      const next = prev.map((partner) => {
        const share = partnerContributionMap[partner.id] ?? 0;
        if (partner.share === share) {
          return partner;
        }
        changed = true;
        return { ...partner, share };
      });
      return changed ? next : prev;
    });
  }, [partnerContributionMap]);

  const monthTitle = anchorDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const dayMonthTitle = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const dayLabel = `${new Date(selectedDate).getDate()}일`;

  const handleSelectDate = (iso) => {
    setSelectedDate(iso);
    const dateObj = new Date(iso);
    setAnchorDate(
      new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
    );
  };

  const handleToday = () => {
    handleSelectDate(todayIso);
  };

  const handleDayShift = (direction) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + direction);
      const iso = formatISO(next);
      setAnchorDate(new Date(next.getFullYear(), next.getMonth(), 1));
      return iso;
    });
  };

  const handleMonthShift = (direction) => {
    setAnchorDate((prev) => {
      const next = new Date(prev);
      const shifted = new Date(
        next.getFullYear(),
        next.getMonth() + direction,
        1
      );
      setSelectedDate(formatISO(shifted));
      return shifted;
    });
  };

  const openTaskModal = () => {
    setActionPickerOpen(false);
    const defaultParticipant = partners[0]?.id || currentUserId || '';
    setTaskForm(buildTaskForm(selectedDate, defaultParticipant));
    setTaskModalStatus({ loading: false, error: '' });
    setTaskActionError('');
    setTaskModalOpen(true);
    setShowCategoryPicker(false);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setShowCategoryPicker(false);
    setTaskModalStatus({ loading: false, error: '' });
  };

  const openConditionModal = (targetDate = selectedDate) => {
    const normalizedDate = targetDate || todayIso;
    const existing = conditionsMap[normalizedDate];
    setConditionForm(buildConditionForm(normalizedDate, existing));
    setConditionStatus({ loading: false, error: '' });
    setConditionModalOpen(true);
  };

  const closeConditionModal = () => {
    setConditionModalOpen(false);
    setConditionStatus({ loading: false, error: '' });
  };

  const openActionPicker = () => {
    if (!getAuthToken()) {
      setTaskActionError('로그인 후 이용해주세요.');
      return;
    }
    setActionPickerOpen(true);
  };

  const handleActionSelection = (action) => {
    setActionPickerOpen(false);
    if (action === 'task') {
      openTaskModal();
    } else if (action === 'condition') {
      openConditionModal(selectedDate);
    }
  };
  const handleRecommendationSelect = (recommendation) => {
    setActiveRecommendation(recommendation);
  };

  const handleTaskInput = (event) => {
    const { name, value } = event.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (roomId, taskTitle) => {
    setTaskForm((prev) => ({
      ...prev,
      roomId,
      title: taskTitle,
      category: taskTitle,
    }));
    setShowCategoryPicker(false);
  };

  const handleConditionScoreChange = (field, value) => {
    const numeric = Number(value);
    setConditionForm((prev) => ({
      ...prev,
      [field]: numeric,
      [field === 'morningScore' ? 'morningLabel' : 'preChoreLabel']:
        scoreToLabel(numeric),
    }));
  };

  const handleConditionDateChange = (value) => {
    setConditionForm((prev) => ({ ...prev, date: value }));
  };

  const handleConditionNoteChange = (event) => {
    const { value } = event.target;
    setConditionForm((prev) => ({ ...prev, note: value }));
  };

  const togglePreChoreDisabled = () => {
    setConditionForm((prev) => ({
      ...prev,
      preChoreDisabled: !prev.preChoreDisabled,
      preChoreLabel: !prev.preChoreDisabled ? '괜찮아요' : scoreToLabel(prev.preChoreScore ?? 5),
    }));
  };

  const estimatePoints = (durationId, effortId) => {
    const durationScore =
      durationOptions.find((option) => option.id === durationId)?.weight || 0;
    const effortScore =
      effortOptions.find((option) => option.id === effortId)?.weight || 0;
    return 20 + durationScore + effortScore;
  };

  const submitTaskForm = async (event) => {
    event.preventDefault();
    if (!taskForm.title.trim() || !taskForm.participantId) {
      setTaskModalStatus((prev) => ({
        ...prev,
        error: '제목과 참여자를 입력해주세요.',
      }));
      return;
    }
    setTaskModalStatus({ loading: true, error: '' });
    const selectedRoom =
      categoryRooms.find((room) => room.id === taskForm.roomId)?.label || '';
    const payload = {
      title: taskForm.title.trim(),
      date: taskForm.date,
      partnerId: taskForm.participantId,
      room: selectedRoom,
      tip: '',
      repeat: taskForm.repeat,
      endDate: taskForm.endDate,
      category: taskForm.category,
      memo: taskForm.memo,
      durationId: taskForm.durationId,
      effortId: taskForm.effortId,
      points: estimatePoints(taskForm.durationId, taskForm.effortId),
    };
    try {
      const created = await taskApi.create(payload);
      setScheduleMap((prev) => applyTaskToMap(prev, created));
      setTaskModalStatus({ loading: false, error: '' });
      setTaskModalOpen(false);
      setShowCategoryPicker(false);
    } catch (error) {
      console.error('할 일을 추가하지 못했습니다.', error);
      setTaskModalStatus({
        loading: false,
        error: error.message || '할 일을 추가하지 못했습니다.',
      });
    }
  };

  const submitConditionForm = async (event) => {
    event.preventDefault();
    setConditionStatus({ loading: true, error: '' });
    try {
      const payload = {
        date: conditionForm.date,
        morningScore: conditionForm.morningScore,
        preChoreScore: conditionForm.preChoreDisabled
          ? null
          : conditionForm.preChoreScore,
        morningLabel: conditionForm.morningLabel,
        preChoreLabel: conditionForm.preChoreLabel,
        preChoreDisabled: conditionForm.preChoreDisabled,
        note: conditionForm.note,
      };
      const saved = await conditionApi.upsert(payload);
      setConditionsMap((prev) => ({
        ...prev,
        [saved.date]: saved,
      }));
      setConditionStatus({ loading: false, error: '' });
      setConditionModalOpen(false);
    } catch (error) {
      console.error('컨디션 저장 실패:', error);
      setConditionStatus({
        loading: false,
        error: error.message || '컨디션을 저장하지 못했습니다.',
      });
    }
  };

  const handleConditionDelete = async () => {
    if (!conditionForm.id) {
      closeConditionModal();
      return;
    }
    if (!window.confirm('이 컨디션 기록을 삭제할까요?')) {
      return;
    }
    setConditionStatus({ loading: true, error: '' });
    try {
      await conditionApi.remove(conditionForm.id);
      setConditionsMap((prev) => {
        const next = { ...prev };
        delete next[conditionForm.date];
        return next;
      });
      setConditionStatus({ loading: false, error: '' });
      setConditionModalOpen(false);
    } catch (error) {
      console.error('컨디션 삭제 실패:', error);
      setConditionStatus({
        loading: false,
        error: error.message || '컨디션을 삭제하지 못했습니다.',
      });
    }
  };

  const openRequestModal = () => {
    if (allTasks.length === 0) {
      return;
    }
    const defaultTaskKey = `${allTasks[0].date}|${allTasks[0].id}`;
    setRequestForm(buildRequestForm(defaultTaskKey, currentUserId));
    setRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
  };

  const handleRequestInput = (event) => {
    const { name, value } = event.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitRequestForm = async (event) => {
    event.preventDefault();
    if (!requestForm.taskKey || !currentUserId) {
      return;
    }
    const [taskDate, taskId] = requestForm.taskKey.split('|');
    const targetTask = allTasks.find(
      (task) => task.id === taskId && task.date === taskDate
    );
    if (!targetTask) {
      return;
    }
    const magnitude = Math.abs(Number(requestForm.delta));
    if (!magnitude) {
      return;
    }
    setRequestSubmitting(true);
    setRequestsError('');
    try {
      const payload = {
        taskId: targetTask.id,
        taskTitle: targetTask.title,
        taskDate,
        delta: magnitude,
        direction: requestForm.direction,
      };
      const created = await requestApi.create(payload);
      setRequests((prev) => [adaptServerRequest(created), ...prev]);
      setRequestModalOpen(false);
      setRequestForm(buildRequestForm('', currentUserId));
    } catch (error) {
      console.error('요청 생성 실패:', error);
      setRequestsError(error.message || '요청 생성에 실패했습니다.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleRequestDecision = async (requestId, partnerId, decision) => {
    try {
      const updated = await requestApi.decide(requestId, {
        partnerId,
        decision,
      });
      const adapted = adaptServerRequest(updated);
      setRequests((prev) => prev.filter((request) => request.id !== adapted.id));
      if (adapted.status === 'approved') {
        if (updated.updatedTask) {
          setScheduleMap((prev) => {
            const { date, points, id: taskId } = updated.updatedTask;
            if (!date) {
              return prev;
            }
            const list = prev[date] || [];
            const next = list.map((task) =>
              task.id === taskId ? { ...task, points } : task
            );
            return {
              ...prev,
              [date]: next,
            };
          });
        } else {
          loadTasks(false);
        }
      }
    } catch (error) {
      console.error('요청 처리 실패:', error);
      setRequestsError(error.message || '요청 처리 중 문제가 발생했습니다.');
    }
  };

  const handleNavClick = (item) => {
    if (item.id === 'requests') {
      setShowRequests((prev) => !prev);
      return;
    }
    setActiveNav(item.id);
    setShowRequests(false);
  };

  const tasksForSelectedDate = scheduleMap[selectedDate] || [];

  const renderMainView = () => {
    if (tasksLoading) {
      return (
        <PlaceholderPanel
          title="불러오는 중"
          description="가사 일정을 불러오는 중입니다."
        />
      );
    }
    if (tasksError) {
      return (
        <PlaceholderPanel title="오류" description={tasksError} />
      );
    }
    if (activeNav === 'calendar') {
      return viewMode === 'month' ? (
        <MonthView
          monthTitle={monthTitle}
          onToday={handleToday}
          calendarCells={calendarCells}
          eventsByDate={eventsByDate}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onOpenActionPicker={openActionPicker}
          partnerMap={partnerMap}
          onOpenEvent={openTaskDetail}
          onMonthShift={handleMonthShift}
        />
      ) : (
        <DayView
          monthTitle={dayMonthTitle}
          dayLabel={dayLabel}
          onDayShift={handleDayShift}
          tasks={tasksForSelectedDate}
          recommendations={personalizedRecommendations}
          partners={partners}
          onSelectRecommendation={handleRecommendationSelect}
          onOpenActionPicker={openActionPicker}
          partnerMap={partnerMap}
          onOpenDetail={(taskId) => openTaskDetail(selectedDate, taskId)}
          onToggleComplete={(taskId, taskDate) =>
            toggleTaskCompletion(taskDate || selectedDate, taskId)
          }
        />
      );
    }
    if (activeNav === 'tasks') {
      return (
        <AllTasksView
          tasks={allTasks}
          partnerMap={partnerMap}
          onOpenDetail={openTaskDetail}
          onToggleComplete={(taskId, taskDate) =>
            toggleTaskCompletion(taskDate, taskId)
          }
        />
      );
    }
    return (
      <PlaceholderPanel
        title="콘텐츠 준비중"
        description="선택한 메뉴에 대한 화면은 곧 업데이트돼요."
      />
    );
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <img src={logoMark} alt="chore:us 로고" className="brand-mark" />
          <button type="button" className="home-selector">
            우리집 <span>⌄</span>
          </button>
        </div>

        <div className="nav-buttons">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              label={item.label}
              badge={
                item.id === 'tasks'
                  ? allTasks.length.toString()
                  : item.id === 'requests'
                  ? requests.length.toString()
                  : item.badge
              }
              isActive={
                item.id === 'requests' ? showRequests : activeNav === item.id
              }
              onClick={() => handleNavClick(item)}
            />
          ))}
        </div>

        <section className="partner-section">
          <header className="partner-section-header">
            <h2>가사 파트너</h2>
            <button
              type="button"
              className="plain-icon"
              onClick={() => setInviteModalOpen(true)}
              aria-label="초대 코드 보기"
            >
              ＋
            </button>
          </header>
          {partnersLoading ? (
            <p className="empty-hint">가사 파트너 정보를 불러오는 중...</p>
          ) : partners.length === 0 ? (
            <p className="empty-hint">
              아직 등록된 파트너가 없어요. 초대코드를 공유해 함께 사용해보세요.
            </p>
          ) : (
            <div className="partner-grid">
              {partners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  points={rollingPointsMap[partner.id] || 0}
                  onClick={() => setActivePartner(partner)}
                />
              ))}
            </div>
          )}
        </section>
      </aside>

      <main className="content-area">
        {activeNav === 'calendar' && (
          <div className="view-switch-bar">
            {['day', 'month'].map((mode) => (
              <button
                key={mode}
                type="button"
                className={viewMode === mode ? 'is-active' : undefined}
                onClick={() => setViewMode(mode)}
              >
                {mode === 'day' ? '일' : '월'}
              </button>
            ))}
          </div>
        )}
        {taskActionError && (
          <p style={{ color: '#b42318', margin: '4px 0 0', fontSize: 13 }}>
            {taskActionError}
          </p>
        )}
        {renderMainView()}
        {showRequests && (
          <RequestPanel
            requests={requests}
            partners={partners}
            isLoading={requestsLoading}
            errorMessage={requestsError}
            onClose={() => setShowRequests(false)}
            onOpenModal={openRequestModal}
            disableCreate={
              allTasks.length === 0 || requestSubmitting || tasksLoading
            }
            onApprove={(requestId, partnerId) =>
              handleRequestDecision(requestId, partnerId, 'approve')
            }
            onReject={(requestId, partnerId) =>
              handleRequestDecision(requestId, partnerId, 'reject')
            }
          />
        )}
        {actionPickerOpen && (
          <ActionPickerModal
            onClose={() => setActionPickerOpen(false)}
            onSelect={handleActionSelection}
          />
        )}
        {taskModalOpen && (
          <TaskModal
            form={taskForm}
            onClose={closeTaskModal}
            onChange={handleTaskInput}
            onSubmit={submitTaskForm}
            onDelete={closeTaskModal}
            openCategory={() => setShowCategoryPicker(true)}
            roomOptions={categoryRooms}
            partners={partners}
            durationOptions={durationOptions}
            effortOptions={effortOptions}
            status={taskModalStatus}
          />
        )}
        {requestModalOpen && (
          <RequestModal
            form={requestForm}
            onClose={closeRequestModal}
            onChange={handleRequestInput}
            onSubmit={submitRequestForm}
            tasks={allTasks}
            partners={partners}
            isSubmitting={requestSubmitting}
          />
        )}
        {showCategoryPicker && (
          <CategoryPicker
            rooms={categoryRooms}
            library={categoryLibrary}
            onClose={() => setShowCategoryPicker(false)}
            onSelect={handleCategorySelect}
          />
        )}
        {activeRecommendation && (
          <RecommendationModal
            recommendation={activeRecommendation}
            partners={partners}
            onClose={() => setActiveRecommendation(null)}
            onConfirm={async ({ partnerId, rating }) => {
              if (!activeRecommendation) {
                return;
              }
              setTaskActionError('');
              try {
                const payload = {
                  title: activeRecommendation.title,
                  date: selectedDate,
                  partnerId,
                  room: activeRecommendation.room || '공용 공간',
                  tip: '',
                  repeat: '없음',
                  endDate: selectedDate,
                  category: activeRecommendation.category || 'recommendation',
                  memo: '',
                  durationId: durationOptions[1].id,
                  effortId: effortOptions[1].id,
                  points: activeRecommendation.points,
                };
                const created = await taskApi.create(payload);
                setScheduleMap((prev) => applyTaskToMap(prev, created));
                console.log('추천 평가', {
                  rating,
                  partnerId,
                  recommendation: activeRecommendation.title,
                  date: selectedDate,
                });
              } catch (error) {
                console.error('추천 작업 생성 실패:', error);
                setTaskActionError(
                  error.message || '추천 작업을 추가하지 못했습니다.'
                );
              } finally {
                setActiveRecommendation(null);
              }
            }}
          />
        )}
        {activePartner && (
          <PartnerProfileModal
            partner={activePartner}
            isSelf={activePartner.id === currentUserId}
            onClose={() => setActivePartner(null)}
            history={partnerHistories[activePartner.id] || []}
            rollingPoints={rollingPointsMap[activePartner.id] || 0}
            favoriteOptions={favoriteChoreOptions}
            onUpdatePartner={updatePartnerProfile}
            onPersistFavorites={persistFavoritesToServer}
            conditionEntries={conditionsMap}
            conditionLoading={conditionsLoading}
            conditionError={conditionListError}
            onEditCondition={openConditionModal}
            onLogout={handleLogout}
            onUpdateColor={handleColorUpdate}
          />
        )}
        {detailTask && (
          <TaskDetailModal
            task={detailTask}
            partner={partnerMap[detailTask.partnerId]}
            onClose={() => setDetailTask(null)}
            onDelete={() => deleteTask(detailTask)}
            onReschedule={(days) => rescheduleTask(detailTask, days)}
            onToggleComplete={() => toggleTaskCompletion(detailTask.date, detailTask.id)}
            onGenerateTip={generateTipForTask}
          />
        )}
        {conditionModalOpen && (
          <ConditionModal
            form={conditionForm}
            onClose={closeConditionModal}
            onSubmit={submitConditionForm}
            onScoreChange={handleConditionScoreChange}
            onDateChange={handleConditionDateChange}
            onNoteChange={handleConditionNoteChange}
            onDelete={handleConditionDelete}
            onTogglePreChoreDisabled={togglePreChoreDisabled}
            status={conditionStatus}
          />
        )}
        {inviteModalOpen && (
          <InviteCodeModal
            code={currentUser?.inviteCode}
            onClose={() => setInviteModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
}

function NavButton({ label, badge, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`nav-button${isActive ? ' is-active' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <span className="nav-trailing">
        {badge !== undefined && <span className="nav-badge">{badge}</span>}
        <span className="chevron">›</span>
      </span>
    </button>
  );
}

function PartnerCard({ partner, onClick, points }) {
  return (
    <button type="button" className="partner-card" onClick={onClick}>
      <div
        className="partner-avatar"
        style={{
          borderColor: partner.accent,
          background: `${partner.color}22`,
        }}
      >
        <div
          className="partner-avatar-inner"
          style={{ backgroundColor: partner.color }}
        />
      </div>
      <div>
        <p className="partner-name">{partner.name}</p>
        <span className="partner-status">{points}P</span>
      </div>
    </button>
  );
}

function MonthView({
  monthTitle,
  onToday,
  calendarCells,
  eventsByDate,
  selectedDate,
  onSelectDate,
  onOpenActionPicker,
  partnerMap,
  onOpenEvent,
  onMonthShift,
}) {
  return (
    <section className="calendar-stage">
      <div className="calendar-toolbar">
        <div className="toolbar-left">
          <button
            type="button"
            className="calendar-add"
            onClick={onOpenActionPicker}
          >
            +
          </button>
          <div className="month-meta">
            <p className="month-title">{monthTitle}</p>
            <span className="month-sub">AI가 추천하는 가사 일정</span>
          </div>
        </div>
        <div className="toolbar-controls">
          <div className="calendar-nav">
            <button
              type="button"
              className="nav-icon"
              aria-label="이전 달"
              onClick={() => onMonthShift(-1)}
            >
              ‹
            </button>
            <button type="button" className="today-button" onClick={onToday}>
              Today
            </button>
            <button
              type="button"
              className="nav-icon"
              aria-label="다음 달"
              onClick={() => onMonthShift(1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-wrapper">
        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {dayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="calendar-cells">
            {calendarCells.map((cell) => (
              <CalendarCell
                key={cell.iso}
                cell={cell}
                events={eventsByDate.get(cell.iso) || []}
                isSelected={cell.iso === selectedDate}
                onSelect={onSelectDate}
                partnerMap={partnerMap}
                onOpenEvent={onOpenEvent}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DayView({
  monthTitle,
  dayLabel,
  onDayShift,
  tasks,
  recommendations,
  partners,
  onSelectRecommendation,
  onOpenActionPicker,
  partnerMap,
  onOpenDetail,
  onToggleComplete,
}) {
  return (
    <section className="day-stage">
      <header className="day-header">
        <div>
          <p className="month-title">{monthTitle}</p>
        </div>
      </header>

      <div className="day-controls">
        <div className="day-nav">
          <button
            type="button"
            className="nav-icon"
            onClick={() => onDayShift(-1)}
          >
            ‹
          </button>
          <span className="day-label">{dayLabel}</span>
          <button
            type="button"
            className="nav-icon"
            onClick={() => onDayShift(1)}
          >
            ›
          </button>
        </div>
        <button
          type="button"
          className="calendar-add"
          aria-label="할일 추가"
          onClick={onOpenActionPicker}
        >
          +
        </button>
      </div>

      <div className="day-task-list">
        {tasks.map((task) => (
          <DayTaskCard
            key={task.id}
            task={task}
            partnerMap={partnerMap}
            onClick={() => onOpenDetail(task.id)}
            onToggleComplete={() => onToggleComplete(task.id, task.date)}
          />
        ))}
      </div>

      <RecommendationSection
        recommendations={recommendations}
        partners={partners}
        onSelectRecommendation={onSelectRecommendation}
        partnerMap={partnerMap}
      />
    </section>
  );
}

function CalendarCell({
  cell,
  events,
  isSelected,
  onSelect,
  partnerMap,
  onOpenEvent,
}) {
  const cellClassNames = [
    'calendar-cell',
    cell.isCurrentMonth ? 'is-current' : 'is-outside',
    isSelected ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={cellClassNames}
      onClick={() => onSelect(cell.iso)}
    >
      <div className="cell-date">
        <span>{cell.label}</span>
        {cell.isToday && <span className="today-pill">오늘</span>}
      </div>
      <div className="calendar-events">
        {events.slice(0, 3).map((event, index) => (
          <span
            key={`${event.label}-${index}`}
            className="event-pill"
            style={{
              backgroundColor: partnerMap[event.partnerId]?.color || '#7abdae',
            }}
            role="button"
            tabIndex={0}
            onClick={(evt) => {
              evt.stopPropagation();
              onOpenEvent(event.date, event.taskId);
            }}
            onKeyDown={(evt) => {
              if (evt.key === 'Enter' || evt.key === ' ') {
                evt.preventDefault();
                onOpenEvent(event.date, event.taskId);
              }
            }}
          >
            {event.label}
          </span>
        ))}
        {events.length > 3 && (
          <span className="event-more">+{events.length - 3} more</span>
        )}
      </div>
    </button>
  );
}

function RequestPanel({
  requests,
  partners,
  onClose,
  onOpenModal,
  onApprove,
  onReject,
  disableCreate,
  isLoading,
  errorMessage,
}) {
  return (
    <section className="request-panel">
      <header className="request-panel-header">
        <button type="button" aria-label="요청 닫기" onClick={onClose}>
          ‹
        </button>
        <strong>요청 목록</strong>
        <button
          type="button"
          aria-label="요청 추가"
          onClick={onOpenModal}
          disabled={disableCreate}
          title={disableCreate ? '조정 가능한 할일이 없어요' : undefined}
        >
          +
        </button>
      </header>
      <div className="request-list">
        {isLoading ? (
          <span className="request-empty">요청을 불러오는 중...</span>
        ) : errorMessage ? (
          <span className="request-empty">{errorMessage}</span>
        ) : requests.length === 0 ? (
          <span className="request-empty">진행 중인 요청이 없어요.</span>
        ) : (
          requests.map((request) => (
            <article key={request.id} className="request-card">
              <div className="request-card-header">
                <div>
                  <p className="requester">{request.requester}</p>
                  <p className="request-task">{request.taskTitle}</p>
                  <p className="request-meta">
                    {request.taskDate} · 포인트 {request.delta > 0 ? '올리기' : '내리기'}
                  </p>
                </div>
                <span
                  className={`request-delta ${
                    request.delta >= 0 ? 'is-plus' : 'is-minus'
                  }`}
                >
                  {request.delta >= 0 ? '+' : ''}
                  {request.delta}P
                </span>
              </div>
              <div className="approval-list">
                {partners.map((partner) => {
                  const status = request.approvals[partner.id];
                  const isRequester = partner.id === request.requesterId;
                  if (isRequester) {
                    return (
                      <div key={partner.id} className="approval-row">
                        <span className="approval-name">{partner.name}</span>
                        <span className="requester-badge">요청자</span>
                      </div>
                    );
                  }
                  return (
                    <div key={partner.id} className="approval-row">
                      <span className="approval-name">{partner.name}</span>
                      <div className="approval-buttons">
                        <button
                          type="button"
                          className={`approve${status === 'approved' ? ' is-solid' : ''}`}
                          disabled={status === 'approved'}
                          onClick={() => onApprove(request.id, partner.id)}
                        >
                          {status === 'approved' ? '승인 완료' : '승인'}
                        </button>
                        <button
                          type="button"
                          className="reject"
                          onClick={() => onReject(request.id, partner.id)}
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function DayTaskCard({ task, partnerMap, onClick, onToggleComplete }) {
  const partner = partnerMap[task.partnerId];
  const accent = partner?.accent || '#2d4f3a';
  const tint = `${partner?.color || '#dfe7d9'}33`;
  const tipText = normalizeTip(task.tip);
  const toggleDisabled = shouldDisableToggle(task.date);
  return (
    <article
      className="day-task-card"
      style={{ borderColor: accent, backgroundColor: tint }}
      onClick={onClick}
      role="button"
    >
      <div className="task-order" style={{ backgroundColor: accent }}>
        {task.order}
      </div>
      <div className="task-body">
        <div className="task-title-row">
          <strong>{task.title}</strong>
          {tipText && <span className="task-tip">[{tipText}]</span>}
        </div>
        <span className="task-room">{task.room}</span>
      </div>
      <div className="task-meta">
        <span className="task-partner">{partner?.name}</span>
        <button
          type="button"
          className={`partner-dot is-toggle${task.isDone ? ' is-checked' : ''}`}
          style={{ color: accent }}
          onClick={(event) => {
            event.stopPropagation();
            if (toggleDisabled) {
              return;
            }
            onToggleComplete?.(task.id, task.date);
          }}
          disabled={toggleDisabled}
          aria-label={task.isDone ? '완료됨' : '완료 표시'}
        />
        <span className="task-points">{task.points}P</span>
      </div>
    </article>
  );
}

function RecommendationSection({
  recommendations,
  partners = [],
  onSelectRecommendation,
  partnerMap,
}) {
  if (!recommendations.length) {
    return null;
  }
  const daily = recommendations.filter((rec) => rec.category === 'daily');
  const rolling = recommendations.filter((rec) => rec.category !== 'daily');
  const renderRow = (list, title) => (
    <div className="recommendation-line">
      <div className="recommendation-row-heading">
        <span>{title}</span>
      </div>
      <div className="recommendation-row recommendation-row-inline">
        {list.length === 0 ? (
          <p className="recommendation-empty">추천할 항목이 없습니다.</p>
        ) : (
          list.map((rec) => {
            const assignedPartnerId =
              rec.assignedPartnerId || rec.partnerId || partners[0]?.id || '';
            const assignedPartner = partnerMap[assignedPartnerId];
            const normalizedRec =
              rec.assignedPartnerId === assignedPartnerId
                ? rec
                : { ...rec, assignedPartnerId };
            return (
              <div
                key={rec.id}
                className="recommendation-card recommendation-card-compact"
                style={{
                  borderColor: assignedPartner?.accent || '#c3d7cf',
                  boxShadow: `inset 0 0 0 2px ${
                    assignedPartner?.color || '#d0e2d7'
                  }33`,
                  backgroundColor: `${
                    assignedPartner?.color || '#eef4ec'
                  }1a`,
                }}
              >
                <div className="rec-title">
                  <strong>{rec.title}</strong>
                  <span className="rec-tag">{rec.room || '공용'}</span>
                </div>
                <p className="rec-meta">
                  {assignedPartner?.name || '가사 파트너'} · {rec.points}P
                </p>
                <button
                  type="button"
                  className="rec-apply"
                  onClick={() => onSelectRecommendation(normalizedRec)}
                >
                  추가
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <section className="recommendation-panel recommendation-compact recommendation-double">
      <div className="recommendation-header recommendation-inline">
        <h3>할일 추천 - AI 맞춤제안</h3>
      </div>
      <div className="recommendation-rows">
        {renderRow(daily, '매일 추천')}
        {renderRow(rolling, '오늘의 추천')}
      </div>
    </section>
  );
}

function PlaceholderPanel({ title, description }) {
  return (
    <section className="placeholder">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

function AllTasksView({ tasks, partnerMap, onOpenDetail, onToggleComplete }) {
  const handleToggleClick = (event, task) => {
    event.stopPropagation();
    if (!onToggleComplete) {
      return;
    }
    onToggleComplete(task.id, task.date);
  };

  return (
    <section className="all-tasks-view">
      <header>
        <h2>모든 할일</h2>
        <span>{tasks.length}개의 작업</span>
      </header>
      <div className="all-task-scroll">
        {tasks.map((task) => {
          const partner = partnerMap[task.partnerId];
          const toggleDisabled = shouldDisableToggle(task.date);
          return (
            <div
              key={`${task.id}-${task.date}`}
              className="all-task-item"
              style={{ borderColor: partner?.accent || '#9ab3a3' }}
              role="button"
              tabIndex={0}
              onClick={() => onOpenDetail(task.date, task.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenDetail(task.date, task.id);
                }
              }}
            >
              <div className="all-task-title">
                <strong>{task.title}</strong>
                <span className="room-tag">({task.room})</span>
                <span className="date-tag">{task.date}</span>
              </div>
              <div className="task-meta">
                <span className="task-partner">{partner?.name}</span>
                <button
                  type="button"
                  className={`partner-dot is-toggle${task.isDone ? ' is-checked' : ''}`}
                  style={{ color: partner?.accent || partner?.color || '#2d4f3a' }}
                  onClick={(event) => handleToggleClick(event, task)}
                  disabled={toggleDisabled}
                  aria-label={task.isDone ? '완료됨' : '미완료'}
                />
                <span className="task-points">{task.points}P</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CalendarPage;

function ActionPickerModal({ onClose, onSelect }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-modal action-picker-modal" onClick={(event) => event.stopPropagation()}>
        <header className="task-modal-header">
          <button type="button" onClick={onClose} aria-label="닫기">
            ‹
          </button>
          <strong>무엇을 추가할까요?</strong>
          <span />
        </header>
        <ul className="action-picker-list">
          <li>
            <button type="button" onClick={() => onSelect('task')}>
              <span>
                새 작업 추가
                <small>집안일을 직접 등록해요.</small>
              </span>
              <span className="chevron">›</span>
            </button>
          </li>
          <li>
            <button type="button" onClick={() => onSelect('condition')}>
              <span>
                컨디션 기록
                <small>오늘의 컨디션을 입력하고 공유해요.</small>
              </span>
              <span className="chevron">›</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

function InviteCodeModal({ code, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-modal invite-modal" onClick={(event) => event.stopPropagation()}>
        <header className="task-modal-header">
          <button type="button" onClick={onClose} aria-label="닫기">
            ‹
          </button>
          <strong>초대 코드 공유</strong>
          <span />
        </header>
        <div className="invite-modal-body">
          <p className="invite-modal-title">
            가족 구성원과 함께하려면 아래 초대코드를 공유하세요.
          </p>
          <p className="invite-code-pill invite-modal-code">
            내 초대코드 <strong>{code || '발급 준비중'}</strong>
          </p>
          <p className="invite-modal-hint">
            초대받은 사람은 회원가입 시 이 코드를 입력하면 같은 집으로 합류합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function TaskModal({
  form,
  onClose,
  onChange,
  onSubmit,
  onDelete,
  openCategory,
  roomOptions,
  partners,
  durationOptions,
  effortOptions,
  status,
}) {
  const { loading, error } = status || {};
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(event) => event.stopPropagation()}>
        <header className="task-modal-header">
          <button type="button" onClick={onClose} aria-label="닫기">
            ‹
          </button>
          <strong>새 작업 추가하기</strong>
          <span />
        </header>
        <form onSubmit={onSubmit} className="task-form">
          <label className="title-field">
            제목
            <div className="title-input-row">
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="예) 설거지"
              />
              <button
                type="button"
                onClick={openCategory}
                className="category-button"
              >
                카테고리
              </button>
            </div>
          </label>
          <label>
            참여자
            <select
              name="participantId"
              value={form.participantId}
              onChange={onChange}
            >
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            방
            <select name="roomId" value={form.roomId} onChange={onChange}>
              {roomOptions.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            반복
            <input
              name="repeat"
              value={form.repeat}
              onChange={onChange}
              placeholder="없음"
            />
          </label>
          <label>
            날짜
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
            />
          </label>
          <label>
            종료일
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
            />
          </label>
          <label>
            메모
            <textarea
              name="memo"
              value={form.memo}
              onChange={onChange}
              placeholder="추가 메모"
            />
          </label>
          <div className="inline-field">
            <label>
              예상 소요 시간
              <select
                name="durationId"
                value={form.durationId}
                onChange={onChange}
              >
                {durationOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              힘든 정도
              <select name="effortId" value={form.effortId} onChange={onChange}>
                {effortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="task-modal-actions">
            <button type="button" className="delete-button" onClick={onDelete}>
              삭제하기
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? '저장 중...' : '완료하기'}
            </button>
          </div>
          {error && (
            <p style={{ color: '#b42318', margin: '6px 0 0', fontSize: 13 }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function ConditionModal({
  form,
  onClose,
  onSubmit,
  onScoreChange,
  onDateChange,
  onNoteChange,
  onDelete,
  onTogglePreChoreDisabled,
  status,
}) {
  const { loading, error } = status || {};
  const [activeHelp, setActiveHelp] = useState(null);
  const instructions = {
    morning:
      '기상 직후 몸 상태를 입력하면 일정 추천에 반영돼요. 입력 후 5~10분 내 반영됩니다.',
    preChore:
      '하루 일과를 끝낸 후 집안일을 시작하기 직전의 컨디션을 입력해주세요.\n본격적인 일이 없는 날이거나 하루종일 집안일을 할 경우에는 토글을 켜서 입력을 건너뛰어도 돼요.',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-modal condition-modal" onClick={(event) => event.stopPropagation()}>
        <header className="task-modal-header">
          <button type="button" onClick={onClose} aria-label="닫기">
            ‹
          </button>
          <strong>컨디션 입력하기</strong>
          <span />
        </header>
        <form onSubmit={onSubmit} className="task-form">
          <label>
            날짜
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={(event) => onDateChange(event.target.value)}
            />
          </label>
          <div className="condition-field">
            <label>
              <span className="condition-title">
                본인이 생각한 기상 직후의 컨디션
                <button
                  type="button"
                  className="condition-help-button"
                  onClick={() =>
                    setActiveHelp((prev) => (prev === 'morning' ? null : 'morning'))
                  }
                  aria-label="도움말"
                >
                  ?
                </button>
          </span>
          <div className="condition-buttons">
            {Array.from({ length: 11 }).map((_, index) => (
              <button
                key={`morning-${index}`}
                    type="button"
                    className={form.morningScore === index ? 'is-active' : undefined}
                    onClick={() => onScoreChange('morningScore', index)}
                  >
                    {index}
                  </button>
                ))}
              </div>
              {activeHelp === 'morning' && (
                <p className="condition-help-text">{instructions.morning}</p>
              )}
            </label>
          </div>
          <div className="condition-field">
            <label>
              <span className="condition-title">
                본인이 생각한 집안일 전 컨디션
                <button
                  type="button"
                  className="condition-help-button"
                  onClick={() =>
                    setActiveHelp((prev) => (prev === 'preChore' ? null : 'preChore'))
                  }
                  aria-label="도움말"
                >
                  ?
                </button>
              </span>
              <span className="condition-label">{form.preChoreLabel}</span>
              <button
                type="button"
                className={`condition-toggle${form.preChoreDisabled ? ' is-active' : ''}`}
                onClick={onTogglePreChoreDisabled}
                aria-label="괜찮아요 토글"
              >
                괜찮아요
              </button>
              <div className="condition-buttons">
                {Array.from({ length: 11 }).map((_, index) => (
                  <button
                    key={`prechore-${index}`}
                    type="button"
                    className={form.preChoreScore === index ? 'is-active' : undefined}
                    onClick={() => onScoreChange('preChoreScore', index)}
                    disabled={form.preChoreDisabled}
                  >
                    {index}
                  </button>
                ))}
              </div>
              {activeHelp === 'preChore' && (
                <p className="condition-help-text">{instructions.preChore}</p>
              )}
            </label>
          </div>
          <label>
            메모
            <textarea
              name="note"
              value={form.note}
              onChange={onNoteChange}
              placeholder="컨디션에 대한 메모를 남겨보세요."
            />
          </label>
          <div className="task-modal-actions">
            <button
              type="button"
              className="delete-button"
              onClick={onDelete}
              disabled={!form.id || loading}
            >
              삭제하기
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? '저장 중...' : '완료하기'}
            </button>
          </div>
          {error && (
            <p style={{ color: '#b42318', margin: '6px 0 0', fontSize: 13 }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function CategoryPicker({ rooms, library, onClose, onSelect }) {
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const filteredTasks = selectedRoom
    ? (library[selectedRoom] || []).filter((task) =>
        task.toLowerCase().includes(search.toLowerCase())
      )
    : [];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="category-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="task-modal-header">
          <button
            type="button"
            onClick={selectedRoom ? () => setSelectedRoom(null) : onClose}
          >
            ‹
          </button>
          <strong>{selectedRoom ? '작업 목록' : '작업 선택'}</strong>
        </header>
        {selectedRoom ? (
          <>
            <input
              className="search-input"
              placeholder="검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {filteredTasks.length === 0 ? (
              <span className="empty-hint">결과 없음</span>
            ) : (
              <div className="category-task-list">
                {filteredTasks.map((task) => (
                  <button
                    key={task}
                    type="button"
                    onClick={() => onSelect(selectedRoom, task)}
                  >
                    {task}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="category-room-list">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  setSelectedRoom(room.id);
                  setSearch('');
                }}
              >
                {room.icon && <img src={room.icon} alt="" />}
                <span>{room.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestModal({
  form,
  onClose,
  onChange,
  onSubmit,
  tasks,
  partners,
  isSubmitting,
}) {
  const taskOptions = tasks.map((task) => ({
    value: `${task.date}|${task.id}`,
    label: `${task.title} · ${task.date}`,
  }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-modal request-modal" onClick={(event) => event.stopPropagation()}>
        <header className="task-modal-header">
          <button type="button" onClick={onClose} aria-label="닫기">
            ‹
          </button>
          <strong>포인트 조정 요청</strong>
          <span />
        </header>
        <form onSubmit={onSubmit} className="task-form">
          <label>
            요청자
            <select
              name="requesterId"
              value={form.requesterId}
              onChange={onChange}
            >
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            대상 작업
            <select
              name="taskKey"
              value={form.taskKey}
              onChange={onChange}
              required
            >
              {taskOptions.length === 0 ? (
                <option value="">등록된 작업이 없어요</option>
              ) : (
                taskOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </label>
          <label>
            포인트 조정
            <div className="inline-field request-adjust-field">
              <select
                name="direction"
                value={form.direction}
                onChange={onChange}
              >
                <option value="increase">포인트 올리기</option>
                <option value="decrease">포인트 내리기</option>
              </select>
              <input
                type="number"
                min="1"
                name="delta"
                value={form.delta}
                onChange={onChange}
              />
            </div>
          </label>
          <p className="form-hint">모든 가사 파트너가 승인하면 자동으로 반영돼요.</p>
          <div className="task-modal-actions">
            <button type="button" className="delete-button" onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={tasks.length === 0 || isSubmitting}
            >
              {isSubmitting ? '요청 중...' : '요청 보내기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PartnerProfileModal({
  partner,
  isSelf,
  onClose,
  history,
  rollingPoints,
  favoriteOptions,
  onUpdatePartner,
  onPersistFavorites,
  conditionEntries,
  conditionLoading,
  conditionError,
  onEditCondition,
  onLogout,
  onUpdateColor,
}) {
  const [activeDetail, setActiveDetail] = useState(null);
  const [colorDraft, setColorDraft] = useState(partner.color || '#6fb377');
  const [colorStatus, setColorStatus] = useState({ loading: false, error: '' });

  useEffect(() => {
    setColorDraft(partner.color || '#6fb377');
    setColorStatus({ loading: false, error: '' });
  }, [partner]);

  const handleOpenColorDetail = () => {
    if (!isSelf) {
      return;
    }
    setColorDraft(partner.color || '#6fb377');
    setColorStatus({ loading: false, error: '' });
    setActiveDetail({ id: 'color', label: '컬러 선택' });
  };

  const handleDetailBack = () => {
    if (activeDetail?.id === 'color') {
      setColorDraft(partner.color || '#6fb377');
      setColorStatus({ loading: false, error: '' });
    }
    setActiveDetail(null);
  };

  const rows = [
    { id: 'name', label: '프로필 이름', value: partner.name },
    { id: 'email', label: '이메일', value: partner.email },
    {
      id: 'color',
      label: '컬러',
      value: partner.color,
      type: 'color',
    },
    { id: 'invite', label: '초대 아이디', value: partner.inviteCode },
    { id: 'points', label: '획득 포인트', value: `${rollingPoints || 0}P` },
    { id: 'share', label: '퍼센트', value: `${partner.share}%` },
  ];

  const detailSections = [
    { id: 'work', label: '가사 노동 현황' },
    { id: 'condition', label: '컨디션' },
    { id: 'favorites', label: '선호하는 집안일' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="profile-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="profile-header">
          <button type="button" onClick={onClose} aria-label="닫기">
            ‹
          </button>
          <div className="profile-hero">
            <div
              className="profile-hero-avatar"
              style={{ borderColor: partner.color }}
            >
              <span />
            </div>
            <div>
              <p className="profile-hero-label">{partner.name} 프로필</p>
              <span className="profile-hero-sub">
                {isSelf ? '본인 계정' : '가사 파트너'}
              </span>
            </div>
          </div>
          <span />
        </header>
        <section className="profile-sheet">
          {!activeDetail ? (
            <>
              {rows
                .filter((row) => row.id !== 'color')
                .map((row) => (
                  <div key={row.id} className="profile-row">
                    <span>{row.label}</span>
                    <span className="row-value">{row.value}</span>
                  </div>
                ))}
              <div className="profile-row">
                <span>컬러</span>
                <div className="row-value color-input-group">
                  <button
                    type="button"
                    className="color-swatch"
                    style={{ background: colorDraft }}
                    disabled={!isSelf}
                    onClick={handleOpenColorDetail}
                  />
                </div>
              </div>
              {detailSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className="profile-row is-action"
                  onClick={() => setActiveDetail(section)}
                >
                  <span>{section.label}</span>
                  <span className="row-value">›</span>
                </button>
              ))}
              {isSelf && (
                <button
                  type="button"
                  className="profile-row is-action"
                  onClick={() => {
                    onClose?.();
                    onLogout?.();
                  }}
                >
                  <span>로그아웃</span>
                  <span className="row-value">↩</span>
                </button>
              )}
            </>
          ) : (
            <DetailSectionView
              section={activeDetail}
              partner={partner}
              history={history}
              onBack={handleDetailBack}
              editableFavorites={isSelf}
              favoriteOptions={favoriteOptions}
              onUpdateFavorites={onUpdatePartner}
              onPersistFavorites={onPersistFavorites}
              conditionEntries={conditionEntries}
              conditionLoading={conditionLoading}
              conditionError={conditionError}
              onEditCondition={onEditCondition}
              onUpdateColor={onUpdateColor}
              colorDraft={colorDraft}
              setColorDraft={setColorDraft}
              colorStatus={colorStatus}
              setColorStatus={setColorStatus}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function DetailSectionView({
  section,
  partner,
  history,
  onBack,
  editableFavorites,
  favoriteOptions = [],
  onUpdateFavorites,
  onPersistFavorites,
  conditionEntries,
  conditionLoading,
  conditionError,
  onEditCondition,
  onUpdateColor,
  colorDraft,
  setColorDraft,
  colorStatus,
  setColorStatus,
}) {
  const [favoriteDraft, setFavoriteDraft] = useState(partner.favorites || []);
  const [customFavorite, setCustomFavorite] = useState('');
  const [isSavingFavorites, setIsSavingFavorites] = useState(false);
  const [favoriteFeedback, setFavoriteFeedback] = useState({
    message: '',
    isError: false,
  });
  const conditionItems = useMemo(() => {
    if (!conditionEntries) {
      return [];
    }
    return Object.values(conditionEntries)
      .map((item) => item)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [conditionEntries]);

  useEffect(() => {
    setFavoriteDraft(partner.favorites || []);
    setCustomFavorite('');
  }, [partner, section]);

  const toggleFavorite = (item) => {
    setFavoriteDraft((prev) =>
      prev.includes(item)
        ? prev.filter((favorite) => favorite !== item)
        : [...prev, item]
    );
  };

  const handleSaveFavorites = async () => {
    const normalized = Array.from(
      new Set(
        [
          ...favoriteDraft.map((item) => item.trim()).filter(Boolean),
          customFavorite.trim(),
        ].filter(Boolean)
      )
    );
    setIsSavingFavorites(true);
    setFavoriteFeedback({ message: '', isError: false });
    try {
      await onPersistFavorites?.(normalized);
      onUpdateFavorites?.(partner.id, { favorites: normalized });
      setFavoriteDraft(normalized);
      setCustomFavorite('');
      setFavoriteFeedback({ message: '저장되었습니다.', isError: false });
    } catch (error) {
      setFavoriteFeedback({
        message: error.message || '저장 중 오류가 발생했습니다.',
        isError: true,
      });
    } finally {
      setIsSavingFavorites(false);
    }
  };

  return (
    <div className="detail-view">
      <div className="detail-header">
        <button type="button" onClick={onBack} aria-label="뒤로가기">
          ‹
        </button>
        <strong>{section.label}</strong>
        <span />
      </div>
      {section.id === 'work' && (
        <>
          {history.length === 0 ? (
            <p className="empty-hint">완료된 작업이 아직 없어요.</p>
          ) : (
            <ul className="history-list">
              {history.map((task) => (
                <li key={`${task.id}-${task.date}`}>
                  <span>{task.title}</span>
                  <small>
                    {task.date} · {task.points}P
                  </small>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {section.id === 'condition' && (
        <>
          {editableFavorites ? (
            <>
              {conditionLoading ? (
                <p className="empty-hint">컨디션을 불러오는 중...</p>
              ) : conditionError ? (
                <p className="empty-hint">{conditionError}</p>
              ) : conditionItems.length === 0 ? (
                <p className="empty-hint">등록된 컨디션 기록이 없습니다.</p>
              ) : (
                <ul className="history-list">
                  {conditionItems.map((entry) => (
                    <li key={entry.id}>
                      <span>
                        {entry.date} · 기상 {entry.morningScore} / 집안일 {entry.preChoreScore}
                      </span>
                      {entry.note && <small>{entry.note}</small>}
                      <button
                        type="button"
                        className="favorite-editor-save"
                        style={{ marginTop: 8 }}
                        onClick={() => onEditCondition?.(entry.date)}
                      >
                        수정
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="favorite-editor-save"
                style={{ marginTop: 12 }}
                onClick={() =>
                  onEditCondition?.(new Date().toISOString().split('T')[0])
                }
              >
                새 컨디션 입력
              </button>
            </>
          ) : (
            <p className="detail-text">
              {partner.condition || '등록된 컨디션 정보가 없어요.'}
            </p>
          )}
        </>
      )}
      {section.id === 'favorites' && (
        <>
          {editableFavorites ? (
            <div className="favorite-editor">
              <div className="favorite-editor-list">
                {favoriteOptions.map((option) => (
                  <label key={option} className="favorite-editor-row">
                    <span>{option}</span>
                    <input
                      type="checkbox"
                      checked={favoriteDraft.includes(option)}
                      onChange={() => toggleFavorite(option)}
                    />
                  </label>
                ))}
                <label className="favorite-editor-row is-custom">
                  <span>기타</span>
                  <input
                    type="text"
                    placeholder="직접 입력해주세요."
                    value={customFavorite}
                    onChange={(event) => setCustomFavorite(event.target.value)}
                  />
                </label>
              </div>
              <button
                type="button"
                className="favorite-editor-save"
                onClick={handleSaveFavorites}
                disabled={isSavingFavorites}
              >
                {isSavingFavorites ? '저장 중...' : '저장'}
              </button>
              {favoriteFeedback.message && (
                <p
                  className={`favorite-editor-feedback${
                    favoriteFeedback.isError ? ' is-error' : ''
                  }`}
                >
                  {favoriteFeedback.message}
                </p>
              )}
            </div>
          ) : partner.favorites.length === 0 ? (
            <p className="empty-hint">등록된 선호 집안일이 없어요.</p>
          ) : (
            <div className="chip-row">
              {partner.favorites.map((favorite) => (
                <span key={favorite} className="chip">
                  {favorite}
                </span>
              ))}
            </div>
          )}
        </>
      )}
      {section.id === 'color' && editableFavorites && (
        <div className="color-detail">
          <p style={{ margin: '8px 0 12px', color: '#4c5c51' }}>
            프로필 색상을 선택하면 카드와 추천 색상이 함께 바뀝니다.
          </p>
          <div className="color-palette-grid">
            {colorPalette.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-palette-cell${
                  colorDraft === color ? ' is-active' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setColorDraft(color)}
              />
            ))}
          </div>
          <div className="favorite-editor-actions">
            <button
              type="button"
              className="favorite-editor-save"
              onClick={async () => {
                if (colorDraft === partner.color) {
                  return;
                }
                setColorStatus({ loading: true, error: '' });
                try {
                  await onUpdateColor?.(partner.id, colorDraft);
                  setColorStatus({ loading: false, error: '' });
                  onBack();
                } catch (error) {
                  setColorStatus({
                    loading: false,
                    error: error.message || '색상을 변경하지 못했습니다.',
                  });
                }
              }}
              disabled={colorStatus.loading || colorDraft === partner.color}
            >
              {colorStatus.loading ? '저장 중...' : '변경'}
            </button>
            <button type="button" className="favorite-editor-close" onClick={onBack}>
              취소
            </button>
          </div>
          {colorStatus.error && (
            <p className="favorite-editor-feedback is-error">{colorStatus.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

function TaskDetailModal({
  task,
  partner,
  onClose,
  onDelete,
  onReschedule,
  onToggleComplete,
  onGenerateTip,
}) {
  const [delayOption, setDelayOption] = useState('선택');
  const [customDays, setCustomDays] = useState(4);
  const [tipState, setTipState] = useState(() => ({
    text: normalizeTip(task.tip),
    loading: false,
    error: '',
  }));

  useEffect(() => {
    setTipState({ text: normalizeTip(task.tip), loading: false, error: '' });
  }, [task]);

  const displayDate = formatSimpleDate(task.date);
  const handleDelayChange = (value) => {
    setDelayOption(value);
    if (value === '선택' || value === 'custom') {
      return;
    }
    const days = Number(value);
    if (!Number.isNaN(days) && days > 0) {
      onReschedule?.(days);
      setDelayOption('선택');
    }
  };
  const applyCustomDelay = () => {
    const days = Number(customDays);
    if (!Number.isNaN(days) && days >= 4) {
      onReschedule?.(days);
      setDelayOption('선택');
    }
  };
  const tipLabel = '팁';
  const tipText = tipState.text || '아직 생성된 팁이 없어요.';
  const handleTipGenerate = async () => {
    if (!onGenerateTip || tipState.loading) {
      return;
    }
    setTipState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const generated = await onGenerateTip(task);
      setTipState({ text: generated, loading: false, error: '' });
    } catch (error) {
      setTipState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || '팁을 생성하지 못했습니다.',
      }));
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
        <header className="detail-modal-header">
          <button type="button" onClick={onClose} aria-label="닫기">
            ‹
          </button>
          <strong>할일 상세보기</strong>
          <span />
        </header>
        <section className="detail-summary">
          <div>
            <p className="detail-title">{task.title}</p>
            <span className="detail-meta">{partner?.name || '-'} · {task.points}P</span>
          </div>
          <button
            type="button"
            className={`partner-dot is-toggle${task.isDone ? ' is-checked' : ''}`}
            style={{ color: partner?.accent || '#2d4f3a' }}
            onClick={(event) => {
              event.stopPropagation();
              onToggleComplete?.();
            }}
            aria-label="완료 체크"
          />
        </section>
        <section className="detail-fields">
          <div className="detail-field">
            <span>방</span>
            <span>{task.room || '공용 공간'}</span>
          </div>
          <div className="detail-field">
            <span>반복</span>
            <span>{task.repeat || '없음'}</span>
          </div>
          <div className="detail-field">
            <span>날짜</span>
            <span>{displayDate}</span>
          </div>
          <div className="detail-field">
            <span>미루기</span>
            <div className="delay-control">
              <select
                value={delayOption}
                onChange={(event) => handleDelayChange(event.target.value)}
              >
                <option value="선택">선택</option>
                <option value="1">1일 후</option>
                <option value="2">2일 후</option>
                <option value="3">3일 후</option>
                <option value="custom">직접 입력…</option>
              </select>
              {delayOption === 'custom' && (
                <div className="custom-delay">
                  <input
                    type="number"
                    min="4"
                    value={customDays}
                    onChange={(event) => setCustomDays(event.target.value)}
                  />
                  <button type="button" onClick={applyCustomDelay}>
                    적용
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="detail-tip">
          <div className="detail-tip-header">
            <strong>[{tipLabel}]</strong>
            <button
              type="button"
              className="tip-generate-button"
              onClick={handleTipGenerate}
              disabled={!onGenerateTip || tipState.loading}
            >
              {tipState.loading ? '생성 중...' : '팁 생성'}
            </button>
          </div>
          {tipState.error && (
            <p className="tip-feedback is-error">{tipState.error}</p>
          )}
          <p>{tipText}</p>
        </section>
        <div className="detail-actions">
          <button type="button" className="detail-secondary" onClick={onClose}>
            완료하기
          </button>
          <button type="button" className="detail-danger" onClick={onDelete}>
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}

function RecommendationModal({ recommendation, partners, onClose, onConfirm }) {
  const getValidPartnerId = useCallback(
    (candidateId) => {
      if (
        candidateId &&
        partners.some((partner) => partner.id === candidateId)
      ) {
        return candidateId;
      }
      return partners[0]?.id || '';
    },
    [partners]
  );
  const [partnerId, setPartnerId] = useState(() =>
    getValidPartnerId(recommendation?.assignedPartnerId ?? recommendation?.partnerId)
  );
  const [rating, setRating] = useState(3);

  useEffect(() => {
    setPartnerId(
      getValidPartnerId(
        recommendation?.assignedPartnerId ?? recommendation?.partnerId
      )
    );
    setRating(3);
  }, [recommendation, getValidPartnerId]);

  if (!recommendation) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!partnerId) {
      return;
    }
    onConfirm({ partnerId, rating });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="recommendation-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <button type="button" onClick={onClose} aria-label="닫기">
            ‹
          </button>
          <strong>[{recommendation.title}]</strong>
          <span />
        </header>
        <form onSubmit={handleSubmit}>
          <label className="modal-field">
            가사 파트너
            <select
              value={partnerId}
              onChange={(event) => setPartnerId(event.target.value)}
            >
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </label>
          <p className="feedback-question">추천에 대한 평가</p>
          <div className="feedback-scale selectable">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={value === rating ? 'is-active' : undefined}
                onClick={() => setRating(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <button type="submit" className="feedback-submit">
            완료
          </button>
        </form>
      </div>
    </div>
  );
}
