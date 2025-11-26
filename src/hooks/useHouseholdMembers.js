import { useEffect, useState } from 'react';
import { getAuthToken, userApi } from '../api/client';

export default function useHouseholdMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchMembers = async () => {
      if (!getAuthToken()) {
        setMembers([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const { members: list } = await userApi.fetchHousehold();
        if (!active) return;
        setMembers(list || []);
      } catch (err) {
        if (!active) return;
        console.error('가족 구성원을 불러오지 못했습니다.', err);
        setError(err.message || '가족 정보를 불러오지 못했습니다.');
        setMembers([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchMembers();
    return () => {
      active = false;
    };
  }, []);

  return { members, loading, error };
}
