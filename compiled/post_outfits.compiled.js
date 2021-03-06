"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Post_Outfits = function () {
	function Post_Outfits() {
		_classCallCheck(this, Post_Outfits);
	}

	_createClass(Post_Outfits, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pd_post_outfits";
			this.PLUGIN_KEY = "pd_post_outfits";

			this.SETTINGS = {};
			this.IMAGES = {};

			this.setup();

			$(this.ready.bind(this));
		}
	}, {
		key: "ready",
		value: function ready() {
			var location_check = yootil.location.recent_posts() || yootil.location.search_results() || yootil.location.thread();

			if (location_check && this.view_in_category()) {
				Post_Outfits_Display.init();
			}

			if (yootil.location.posting() || yootil.location.editing()) {
				if (this.can_use()) {
					Post_Outfits_Posting.init();
				}
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				this.SETTINGS = plugin.settings;
				this.IMAGES = plugin.images;
			}
		}
	}, {
		key: "can_use",
		value: function can_use() {
			if (!this.SETTINGS.groups.length) {
				return false;
			}

			var grps = yootil.user.group_ids();

			if (Array.isArray(grps) && grps.length) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = grps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var id = _step.value;

						if ($.inArrayLoose(parseInt(id, 10), this.SETTINGS.groups) > -1) {
							return true;
						}
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}

			return false;
		}
	}, {
		key: "view_in_category",
		value: function view_in_category() {
			if (!this.SETTINGS.categories.length || !yootil.page.category.id()) {
				return false;
			}

			if ($.inArrayLoose(parseInt(yootil.page.category.id(), 10), this.SETTINGS.categories) > -1) {
				return true;
			}

			return false;
		}
	}]);

	return Post_Outfits;
}();

var Post_Outfits_Item = function () {
	function Post_Outfits_Item() {
		_classCallCheck(this, Post_Outfits_Item);
	}

	_createClass(Post_Outfits_Item, [{
		key: "create",
		value: function create() {
			var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
			var can_remove = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

			var html = "";

			html += "<div class='post-outfits-item' data-post-outfits-id='" + parseInt(key, 10) + "'>";

			html += "<div class='post-outfits-item-preview'>";
			html += "<div class='post-outfits-item-asterisk'><img src='" + Post_Outfits.IMAGES.asterisk + "' /></div>";

			var img_url = "";

			if (item.i.length > 10) {
				img_url = item.i;
				html += "<img class='post-outfits-item-preview-img' src='" + pb.text.escape_html(item.i) + "' />";
			} else {
				html += "<img class='post-outfits-item-preview-img' src='" + Post_Outfits.IMAGES.nopreview + "' />";
			}

			html += "<div class='post-outfits-item-image-url'><input placeholder='Preview Image URL...' type='text' value='" + pb.text.escape_html(img_url) + "' /></div>";

			html += "</div>";

			html += "<div class='post-outfits-item-content'>";
			html += "<textarea cols='1' rows='1'>" + item.t + "</textarea>";
			html += "</div>";

			var opacity = can_remove ? 1 : 0.4;

			html += "<div class='post-outfits-item-controls'>";
			html += "<div><img class='post-outfits-item-picture' src='" + Post_Outfits.IMAGES.picture + "' title='Edit Picture' /></div>";
			html += "<div><img class='post-outfits-item-save' src='" + Post_Outfits.IMAGES.save + "' title='Save Template' /></div>";
			html += "<div><img class='post-outfits-item-pick' src='" + Post_Outfits.IMAGES.pick + "' title='Pick Template' /></div>";
			html += "<div><img class='post-outfits-item-remove' style='opacity: " + opacity + "' src='" + Post_Outfits.IMAGES.remove + "' title='Remove Template' /></div>";
			html += "</div>";

			html += "</div>";

			return html;
		}
	}]);

	return Post_Outfits_Item;
}();

var Post_Outfits_Posting = function () {
	function Post_Outfits_Posting() {
		_classCallCheck(this, Post_Outfits_Posting);
	}

	_createClass(Post_Outfits_Posting, null, [{
		key: "init",
		value: function init() {
			this.key_id = yootil.user.logged_in() ? "_" + parseInt(yootil.user.id(), 10) : "";
			this.new_thread = yootil.location.posting_thread() ? true : false;
			this.new_post = !this.new_thread ? true : false;
			this.editing = yootil.location.editing() ? true : false;
			this.hook = this.new_thread ? "thread_new" : "post_new";

			this.saved_outfits = this.load_saved_outfits();

			this.build();
			this.selected_outfit = this.get_selected_outfit();
		}
	}, {
		key: "build",
		value: function build() {
			var $wrapper = $("#post-outfits");
			var has_wrapper = $wrapper.length == 1 ? true : false;
			var $container = yootil.create.container("Post Outfits", this.build_saved_post_outfits());

			this.bind_events($container);

			if ($container.find(".post-outfits-item").length > 1) {
				$container.find(".post-outfits-item:not(:last) textarea").off("keyup").on("keyup", function () {
					var $item = $(this).closest(".post-outfits-item");

					$item.find(".post-outfits-item-asterisk").addClass("post-outfits-item-asterisk-unsaved");
				});
			}

			if (!has_wrapper) {
				$wrapper = $("<div id='post-outfits'></div>");
			}

			$wrapper.append($container);

			if (!has_wrapper) {
				$wrapper.insertAfter($(".container.wysiwyg-area"));
			}
		}
	}, {
		key: "bind_key_event",
		value: function bind_key_event() {
			var _this = this;

			var $the_form = null;

			if (this.editing) {
				if (yootil.location.editing_thread()) {
					$the_form = yootil.form.edit_thread();
				} else {
					$the_form = yootil.form.edit_post();
				}
			} else {
				$the_form = yootil.form.post_form();
			}

			if ($the_form.length) {
				$the_form.on("submit", function () {

					_this._submitted = true;
					_this.set_on();
				});
			}
		}
	}, {
		key: "get_hook",
		value: function get_hook() {
			var hook = "";

			if (this.new_thread) {
				hook = "thread_new";
			} else if (this.editing) {
				if (yootil.location.editing_thread()) {
					hook = "thread_edit";
				} else {
					hook = "post_edit";
				}
			} else {
				hook = "post_new";
			}

			return hook;
		}
	}, {
		key: "set_on",
		value: function set_on() {
			if ((this.new_thread || this.new_post || this.editing) && this._submitted) {
				var hook = this.get_hook();
				var outfit = "";

				if (this.selected_outfit != null && this.saved_outfits[this.selected_outfit] != null) {
					outfit = this.saved_outfits[this.selected_outfit];
					outfit.id = this.selected_outfit;
				}

				yootil.key.set_on(Post_Outfits.PLUGIN_KEY, outfit, null, hook);
			}
		}
	}, {
		key: "bind_events",
		value: function bind_events($elem) {
			if (yootil.location.posting() || yootil.location.editing_thread() || yootil.location.editing_post()) {
				this.bind_key_event();
			}

			$elem.find(".post-outfits-item-pick").click(function () {
				var $item = $(this).closest(".post-outfits-item");
				var id = $item.attr("data-post-outfits-id");

				$(".post-outfits-item-selected").removeClass("post-outfits-item-selected");

				$item.addClass("post-outfits-item-selected");

				Post_Outfits_Posting.selected_outfit = parseInt(id, 10);
			});

			$elem.find(".post-outfits-item-content textarea").on("keyup", function () {
				var $area = $(this);

				if ($area.val().length) {
					$area.off("keyup");

					var $item = $(this).closest(".post-outfits-item");
					var $parent = $item.parent();

					$item.find(".post-outfits-item-asterisk").addClass("post-outfits-item-asterisk-unsaved");
					$item.find(".post-outfits-item-remove").addClass("post-outfits-item-bounce-in");

					var $empty_item = $(new Post_Outfits_Item().create({

						i: "",
						t: ""

					}, +new Date())).addClass("post-outfits-item-bounce-in");

					Post_Outfits_Posting.bind_events($empty_item);

					$parent.append($empty_item);
				}
			});

			$elem.find(".post-outfits-item-remove").on("click", function () {
				if ($(this).css("opacity") <= 0.4) {
					return;
				}

				var $item = $(this).closest(".post-outfits-item");
				var $parent = $item.parent();
				var id = $item.attr("data-post-outfits-id");

				$item.addClass("post-outfits-item-roll-out");

				setTimeout(function () {
					$item.remove();
					Post_Outfits.remove_outfit(id);

					if ($parent.find("div").length == 0) {
						var $empty_item = $(new Post_Outfits_Item().create({

							i: "",
							t: ""

						}, +new Date())).addClass("post-outfits-item-bounce-in");

						Post_Outfits_Posting.bind_events($empty_item);

						$parent.append($empty_item);
					}
				}, 600);
			});

			$elem.find(".post-outfits-item-save").on("click", function () {
				var _this2 = this;

				var $item = $(this).closest(".post-outfits-item");
				var id = $item.attr("data-post-outfits-id");

				$item.find(".post-outfits-item-asterisk").removeClass("post-outfits-item-asterisk-unsaved");

				var img = $item.find(".post-outfits-item-image-url input").val();
				var txt = $item.find(".post-outfits-item-content textarea").val();

				if (img.length > 10) {
					$item.find(".post-outfits-item-preview-img").attr("src", yootil.html_encode(img));
				}

				$(this).addClass("post-outfits-item-saved-spin");

				setTimeout(function () {

					$(_this2).removeClass("post-outfits-item-saved-spin");
				}, 1100);

				Post_Outfits_Posting.save_outfit(id, img, txt);
				Post_Outfits_Posting.saved_outfits = Post_Outfits_Posting.load_saved_outfits();
			});

			$elem.find(".post-outfits-item-picture").on("click", function () {
				var $item = $(this).closest(".post-outfits-item");
				var $url = $item.find(".post-outfits-item-image-url");

				if ($url.hasClass("post-outfits-item-image-url-show")) {
					$url.removeClass("post-outfits-item-image-url-show");
					$url.addClass("post-outfits-item-image-url-hide");
				} else {
					$url.removeClass("post-outfits-item-image-url-hide");
					$url.addClass("post-outfits-item-image-url-show");
				}
			});

			$elem.find(".post-outfits-item-image-url input").on("keyup", function () {
				var $item = $(this).closest(".post-outfits-item");
				var $parent = $item.parent();

				$item.find(".post-outfits-item-asterisk").addClass("post-outfits-item-asterisk-unsaved");
			});
		}
	}, {
		key: "build_saved_post_outfits",
		value: function build_saved_post_outfits() {
			var outfits = "<div class='post-outfits-list'>";

			for (var key in this.saved_outfits) {
				if (this.saved_outfits.hasOwnProperty(key)) {
					outfits += new Post_Outfits_Item().create(this.saved_outfits[key], key, true);
				}
			}

			outfits += new Post_Outfits_Item().create({

				i: "",
				t: ""

			}, +new Date(), false);

			outfits += "</div>";

			return outfits;
		}
	}, {
		key: "load_saved_outfits",
		value: function load_saved_outfits() {
			var tpls = localStorage.getItem("post_outfits" + this.key_id);

			if (tpls && tpls.length) {
				return JSON.parse(tpls);
			}

			return {};
		}
	}, {
		key: "remove_outfit",
		value: function remove_outfit(id) {
			var outfits = this.load_saved_outfits();

			if (outfits[id]) {
				delete outfits[id];
				localStorage.setItem("post_outfits" + this.key_id, JSON.stringify(outfits));
			}
		}
	}, {
		key: "save_outfit",
		value: function save_outfit(id) {
			var img = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
			var txt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

			var outfits = this.load_saved_outfits();

			outfits[id] = {

				i: img,
				t: txt || ""

			};

			localStorage.setItem("post_outfits" + this.key_id, JSON.stringify(outfits));
		}
	}, {
		key: "get_selected_outfit",
		value: function get_selected_outfit() {
			if (this.editing) {
				var post_id = parseInt(yootil.page.post.id(), 10);
				var outfit = yootil.key.value(Post_Outfits.PLUGIN_KEY, post_id);

				if (outfit && outfit.id) {
					var $selected = $(".post-outfits-item[data-post-outfits-id=" + outfit.id + "]");

					if ($selected.length == 1) {
						$selected.addClass("post-outfits-item-selected");
					}

					return outfit.id;
				}
			}

			return null;
		}
	}]);

	return Post_Outfits_Posting;
}();

var Post_Outfits_Display = function () {
	function Post_Outfits_Display() {
		_classCallCheck(this, Post_Outfits_Display);
	}

	_createClass(Post_Outfits_Display, null, [{
		key: "init",
		value: function init() {
			var _this3 = this;

			yootil.event.after_search(function () {

				_this3.display.bind(_this3)();
			});

			this.display();

			$(window).on("resize", this.update_outfit_position);
		}
	}, {
		key: "display",
		value: function display() {
			var post_ids = proboards.plugin.keys.data[Post_Outfits.PLUGIN_KEY];

			for (var key in post_ids) {
				if (!post_ids[key].id) {
					continue;
				}

				var $post = $(".post#post-" + parseInt(key, 10));

				if ($post.length == 1) {
					this.create_post_outfit(parseInt(key, 10), $post, $(".post:first").css("width"), post_ids[key]);
				}
			}
		}
	}, {
		key: "create_post_outfit",
		value: function create_post_outfit(id, $post, width, outfit) {
			var outfit_html = "<div data-post-id-outfit='post-" + id + "' class='post-outfits-post-item-wrapper'><div class='post-outfits-post-item'>";

			outfit_html += "<div class='post-outfits-post-item-title' title='" + Post_Outfits.SETTINGS.description + "'>" + Post_Outfits.SETTINGS.title + "</div>";

			var img = "<em>No Image</em>";
			var has_img = false;

			if (outfit.i) {
				img = "<img src='" + pb.text.escape_html(outfit.i) + "' />";
				has_img = true;
			}

			var text_container = "";
			var img_container = "<div class='post-outfits-post-item-image'>" + img + "</div>";

			if (outfit.t.length > 0) {
				var parser = new Post_Outfits_Parser();

				text_container = "<div class='post-outfits-post-item-text'>" + parser.parse(outfit.t) + "</div>";
			} else {
				img_container = "<div class='post-outfits-post-item-image post-outfits-post-item-image-no-border'>" + img + "</div>";
			}

			outfit_html += img_container;
			outfit_html += text_container;

			outfit_html += "</div></div>";

			var $outfit = $(outfit_html);

			$outfit.find(".post-outfits-post-item-title").tipTip({

				defaultPosition: "left",
				maxWidth: "auto"

			});

			if (has_img) {
				if (outfit.i.match(/^(https?:\/\/|www\.)/i)) {
					$outfit.find(".post-outfits-post-item-image img").tipTip({

						defaultPosition: "left",
						maxWidth: "auto",
						content: "<div class='post-outfits-post-item-image-hover'><img src='" + pb.text.escape_html(outfit.i) + "' /></div>"

					});

					$outfit.find(".post-outfits-post-item-image img").on("click", function (e) {
						window.open($(this).attr("src"));
					});
				}
			}

			if (yootil.user.is_staff()) {
				$outfit.find(".post-outfits-post-item-title").on("click", function () {
					var _this4 = this;

					pb.window.confirm("Remove outfit from this post?", function () {

						var post_id = parseInt($(_this4).parent().parent().attr("data-post-id-outfit").split("-")[1], 10);

						yootil.key.set(Post_Outfits.PLUGIN_KEY, "", post_id);
						$(_this4).parent().parent().remove();
					});
				});
			}

			$outfit.find(".post-outfits-post-item").css("top", parseInt(Post_Outfits.SETTINGS.top_offset, 10) + "px");

			$post.find("td:first").prepend($outfit.css({

				left: parseInt(width, 10) + parseInt(Post_Outfits.SETTINGS.left_offset, 10) + $post.position().left

			}));
		}
	}, {
		key: "update_outfit_position",
		value: function update_outfit_position() {
			$(".post-outfits-post-item-wrapper").each(function () {
				var $post = $(".post#" + $(this).attr("data-post-id-outfit"));

				if ($post.length == 1) {
					$(this).css({

						left: parseInt($post.css("width"), 10) + parseInt(Post_Outfits.SETTINGS.left_offset, 10) + $post.position().left

					});
				}
			});
		}
	}]);

	return Post_Outfits_Display;
}();

var Post_Outfits_Parser = function () {
	function Post_Outfits_Parser() {
		_classCallCheck(this, Post_Outfits_Parser);

		this.parser_lookup = [{
			open_bbc: "[b]",
			close_bbc: "[/b]",
			open_html: "<b>",
			close_html: "</b>"
		}, {
			open_bbc: "[i]",
			close_bbc: "[/i]",
			open_html: "<em>",
			close_html: "</em>"
		}, {
			open_bbc: "[s]",
			close_bbc: "[/s]",
			open_html: "<s>",
			close_html: "</s>"
		}, {
			open_bbc: "[u]",
			close_bbc: "[/u]",
			open_html: "<u>",
			close_html: "</u>"
		}, {
			open_bbc: "[center]",
			close_bbc: "[/center]",
			open_html: "<div style='text-align: center'>",
			close_html: "</div>"
		}];
	}

	_createClass(Post_Outfits_Parser, [{
		key: "parse",
		value: function parse() {
			var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

			var html = yootil.html_encode(str);

			for (var i = 0; i < this.parser_lookup.length; ++i) {
				var item = this.parser_lookup[i];

				html = html.replace(item.open_bbc, item.open_html);
				html = html.replace(item.close_bbc, item.close_html);
			}

			html = html.replace(/\n|\r/g, "<br />");

			return html;
		}
	}]);

	return Post_Outfits_Parser;
}();


Post_Outfits.init();