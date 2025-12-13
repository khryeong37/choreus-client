// src/api/rl.js

export async function requestRecommendation({ dow, condition_scores }) {
  const res = await fetch('/api/rl/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dow,
      condition_scores,
    }),
  });

  if (!res.ok) {
    throw new Error('추천 요청 실패');
  }

  return res.json();
}

export async function sendFeedback({ dow, condition_scores, task_id, score }) {
  const res = await fetch('/api/rl/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dow,
      condition_scores,
      task_id,
      score,
    }),
  });

  if (!res.ok) {
    throw new Error('피드백 전송 실패');
  }

  return res.json();
}
