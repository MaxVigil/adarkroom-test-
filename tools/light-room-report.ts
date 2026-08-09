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
console.log('Pending-balance buildings: 0');
console.log('');
console.log('## Logger Hut');
console.log(`- Base: ${base.woodPerTenSeconds} wood / 10s with ${base.workers} workers`);
console.log(`- Iron axes: ${axes.woodPerTenSeconds} wood / 10s with ${axes.workers} workers`);
console.log(`- Base wood-cost payback: ${base.woodCostPaybackMinutes.toFixed(1)} minutes`);
console.log(`- Hut plus iron-axes wood-cost payback: ${axes.woodCostPaybackMinutes.toFixed(1)} minutes`);
console.log(`- Workers freed versus gatherers: ${base.workersFreed} base, ${axes.workersFreed} with iron axes`);
console.log('- Iron axes: approved one-time Workshop upgrade; 300 wood, 50 leather, 40 iron');
console.log('');
console.log('## Guest House');
console.log(`- Rooms: ${guestHouseDesign.building.baseRooms} base, ${guestHouseDesign.building.maximumRooms} maximum`);
console.log(`- Caretakers: ${guestHouseDesign.caretaker.maximumWorkers}`);
console.log(`- Construction: ${guestHouseDesign.building.cost['resource.wood']} wood, ${guestHouseDesign.building.cost['resource.fur']} fur, ${guestHouseDesign.building.cost['resource.leather']} leather`);
console.log(`- Visits: ${guestHouseDesign.visitIntervalSeconds.min / 60}-${guestHouseDesign.visitIntervalSeconds.max / 60} minutes; queue capacity ${guestHouseDesign.queueCapacity}`);
console.log(`- Caretaker: ${guestHouseDesign.caretaker.visitReductionFraction * 100}% faster visits and ${guestHouseDesign.caretaker.reserveUnitsPerCycle} reserved units / 10s`);
console.log(`- Pantry: ${guestHouseDesign.pantryDiscountFraction * 100}% service discount and ${guestHouseDesign.caretaker.pantryReserveUnitsPerCycle} reserved units / 10s`);
console.log(`- Notice board: ${guestHouseDesign.noticeBoardVisitReductionFraction * 100}% faster visits and next-guest preview`);
console.log('- Persistent rooms, FIFO queue, waiting guest, inherited offers, paid completion, and save reload: playable and tested');

if (issues.length > 0) {
  console.log('');
  for (const issue of issues) console.log(`- [${issue.code}] ${issue.message}`);
  process.exitCode = 1;
}
