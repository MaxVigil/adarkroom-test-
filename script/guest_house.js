/**
 * Playable Guest House runtime. Canonical balance values come from LightRoomData.
 */
var GuestHouse = {
  _tickTimer: null,
  _handlingState: false,

  data: function() {
    return LightRoomData.guestHouse;
  },

  localize: function(value) {
    return LightRoom.localize(value);
  },

  emptyState: function() {
    return {
      rooms: [],
      queue: [],
      waiting: [],
      reserved: {},
      arrivalCursor: 0
    };
  },

  state: function() {
    var state = $SM.get('game.guestHouse');
    if(!state || typeof state != 'object') {
      state = GuestHouse.emptyState();
      $SM.set('game.guestHouse', state, true);
    }
    if(!Array.isArray(state.rooms)) state.rooms = [];
    if(!Array.isArray(state.queue)) state.queue = [];
    if(!Array.isArray(state.waiting)) state.waiting = [];
    if(!state.reserved || typeof state.reserved != 'object') state.reserved = {};
    if(typeof state.arrivalCursor != 'number') state.arrivalCursor = 0;
    return state;
  },

  saveState: function(state) {
    $SM.set('game.guestHouse', state);
  },

  hasBuilding: function() {
    return $SM.get('game.buildings["' + GuestHouse.data().buildingKey + '"]', true) > 0;
  },

  hasUpgrade: function(key) {
    return Boolean($SM.get('game.upgrades["' + key + '"]', true));
  },

  roomCapacity: function() {
    return GuestHouse.hasUpgrade(GuestHouse.data().upgrades.secondRoom) ? 2 : 1;
  },

  caretakerWorking: function() {
    return $SM.get('game.workers["' + GuestHouse.data().caretakerKey + '"]', true) > 0;
  },

  guestById: function(guestId) {
    for(var i = 0; i < GuestHouse.data().guests.length; i++) {
      if(GuestHouse.data().guests[i].key === guestId) return GuestHouse.data().guests[i];
    }
    return null;
  },

  serviceAvailable: function(service) {
    if(service.action === 'apply-map') return typeof World == 'object' && !World.seenAll;
    if(service.action === 'grant-perk') return !$SM.hasPerk(service.grants);
    return false;
  },

  availableServices: function(guest) {
    var services = [];
    for(var i = 0; guest && i < guest.services.length; i++) {
      if(GuestHouse.serviceAvailable(guest.services[i])) services.push(guest.services[i]);
    }
    return services;
  },

  occupiedGuestIds: function(state) {
    var occupied = {};
    var visits = state.rooms.concat(state.queue, state.waiting);
    for(var i = 0; i < visits.length; i++) occupied[visits[i].guestId] = true;
    return occupied;
  },

  chooseNextGuest: function(state) {
    var guests = GuestHouse.data().guests;
    var occupied = GuestHouse.occupiedGuestIds(state);
    for(var offset = 0; offset < guests.length; offset++) {
      var index = (state.arrivalCursor + offset) % guests.length;
      var guest = guests[index];
      if(!occupied[guest.key] && GuestHouse.availableServices(guest).length > 0) {
        state.arrivalCursor = (index + 1) % guests.length;
        return guest;
      }
    }
    return null;
  },

  scheduleNextVisit: function(state) {
    if(!$SM.get('features.location.world') || typeof state.nextVisitSeconds == 'number') return state;
    var guest = GuestHouse.chooseNextGuest(state);
    if(!guest) return state;
    var range = GuestHouse.data().visitIntervalSeconds;
    state.nextVisitSeconds = Math.floor(range.min + Math.random() * (range.max - range.min + 1));
    state.nextGuestId = guest.key;
    return state;
  },

  canAcceptAnother: function(state) {
    if(!GuestHouse.hasBuilding()) return state.waiting.length === 0;
    return state.rooms.length < GuestHouse.roomCapacity()
      || state.queue.length < GuestHouse.data().queueCapacity;
  },

  arrive: function(state) {
    var guest = GuestHouse.guestById(state.nextGuestId);
    if(!guest || GuestHouse.availableServices(guest).length === 0) {
      delete state.nextGuestId;
      delete state.nextVisitSeconds;
      return state;
    }
    var visit = {
      visitId: guest.key + '-' + Date.now(),
      guestId: guest.key
    };
    if(!GuestHouse.hasBuilding()) {
      state.waiting.push(visit);
      Notifications.notify(Room, _('a teacher is waiting for a place to stay'));
      Notifications.notify(Room, _('the builder suggests a guest house'));
    } else if(state.rooms.length < GuestHouse.roomCapacity()) {
      state.rooms.push(visit);
      Notifications.notify(Room, _('{0} arrives at the guest house', GuestHouse.localize(guest.name)));
    } else {
      state.queue.push(visit);
      Notifications.notify(Room, _('{0} waits for a free guest room', GuestHouse.localize(guest.name)));
    }
    delete state.nextGuestId;
    delete state.nextVisitSeconds;
    return state;
  },

  promoteWaiting: function(state) {
    if(!GuestHouse.hasBuilding()) return state;
    while(state.waiting.length > 0 && state.rooms.length < GuestHouse.roomCapacity()) {
      var visit = state.waiting.shift();
      state.rooms.push(visit);
      var guest = GuestHouse.guestById(visit.guestId);
      Notifications.notify(Room, _('{0} settles into the guest house', GuestHouse.localize(guest.name)));
    }
    while(state.waiting.length > 0 && state.queue.length < GuestHouse.data().queueCapacity) {
      state.queue.push(state.waiting.shift());
    }
    return state;
  },

  promoteQueue: function(state) {
    while(state.queue.length > 0 && state.rooms.length < GuestHouse.roomCapacity()) {
      state.rooms.push(state.queue.shift());
    }
    return state;
  },

  discountedCost: function(service) {
    var discount = GuestHouse.hasUpgrade(GuestHouse.data().upgrades.pantry)
      ? GuestHouse.data().pantryDiscountFraction
      : 0;
    var cost = {};
    for(var store in service.cost) cost[store] = Math.ceil(service.cost[store] * (1 - discount));
    return cost;
  },

  reserveSupplies: function(state) {
    if(!GuestHouse.caretakerWorking() || state.rooms.length === 0) return state;
    var visit = state.rooms[0];
    var guest = GuestHouse.guestById(visit.guestId);
    var services = GuestHouse.availableServices(guest);
    if(services.length === 0) return state;
    var requirement = GuestHouse.discountedCost(services[0]);
    var reserved = state.reserved[visit.visitId] || {};
    var remaining = GuestHouse.hasUpgrade(GuestHouse.data().upgrades.pantry)
      ? GuestHouse.data().caretaker.pantryReserveUnitsPerCycle
      : GuestHouse.data().caretaker.reserveUnitsPerCycle;
    var changed = false;
    for(var store in requirement) {
      var needed = Math.max(0, requirement[store] - (reserved[store] || 0));
      var available = $SM.get('stores["' + store + '"]', true);
      var moved = Math.min(needed, available, remaining);
      if(moved > 0) {
        $SM.add('stores["' + store + '"]', -moved, true);
        reserved[store] = (reserved[store] || 0) + moved;
        remaining -= moved;
        changed = true;
      }
      if(remaining <= 0) break;
    }
    if(changed) state.reserved[visit.visitId] = reserved;
    return state;
  },

  cleanCompletedGuests: function(state) {
    for(var i = state.rooms.length - 1; i >= 0; i--) {
      var visit = state.rooms[i];
      if(GuestHouse.availableServices(GuestHouse.guestById(visit.guestId)).length === 0) {
        GuestHouse.refundReservation(state, visit.visitId, {});
        state.rooms.splice(i, 1);
      }
    }
    return GuestHouse.promoteQueue(state);
  },

  refundReservation: function(state, visitId, usedCost) {
    var reserved = state.reserved[visitId] || {};
    for(var store in reserved) {
      var excess = Math.max(0, reserved[store] - (usedCost[store] || 0));
      if(excess > 0) $SM.add('stores["' + store + '"]', excess, true);
    }
    delete state.reserved[visitId];
  },

  tick: function() {
    var state = GuestHouse.state();
    state = GuestHouse.promoteWaiting(state);
    state = GuestHouse.cleanCompletedGuests(state);
    state = GuestHouse.reserveSupplies(state);
    state = GuestHouse.scheduleNextVisit(state);

    if(typeof state.nextVisitSeconds == 'number' && GuestHouse.canAcceptAnother(state)) {
      var elapsed = GuestHouse.data().caretaker.intervalSeconds;
      if(GuestHouse.caretakerWorking()) elapsed /= (1 - GuestHouse.data().caretaker.visitReductionFraction);
      if(GuestHouse.hasUpgrade(GuestHouse.data().upgrades.noticeBoard)) {
        elapsed /= (1 - GuestHouse.data().noticeBoardVisitReductionFraction);
      }
      state.nextVisitSeconds = Math.max(0, state.nextVisitSeconds - elapsed);
      if(state.nextVisitSeconds <= 0) state = GuestHouse.arrive(state);
    }

    GuestHouse.saveState(state);
    GuestHouse.renderButton();
  },

  remainingCost: function(state, visit, service) {
    var cost = GuestHouse.discountedCost(service);
    var reserved = state.reserved[visit.visitId] || {};
    var remaining = {};
    for(var store in cost) remaining[store] = Math.max(0, cost[store] - (reserved[store] || 0));
    return remaining;
  },

  completeService: function(visitId, service) {
    var state = GuestHouse.state();
    var cost = GuestHouse.discountedCost(service);
    GuestHouse.refundReservation(state, visitId, cost);
    if(service.action === 'grant-perk') $SM.addPerk(service.grants);
    if(service.action === 'apply-map') World.applyMap();
    state.rooms = state.rooms.filter(function(visit) { return visit.visitId !== visitId; });
    state = GuestHouse.promoteQueue(state);
    GuestHouse.saveState(state);
    Notifications.notify(Room, _('the guest leaves after sharing what they know'));
    GuestHouse.renderButton();
  },

  visitScene: function(state, visit) {
    var guest = GuestHouse.guestById(visit.guestId);
    var services = GuestHouse.availableServices(guest);
    var buttons = {};
    for(var i = 0; i < services.length; i++) {
      (function(service, index) {
        buttons['service' + index] = {
          text: GuestHouse.localize(service.name),
          cost: GuestHouse.remainingCost(state, visit, service),
          onChoose: function() { GuestHouse.completeService(visit.visitId, service); },
          nextScene: 'end'
        };
      })(services[i], i);
    }
    buttons.back = { text: _('not now'), nextScene: { 1: 'start' } };
    return {
      text: [
        GuestHouse.localize(guest.name),
        GuestHouse.caretakerWorking()
          ? _('the caretaker has written down every offer')
          : _('the traveller waits until the settlement is ready')
      ],
      buttons: buttons
    };
  },

  open: function() {
    var state = GuestHouse.cleanCompletedGuests(GuestHouse.state());
    GuestHouse.saveState(state);
    var scenes = {};
    var buttons = {};
    var text = [_('rooms: {0}/{1}', state.rooms.length, GuestHouse.roomCapacity())];
    if(state.queue.length > 0) text.push(_('waiting in line: {0}', state.queue.length));
    if(state.rooms.length === 0) text.push(_('the guest rooms are quiet'));
    if(GuestHouse.hasUpgrade(GuestHouse.data().upgrades.noticeBoard) && state.nextGuestId) {
      var nextGuest = GuestHouse.guestById(state.nextGuestId);
      text.push(_('next expected traveller: {0}', GuestHouse.localize(nextGuest.name)));
    }
    for(var i = 0; i < state.rooms.length; i++) {
      var visit = state.rooms[i];
      var sceneId = 'visit' + i;
      var guest = GuestHouse.guestById(visit.guestId);
      buttons['guest' + i] = { text: GuestHouse.localize(guest.name), nextScene: { 1: sceneId } };
      scenes[sceneId] = GuestHouse.visitScene(state, visit);
    }
    buttons.close = { text: _('close'), nextScene: 'end' };
    scenes.start = { text: text, buttons: buttons };
    Events.startEvent({ title: GuestHouse.localize(GuestHouse.data().name), scenes: scenes });
  },

  renderButton: function() {
    if(!GuestHouse.hasBuilding() || !Room.panel) return;
    var state = GuestHouse.state();
    var count = state.rooms.length + state.queue.length;
    var container = $('#guestHouseActions');
    if(container.length === 0) {
      container = $('<div>').attr({ id: 'guestHouseActions', 'data-legend': GuestHouse.localize(GuestHouse.data().name) })
        .appendTo('#roomPanel');
    }
    var button = $('#guestHouseButton');
    var label = _('guests') + (count > 0 ? ' (' + count + ')' : '');
    if(button.length === 0) {
      button = new Button.Button({
        id: 'guestHouseButton',
        text: label,
        click: GuestHouse.open,
        width: '100px'
      }).appendTo(container);
    } else {
      $('.text', button).first().text(label);
    }
  },

  disableInheritedGuestEvents: function() {
    for(var i = 0; i < Events.Room.length; i++) {
      var event = Events.Room[i];
      for(var g = 0; g < GuestHouse.data().guests.length; g++) {
        if(event.title === _(GuestHouse.data().guests[g].inheritedEventTitle)) {
          event.isAvailable = function() { return false; };
        }
      }
    }
  },

  handleStateUpdates: function(e) {
    if(GuestHouse._handlingState) return;
    if(e.stateName.indexOf('game.guestHouse') !== 0
      && e.stateName.indexOf('game.buildings') !== 0
      && e.stateName.indexOf('game.upgrades') !== 0
      && e.stateName.indexOf('game.workers') !== 0) return;
    GuestHouse._handlingState = true;
    var state = GuestHouse.promoteWaiting(GuestHouse.cleanCompletedGuests(GuestHouse.state()));
    $SM.set('game.guestHouse', state, true);
    GuestHouse.renderButton();
    GuestHouse._handlingState = false;
  },

  init: function() {
    if(!LightRoomData.guestHouse) return;
    GuestHouse.disableInheritedGuestEvents();
    GuestHouse.state();
    $.Dispatch('stateUpdate').subscribe(GuestHouse.handleStateUpdates);
    GuestHouse.renderButton();
    Engine.clearInterval(GuestHouse._tickTimer);
    GuestHouse._tickTimer = Engine.setInterval(GuestHouse.tick, GuestHouse.data().caretaker.intervalSeconds * 1000);
  }
};
