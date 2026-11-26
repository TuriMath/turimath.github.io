// Theorems come straight from GitHub: every issue labelled `theorem` in TuriMath/theorems is one theorem, and its
// labels are its state (docs/pipeline.md in TuriMath/mathlab). Nothing to edit here when the factory moves.
const REPO = 'TuriMath/theorems';
const API = 'https://api.github.com/repos/' + REPO;
const RAW = 'https://raw.githubusercontent.com/' + REPO + '/main/';
const BLOB = 'https://github.com/' + REPO + '/blob/main/';

const STAGES = [
  {key: 'formalize', name: 'Formalize', what: 'Two agents write the statement in Lean, blind to each other'},
  {key: 'equiv', name: 'Match', what: 'Prove the two statements say the same thing; the critic tries to break it'},
  {key: 'prove', name: 'Prove', what: 'The statement is locked; now prove it'},
  {key: 'verified', name: 'Verified', what: 'Lean accepts the proof'},
];

function parseIssue(i) {
  const labels = i.labels.map(l => (typeof l === 'string' ? l : l.name));
  const body = i.body || '';
  const field = name => (body.match(new RegExp('\\*\\*' + name + ':\\*\\*\\s*(.+)')) || [])[1] || '';
  const section = title => {
    const m = body.match(new RegExp('###\\s*' + title + '[^\\n]*\\n([\\s\\S]*?)(?=\\n###|\\n---|$)'));
    return m ? m[1].trim() : '';
  };
  const src = section('Source statement');
  const quote = src.split('\n').filter(l => l.startsWith('>')).map(l => l.replace(/^>\s?/, '')).join(' ').trim();
  const ref = (src.match(/Reference:\s*(.+)/) || [])[1] || '';
  const tier = (labels.find(l => /^tier:\d/.test(l)) || 'tier:?').slice(5);
  const stage = labels.includes('verified') ? 'verified' : labels.includes('parked') ? 'parked'
    : (labels.find(l => l.startsWith('stage:')) || 'stage:formalize').slice(6);
  return {
    number: i.number, url: i.html_url, name: i.title.replace(/^Theorem:\s*/, ''), slug: field('Slug').trim(),
    tier, stage, quote, ref, mathlib: section('What Mathlib has'), closed: i.state === 'closed',
    updated: i.updated_at,
  };
}

const STATUS = {
  formalize: 'Formalizing', equiv: 'Matching A ↔ B', critique: 'In critique', prove: 'Proving',
  verified: 'Verified', parked: 'Parked',
};

// One API call per visit (cached for 5 minutes): GitHub allows 60 unauthenticated calls an hour per visitor.
async function loadTheorems() {
  const key = 'turimath-theorems';
  try {
    const c = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (c && Date.now() - c.at < 5 * 60e3) return c.list;
  } catch (e) { /* storage unavailable: just fetch */ }
  const r = await fetch(API + '/issues?labels=theorem&state=all&per_page=100&sort=created&direction=asc');
  if (!r.ok) throw new Error('GitHub said ' + r.status);
  const list = (await r.json()).filter(i => !i.pull_request).map(parseIssue);
  try { sessionStorage.setItem(key, JSON.stringify({at: Date.now(), list})); } catch (e) { /* fine */ }
  return list;
}

const el = (tag, text, cls) => {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  if (cls) e.className = cls;
  return e;
};
const badge = t => el('span', STATUS[t.stage] || t.stage, 'badge ' + t.stage);

// Inline markdown for the "What Mathlib has" notes: `code`, *em*, list items. Text only, no HTML from the issue.
function miniMarkdown(md) {
  const root = el('div', null, 'md');
  let ul = null;
  for (const line of md.split('\n')) {
    if (!line.trim()) { ul = null; continue; }
    const item = /^\s*[-*]\s+/.test(line);
    const target = item ? (ul ||= root.appendChild(el('ul'))).appendChild(el('li')) : (ul = null, root.appendChild(el('p')));
    line.replace(/^\s*[-*]\s+/, '').split(/(`[^`]+`)/).forEach(part => {
      if (/^`.+`$/.test(part)) target.append(el('code', part.slice(1, -1)));
      else target.append(part.replace(/\*([^*]+)\*/g, '$1'));
    });
  }
  return root;
}
