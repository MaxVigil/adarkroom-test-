var Path = {
	DEFAULT_BAG_SPACE: 10,
	_STORES_OFFSET: 0,
	// Everything not in this list weighs 1
	Weight: {
		'bone spear': 2,
		'iron sword': 3,
		'steel sword': 5,
		'rifle': 5,
		'bullets': 0.1,
		'energy cell': 0.2,
		'laser rifle': 5,
    'plasma rifle': 5,
		'bolas': 0.5,
	},

	// Inventory presentation is shared by the outfitting and world screens. Item
	// arrays run from the earliest unlock to the latest so stronger, later finds
	// can be displayed first without changing the underlying store data.
	InventoryCategories: ['armour', 'weapons', 'ammunition', 'supplies', 'other'],
	InventoryProgression: {
		'armour': ['l armour', 'i armour', 's armour', 'kinetic armour'],
		'weapons': ['bone spear', 'iron sword', 'steel sword', 'rifle', 'bayonet', 'bolas', 'grenade', 'laser rifle', 'energy blade', 'disruptor', 'plasma rifle'],
		'ammunition': ['bullets', 'energy cell'],
		'supplies': ['water', 'cured meat', 'medicine', 'hypo', 'stim'],
		'other': ['torch', 'charm', 'alien alloy', 'glowstone']
	},
	InventoryIcons: {
		'armour': '\u25c7',
		'weapons': '\u2020',
		'ammunition': '\u00b7',
		'supplies': '+',
		'other': '\u2026'
	},
		
	name: 'Path',
	options: {}, // Nuthin'
	init: function(options) {
		this.options = $.extend(
			this.options,
			options
		);
		
		// Init the World
		World.init();
		
		// Create the path tab
		this.tab = Header.addLocation(_("A Dusty Path"), "path", Path);
		
		// Create the Path panel
		this.panel = $('<div>').attr('id', "pathPanel")
			.addClass('location')
			.appendTo('div#locationSlider');

		this.scroller = $('<div>').attr('id', 'pathScroller').appendTo(this.panel);
		
		// Add the outfitting area
		var outfitting = $('<div>').attr({'id': 'outfitting', 'data-legend': _('supplies:')}).appendTo(this.scroller);
		$('<div>').attr('id', 'bagspace').appendTo(outfitting);
		
		// Add the embark button
		new Button.Button({
			id: 'embarkButton',
			text: _("embark"),
			click: Path.embark,
			width: '80px',
			cooldown: World.DEATH_COOLDOWN
		}).appendTo(this.scroller);
		
		Path.outfit = $SM.get('outfit');
		
		Engine.updateSlider();
		
		//subscribe to stateUpdates
		$.Dispatch('stateUpdate').subscribe(Path.handleStateUpdates);
	},
	
	openPath: function() {
		Path.init();
		Engine.event('progress', 'path');
		Notifications.notify(Room, _('the compass points ' + World.dir));
	},
	
	getWeight: function(thing) {
		var w = Path.Weight[thing];
		if(typeof w != 'number') w = 1;
		
		return w;
	},

	getInventoryCategory: function(thing, store) {
		for(var category in Path.InventoryProgression) {
			if(Path.InventoryProgression[category].indexOf(thing) >= 0) return category;
		}
		// Any future combat consumable marked as a weapon belongs with weapons.
		return store && store.type == 'weapon' ? 'weapons' : 'other';
	},

	getInventoryRank: function(thing, category) {
		return Path.InventoryProgression[category].indexOf(thing);
	},

	getInventoryCategoryName: function(category) {
		var names = {
			'armour': _('armour'),
			'weapons': _('weapons'),
			'ammunition': _('ammunition'),
			'supplies': _('supplies'),
			'other': _('other')
		};
		return names[category];
	},

	createInventoryCategory: function(category) {
		var section = $('<div>').addClass('inventoryCategory').attr('data-category', category);
		$('<div>').addClass('inventoryCategoryTitle')
			.append($('<span>').addClass('inventoryCategoryIcon').attr('aria-hidden', 'true').text(Path.InventoryIcons[category]))
			.append(document.createTextNode(Path.getInventoryCategoryName(category)))
			.appendTo(section);
		$('<div>').addClass('inventoryCategoryItems').appendTo(section);
		return section;
	},

	getCurrentArmour: function() {
		if($SM.get('stores["kinetic armour"]', true) > 0) return { key: 'kinetic armour', name: _("kinetic") };
		if($SM.get('stores["s armour"]', true) > 0) return { key: 's armour', name: _("steel") };
		if($SM.get('stores["i armour"]', true) > 0) return { key: 'i armour', name: _("iron") };
		if($SM.get('stores["l armour"]', true) > 0) return { key: 'l armour', name: _("leather") };
		return null;
	},
	
	getCapacity: function() {
		if($SM.get('stores["cargo drone"]', true) > 0) {
			return Path.DEFAULT_BAG_SPACE + 100;
		} else if($SM.get('stores.convoy', true) > 0) {
			return Path.DEFAULT_BAG_SPACE + 60;
		} else if($SM.get('stores.wagon', true) > 0) {
			return Path.DEFAULT_BAG_SPACE + 30;
		} else if($SM.get('stores.rucksack', true) > 0) {
			return Path.DEFAULT_BAG_SPACE + 10;
		}
		return Path.DEFAULT_BAG_SPACE;
	},
	
	getFreeSpace: function() {
		var num = 0;
		if(Path.outfit) {
			for(var k in Path.outfit) {
				var n = Path.outfit[k];
				if(isNaN(n)) {
					// No idea how this happens, but I will fix it here!
					Path.outfit[k] = n = 0;
				}
				num += n * Path.getWeight(k);
			}
		}
		return Path.getCapacity() - num;
	},
	
	updatePerks: function(ignoreStores) {
		if($SM.get('character.perks')) {
			var perks = $('#perks');
			var needsAppend = false;
			if(perks.length === 0) {
				needsAppend = true;
				perks = $('<div>').attr({'id': 'perks', 'data-legend': _('perks')});
			}
			for(var k in $SM.get('character.perks')) {
				var id = 'perk_' + k.replace(' ', '-');
				var r = $('#' + id);
				if($SM.get('character.perks["'+k+'"]') && r.length === 0) {
					r = $('<div>').attr('id', id).addClass('perkRow').appendTo(perks);
					$('<div>').addClass('row_key').text(_(k)).appendTo(r);
					$('<div>').addClass('tooltip bottom right').text(Engine.Perks[k].desc).appendTo(r);
				}
			}
			
			if(needsAppend && perks.children().length > 0) {
				perks.prependTo(Path.panel);
			}
			
			if(!ignoreStores && Engine.activeModule === Path) {
				$('#storesContainer').css({top: perks.height() + 26 + Path._STORES_OFFSET + 'px'});
			}
		}
	},
	
	updateOutfitting: function() {
		var outfit = $('div#outfitting');
		
		if(!Path.outfit) {
			Path.outfit = {};
		}
		
		// Add the armour row
		var currentArmour = Path.getCurrentArmour();
		var armourKey = currentArmour && currentArmour.key;
		var aRow = $('#armourRow');
		if(armourKey && aRow.length === 0) {
			aRow = $('<div>').attr('id', 'armourRow').addClass('outfitRow').attr('data-item', armourKey);
			$('<div>').addClass('row_key').text(_('armour')).appendTo(aRow);
			$('<div>').addClass('row_val').text(currentArmour.name).appendTo(aRow);
			$('<div>').addClass('clear').appendTo(aRow);
		} else if(armourKey) {
			aRow.attr('data-item', armourKey);
			$('.row_val', aRow).text(currentArmour.name);
		} else {
			aRow.remove();
		}
		
		// Add the water row
		var wRow = $('#waterRow');
		if(wRow.length === 0) {
			wRow = $('<div>').attr('id', 'waterRow').addClass('outfitRow').attr('data-item', 'water');
			$('<div>').addClass('row_key').text(_('water')).appendTo(wRow);
			$('<div>').addClass('row_val').text(World.getMaxWater()).appendTo(wRow);
			$('<div>').addClass('clear').appendTo(wRow);
		} else {
			$('.row_val', wRow).text(World.getMaxWater());
		}
		
		var space = Path.getFreeSpace();
		var currentBagCapacity = 0;
		// Add the non-craftables to the craftables
		var carryable = $.extend({
			'cured meat': { type: 'tool', desc: _('restores') + ' ' + World.MEAT_HEAL + ' ' + _('hp') },
			'bullets': { type: 'tool', desc: _('use with rifle') },
			'grenade': {type: 'weapon' },
			'bolas': {type: 'weapon' },
			'laser rifle': {type: 'weapon' },
			'energy cell': {type: 'tool', desc: _('emits a soft red glow') },
			'bayonet': {type: 'weapon' },
			'charm': {type: 'tool'},
			'alien alloy': { type: 'tool' },
			'medicine': {type: 'tool', desc: _('restores') + ' ' + World.MEDS_HEAL + ' ' + _('hp') }
		}, Room.Craftables, Fabricator.Craftables);
		
		for(var k in carryable) {
			var store = carryable[k];
			var have = $SM.get('stores["'+k+'"]');
			var num = Path.outfit[k];
			num = typeof num == 'number' ? num : 0;
			if (have !== undefined) {
				if (have < num) { num = have; }
				$SM.set(k, num, true);
			}

			var row = $('div#outfit_row_' + k.replace(' ', '-'), outfit);
			if((store.type == 'tool' || store.type == 'weapon') && have > 0) {
				currentBagCapacity += num * Path.getWeight(k);
				if(row.length === 0) {
					row = Path.createOutfittingRow(k, num, store, store.name).appendTo(outfit);
				} else {
					$('div#' + row.attr('id') + ' > div.row_val > span', outfit).text(num);
					$('div#' + row.attr('id') + ' .tooltip .numAvailable', outfit).text(have - num);
				}
				if(num === 0) {
					$('.dnBtn', row).addClass('disabled');
					$('.dnManyBtn', row).addClass('disabled');
				} else {
					$('.dnBtn', row).removeClass('disabled');
					$('.dnManyBtn', row).removeClass('disabled');
				}
				if(num == have || space < Path.getWeight(k)) {
					$('.upBtn', row).addClass('disabled');
					$('.upManyBtn', row).addClass('disabled');
				} else {
					$('.upBtn', row).removeClass('disabled');
					$('.upManyBtn', row).removeClass('disabled');
				}
			} else if(have === 0 && row.length > 0) {
				row.remove();
			}
		}

		// Rebuild only the lightweight presentation wrappers. Existing rows keep
		// their handlers and tooltips while being grouped and progression-sorted.
		var rows = $('.outfitRow', outfit).detach().get();
		$('.inventoryCategory', outfit).remove();
		rows.sort(function(a, b) {
			var aKey = $(a).attr('data-item') || $(a).attr('key');
			var bKey = $(b).attr('data-item') || $(b).attr('key');
			var aCategory = Path.getInventoryCategory(aKey);
			var bCategory = Path.getInventoryCategory(bKey);
			var categoryDiff = Path.InventoryCategories.indexOf(aCategory) - Path.InventoryCategories.indexOf(bCategory);
			if(categoryDiff !== 0) return categoryDiff;
			return Path.getInventoryRank(bKey, bCategory) - Path.getInventoryRank(aKey, aCategory);
		});
		for(var c = 0; c < Path.InventoryCategories.length; c++) {
			var category = Path.InventoryCategories[c];
			var section = Path.createInventoryCategory(category);
			for(var r = 0; r < rows.length; r++) {
				var rowKey = $(rows[r]).attr('data-item') || $(rows[r]).attr('key');
				if(Path.getInventoryCategory(rowKey) == category) $(rows[r]).appendTo($('.inventoryCategoryItems', section));
			}
			if($('.outfitRow', section).length > 0) section.appendTo(outfit);
		}

		Path.updateBagSpace(currentBagCapacity);

	},

	updateBagSpace: function(currentBagCapacity) {
		// Update bagspace
		$('#bagspace').text(_('free {0}/{1}', Math.floor(Path.getCapacity() - currentBagCapacity) , Path.getCapacity()));

		if(Path.outfit['cured meat'] > 0) {
			Button.setDisabled($('#embarkButton'), false);
		} else {
			Button.setDisabled($('#embarkButton'), true);
		}

	},
	
	createOutfittingRow: function(key, num, store) {
		if(!store.name) store.name = _(key);
		var row = $('<div>').attr('id', 'outfit_row_' + key.replace(' ', '-')).addClass('outfitRow').attr({'key': key, 'data-item': key});
		$('<div>').addClass('row_key').text(store.name).appendTo(row);
		var val = $('<div>').addClass('row_val').appendTo(row);
		
		$('<span>').text(num).appendTo(val);
		$('<div>').addClass('upBtn').appendTo(val).click([1], Path.increaseSupply);
		$('<div>').addClass('dnBtn').appendTo(val).click([1], Path.decreaseSupply);
		$('<div>').addClass('upManyBtn').appendTo(val).click([10], Path.increaseSupply);
		$('<div>').addClass('dnManyBtn').appendTo(val).click([10], Path.decreaseSupply);
		$('<div>').addClass('clear').appendTo(row);
		
		var numAvailable = $SM.get('stores["'+key+'"]', true);
		var tt = $('<div>').addClass('tooltip bottom right').appendTo(row);

		if(store.type == 'weapon') {
			$('<div>').addClass('row_key').text(_('damage')).appendTo(tt);
			$('<div>').addClass('row_val').text(World.getDamage(key)).appendTo(tt);
		} else if(store.type == 'tool' && store.desc != "undefined") {
			$('<div>').addClass('row_key').text(store.desc).appendTo(tt);
		}

		$('<div>').addClass('row_key').text(_('weight')).appendTo(tt);
		$('<div>').addClass('row_val').text(Path.getWeight(key)).appendTo(tt);
		$('<div>').addClass('row_key').text(_('available')).appendTo(tt);
		$('<div>').addClass('row_val').addClass('numAvailable').text(numAvailable).appendTo(tt);
		
		return row;
	},
	
	increaseSupply: function(btn) {
		var supply = $(this).closest('.outfitRow').attr('key');
		Engine.log('increasing ' + supply + ' by up to ' + btn.data);
		var cur = Path.outfit[supply];
		cur = typeof cur == 'number' ? cur : 0;
		if(Path.getFreeSpace() >= Path.getWeight(supply) && cur < $SM.get('stores["'+supply+'"]', true)) {
			var maxExtraByWeight = Math.floor(Path.getFreeSpace() / Path.getWeight(supply));
			var maxExtraByStore  = $SM.get('stores["'+supply+'"]', true) - cur;
			Path.outfit[supply] = cur + Math.min(btn.data, maxExtraByWeight, maxExtraByStore);
			$SM.set('outfit['+supply+']', Path.outfit[supply]);
			Path.updateOutfitting();
		}
	},
	
	decreaseSupply: function(btn) {
		var supply = $(this).closest('.outfitRow').attr('key');
		Engine.log('decreasing ' + supply + ' by up to ' + btn.data);
		var cur = Path.outfit[supply];
		cur = typeof cur == 'number' ? cur : 0;
		if(cur > 0) {
			Path.outfit[supply] = Math.max(0, cur - btn.data);
			$SM.set('outfit['+supply+']', Path.outfit[supply]);
			Path.updateOutfitting();
		}
	},
	
	onArrival: function(transition_diff) {
		Path.setTitle();
		Path.updateOutfitting();
		Path.updatePerks(true);
		
		AudioEngine.playBackgroundMusic(AudioLibrary.MUSIC_DUSTY_PATH);

		Engine.moveStoresView($('#perks'), transition_diff);
	},
	
	setTitle: function() {
		document.title = _('A Dusty Path');
	},
	
	embark: function() {
		for(var k in Path.outfit) {
			$SM.add('stores["'+k+'"]', -Path.outfit[k]);
		}
		World.onArrival();
		$('#outerSlider').animate({left: '-700px'}, 300);
		Engine.activeModule = World;
		AudioEngine.playSound(AudioLibrary.EMBARK);
	},
	
	handleStateUpdates: function(e){
		if(e.category == 'character' && e.stateName.indexOf('character.perks') === 0 && Engine.activeModule == Path){
			Path.updatePerks();
		} else if(e.category == 'income' && Engine.activeModule == Path){
			Path.updateOutfitting();
		}
	}
};
