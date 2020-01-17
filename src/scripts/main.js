app = {
	dom: {
		$window: $(window)
	},
	animationBetweenDelay: 0.25,
	swiperDefaultSettings: {
		slidesPerView: 1,
		followFinger: false,
		init: false,
		speed: 1000
	}
};

app.swiperInitSplittyInside = function (swiper, callback) {
	var $el = $(swiper.$el);
	var $slides = $el.find('[data-home-banner-slide]');
	$slides.each(function() {
		$(this).removeClass('_parsed').addClass('_parsing');
	});

	// Разбиваем строки на элементы в слайдах свайпера, создавая им дополнительную вложенность
	// (необходимо для анимации выезжания 'из под шторки')
	$el.find('[data-splitty-swiper-title]').splitty({
		additionalNesting: true
	});

	// Разбиваем строки на элементы внутри слайдов свайпера
	$el.find('[data-splitty-swiper]').splitty({
		onInit: function () {
			app.parseAnimateDelayed();

			setTimeout(function() {
				$slides.each(function() {
					$(this).removeClass('_parsing').addClass('_parsed');
				});
			}, 300);
		}
	});

	typeof callback === 'function' && callback();
};

app.checkScrollTopForFirstScreen = function () {
	// Проверяем, находится ли первый экран главной страницы в зоне видимости экрана
	// пользователя при загрузке страницы
	var currentWindowScroll = app.dom.$window.scrollTop();
	var firstScreenHeight = $('[data-waypoint="mp_first"]').height();

	return currentWindowScroll <= firstScreenHeight;
};

app.addSplittyDelay = function ($item, delay, callback) {
	// Устанавливаем задержку в data-атрибут переданного элемента
	$item.attr('data-animate-delayed', delay);

	typeof callback === 'function' && callback({
		delay: delay,
		element: $item
	});
};

app.firstSplittyInit = function () {
	// Устанавливаем задержку на появление элементов,
	// если первый экран главной страницы находится в зоне видимости пользователя
	if ( app.checkScrollTopForFirstScreen() ) {
		var elements = [
			{
				$element: $('[data-animate-delayed-target="firstTitle"]'),
				delay: 0
			},
			{
				$element: $('[data-animate-delayed-target="firstText"]'),
				delay: 0.6
			},
			{
				$element: $('[data-animate-delayed-target="header"]'),
				delay: 0
			},
			{
				$element: $('[data-animate-delayed-target="firstCounter"]'),
				delay: 1
			},
			{
				$element: $('[data-animate-delayed-target="firstIconSearch"]'),
				delay: 1.25
			},
			{
				$element: $('[data-animate-delayed-target="firstIconArrow"]'),
				delay: 1.25
			},
			{
				$element: $('[data-animate-delayed-target="firstIconArrowWrapper"]'),
				delay: 0.65
			}
		];

		// Устанвливаем всем элементам в массиве задержку (animate-delay),
		// которая указана в атрибуте 'data-animate-delayed'
		for (var i=0; i < elements.length; i++) {
			app.addSplittyDelay(elements[i].$element, elements[i].delay, function() {
				elements[i].$element.removeAttr('data-wow-delay');
				app.parseAnimateDelayed(elements[i].$element);
			});
		}

		// Обнуляем animation-delay у элементов
		function resetElementsDelays () {
			for (var i=0; i < elements.length; i++) {
				app.parseAnimateDelayed(elements[i].$element);
			}
		}

		// После отработки всех анимаций, удаляем у элементов задержки
		setTimeout(function() {
			for (var i=0; i < elements.length; i++) {
				var $current = elements[i].$element;
				var delayedTarget = $current.attr('data-animate-delayed-target');

				if (delayedTarget === 'firstTitle') {
					$current.find('p, span').css({
						'animation-delay': ''
					});
				}

				$current.attr('data-animate-delayed', '').css({
					'animation-delay': ''
				});
				$current.find('.animated').css({
					'animation-delay': ''
				});
			}

			resetElementsDelays();
		}, 6000);
	}

	app.parseAnimateDelayed();
};

app.parseAnimateDelayed = function ($elem, reverse) {
	// Добавляем ступенчатую задержку элементам
	// (увеличиваем задеркжу появления следующего элемента в цикле
	// на значение в app.animationBetweenDelay, либо 0
	var $this = $elem || $('[data-animate-delayed]');

	if ($this) {
		$this.each(function(i, element){
			var dataAnimateDelayed = parseFloat($(element).attr('data-animate-delayed'));

			var $animateChildren = $(element).find('p, span');

			var $parseTarget = $animateChildren.length > 0 ? $animateChildren : $(element);

			var defaultAnimationDelay = reverse ? ($parseTarget.length - 1) * app.animationBetweenDelay : 0;
			var animationDelay = typeof dataAnimateDelayed === 'number' && (dataAnimateDelayed + defaultAnimationDelay) || defaultAnimationDelay;

			$parseTarget.each(function() {
				// Add transition-delay
				$(this).css({
					'animation-delay': animationDelay + 's'
				});

				// Reduce current transition step
				animationDelay += (reverse ? -1 : 1) * app.animationBetweenDelay;
			});
		});
	}
};

app.animateCSS = function (element, animationName, callback, offTimeout, removeAnimationClass) {
	// Функция воспроизведения анимации 'animationName' для элемента 'element'
	var $node = $(element);

	// Хак для IE, для корректной отработки анимаций
	if (app.isIE()) {
		$node.addClass('hidden').removeClass('animated').removeClass(animationName);
		setTimeout(function() {
			$node.removeClass('hidden').addClass('animated').addClass(animationName);
		}, 0);
	} else {
		$node.addClass('animated').addClass(animationName);
	}

	// Удаляем присвоенные элементу свойства после окончания анимации
	function handleAnimationEnd() {
		setTimeout(function () {
			if (removeAnimationClass) {
				$node.removeClass('animated').removeClass(animationName);
			}
			$node.off('animationend', handleAnimationEnd);
		}, offTimeout || 0);

		if (typeof callback === 'function') callback();
	}

	$node.on('animationend', handleAnimationEnd);
};

app.isIE = function () {
	// Проверка браузера пользователя на IE
	var userAgent = window.navigator.userAgent.toLowerCase();

	if ((/trident/gi).test(userAgent) || (/msie/gi).test(userAgent)) {
		return true;
	}

	return false;
};

app.stickyScroller = function () {
	// обертка, внутри которой будет работать блок sticky
	var $stickyScrollerParent = $('[data-sticky-scroller]');
	if ($stickyScrollerParent.length) {
		// блок, который ведет себя как sticky
		var $stickyScrollerBlock = $stickyScrollerParent.find('[data-sticky-scroller-block]');
		// внутрення галарея, которая прокручивается при скроле
		var $stickyScrollerGallery = $stickyScrollerBlock.find('[data-sticky-scroller-gallery]');
		var stickyScrollerGalleryWidth = $stickyScrollerGallery[0].scrollWidth; // ширина галереи
		var headerHeight = $('[data-header]').height(); // высота шапки сайта

		// выставляем высоту для нашего блока со стики исходя из ширины галереи
		function updateScrollerHeight () {
			$stickyScrollerParent.height(stickyScrollerGalleryWidth + $stickyScrollerBlock.outerHeight()).css({
				position: 'relative'
			});
		}

		app.dom.$window.on('resize', function() {
			updateScrollerHeight();
		});
		updateScrollerHeight();

		// вводим состояние sticky блока
		var state = 'top'; // [top, bottom, fixed]

		// функция для вычисления положения sticky блока, смешения галереи и установки нужных css
		// вызовается при скроле и ресайзе
		function update () {
			// верхний отступ, чтобы блок был по середине экрана с учетом шапки
			var offsetTop = (app.dom.$window.height() - headerHeight - $stickyScrollerBlock.height()) / 2 + headerHeight;
			// положение обуртки сники во viewport
			var parentRect = $stickyScrollerParent[0].getBoundingClientRect();

			// если обертка ниже верхнего отступа, то фиксируем sticky вверху блока
			if (parentRect.top > offsetTop) {
				// не выполняем ничего, если состояние sticky не изменялось
				if(state !== 'top') {
					state = 'top';
					$stickyScrollerBlock.css({
						position: 'absolute',
						top: 0,
						width: '100%',
						bottom: 'auto'
					});
				}
			// если расстояние до нижней границы больше больше, чем высота sticky блока + смещение, то закрепляем по середине экрана
			} else if (parentRect.bottom > $stickyScrollerBlock.outerHeight() + offsetTop) {
				if(state !== 'fixed') {
					state = 'fixed';
					$stickyScrollerBlock.css({
						position: 'fixed',
						width: $stickyScrollerParent.width() + 'px',
						top: offsetTop + 'px',
						bottom: 'auto'
					});
				}
			// в остальных случаях закрепляем sticky в нижней границы обертки
			} else {
				if(state !== 'bottom') {
					state = 'bottom';
					$stickyScrollerBlock.css({
						position: 'absolute',
						top: 'auto',
						bottom: 0,
						width: '100%'
					});
				}
			}

			// вычисляем смещение галереи во время скрола
			var RATIO = (-parentRect.top + offsetTop) / ($stickyScrollerParent.height() - $stickyScrollerBlock.outerHeight());

			RATIO = Math.max(0, Math.min(RATIO, 1));

			var scrollLeft = -RATIO * (stickyScrollerGalleryWidth - $stickyScrollerGallery.width());
			$stickyScrollerGallery.css({
				transform: 'translateX('+scrollLeft+'px)'
			});
		}

		app.dom.$window.on('scroll resize', update);
		update();
	}
};

app.splitty = function () {
	// Разбиваем все строки с атрибутом 'data-splitty' на несколько элементов
	// в случае, если элемент не умещается в ширину родителя и текст переносится на новую строку
	$('[data-splitty]').splitty({
		parseTimeout: 0,
		resizeDelay: 300,
		onReinit: function() {
			app.parseAnimateDelayed();
		},
		onInit: function() {
			app.firstSplittyInit();
			setTimeout(function() {
				app.wow();
			}, 1500);
		},
		reinitOnResize: true
	});
	$('[data-splitty-title]').splitty({
		parseTimeout: 0,
		resizeDelay: 300,
		additionalNesting: true,
		onReinit: function() {
			app.parseAnimateDelayed();
		},
		onInit: function() {
			app.parseAnimateDelayed();
		},
		reinitOnResize: true
	});
};

app.smoothScroll = function () {
	// Плавный скролл к блоку с якорем
	var $smoothScroll = $('[data-smooth-scroll]');
	var scrollSpeed = 700;

	$smoothScroll.each(function (i, e) {
		var $this = $(this);
		var getId = $(e).data('smooth-scroll-to');
		var $target = $('[data-smooth-scroll-target=' + getId + ']');

		$this.on('click', function () {
			$('html, body').animate({
				scrollTop: $target.offset().top
			}, scrollSpeed);
		});
	});
};

app.highcharts = function () {
	// Инициализация графика Highcharts на страницах
	var $highcharts = $('[data-highcharts]');

	function renderChart (data, chart) {
		var currentId = $(chart).data('highcharts-id');

		return Highcharts.chart($('[data-highcharts-id="'+currentId+'"]')[0], {
			chart: {
				zoomType: 'x',
				backgroundColor: null,
				events: {
					load: function() {
						var $highchartsTab = $('[data-highcharts-tab="'+currentId+'"]');
						var highchartsChartIndex = $(this.renderTo).data('highcharts-chart');
						var _this = this;
						var addSeriesToChart = function() {
							_this.series[0].remove();
							_this.addSeries({
								data: data,
								type: 'area',
								name: 'руб.'
							});
						};

						if(highchartsChartIndex === 0) {
							addSeriesToChart();
						}

						$highchartsTab.on('click', function() {
							addSeriesToChart();
						});

						var waypointIsDone = false;
						$(this.renderTo).waypoint({
							offset: '100%',
							handler: function(dir) {
							    if (dir === 'down') {
							    	if (!waypointIsDone) {
										setTimeout(function() {
											addSeriesToChart();
											waypointIsDone = true;
										}, 300);
									}
								}
							}
						});

						$(this.renderTo).waypoint({
							offset: '-30%',
							handler: function() {
								if (!waypointIsDone) {
									setTimeout(function() {
										addSeriesToChart();
										waypointIsDone = true;
									}, 300);
								}
							}
						});
					}
				}
			},
			tooltip: {
				backgroundColor: '#333333',
				borderRadius: 4,
				borderWidth: 1,
				borderColor: 'transparent',
				padding: 0,
				shadow: false,
				useHTML: true,
				formatter: function (e) {
					var getPrice = this.y;
					var getName = this.series.userOptions.name;
					var getDate = Highcharts.dateFormat('%d.%m.%Y • %H:%M', this.x);

					return '<div class="highcharts-tooltip__parent">' +
                    '<div class="highcharts-tooltip__row">' +
                    '<div class="highcharts-tooltip__title">' +
                    '<span>Стоимость</span>' +
                    '</div>' +
                    '<div class="highcharts-tooltip__text">' +
                    '<span>'+getPrice+' '+'<b>'+getName+'</b>'+'</span>' +
                    '</div>' +
                    '</div>' +
                    '<div class="highcharts-tooltip__separator"></div>'	+
                    '<div class="highcharts-tooltip__row">' +
                    '<div class="highcharts-tooltip__title">' +
                    '<span>Данные на</span>' +
                    '</div>' +
                    '<div class="highcharts-tooltip__text">' +
                    '<span><b>'+getDate+'</b></span>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
				},
				style: {
					color: '#ffffff'
				}
			},
			credits: {
				enabled: false
			},
			exporting: {
				enabled: false
			},
			title: {
				text: ''
			},
			subtitle: {
				text: ''
			},
			xAxis: {
				type: 'datetime',
				labels: {
					style: {
						fontSize: '15px',
						lineHeight: '28px',
						color: '#999999',
						fontWeight: 500,
						fontFamily: 'Gilroy'
					}
				},
				offset: 24,
				lineWidth: 0,
				tickWidth: 0
			},
			yAxis: {
				title: {
					text: ''
				},
				opposite: true,
				labels: {
					style: {
						fontSize: '15px',
						lineHeight: '28px',
						color: '#999999',
						fontWeight: 500,
						fontFamily: 'Gilroy'
					}
				},
				offset: 30,
				lineWidth: 0,
				tickWidth: 0
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				animation: {
					duration: 1000
				},
				area: {
					fillOpacity: 0.1,
					fillColor: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, 'rgba(0, 142, 206, 0.1)'],
							[1, 'rgba(0, 142, 206, 0)']
						]
					},
					marker: {
						radius: 2
					},
					lineWidth: 1,
					states: {
						hover: {
							lineWidth: 1
						}
					},
					threshold: null
				},
				series: {
					states: {
						hover: {
							halo: {
								opacity: 0,
								size: 0
							}
						}
					},
					marker: {
						enabled: false,
						states: {
							hover: {
								radius: 6,
								fillColor: '#3F91CD',
								lineWidthPlus: 4,
								lineColor: '#ffffff'
							}
						}
					}
				}
			},
			series: [{
				type: 'area',
				name: 'руб.',
				data: data
			}]
		});
	}

	$highcharts.each(function(i, e){
		if (typeof Highcharts !== 'undefined') {
			Highcharts.setOptions({
				lang: {
					months: ['Январь', 'Февраль', 'Март', 'Апрель',
						'Май', 'Июнь', 'Июль', 'Август',
						'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
					weekdays: ['Воскресенье', 'Понедельник', 'Вторник',
						'Среда', 'Четверг', 'Пятница', 'Суббота'],
					shortMonths: ['Январь', 'Февраль', 'Март', 'Апрель',
						'Май', 'Июнь', 'Июль', 'Август',
						'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
				}
			});
			Highcharts.getJSON(
				'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/usdeur.json',
				function (data) {
					renderChart(data, e);
				}
			);
		}
	});
};

app.wow = function () {
	// Плагин, который отыгрывает анимацию,
	// при появлении элемента на экране пользователя
	new WOW({
		resetAnimation: true,
		offset: app.dom.$window.height()*20/100,
		callback: function(box) {
			if ($(box).attr('data-wow-animation') && !$(box).attr('data-product-title')) {
				var animationName = $(box).attr('data-wow-animation');
				app.animateCSS($(box), animationName, function() {
					$(box).removeAttr('data-wow-animation').removeClass('wow').css({
						visibility: ''
					});
				}, 300);
			}
		}
	}).init();
};

app.revealBlockOnReset = function () {
	var $box = $('[data-product-wrapper]');
	$box.waypoint({
		handler: function () {
			$('[data-product-slide], [data-product-title], [data-product-button]').each(function () {
				var $this = $(this);
				var name = $this.attr('data-wow-animation');
				var delay = $this.attr('data-wow-delay');

				if (app.isIE()) {
					$this.css({
						'animation-delay': delay
					});
				}

				app.animateCSS($this, name, function() {
					console.log('Element:', $this);
					$this.removeAttr('data-wow-animation').removeClass('hidden').css({
						visibility: ''
					});
				}, 300);
			});
		},
		offset: '50%'
	});
};

app.openPopup = function () {
	var $popup = $('[data-open-popup]');
	$popup.magnificPopup({
		type: 'inline',
		midClick: true,
		// Delay in milliseconds before popup is removed
		removalDelay: 300,
		// Class that is added to popup wrapper and background
		// make it unique to apply your CSS animations just to this exact popup
		mainClass: 'mfp-fade'
	});
	// dev mode
	// $popup.click();
};

app.menu = function () {
	var $menu = $('[data-menu]');
	var $menuButton = $('[data-menu-button]');
	var $menuClose = $('[data-menu-close]');
	var $menuSubnav = $('[data-menu-subnav]');
	var $menuNav = $('[data-menu-nav]');

	var activeClass = '_active';
	var menuOpen = false;

	function renderMenu () {
		var elements = [
			{
				$element: $('[data-animate-delayed-target="menuHeader"]'),
				delay: 0.55
			},
			{
				$element: $('[data-animate-delayed-target="menuSeparator"]'),
				delay: 0.55
			},
		];

		setDelayOnNav('menuNavLink', 2);
		setDelayOnNav('menuBottomNavLink', 3);

		for (var i=0; i < elements.length; i++) {
			app.addSplittyDelay(elements[i].$element, elements[i].delay, function() {
				app.parseAnimateDelayed(elements[i].$element);
			});
		}
	}

	function closeMenu () {
		$('[data-menu-animate]').css({'animation-delay': ''});
	}

	function clearStylesAndStates () {
		$menuNav.removeClass(activeClass);
		$menuSubnav.stop().hide();
	}

	function restartAnimation (direction) {
		if (direction === undefined || !direction) {
			direction = 'in';
		}

		var $menuAnimate = $('[data-menu-animate]');

		$menuAnimate.each(function() {
			var $this = $(this);
			var $menuAnimateIn = $this.data('menu-animate-in') || 'fadeIn';
			var $menuAnimateOut = $this.data('menu-animate-out') || 'fadeOut';

			if (!$this.hasClass('animated')){
				$this.addClass('animated');
			}

			if (direction === 'in') {
				$this.removeClass($menuAnimateOut);
				$this.removeClass($menuAnimateIn);
				setTimeout(function() {
					$this.addClass($menuAnimateIn);
				}, 0);
			} else if (direction === 'out') {
				$this.removeClass($menuAnimateIn);
				$this.removeClass($menuAnimateOut);
				setTimeout(function() {
					$this.addClass($menuAnimateOut);
				}, 0);
			}
		});
	}

	function setDelayOnNav (delayedTargetName, delay) {
		var defaultMenuNavLinkDelay = 0.4 || delay;

		$('[data-animate-delayed-target="'+delayedTargetName+'"]').each(function(index) {
			var $this = $(this);
			var $children = $this.children('p, span');

			$children.each(function() {
				$(this).css({
					'animation-delay': (defaultMenuNavLinkDelay + (index * 0.08)) + 's'
				});
			});
		});

	}
	function menuSubnavItemsDelay (delay){
		var defaulMenuSubnavItemsDelay = delay ?  0.7 : 0;
		$menuSubnav.each(function () {
			var $this = $(this);
			var $children = $this.find('p, span');

			$children.each(function(index) {
				$(this).css({
					'animation-delay': (defaulMenuSubnavItemsDelay + (index * 0.05)) + 's'
				});
			});
		});
	}

	$menuButton.on('click', function() {
		menuSubnavItemsDelay(true);
		$('[data-menu-subnav]').hide(0);
		restartAnimation('in');

		app.animateCSS($menu, 'slideInRightMenu', null, null, 'slideOutRightMenu');
		setTimeout(function() {
			$menu.addClass(activeClass);
		}, 700);

		renderMenu();
		$menuNav.first().trigger('mouseenterEmulate');

	});

	$menuClose.on('click', function() {
		menuOpen = false;
		$menu.addClass('_close');
		closeMenu();
		app.animateCSS($menu, 'slideOutRightMenu', function() {
			$menu.removeClass(activeClass);
		}, null, 'slideInRightMenu');
		clearStylesAndStates();
		setTimeout(function() {
			$menuSubnav.stop().show(0);
			$menu.removeClass('_close');
		}, 600);
	});

	$menuNav.on('mouseenter mouseenterEmulate', function() {
		var $this = $(this);
		if($this.hasClass('_active')){
			return false;
		}
		if (menuOpen){
    		menuSubnavItemsDelay();
		}
		menuOpen = true;
		var $menuNavActive = $menuNav.filter('._active');
		var $subnavActive = $('[data-menu-subnav="'+$menuNavActive.data('menu-nav')+'"]');
		var getId = $this.data('menu-nav');
		var $getSubnav = $('[data-menu-subnav="'+getId+'"]');
		if($subnavActive.length){
			$subnavActive.addClass('_close');
			setTimeout(function () {
				$subnavActive.removeClass('_close');

				clearStylesAndStates();
				$this.addClass(activeClass);
				$getSubnav.stop().addClass('_active').show();
			},600);
		}else if($getSubnav.length){
			clearStylesAndStates();
			$getSubnav.stop().addClass('_active').show();
			$this.addClass(activeClass);
		}else{
			clearStylesAndStates();
			$this.addClass(activeClass);
		}
	});
};

app.fade = function () {
	// Появляющиеся при клике на кнопку скрытые блоки
	var init = function (){
		var $fadeElements = $('[data-fade-block], [data-fade-layout]');

		$fadeElements.each(function(i, e) {
			if ($(e).data('menu')) {
				return;
			}

			var dataAttrs = ['fade-in-effect', 'fade-speed'];

			$(dataAttrs).each(function(dataIndex, dataElem) {
				if($(e).data(dataElem)){
					$(e).addClass( $(e).data(dataElem)+' ' );
				}
			});
		});
	};
	init();

	// Запуск анимации на элементах с атрибутом 'data-fade-animate'
	// со стандартными свойствами
	var addClassToAnimatedBlocks = function (inst) {
		var $fadeAnimate = $(inst).find('[data-fade-animate]');
		if (!$fadeAnimate.hasClass('animated')) {
			$fadeAnimate.addClass('animated');
		}
	};

	// Обработка всех кнопок, при клике на которые появляются связанные с ними блоки
	var $fadeButton = $('[data-fade-button]');
	$fadeButton.each(function () {
		var $this = $(this);

		$this.on('click', function (e) {
			e.preventDefault();

			var $fadeName = $this.data('fade-button');
			var $fadeBlock = $('[data-fade-block="' + $fadeName + '"]'),
				$fadeBlockInEffect = $fadeBlock.data('fade-in-effect') || 'slideInRight',
				$fadeBlockOutEffect = $fadeBlock.data('fade-out-effect') || 'slideOutRight';
			var $fadeClose = $('[data-fade-close="' + $fadeName + '"]');
			var $fadeLayout = $('[data-fade-layout="' + $fadeName + '"]'),
				$fadeLayoutInEffect = $fadeLayout.data('fade-in-effect') || 'fadeIn',
				$fadeLayoutOutEffect = $fadeLayout.data('fade-out-effect') || 'fadeOut';

			var toggleBodyOverflow = function (par) {
				var $body = $('body');

				if (par) {
					$body.css('overflow', par);
				} else {
					if ($body.css('overflow') === 'hidden') {
						$body.css({
							overflow: 'visible'
						});
					} else {
						$body.css({
							overflow: 'hidden'
						});
					}
				}
			};

			$fadeBlock.stop().show(0, function() {
				var animationDuration = 1000;

				//- start IE11 animation hack
				$fadeBlock.hide(0).removeClass($fadeBlockInEffect);
				//- end
				setTimeout(function() {
					//- start IE11 animation hack
					$fadeBlock.show(0).addClass($fadeBlockInEffect);
					//- end
				}, 0);

				setTimeout(function() {
					addClassToAnimatedBlocks($fadeBlock);

					toggleBodyOverflow();
				}, animationDuration);
			});

			$fadeLayout.stop().show();

			$fadeLayout.on('click', function () {
				$fadeClose.trigger('click');
			});

			$fadeClose.on('click', function (e) {
				e.preventDefault();

				$fadeLayout.removeClass($fadeLayoutInEffect).addClass($fadeLayoutOutEffect);
				$fadeBlock.removeClass($fadeBlockInEffect).addClass($fadeBlockOutEffect);

				setTimeout(function () {
					toggleBodyOverflow('visible');
					$fadeBlock.stop().hide().removeClass($fadeBlockOutEffect).addClass($fadeBlockInEffect);
					$fadeLayout.stop().hide().removeClass($fadeLayoutOutEffect).addClass($fadeLayoutInEffect);
				}, 1000);
			});
		});
	});
};

app.collapse = function () {
	var $collapse = $('[data-collapse]');

	$collapse.each(function (i, e) {
		var $this = $(e);
		var $top = $this.find('[data-collapse-top]');
		var $content = $this.find('[data-collapse-content]');
		var $icon = $this.find('[data-collapse-icon]');
		var activeClass = '_active';
		var transitionSpeed = 300;

		$top.on('click', function () {
			if ($this.hasClass(activeClass)) {
				$icon.removeClass(activeClass);
				$content.stop().slideUp(transitionSpeed, function () {
					$this.removeClass(activeClass);
				});
			} else {
				$icon.addClass(activeClass);
				$content.stop().slideDown(transitionSpeed, function () {
					$this.addClass(activeClass);
				});
			}
		});
	});
};

app.tabs = function () {
	var $tabs = $('[data-tabs]');

	$tabs.each(function (i, e) {
		var $this = $(e);
		var $tabElements = $this.find('[data-tab-id]');
		var activeClass = '_active';

		$tabElements.each(function (tabIndex, tabElement) {
			var $getTabParent = $(tabElement).parents('[data-tabs]').eq(0);

			if ($this.is($getTabParent)) {
				var $current = $(tabElement);
				var $currentParent = $current.closest('[data-tabs]');
				var $currentTabs = $currentParent.find('[data-tab-id]');
				var $currentBlocks = $currentParent.find('[data-tab-block]');

				var activeClassRemover = function (i2, e2) {
					if ($(e2).closest('[data-tabs]').is($currentParent)) {
						$(e2).removeClass(activeClass);
					}
				};

				$current.on('click', function () {
				    var currentId = $(this).data('tab-id');

					$currentTabs.each(activeClassRemover);
					$currentBlocks.each(activeClassRemover);

					$currentParent.find('[data-tab-block="'+currentId+'"]').eq(0).addClass(activeClass);
					$current.addClass(activeClass);
				});
			}
		});
	});
};


app.cookieLayout = function () {
	var $cookie = $('[data-cookie]');
	var $close = $cookie.find('[data-cookie-close]');

	$close.on('click', function () {
		$cookie.remove();
	});
};

app.chosen = function () {
	$('[data-chosen-select]').chosen({disable_search: true, width: '100%'});
	$('[data-chosen-select-content-fit]').chosen({disable_search: true, width: 'calc(100% + 15px)'});
};

app.lang = function () {
	var $chosen = $('[data-chosen-select-lang]');
	var $lang = $('[data-lang]');
	var $langIcon = $lang.find('[data-lang-icon]');
	var $langInner = $lang.find('[data-lang-inner]');
	var activeClass = '_active';
	// Mobile
	var $langSelect = $lang.find('.filter-select._lang');

	$chosen.chosen({disable_search: true, width: '100%'});

	$langIcon.on('click touchstart', function() {
		$lang.addClass(activeClass);
	})
};

app.geoMap = function () {
	var $pins = $('[data-geo-map-pin]');
	var $countries = $('.country__with-enterprise');

	var visibleClass = '_visible';
	var activeClass = '_active';

	if ($countries.length > 0) {
		function getCountryNode (countryName) {
			if (countryName) {
				var targetCountryNode = null;

				countryName = countryName.toLowerCase();
				countryName = countryName[0].toUpperCase() + countryName.slice(1);

				var $countryPath = $('[data-map-country="'+countryName+'"]');

				if ($countryPath.length > 0) {
					targetCountryNode = $countryPath;
				}

				return targetCountryNode;
			}
		}

		function hideAllCards () {
			$('[data-geo-card]').removeClass(visibleClass);
		}

		function clearAllPaths () {
			$('[data-map-country]').removeClass(activeClass);
		}

		$pins.each(function() {
			var $pin = $(this);

			$pin.on('mouseover', function() {
				var $this = $(this);
				$this.addClass('_visible');

				var country = $pin.attr('data-country');
				var $countryPath = getCountryNode(country);
				$countryPath.addClass('_active');

				hideAllCards();

				var $card = $this.find('[data-geo-card]');
				if ($card.length > 0) {
					$card.addClass(visibleClass);
				}
			});

			$pin.on('mouseleave', function(){
				hideAllCards();
				clearAllPaths();
			});
		});
	}
};

app.history = function () {
	var timeline = document.querySelector('[data-timeline-container]');
	if (timeline) {
		var timelineItems = timeline.querySelectorAll('[data-timeline]');
		var historyStages = document.querySelectorAll('[data-history]');
		var historyActual = document.querySelector('[data-history-actual]');
		// var historyTotal = document.querySelector('[data-history-total]');
		var imageTriggerList = document.querySelectorAll('[data-history-image]');
		var imageContainer = document.querySelector('[data-history-images]');
		var footer = document.querySelector('.footer');

		// missing forEach on NodeList for IE11
		if (window.NodeList && !NodeList.prototype.forEach) {
			NodeList.prototype.forEach = Array.prototype.forEach;
		}

		// Задаем первоначальное состояние: первый пункт навигации выделен, первая фотография видна
		function initialState () {
			setActiveTimelineItem(historyStages[0].dataset.history);
			imageContainer.querySelectorAll('[data-history-image-item]')[0].style.opacity = '1';
		}

		// Очищаем классы всех элементов списка навигации
		function clearAllTimelineItems () {
			timelineItems.forEach(function (item) {
				item.classList.remove('timeline__item--active');
			});
		}

		// Задаем пункту навигации активное состояние
		function setActiveTimelineItem (anchor) {
			clearAllTimelineItems();
			var targetItem = timeline.querySelector('[data-timeline=' + anchor + ']');
			targetItem.classList.add('timeline__item--active');
		}

		// Задаем фотографии активное (видимое) состояние
		function setActiveImage (id) {
			imageContainer.querySelectorAll('[data-history-image-item]').forEach(function (img) {
				img.style.opacity = '0';
			});
			document.getElementById(id).style.opacity = '1';
		}

		// Перемещение position: fixed блоков справа и слева (timeline и изображения) при появлении футера
		function updateFixedPosition () {
			timeline.style.top = 96 - (document.documentElement.clientHeight - footer.getBoundingClientRect().top) + 'px';
			imageContainer.style.top = 96 - (document.documentElement.clientHeight - footer.getBoundingClientRect().top) + 'px';
		}

		// Отключение или включение всех waypoints разом для организации скролла
		function setWaypointsState (state) {
			switch (state) {
			case 'disable':
				historyWaypointsDown.forEach(function (waypoint) {
					waypoint.disable();
				});
				historyWaypointsUp.forEach(function (waypoint) {
					waypoint.disable();
				});
				imageWaypoints.forEach(function (waypoint) {
					waypoint.disable();
				});
				break;
			case 'enable':
			default:
				historyWaypointsDown.forEach(function (waypoint) {
					waypoint.enable();
				});
				historyWaypointsUp.forEach(function (waypoint) {
					waypoint.enable();
				});
				imageWaypoints.forEach(function (waypoint) {
					waypoint.enable();
				});
			}
		}

		initialState();

		// Заранее создаю массивы под waypoints, чтобы потом своевременно их отключать и включать
		var historyWaypointsDown = new Array(historyStages.length);
		var historyWaypointsUp = new Array(historyStages.length);
		var imageWaypoints = new Array(historyStages.length);

		historyStages.forEach(function (stage, index) {
			historyWaypointsDown[index] = new Waypoint({
				element: stage,
				handler: function (direction) {
					if (direction === 'down') {
						var updatedCounterValue = index + 1;
						historyActual.textContent = index + 1 > 10 ? updatedCounterValue : '0' + updatedCounterValue;
						setActiveTimelineItem(stage.dataset.history);
					}
				},
				offset: 0
			});
			historyWaypointsUp[index] = new Waypoint({
				element: stage,
				handler: function (direction) {
					if (direction === 'up') {
						var updatedCounterValue = index + 1;
						historyActual.textContent = index + 1 > 10 ? updatedCounterValue : '0' + updatedCounterValue;
						setActiveTimelineItem(stage.dataset.history);
					}
				},
				offset: 'bottom-in-view'
			});
		});

		// Создаем отдельные waypoints для управления изображениями, привязанными к data-history-image
		imageTriggerList.forEach(function (trigger, index) {
			imageWaypoints[index] = new Waypoint({
				element: trigger,
				handler: function () {
					setActiveImage(trigger.dataset.historyImage);
				},
				offset: 100
			});
		});

		// Обновляем положение изображения, когда докрутили до футера
		var footerWaypoint = new Waypoint({
			element: footer,
			handler: function (direction) {
				if (direction === 'down') {
					document.addEventListener('scroll', updateFixedPosition);
				}
				if (direction === 'up') {
					timeline.style.top = 96 + 'px';
					imageContainer.style.top = 96 + 'px';
					document.removeEventListener('scroll', updateFixedPosition);
				}
			},
			offset: '100%'
		});

		// Скролл текста к нужному пункту при клике на соответствующем элементе timeline
		// Для коллбэка по выполнении анимации переходим на jQuery
		$('[data-timeline]').each(function (index) {
			$(this).on('click', function(e) {
				e.preventDefault();
				setActiveTimelineItem(e.target.dataset.timeline);
				// Выбираем активной первую фотографию в блоке, который появится по клику на навигацию
				setActiveImage(historyStages[index].querySelector('[data-history-image]').dataset.historyImage);
				// Выставляем счетчик над timeline на новое значение
				var updatedCounterValue = index + 1;
				historyActual.textContent = index + 1 > 10 ? updatedCounterValue : '0' + updatedCounterValue;
				// Отключаем waypoints на период скролла
				setWaypointsState('disable');
				$([document.documentElement, document.body]).stop().animate({
					scrollTop: $('[data-history]').eq(index).offset().top - 50
				}, 500, function () {
					// После завершения скролла снова включаем waypoints
					setWaypointsState('enable');
				});
			});
		});
	}
};

app.stickyHeader = function () {
	var $stickyHeader = $('[data-sticky-header]');
	var activeClass = '_active';

	$('[data-waypoint="mp_second"]').waypoint({
		handler: function(dir) {
			if (dir === 'down') {
				$stickyHeader.addClass(activeClass);
			} else {
				$stickyHeader.removeClass(activeClass);
			}
		}
	});
};

app.swiperMainHeaderImages = function () {
	var $homeSwiper = $('[data-home-swiper]');
	var $homeSwiperImages = $homeSwiper.find('[data-home-swiper-src]');
	var $window = app.dom.$window;
	var calcImgWidth = 0;
	var calcImgHeight = 0;
	var transitionOffsetWidth = 0;
	var transitionOffsetHeight = 0;
	var counterSwiper;
	var imgSrc = $homeSwiperImages.data('home-swiper-src');
	var img = new Image();
	img.onload = function () {
		onLoadImg();
	};
	img.src = imgSrc;

	$window.on('resize', function () {
		onLoadImg();
	});

	function onLoadImg () {
		var kImg = img.width/img.height;
		var kWidth = $window.width() / img.width;
		var kHeight = $window.height() / img.height;
		if(kWidth > kHeight) {
			calcImgWidth = $window.width();
			calcImgHeight = calcImgWidth / kImg;
			transitionOffsetHeight = -(calcImgHeight - $window.height()) / 2;
			transitionOffsetWidth = 0;
		}else{
			calcImgHeight = $window.height();
			calcImgWidth = calcImgHeight * kImg;
			transitionOffsetWidth = -(calcImgWidth - $window.width()) / 2;
			transitionOffsetHeight = 0;
		}

		initSwiper();
	}

	function initPagination ($swipers) {
	    if (counterSwiper && counterSwiper !== 'undefined') {
	      counterSwiper.destroy();
		}

		var $counter = $('[data-counter="home"]');
		var $next = $counter.find('[data-counter-next]');
		var $prev = $counter.find('[data-counter-prev]');

		var $counterSwiper = $counter.find('[data-counter-swiper]');
		var speed = 1000;
		counterSwiper = new Swiper($counterSwiper, {
			slidesPerView: 1,
			direction: 'vertical',
			initialSlide: 0,
			speed: speed,
			height: 32,
			loop: true,
			autoplay: {
				delay: 5000,
				disableOnInteraction: false
			},
			controller: {
				control: [$swipers[0].swiper, $swipers[1].swiper, $swipers[2].swiper, $swipers[3].swiper]
			},
			on: {
				slideChangeTransitionStart: function() {
					var _this = this;
					this.allowSlidePrev = false;
					this.allowSlideNext = false;

					setTimeout(function() {
						_this.allowSlidePrev = true;
						_this.allowSlideNext = true;
					}, speed + 200);
				}
			}
		});

		$next.on('click', function() {
			if (counterSwiper.allowSlidePrev || counterSwiper.allowSlideNext) {
				counterSwiper.slideNext();
			}
		});

		$prev.on('click', function() {
			if (counterSwiper.allowSlidePrev || counterSwiper.allowSlideNext) {
				counterSwiper.slidePrev();
			}
		});
	}

	function initSwiper () {
		var $swipers = $homeSwiper.find('[data-swiper-main-images]');

		if ($swipers.length > 0) {
			var windowWidth = app.dom.$window.width();
			var quarter = Math.ceil(windowWidth / 4);
			$swipers.width(quarter);
			$swipers.each(function (swiperIndex) {
				var $slides = $(this).find('[data-slide-id]');
				var $imageElem = $slides.find('img');
				$imageElem.each(function () {
					$(this)[0].src = $(this).data('src');
					$(this).css({
						width: calcImgWidth + 'px',
						height: calcImgHeight + 'px',
						transform: 'translate(' + (-(quarter * swiperIndex) + transitionOffsetWidth) + 'px,' + transitionOffsetHeight + 'px)'
					});
				});

				var homeBannerSwiper = $('[data-home-banner]')[0];
				var swiperSettings = {
					allowTouchMove: false,
					virtualTranslate: true,
					speed: 1000,
					loop: true,
					on: {
						slideChange: function () {
							var _this = this;
							var slide = homeBannerSwiper.swiper.slides[this.realIndex];
							var $bannerTitle = $(slide).find('.main__slide-title p, .main__slide-title span');
							var $bannerText = $(slide).find('.main__slide-text p, .main__slide-text span');

							app.animateCSS($bannerTitle, 'titleSlideIn');
							app.animateCSS($bannerText, 'fadeInUp', 0, false);
						},
					},
					thumbs: {
						swiper: {
							el: homeBannerSwiper,
							virtualTranslate: true,
							allowTouchMove: false,
							on: {
								init: function () {
									app.swiperInitSplittyInside(this);
								}
							}
						}
					}
				};
				new Swiper(this, swiperSettings);
			});
			initPagination ($swipers);
		}
	}
};

app.swiperMainNews = function () {
	var $swiper = $('[data-swiper-main-news]');

	var swiperSettings = {
		slidesPerView: 1,
		spaceBetween: 32,
		allowTouchMove: false,
		breakpoints: {
			1200: {
				slidesPerView: 2
			},
			991: {
				slidesPerView: 1
			},
			580: {
				slidesPerView: 2
			}
		},
		on: {
			init: function() {
				app.swiperInitSplittyInside(this);
			}
		}
	};

	var resultSettings = $.extend(true, {}, app.swiperDefaultSettings, swiperSettings);

	if ($swiper.length) {
		var swiper = new Swiper($swiper, resultSettings);
		swiper.init();
	}
};

app.swiperMainStocks = function () {
	var $swiper = $('[data-swiper-mfs-swiper]');

	var swiperSettings = {
		allowTouchMove: false,
		thumbs: {
			swiper: {
				el: '[data-swiper-mfs-images]',
				speed: 1000
			}
		},
		pagination: {
			el: '[data-swiper-mfs-pagination]',
			clickable: true
		}
	};

	var resultSettings = $.extend(true, {}, app.swiperDefaultSettings, swiperSettings);

	if ($swiper.length) {
		var swiper = new Swiper($swiper, resultSettings);
		swiper.init();
	}
};

app.swiperMainProducts = function () {
	var $swiper = $('[data-swiper-main-products]');

	var swiperSettings = {
		spaceBetween: 32
	};

	var resultSettings = $.extend(true, {}, app.swiperDefaultSettings, swiperSettings);

	if ($swiper.length) {
		var swiper = new Swiper($swiper, resultSettings);
		swiper.init();
	}
};

app.swiperMainBannerMobile = function () {
	var $swiper = $('[data-swiper-main-mobile-banner]');

	var swiperSettings = {
		autoHeight: true,
		pagination: {
			el: '[data-swiper-main-mobile-banner-pagination]',
			type: 'bullets',
			clickable: true
		}
	};

	var resultSettings = $.extend(true, {}, app.swiperDefaultSettings, swiperSettings);

	if ($swiper.length) {
		var swiper = new Swiper($swiper, resultSettings);
		swiper.init();
	}
};

app.swiperPressGallery = function () {
	var $galleryCollection = $('[data-press-gallery-wrapper]');

	$galleryCollection.each(function() {
		var $this = $(this);
		var $gallery = $this.find('[data-press-gallery]');
		var $pagination = $this.find('[data-press-gallery-pagination]');
		var $next = $this.find('[data-press-gallery-next]');
		var $prev = $this.find('[data-press-gallery-prev]');

		new Swiper($gallery[0], {
			pagination: {
				el: $pagination[0],
				type: 'fraction',
			},
			navigation: {
				nextEl: $next[0],
				prevEl: $prev[0],
			},
		});
	});
};

app.swiperMoreNewsGallery = function () {
	var $galleryCollection = $('[data-more-news-gallery-wrapper]');

	$galleryCollection.each(function() {
		var $this = $(this);
		var $gallery = $this.find('[data-more-news-gallery]');
		var $pagination = $this.find('[data-more-news-gallery-pagination]');
		var $next = $this.find('[data-more-news-gallery-next]');
		var $prev = $this.find('[data-more-news-gallery-prev]');

		new Swiper($gallery[0], {
			spaceBetween: 32,
			slidesPerView: 'auto',
			pagination: {
				el: $pagination[0],
				type: 'fraction',
			},
			navigation: {
				nextEl: $next[0],
				prevEl: $prev[0],
			},
		});
	});
};

app.gallery = function () {
	var $videoTriggers = $('[data-video-trigger]');
	$videoTriggers.magnificPopup({
		type: 'iframe',
		iframe: {
			patterns: {
				youtube: {
					index: 'youtube.com/',
					id: function(url) {
						var m = url.match(/[\\?\\&]v=([^\\?\\&]+)/);
						if ( !m || !m[1] ) return null;
						return m[1];
					},
					src: '//www.youtube.com/embed/%id%?autoplay=1'
				}
			}
		},
		mainClass: 'gallery-popup',
		closeMarkup: '<div class="mfp-close-wrapper"><button title="%title%" type="button" class="mfp-close"></button></div>'
	});
};

app.careerImages = function () {
	var $careerImages = $('[data-career-images]'),
		careerImagesOffset = $careerImages.offset();

	if ($careerImages.length > 0) {
		var $careerImagesInner = $('[data-career-images-inner]');
		var $images = $careerImages.find('[data-career-images-item]');
		var imagesWidth = 0;
		var headerHeight = $('[data-header]').height();


		$images.each(function() {
			imagesWidth += $(this).outerWidth();
		});

		app.dom.$window.on('scroll', function(){
			var RATIO = -(0 - app.dom.$window.scrollTop()) / ($careerImages.height() + careerImagesOffset.top - headerHeight);

			var translateValue = RATIO * (app.dom.$window.width() - imagesWidth ) / 2;

			if (RATIO > 0) {
				$careerImagesInner.css({
					transform: 'translateX('+ translateValue +'px)'
				});
			} else {
				$careerImagesInner.css({
					transform: 'translateX(0px)'
				});
			}
		});
	}
};

app.imageLightbox = function () {
	$('[data-image-lightbox]').magnificPopup({
		type: 'image',
		mainClass: 'gallery-popup',
		closeMarkup: '<div class="mfp-close-wrapper"><button title="%title%" type="button" class="mfp-close"></button></div>'
	});
};

app.swiperAbout = function () {
	var swiperAbout = new Swiper ('[data-about-slider]', {
		speed: 1000,
		navigation: {
			nextEl: '[data-about-next]',
			prevEl: '[data-about-prev]'
		},
		on: {
			init: function () {
				var firstSlideContent = document.querySelector('[data-about-slider-content]');
				firstSlideContent.classList.add('about__slider-content--active');
			},
			slideChangeTransitionStart: function () {
				var slides = swiperAbout.slides;
				var prevItem = slides[swiperAbout.previousIndex].querySelector('[data-about-slider-content]');
				var nextItem = slides[swiperAbout.activeIndex].querySelector('[data-about-slider-content]');
				prevItem.classList.remove('about__slider-content--active');
				prevItem.classList.add('about__slider-content--closing');
				nextItem.classList.add('about__slider-content--active');
			},
			slideChangeTransitionEnd: function () {
				var slides = swiperAbout.slides;
				var prevItem = slides[swiperAbout.previousIndex].querySelector('[data-about-slider-content]');
				prevItem.classList.remove('about__slider-content--closing');
			}
		}
	});
};

app.dropzone = function () {
	var $dropzone = $('[data-dropzone]');

	$dropzone.each(function() {
		var $this = $(this);
		var $content = $this.find('[data-dropzone-content]');
		var $input = $this.find('[data-dropzone-input]');
		var $files = $this.find('[data-dropzone-files]');

		var dropzoneSettings = {
			paramName: 'file',
			uploadMultiple: true
		};

		$content.on('click', function() {
			$input.trigger('click');
		});

		$content.find('a').on('click', function(e){
			e.preventDefault();
		});

		$this.dropzone(dropzoneSettings).on('drop addedfile', function(e) {
			e.preventDefault();

			var files = e.originalEvent.dataTransfer.files;
			if (files.length > 0) {
				renderFiles(files, $files);
			}
		});

		$input.on('change', function(e) {
			e.preventDefault();

			var files = e.target.files;
			if (files.length > 0) {
				renderFiles(files, $files);
			}
		});

		function renderFiles (filesArray, $filesWrapperSelector) {
			var result = '';

			$(filesArray).each(function(i) {
				var name = this.name;

				result += '<div class="dropzone__file" data-dropzone-file data-dropzone-file-index="'+i+'">' +
					'<div class="dropzone__file-name">' +
						'<span>'+name+'</span>' +
					'</div>' +
					'<div class="dropzone__file-close" data-dropzone-file-close></div>' +
				'</div>';
			});

			$filesWrapperSelector.html(result);

			$('[data-dropzone-file-close]').on('click', function() {
				var $this = $(this);

				$this.closest('[data-dropzone-file]').remove();
			});
		}
	});
};

app.contactsMap = function () {
	var contactsMapSelector = $('[data-contacts-map]')[0];

	if (contactsMapSelector) {
		var position = {lat: 55.737297960689304, lng: 37.505245920606015};
		var map = new google.maps.Map(contactsMapSelector, {
			center: position,
			zoom: 17,
			format: 'png',
			maptype: 'roadmap',
			styles: [
				{
					'featureType': 'administrative',
					'elementType': 'geometry',
					'stylers': [
						{
							'visibility': 'off'
						}
					]
				},
				{
					'featureType': 'administrative',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#ffffff'
						},
						{
							'weight': 2
						}
					]
				},
				{
					'featureType': 'poi',
					'stylers': [
						{
							'visibility': 'off'
						}
					]
				},
				{
					'featureType': 'road',
					'elementType': 'labels.icon',
					'stylers': [
						{
							'visibility': 'off'
						}
					]
				},
				{
					'featureType': 'road.arterial',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#ffffff'
						}
					]
				},
				{
					'featureType': 'road.arterial',
					'elementType': 'geometry.stroke',
					'stylers': [
						{
							'color': '#ffffff'
						}
					]
				},
				{
					'featureType': 'road.highway',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#ffffff'
						}
					]
				},
				{
					'featureType': 'road.highway.controlled_access',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#ffffff'
						}
					]
				},
				{
					'featureType': 'road.local',
					'elementType': 'geometry.stroke',
					'stylers': [
						{
							'color': '#ffffff'
						}
					]
				},
				{
					'featureType': 'transit',
					'stylers': [
						{
							'visibility': 'off'
						}
					]
				}
			]
		});

		new google.maps.Marker({
			position: position,
			map: map,
			icon: '/common/images/i-map-marker.svg'
		});
	}
};

app.validateForm = function() {
	var $input = $('[data-input], [data-textarea]');

	var notEmptyClass = '_not-empty',
		validClass = '_valid',
		invalidClass = '_invalid';

	$input.each(function() {
		var $this = $(this);
		var $field = $this.find('[data-input-field]');
		var fieldType = $field.attr('type');

		$field.on('change keyup', function() {
			var value = $field.val();

			if (value.length > 0) {
				$field.addClass(notEmptyClass);
			} else {
				if(fieldType !== 'phone' && fieldType !== 'tel') {
					$field.removeClass(notEmptyClass);
				}
			}

			if(fieldType === 'email') {
				if (isEmail($field.val())) {
					$field.addClass(validClass).removeClass(invalidClass);

					removeInputError($this);
				} else {
					$field.removeClass(validClass).addClass(invalidClass);

					renderInputError($this, 'Некорректно введена почта');
				}
			}
		});

		if (fieldType === 'phone' || fieldType === 'tel') {
			$field.addClass(notEmptyClass);
		}
	});

	function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	}

	function renderInputError ($containerSelector, errorMessage) {
		var getErrorMessageContainer = $containerSelector.find('[data-input-error]');

		if (getErrorMessageContainer.length === 0) {
			var template = '<div class="input__error" data-input-error>' +
				'<span>'+errorMessage+'</span>' +
				'</div>';
			$containerSelector.append(template);
		}
	}

	function removeInputError ($containerSelector) {
		$containerSelector.find('[data-input-error]').remove();
	}
};

app.maskedInput = function() {
	$('input[type="phone"], input[type="tel"]').mask('+7 (999) 999-99-99', {
		autoclear: false
	}).addClass('_masked');
};

app.counter = function () {
	var $counters = $('[data-counter="common"]');

	$counters.each(function() {
		var $this = $(this);
		var $prev = $this.find('[data-counter-prev]');
		var $next = $this.find('[data-counter-next]');
		var $counterSwiper = $this.find('[data-counter-swiper]');
		var $swiper = $(this).closest('.swiper-container');

		if ($swiper.length > 0) {
			var swiper = $swiper[0].swiper;
		}


		if ($counterSwiper.length > 0) {
			var counterSwiper = new Swiper($counterSwiper[0], {
				slidesPerView: 1,
				initialSlide: 0,
				height: 32,
				direction: 'vertical',
				loop: false,
				navigation: {
					prevEl: $prev[0],
					nextEl: $next[0]
				}
			});
		}

		$prev.on('click', function() {
			if (swiper) {
				swiper.slidePrev();

				if (counterSwiper) {
					counterSwiper.slideTo(swiper.activeIndex);
				}
			}
		});

		$next.on('click', function() {
			if (swiper) {
				swiper.slideNext();

				if (counterSwiper) {
					counterSwiper.slideTo(swiper.activeIndex);
				}
			}
		});
	});
};

app.about = function () {
	var $wpAboutStock = $('[data-waypoint="about-stock"]');
	var $wpAboutStats = $('[data-waypoint="about-stats"]');
	var $wpAboutIndicators = $('[data-waypoint="about-indicators"]');

	$wpAboutIndicators.waypoint({
		offset: $('[data-header]').outerHeight(),
		handler: function(dir) {
			switch (dir) {
			case 'down':
				$wpAboutStock.addClass('_fixed-top');
				break;
			case 'up':
				$wpAboutStock.removeClass('_fixed-top');
				break;
			}
		}
	});

	$wpAboutStats.waypoint({
		offset: function() {
			return this.context.innerHeight() - this.adapter.outerHeight() - 32;
		},
		handler: function (dir) {
			switch (dir){
			case 'down':
				$wpAboutStock.addClass('_fixed-bottom').removeClass('_fixed-top');
				break;
			case 'up':
				$wpAboutStock.removeClass('_fixed-bottom').addClass('_fixed-top');
			}
		}
	});
};

app.search = function() {
	var $search = $('[data-search]');
	var $searchPredict = $search.find('[data-search-predict]');
	var $searchInput = $search.find('[data-search-input]');
	var $searchClear = $search.find('[data-search-clear]');

	$searchInput.on('keyup keydown', function(){
		var $this = $(this);
		var $val = $this.val();
		var testPredict = showSearchPredict($val, 'Производство');

		if ($val.length > 0) {
			$searchClear.stop().show();
		} else {
			$searchClear.stop().hide();
		}

		if ($val.length > 0 && testPredict) {
			$searchPredict.text(testPredict);
		} else {
			$searchPredict.text('');
		}
	});

	$searchClear.on('click', function() {
		$searchPredict.text('');
		$searchInput.val('').attr('value', '');
		$searchClear.stop().hide();
	});

	var showSearchPredict = function (query, predictString) {
		if (predictString.includes(query)) {
			return predictString;
		}
	};
};

app.alert = function () {
	var $alerts = $('[data-alert]');
	$alerts.each(function() {
		var $this = $(this);
		var $close = $this.find('[data-alert-close]');

		$close.on('click', function() {
			$this.stop().hide();
		});
	});
};

app.init = function () {
	app.smoothScroll();
	app.highcharts();
	app.splitty();
	app.openPopup();
	app.fade();
	app.menu();
	app.collapse();
	app.tabs();
	app.cookieLayout();
	app.chosen();
	app.stickyScroller();
	app.geoMap();
	app.history();
	app.stickyHeader();
	app.swiperPressGallery();
	app.swiperMoreNewsGallery();
	app.swiperMainHeaderImages();
	app.swiperMainStocks();
	app.swiperMainNews();
	app.swiperMainProducts();
	app.swiperMainBannerMobile();
	app.gallery();
	app.careerImages();
	app.imageLightbox();
	app.dropzone();
	app.contactsMap();
	app.validateForm();
	app.maskedInput();
	app.swiperAbout();
	app.counter();
	app.about();
	app.search();
	app.alert();
	app.lang();
	app.revealBlockOnReset();
};

$(function () {
	$(document).ready(function () {
		app.init();
	});
});
