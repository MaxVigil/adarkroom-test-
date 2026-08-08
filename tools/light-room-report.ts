import { guestHouseDesign, lightRoomOverlay, loggerHutEconomics } from '../src/light-room/index.js';
import { validateLightRoomCatalog } from '../src/light-room/validation.js';

const issues = validateLightRoomCatalog();
const base = loggerHutEconomics(false);
const axes = loggerHutEconomics(true);

console.log('# Light Room overlay report');
console.log('');
console.log(`Status: ${issues.length === 0 ? 'valid' : 'invalid'}`);
console.log(`New buildings: ${lightRoomOverlay.buildings.length}`);
console.log(`New professions: ${lightRoomOverlay.professions.length}`);
console.log(`Modified professions: ${lightRoomOverlay.professionPatches.length}`);
console.log(`Catalogued upgrades: ${lightRoomOverlay.upgrades.length}`);
console.log(`Pending-balance buildings: ${guestHouseDesign.acquisitionStatus === 'pending-balance' ? 1 : 0}`);
console.log('');
console.log('## Logger Hut');
console.log(`- Base: ${base.woodPerTenSeconds} wood / 10s with ${base.workers} workers`);
console.log(`- Iron axes: ${axes.woodPerTenSeconds} wood / 10s with ${axes.workers} workers`);
console.log(`- Base wood-cost payback: ${base.woodCostPaybackMinutes.toFixed(1)} minutes`);
console.log(`- Workers freed versus gatherers: ${base.workersFreed} base, ${axes.workersFreed} with iron axes`);
console.log('- Iron axes acquisition: pending design approval');
console.log('');
console.log('## Guest House');
console.log(`- Rooms: ${guestHouseDesign.building.baseRooms} base, ${guestHouseDesign.building.maximumRooms} maximum`);
console.log(`- Caretakers: ${guestHouseDesign.caretaker.maximumWorkers}`);
console.log('- Guest persistence, FIFO queue, inherited offers, and supply reservation: implemented as pure rules');
console.log('- Construction cost, visit interval, queue capacity, and caretaker reserve rate: pending balance approval');

if (issues.length > 0) {
  console.log('');
  for (const issue of issues) console.log(`- [${issue.code}] ${issue.message}`);
  process.exitCode = 1;
}
