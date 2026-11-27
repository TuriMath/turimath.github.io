// One theorem: the source quote, where it is in the pipeline, and its Lean files once they exist on main.
const q = new URLSearchParams(location.search);
const n = Number(q.get('n'));
const home = q.get('r') || 'TuriMath/theorems';  // repo holding the issue; ?r=TuriMath/<name>&n=<issue>
const head = document.getElementById('head');
const doc = document.getElementById('doc');
const fail = msg => head.replaceChildren(el('p', msg, 'empty'));

const raw = (t, path) => fetch(rawOf(t, path)).then(r => (r.ok ? r.text() : null)).catch(() => null);
const note = () => { const p = el('p', null, 'note'); doc.append(p); return p; };
const link = (href, text) => Object.assign(el('a', text), {href, rel: 'noopener'});

loadTheorems().then(async list => {
  const t = list.find(x => x.number === n && x.home === home);
  if (!t) return fail('No theorem with that number. Go back to the list.');
  document.title = t.name + ' · TuriMath';

  const meta = el('div', null, 'meta');
  meta.append(badge(t), 'Tier ' + t.tier, ' · ', ...(t.repo ? [link(repoUrl(t), t.repo), ' · '] : []), link(t.url, 'issue #' + t.number));
  const h = el('h1', t.name, 'chalk');
  head.replaceChildren(meta, h);
  if (t.quote) head.append(el('blockquote', '“' + t.quote + '”', 'source chalk'));
  if (t.ref) head.append(el('p', 'Source: ' + t.ref.replace(/\*/g, ''), 'ref'));

  // progress track: formalize → match → prove → verified
  const at = t.stage === 'parked' ? -1 : STAGES.findIndex(s => s.key === t.stage);
  const track = el('div', null, 'track');
  STAGES.forEach((s, i) => {
    const d = el('div', null, i < at || t.stage === 'verified' ? 'done' : i === at ? 'now' : '');
    d.append(el('b', s.name), s.what);
    track.append(d);
  });
  head.append(track);
  if (t.stage === 'parked') head.append(el('p', 'Parked: out of attempts for now. The reason is in the last comment on the issue.', 'note'));

  const slug = t.slug;
  const [stmt, proof] = slug ? await Promise.all([raw(t, `Theorems/${slug}/A.lean`), raw(t, `Theorems/${slug}/Proof.lean`)]) : [null, null];

  doc.append(el('h3', 'The statement in Lean', 'chalk'));
  if (stmt) {
    doc.append(el('p', 'Locked: one of two blind readings of the quote, proved equivalent to the other and passed by the critic. CI fails any change to it.'));
    doc.append(el('pre', stmt.trim()));
    note().append(link(blobOf(t, `Theorems/${slug}/A.lean`), 'A.lean'), ' · ',
      link(blobOf(t, `Theorems/${slug}/B.lean`), 'the other reading, B.lean'), ' · ',
      link(blobOf(t, `Theorems/${slug}/Equiv.lean`), 'the proof they match, Equiv.lean'));
  } else {
    doc.append(el('p', 'Not locked yet. Two agents are writing it in Lean, each without seeing the other\'s; it shows here once the two readings are proved to match and the critic signs off.', 'note'));
  }

  doc.append(el('h3', 'The proof', 'chalk'));
  if (proof && t.stage === 'verified') {
    const d = el('details'); d.open = proof.split('\n').length < 60;
    d.append(el('summary', 'Proof.lean · ' + proof.trim().split('\n').length + ' lines'), el('pre', proof.trim()));
    doc.append(el('p', 'Lean checked every step. Only the three standard axioms are used.'), d);
    note().append(link(blobOf(t, `Theorems/${slug}/Proof.lean`), 'Proof.lean on GitHub'),
      ' · check it yourself: clone the repo and run ', el('code', 'scripts/gate.sh'));
  } else {
    doc.append(el('p', t.stage === 'parked' ? 'No proof: parked before it was proved.' : 'Not yet. The proof starts once the statement is locked.', 'note'));
  }

  if (t.mathlib) {
    doc.append(el('h3', 'What Mathlib already has', 'chalk'));
    doc.append(miniMarkdown(t.mathlib));
  }
  doc.append(el('h3', 'Every attempt', 'chalk'));
  note().append('The full history, including rejected statements and failed attempts, is on ', link(t.url, 'issue #' + t.number), '.');
}).catch(() => fail('Couldn\'t reach GitHub just now. Every theorem is an issue in TuriMath/theorems.'));
