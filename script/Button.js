var Button = {
	Button: function(options) {
		if(typeof options.cooldown == 'number') {
			this.data_cooldown = options.cooldown;
		}
		this.data_remaining = 0;
		if(typeof options.click == 'function') {
			this.data_handler = options.click;
		}

		var el = $('<div>')
			.attr('id', typeof(options.id) != 'undefined' ? options.id : "BTN_" + Engine.getGuid())
			.addClass('button')
			.text(typeof(options.text) != 'undefined' ? options.text : "button")
			.click(function() {
				if(!$(this).hasClass('disabled')) {
					Button.cooldown($(this));
					$(this).data("handler")($(this));
				}
			})
			.data("handler",  typeof options.click == 'function' ? options.click : function() { Engine.log("click"); })
			.data("remaining", 0)
			.data("cooldown", typeof options.cooldown == 'number' ? options.cooldown : 0)
			.data('boosted', options.boosted ?? (() => false));

		if(options.action) {
			el.addClass('actionButton');
		}

		if(options.entity) {
			el.attr('data-entity', options.entity).addClass('hasEntityDescription');
		}

		el.append($("<div>").addClass('cooldown'));

		// waiting for expiry of residual cooldown detected in state
		Button.cooldown(el, 'state');

		if(options.cost || (options.entity && EntityDescriptions.get(options.entity))) {
			var ttPos = options.ttPos ? options.ttPos : "bottom right";
			var costTooltip = $('<div>').addClass('tooltip costTooltip entityTooltip ' + ttPos);
			EntityDescriptions.addToTooltip(costTooltip, options.entity);
			for(var k in (options.cost || {})) {
				$("<div>").addClass('row_key').text(EntityDescriptions.name(k)).appendTo(costTooltip);
				$("<div>").addClass('row_val').text(options.cost[k]).appendTo(costTooltip);
			}
			if(costTooltip.children().length > 0) {
				costTooltip.appendTo(el);
			}
		}

		if(options.width) {
			el.css('width', options.width);
		}

		return el;
	},

	saveCooldown: true,

	getCostRows: function(cost) {
		var rows = [];
		for(var resource in (cost || {})) {
			var have = $SM.get('stores["' + resource + '"]', true);
			have = typeof have === 'number' && !isNaN(have) ? Math.floor(have) : 0;
			var need = Number(cost[resource]) || 0;
			rows.push({
				resource: resource,
				have: have,
				need: need,
				missing: Math.max(0, need - have),
				enough: have >= need
			});
		}
		return rows;
	},

	canAfford: function(cost) {
		var rows = Button.getCostRows(cost);
		for(var i = 0; i < rows.length; i++) {
			if(!rows[i].enough) return false;
		}
		return true;
	},

	updateCostTooltip: function(btn, options) {
		if(!btn || btn.length === 0) return;
		options = options || {};
		var tooltip = btn.children('div.tooltip').first();
		if(tooltip.length === 0) {
			tooltip = $('<div>').addClass('tooltip costTooltip bottom right').appendTo(btn);
		}

		tooltip.empty().addClass('costTooltip entityTooltip').attr('data-entity', options.entity || '');
		EntityDescriptions.addToTooltip(tooltip, options.entity);

		if(options.status) {
			$('<div>')
				.addClass('tooltipStatus state-' + (options.state || 'blocked'))
				.text(EntityDescriptions.ui('status') + ': ' + options.status)
				.appendTo(tooltip);
		}
		if(options.reason) {
			$('<div>')
				.addClass('tooltipReason')
				.text(EntityDescriptions.ui('reason') + ': ' + options.reason)
				.appendTo(tooltip);
		}

		if(!options.hideCost) {
			var rows = Button.getCostRows(options.cost);
			if(rows.length > 0) {
				$('<div>').addClass('tooltipCostTitle').text(EntityDescriptions.ui('cost')).appendTo(tooltip);
				for(var i = 0; i < rows.length; i++) {
					var row = rows[i];
					var costRow = $('<div>')
						.addClass('costRow ' + (row.enough ? 'sufficient' : 'missing'))
						.appendTo(tooltip);
					$('<span>').addClass('costResource').text(EntityDescriptions.name(row.resource) + ':').appendTo(costRow);
					$('<span>').addClass('costAmounts').text(EntityDescriptions.ui('haveNeed', row.have, row.need)).appendTo(costRow);
					$('<span>')
						.addClass('costResult')
						.text(row.enough ? '✓ ' + EntityDescriptions.ui('enough') : EntityDescriptions.ui('missingCount', row.missing))
						.appendTo(costRow);
				}
			}
		}
		if(btn.is(':hover') || btn.is(':focus')) {
			EntityDescriptions.positionTooltip(btn);
		}
	},

	setState: function(btn, state, label) {
		if(!btn || btn.length === 0) return;
		btn
			.removeClass('state-ready state-blocked state-complete')
			.addClass('statefulButton state-' + state)
			.attr({
				role: 'button',
				tabindex: 0,
				'aria-disabled': state === 'ready' ? 'false' : 'true'
			});

		var stateLabel = btn.children('.buttonState');
		if(stateLabel.length === 0) {
			stateLabel = $('<span>').addClass('buttonState').appendTo(btn);
		}
		stateLabel.text(label || '');
		Button.setDisabled(btn, state !== 'ready');

		btn.off('keydown.buttonState').on('keydown.buttonState', function(e) {
			if((e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) && !$(this).hasClass('disabled')) {
				e.preventDefault();
				$(this).trigger('click');
			}
		});
	},

	setDisabled: function(btn, disabled) {
		if(btn) {
			if(!disabled && !btn.data('onCooldown')) {
				btn.removeClass('disabled');
			} else if(disabled) {
				btn.addClass('disabled');
			}
			btn.data('disabled', disabled);
		}
	},

	isDisabled: function(btn) {
		if(btn) {
			return btn.data('disabled') === true;
		}
		return false;
	},

	cooldown: function(btn, option) {
		var cd = btn.data("cooldown");
		if (btn.data('boosted')()) {
			cd /= 2;
		}
		var id = 'cooldown.'+ btn.attr('id');
		if(cd > 0) {
			if(typeof option == 'number') {
				cd = option;
			}
			// param "start" takes value from cooldown time if not specified
			var start, left;
			switch(option){
				// a switch will allow for several uses of cooldown function
				case 'state':
					if(!$SM.get(id)){
						return;
					}
					start = Math.min($SM.get(id), cd);
					left = (start / cd).toFixed(4);
					break;
				default:
					start = cd;
					left = 1;
			}
			Button.clearCooldown(btn);
			if(Button.saveCooldown){
				$SM.set(id,start);
				// residual value is measured in seconds
				// saves program performance
				btn.data('countdown', Engine.setInterval(function(){
					$SM.set(id, $SM.get(id, true) - 0.5, true);
				},500));
			}
			var time = start;
			var gameSpeed = Engine.getGameSpeed();
			if(gameSpeed > 1) {
				time /= gameSpeed;
			}
			$('div.cooldown', btn).width(left * 100 +"%").animate({width: '0%'}, time * 1000, 'linear', function() {
				Button.clearCooldown(btn, true);
			});
			btn.addClass('disabled');
			btn.data('onCooldown', true);
		}
	},

	rescaleCooldowns: function(speed) {
		$('.button').each(function() {
			var btn = $(this);
			if(!btn.data('onCooldown')) return;

			var remaining = $SM.get('cooldown.' + btn.attr('id'), true);
			if(typeof remaining !== 'number' || remaining <= 0) return;

			var cooldown = $('div.cooldown', btn);
			cooldown.stop(true, false).animate(
				{width: '0%'},
				(remaining * 1000) / speed,
				'linear',
				function() {
					Button.clearCooldown(btn, true);
				}
			);
		});
	},

	clearCooldown: function(btn, cooldownEnded) {
		var ended = cooldownEnded || false;
		if(!ended){
			$('div.cooldown', btn).stop(true, true);
		}
		btn.data('onCooldown', false);
		if(btn.data('countdown')){
			Engine.clearInterval(btn.data('countdown'));
			$SM.remove('cooldown.'+ btn.attr('id'));
			btn.removeData('countdown');
		}
		if(!btn.data('disabled')) {
			btn.removeClass('disabled');
		}
	}
};
