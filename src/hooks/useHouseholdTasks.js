import { useCallback, useEffect, useState } from 'react';
import { getAuthToken, taskApi } from '../api/client';

export default function useHouseholdTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    if (!getAuthToken()) {
      setTasks([]);
      setLoading(false);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { tasks: list } = await taskApi.list();
      setTasks(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('할 일을 불러오지 못했습니다.', err);
      setError(err.message || '할 일을 불러오지 못했습니다.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchTasks = async () => {
      await loadTasks();
    };
    if (active) {
      fetchTasks();
    }
    return () => {
      active = false;
    };
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    refresh: loadTasks,
  };
}
