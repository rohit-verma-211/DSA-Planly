async function req(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.status === 204 ? null : res.json();
}

export const api = {
  getPlan: () => req('/plan'),
  updateQuestion: (id, patch) => req(`/questions/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  addQuestion: (q) => req('/questions', { method: 'POST', body: JSON.stringify(q) }),
  deleteQuestion: (id) => req(`/questions/${id}`, { method: 'DELETE' }),
  setStartDate: (value) => req('/settings/start_date', { method: 'PUT', body: JSON.stringify({ value }) }),
};
