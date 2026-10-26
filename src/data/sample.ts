// Generic, local-only sample data. No real people, companies or APIs.
import type { Person } from '../components/ds/Inputs2';

const FIRST = ['Jane', 'Arjun', 'Maya', 'Tomás', 'Lena', 'Kofi', 'Aiko', 'Noah', 'Priya', 'Ezra', 'Sofia', 'Omar', 'Hana', 'Lucas', 'Zara', 'Ivan', 'Nia', 'Leo', 'Amara', 'Felix', 'Ines', 'Ravi', 'Chloe', 'Mateo'];
const LAST = ['Cooper', 'Mehta', 'Lindqvist', 'Alvarez', 'Fischer', 'Mensah', 'Tanaka', 'Brooks', 'Iyer', 'Cohen', 'Rossi', 'Haddad', 'Kim', 'Moreau', 'Ali', 'Petrov', 'Okafor', 'Novak', 'Diallo', 'Weber', 'Costa', 'Nair', 'Martin', 'Silva'];
export const DEPARTMENTS = ['Engineering', 'Sales', 'Design', 'Operations', 'Finance'];
export const ROLES = ['Engineer', 'Account Executive', 'Designer', 'Coordinator', 'Analyst', 'Manager'];
const TEAMS = ['Platform', 'Growth', 'Core', 'Field', 'Insights'];
const CITIES = ['London', 'Berlin', 'Lisbon', 'Nairobi', 'Toronto', 'Singapore', 'Austin'];

function rng(seed: number) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export interface Employee {
  id: string; name: string; email: string; department: string; role: string; team: string; location: string;
  status: 'Active' | 'Away' | 'Inactive'; openTasks: number; lastActive: string; lastActiveDays: number;
}
export const employees: Employee[] = (() => {
  const r = rng(42);
  return Array.from({ length: 48 }, (_, i) => {
    const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 7 + Math.floor(i / FIRST.length) * 5) % LAST.length]}`;
    const days = Math.floor(r() * 30);
    return {
      id: `EMP-${2040 + i}`, name, email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      department: DEPARTMENTS[i % DEPARTMENTS.length], role: ROLES[(i * 5) % ROLES.length], team: TEAMS[(i * 3) % TEAMS.length],
      location: CITIES[(i * 2) % CITIES.length], status: (r() > 0.82 ? 'Inactive' : r() > 0.8 ? 'Away' : 'Active'),
      openTasks: Math.floor(r() * 24), lastActiveDays: days, lastActive: days === 0 ? 'Today' : `${days} d ago`,
    };
  });
})();

export const people: Person[] = employees.slice(0, 10).map(e => ({ id: e.id, name: e.name, role: e.role, email: e.email, code: e.id }));

export interface Account { id: string; name: string; owner: string; stage: string; value: number; health: 'Healthy' | 'At risk' | 'Churned'; industry: string; lastContact: string }
const ORGS = ['Northwind Labs', 'Blue Harbor Co', 'Kestrel Systems', 'Lumen Freight', 'Orchard Health', 'Pinecrest Bank', 'Quartz Retail', 'Riverstone Media', 'Summit Energy', 'Tidewater Foods', 'Vantage Clinics', 'Willow Logistics', 'Atlas Mobility', 'Beacon Analytics'];
export const STAGES = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
export const INDUSTRIES = ['Technology', 'Logistics', 'Healthcare', 'Finance', 'Retail'];
export const accounts: Account[] = ORGS.map((name, i) => ({
  id: `ACC-${310 + i}`, name, owner: employees[i * 3 % employees.length].name, stage: STAGES[i % STAGES.length],
  value: 12000 + ((i * 7919) % 90) * 1000, health: i % 6 === 0 ? 'At risk' : i % 9 === 0 ? 'Churned' : 'Healthy',
  industry: INDUSTRIES[i % INDUSTRIES.length], lastContact: `${(i * 3) % 20 + 1} d ago`,
}));

export interface Project { id: string; name: string; client: string; lead: string; progress: number; due: string; status: 'On track' | 'At risk' | 'Blocked'; tasks: number; done: number; members: number; membersOf: number }
export const projects: Project[] = [
  ['Website relaunch', 'Northwind Labs', 72, 'On track'], ['Mobile onboarding', 'Kestrel Systems', 45, 'At risk'], ['Data warehouse', 'Pinecrest Bank', 88, 'On track'],
  ['Partner portal', 'Atlas Mobility', 20, 'Blocked'], ['Billing migration', 'Quartz Retail', 61, 'On track'], ['Support analytics', 'Beacon Analytics', 34, 'At risk'],
].map(([name, client, progress, status], i) => ({
  id: `PRJ-${100 + i}`, name: name as string, client: client as string, lead: employees[i * 5].name, progress: progress as number,
  due: ['12 May 2026', '30 Jun 2026', '15 Apr 2026', '01 Aug 2026', '20 May 2026', '09 Jul 2026'][i], status: status as Project['status'],
  tasks: 20 + i * 4, done: Math.round((20 + i * 4) * (progress as number) / 100), members: 4 + i, membersOf: 6 + i,
}));

export const tasks = Array.from({ length: 14 }, (_, i) => ({
  id: `T-${400 + i}`, title: ['Review wireframes', 'Write API spec', 'Migrate tables', 'QA sign-off', 'Update copy', 'Load testing', 'Security review'][i % 7] + ` ${Math.floor(i / 7) + 1}`,
  project: projects[i % projects.length].name, assignee: employees[i * 2].name, priority: ['High', 'Medium', 'Low'][i % 3], due: `${(i % 27) + 1} May 2026`,
  state: (['To do', 'In progress', 'Done'] as const)[i % 3],
}));

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const weekly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
