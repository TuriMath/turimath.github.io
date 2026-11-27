// Home page: the theorem list and counters, live from GitHub issues (data.js).
const TEAM = [
  ['Hilbert', 'Scout & planner', 'H'], ['Noether', 'Formalizer A', 'N'], ['Gauss', 'Formalizer B', 'G'],
  ['Euler', 'Prover', 'E'], ['Gödel', 'Critic', 'Γ'],
];
const team = document.getElementById('team-list');
for (const [name, role, mark] of TEAM) {
  const a = el('div', null, 'agent');
  a.innerHTML = `<svg viewBox="0 0 64 64" class="chalk" aria-hidden="true"><circle cx="32" cy="32" r="27" fill="none" stroke="#EAF2FF" stroke-width="2.5"/>`
    + `<text x="32" y="44" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="34" fill="#EAF2FF">${mark}</text></svg>`;
  a.append(el('b', name, 'chalk'), el('span', role));
  team.append(a);
}

const thmList = document.getElementById('thm-list');
const showError = html => thmList.replaceChildren(Object.assign(el('p', null, 'empty'), {innerHTML: html}));

loadTheorems().then(list => {
  try {
    thmList.replaceChildren();
    if (!list.length) { thmList.append(el('p', 'The first theorem is being picked.', 'empty')); return; }
    list.forEach(t => {
      const row = el('article', null, 'thm');
      const gh = el('a', 'GitHub ↗'); gh.href = repoUrl(t); gh.rel = 'noopener';
      row.append(el('h3', t.name), gh);
      thmList.append(row);
    });
  } catch (e) {
    console.error('TuriMath: could not draw the theorem list', e);
    showError('Something went wrong drawing the list. Every theorem is an issue in <a href="https://github.com/TuriMath/theorems/issues?q=label%3Atheorem">TuriMath/theorems</a>.');
  }
}).catch(e => {
  console.error('TuriMath: no theorem data', e);
  showError('Couldn\'t reach GitHub just now. Every theorem is an issue in <a href="https://github.com/TuriMath/theorems/issues?q=label%3Atheorem">TuriMath/theorems</a>.');
});
