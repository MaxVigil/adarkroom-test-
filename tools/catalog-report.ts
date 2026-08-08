import { baseline } from '../src/game-data/index.js';
import { validateBaseline } from '../src/game-data/validation.js';

const issues = validateBaseline();
const counts = {
  resources: baseline.resources.length,
  buildings: baseline.buildings.length,
  professions: baseline.professions.length,
  items: baseline.items.length,
  recipes: baseline.recipes.length,
  weapons: baseline.weapons.length,
  perks: baseline.perks.length,
  blueprints: baseline.blueprints.length,
  locations: baseline.locations.length,
  events: baseline.events.length,
  scenes: baseline.scenes.length,
  enemies: baseline.enemies.length,
  combatEncounters: baseline.combatEncounters.length,
  lootTables: baseline.lootTables.length,
};

console.log('# Light Room baseline catalog report');
console.log('');
console.log(`Status: ${issues.length === 0 ? 'valid' : 'invalid'}`);
console.log('');
for (const [name, count] of Object.entries(counts)) console.log(`- ${name}: ${count}`);

if (issues.length > 0) {
  console.log('');
  console.log('## Issues');
  for (const issue of issues) console.log(`- [${issue.code}] ${issue.message}`);
  process.exitCode = 1;
}
