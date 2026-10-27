import { uid, addDays } from './helpers'
export function seed() {
  const now = Date.now()
  const P = [['Website Redesign', 'Refresh marketing site and design system', 'High', 'Active', -20, 25], ['Mobile App v2', 'Ship the next major mobile release', 'Medium', 'Active', -10, 50], ['Data Migration', 'Move legacy reports to the new warehouse', 'Low', 'Planning', 5, 70]].map(([name, description, priority, status, s, d]) => ({ id: uid(), name, description, priority, status, startDate: addDays(s), deadline: addDays(d), archived: false }))
  const mk = (pi, title, status, priority, assignee, labels, due, hrs) => ({ id: uid(), projectId: P[pi].id, title, description: `Work item: ${title}.`, status, priority, assignee, labels, startDate: addDays(due - 10), dueDate: addDays(due), hours: hrs, dependsOn: [], comments: [], activity: [{ t: now, msg: 'Task created' }], createdAt: now + due })
  const tasks = [
    mk(0, 'Audit current pages', 'Completed', 'Medium', 'Asha', ['research'], -5, 6), mk(0, 'Design new homepage', 'In Progress', 'High', 'Ravi', ['design'], 3, 12),
    mk(0, 'Build component library', 'To Do', 'High', 'Meena', ['dev'], 9, 20), mk(0, 'Accessibility review', 'In Review', 'Medium', 'Asha', ['qa'], -1, 5),
    mk(1, 'Push notification service', 'In Progress', 'High', 'Karan', ['dev'], 6, 16), mk(1, 'Onboarding flow', 'To Do', 'Medium', 'Meena', ['design', 'ux'], 14, 10),
    mk(1, 'Crash reporting setup', 'Completed', 'Low', 'Karan', ['dev'], -3, 4), mk(1, 'Beta release', 'To Do', 'High', 'Ravi', ['release'], 30, 8),
    mk(2, 'Map legacy schemas', 'In Review', 'Medium', 'Ravi', ['data'], 8, 14), mk(2, 'Write ETL scripts', 'To Do', 'High', 'Karan', ['data', 'dev'], 20, 24),
  ]
  tasks[2].dependsOn = [tasks[1].id]; tasks[7].dependsOn = [tasks[4].id, tasks[5].id]; tasks[9].dependsOn = [tasks[8].id]
  return { projects: P, tasks, prefs: { collapsed: false } }
}
