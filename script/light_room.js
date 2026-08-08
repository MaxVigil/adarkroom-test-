/**
 * Adapter from the generated Light Room catalog to the inherited playable runtime.
 */
(function() {
  if(typeof LightRoomData != 'object') return;

  var locale = typeof lang == 'string' && lang.toLowerCase().indexOf('uk') === 0 ? 'uk' : 'en';
  var localize = function(value) {
    return value[locale] || value.en;
  };

  for(var i = 0; i < LightRoomData.buildings.length; i++) {
    var definition = LightRoomData.buildings[i];
    Room.Craftables[definition.key] = {
      name: localize(definition.name),
      button: null,
      maximum: definition.maximum,
      availableMsg: localize(definition.availableMessage),
      buildMsg: localize(definition.builtMessage),
      type: 'building',
      requiresBuilding: definition.requiresBuilding,
      cost: (function(cost) {
        return function() { return Object.assign({}, cost); };
      })(definition.cost)
    };
  }

  for(var j = 0; j < LightRoomData.professions.length; j++) {
    var profession = LightRoomData.professions[j];
    Outside._INCOME[profession.key] = {
      name: localize(profession.name),
      delay: profession.delay,
      stores: profession.stores,
      maximum: profession.maximum,
      modifiers: profession.modifiers
    };
    Outside.LightRoomJobs = Outside.LightRoomJobs || {};
    Outside.LightRoomJobs[profession.requiresBuilding] = [profession.key];
  }

  var inheritedIncomeStores = Outside.getIncomeStores;
  Outside.getIncomeStores = function(worker) {
    var income = Outside._INCOME[worker];
    for(var k = 0; income && income.modifiers && k < income.modifiers.length; k++) {
      var modifier = income.modifiers[k];
      if(modifier.upgrade && $SM.get('game.upgrades["' + modifier.upgrade + '"]')) {
        return modifier.stores;
      }
    }
    return inheritedIncomeStores.call(Outside, worker);
  };

  window.LightRoom = {
    data: LightRoomData,
    localize: localize
  };
})();
