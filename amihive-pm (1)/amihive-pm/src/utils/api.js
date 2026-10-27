import axios from 'axios'
const api = axios.create({ baseURL: 'https://jsonplaceholder.typicode.com', timeout: 8000 })
// Fetches mock todos + users and maps them to task-shaped objects ("Import from API").
export async function fetchMockTasks(limit = 5) {
  const [{ data: todos }, { data: users }] = await Promise.all([api.get('/todos', { params: { _limit: limit } }), api.get('/users', { params: { _limit: 5 } })])
  return todos.map((t) => ({ title: t.title.charAt(0).toUpperCase() + t.title.slice(1), done: t.completed, assignee: users[t.userId % users.length].name.split(' ')[0] }))
}
