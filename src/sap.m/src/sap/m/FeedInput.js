/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/m/TextArea",
	"sap/m/Button",
	"./FeedInputRenderer",
	"sap/ui/thirdparty/jquery",
	"sap/base/security/URLListValidator",
	"sap/base/security/sanitizeHTML",
	"sap/m/Avatar",
	"sap/m/AvatarShape",
	"sap/m/AvatarSize",
	"sap/ui/core/Lib",
	"sap/base/Log"
],
	function(library, Control, TextArea, Button, FeedInputRenderer, jQuery, URLListValidator, sanitizeHTML0, Avatar,
		AvatarShape, AvatarSize, CoreLib, Log) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;


	var MAX_ROWS = 15,
		MIN_ROWS = 2,
		UNLIMITED_ROWS = 0;
	/**
	 * Constructor for a new FeedInput.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The Feed Input allows the user to enter text for a new feed entry and then post it.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22
	 * @alias sap.m.FeedInput
	 */
	var FeedInput = Control.extend("sap.m.FeedInput", /** @lends sap.m.FeedInput.prototype */ {
		metadata : {

			library : "sap.m",
			designtime: "sap/m/designtime/FeedInput.designtime",
			properties : {

				/**
				 * Set this flag to "false" to disable both text input and post button.
				 */
				enabled : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Defines the number of visible text lines for the control.
				 * <b>Note:</b> Minimum value is 2, maximum value is 15.
				 */
				rows : {type : "int", group : "Appearance", defaultValue : 2},

				/**
				 * Determines whether the characters, exceeding the maximum allowed character count, are visible in the input field.
				 *
				 * If set to <code>false</code>, the user is not allowed to enter more characters than what is set in the <code>maxLength</code> property.
				 * If set to <code>true</code>, the characters exceeding the <code>maxLength</code> value are selected on paste and the counter below
				 * the input field displays their number.
				 */
				showExceededText: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * The maximum length (the maximum number of characters) for the feed's input value. By default this is not limited.
				 */
				maxLength : {type : "int", group : "Behavior", defaultValue : 0},

				/**
				 * Indicates the ability of the control to automatically grow and shrink dynamically with its content.
				 */
				growing : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Defines the maximum number of lines that the control can grow.
				 * Value is set to 0 by default, which means an unlimited numbers of rows.
				 * <b>Note:</b> Minimum value to set is equal to the <code>rows</code> property value, maximum value is 15.
				 */
				growingMaxLines : {type : "int", group : "Behavior", defaultValue : 0},

				/**
				 * The placeholder text shown in the input area as long as the user has not entered any text value.
				 */
				placeholder : {type : "string", group : "Appearance", defaultValue : "Post something here"},

				/**
				 * The text value of the feed input. As long as the user has not entered any text the post button is disabled
				 */
				value : {type : "string", group : "Data", defaultValue : null},

				/**
				 * Icon to be displayed as a graphical element within the feed input. This can be an image or an icon from the icon font.
				 */
				icon : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

				/**
				 * Defines the shape of the icon.
				 * @since 1.88
				 */
				iconDisplayShape: { type: "sap.m.AvatarShape", defaultValue: AvatarShape.Circle},

				/**
				 * Defines the initials of the icon.
				 * @since 1.88
				 */
				iconInitials: { type: "string", defaultValue: "" },

				/**
				 * Defines the size of the icon.
				 * @since 1.88
				 */
				iconSize: { type: "sap.m.AvatarSize", defaultValue: AvatarSize.M},

				/**
				 * If set to "true" (default), icons will be displayed. In case no icon is provided the standard placeholder will be displayed. if set to "false" icons are hidden
				 */
				showIcon : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Some mobile devices support higher resolution images while others do not. Therefore, you should provide image resources for all relevant densities.
				 * If the property is set to "true", one or more requests are sent to the server to try and get the perfect density version of an image. If an image of a certain density is not available, the image control falls back to the default image, which should be provided.
				 *
				 * If you do not have higher resolution images, you should set the property to "false" to avoid unnecessary round-trips.
				 *
				 * Please be aware that this property is relevant only for images and not for icons.
				 *
				 * @deprecated as of version 1.88. Image replaced by {@link sap.m.Avatar }
				 */
				iconDensityAware : {type : "boolean", group : "Appearance", defaultValue : true},

				/**
				 * Sets a new tooltip for Submit button. The tooltip can either be a simple string (which in most cases will be rendered as the title attribute of this element)
				 * or an instance of sap.ui.core.TooltipBase.
				 * If a new tooltip is set, any previously set tooltip is deactivated.
				 * The default value is set language dependent.
				 * @since 1.28
				 * @type {sap.ui.core.TooltipBase|string}
				 */
				buttonTooltip : {type : "any", group : "Accessibility", defaultValue : "Submit"},

				/**
				 * Text for Picture which will be read by screenreader.
				 * If a new ariaLabelForPicture is set, any previously set ariaLabelForPicture is deactivated.
				 * @deprecated as of version 1.88. This will not have any effect in code now.
				 */
				ariaLabelForPicture : {type : "string", group : "Accessibility", defaultValue : null}
			},
			aggregations : {
				/**
				 * Defines the inner avatar control.
				 */
				_avatar: { type: "sap.m.Avatar", multiple: false, visibility: "hidden" },
				/**
				 * Defines the actions that are displayed next to the text area. These buttons can be used to trigger actions, such as attaching a file.
				 * This is a {@link sap.m.Button}
				 * If the actions are not set, the post button is displayed as the last control in the feed input.
				 * <b>Note:</b> Only <code>sap.m.Button</code> is supported for this aggregation. If another control is provided, an error is logged and actions are ignored.
				 * @since 1.139
				 */
				actions: {type: "sap.ui.core.Control", multiple: true}
			},
			events : {

				/**
				 * The Post event is triggered when the user has entered a value and pressed the post button. After firing this event, the value is reset.
				 */
				post : {
					parameters : {
						/**
						 * The value of the feed input before reseting it.
						 */
						value : {type : "string"}
					}
				}
			}
		},

		renderer: FeedInputRenderer
	});


	/*
	* These are the rules for the FormattedText
	*/
	var _defaultRenderingRules = {
		// rules for the allowed attributes
		ATTRIBS: {
			'style': 1,
			'class': 1,
			'a::href': 1,
			'a::target': 1
		},
		// rules for the allowed tags
		ELEMENTS: {
			// Text Module Tags
			'a': { cssClass: 'sapMLnk' },
			'abbr': 1,
			'blockquote': 1,
			'br': 1,
			'cite': 1,
			'code': 1,
			'em': 1,
			'h1': { cssClass: 'sapMTitle sapMTitleStyleH1' },
			'h2': { cssClass: 'sapMTitle sapMTitleStyleH2' },
			'h3': { cssClass: 'sapMTitle sapMTitleStyleH3' },
			'h4': { cssClass: 'sapMTitle sapMTitleStyleH4' },
			'h5': { cssClass: 'sapMTitle sapMTitleStyleH5' },
			'h6': { cssClass: 'sapMTitle sapMTitleStyleH6' },
			'p': 1,
			'pre': 1,
			'strong': 1,
			'span': 1,
			'u': 1,

			// List Module Tags
			'dl': 1,
			'dt': 1,
			'dd': 1,
			'ol': 1,
			'ul': 1,
			'li': 1
		}
	};

	/**
	 * Holds the internal list of allowed and evaluated HTML elements and attributes
	 * @private
	 */
	FeedInput.prototype._renderingRules = _defaultRenderingRules;

	/**
	 * Sanitizes attributes on an HTML tag.
	 *
	 * @param {string} tagName An HTML tag name in lower case
	 * @param {array} attribs An array of alternating names and values
	 * @return {array} The sanitized attributes as a list of alternating names and values. Value <code>null</code> removes the attribute.
	 * @private
	 */
	function fnSanitizeAttribs(tagName, attribs) {

		var attr,
			value,
			addTarget = tagName === "a";
		// add UI5 specific classes when appropriate
		var cssClass = (this._renderingRules.ELEMENTS[tagName] && this._renderingRules.ELEMENTS[tagName].cssClass) ? this._renderingRules.ELEMENTS[tagName].cssClass : "";
		for (var i = 0; i < attribs.length; i += 2) {
			// attribs[i] is the name of the tag's attribute.
			// attribs[i+1] is its corresponding value.
			// (i.e. <span class="foo"> -> attribs[i] = "class" | attribs[i+1] = "foo")
			attr = attribs[i];
			value = attribs[i + 1];

			if (!this._renderingRules.ATTRIBS[attr] && !this._renderingRules.ATTRIBS[tagName + "::" + attr]) {
				attribs[i + 1] = null;
				continue;
			}

			// sanitize hrefs
			if (attr == "href") { // a::href
				if (!URLListValidator.validate(value)) {
					attribs[i + 1] = "#";
					addTarget = false;
				}
			}
			if (attr == "target") { // a::target already exists
				addTarget = false;
			}

			// add UI5 classes to the user defined
			if (cssClass && attr.toLowerCase() == "class") {
				attribs[i + 1] = cssClass + " " + value;
				cssClass = "";
			}
		}

		if (addTarget) {
			attribs.push("target");
			attribs.push("_blank");
		}
		// add UI5 classes, if not done before
		if (cssClass) {
			attribs.push("class");
			attribs.push(cssClass);
		}

		return attribs;
	}

	function fnPolicy(tagName, attribs) {
		return fnSanitizeAttribs.call(this, tagName, attribs);
	}
	/**
	 * Sanitizes HTML tags and attributes according to a given policy.
	 *
	 * @param {string} sText The HTML to sanitize
	 * @return {string} The sanitized HTML
	 * @private
	 */

	FeedInput.prototype._sanitizeHTML = function (sText) {
		return sanitizeHTML0(sText, {
			tagPolicy: fnPolicy.bind(this),
			uriRewriter: function (sUrl) {
				// by default, we use the URLListValidator to check the URLs
				if (URLListValidator.validate(sUrl)) {
					return sUrl;
				}
			}
		});
	};

	/////////////////////////////////// Lifecycle /////////////////////////////////////////////////////////

	/**
	 * Overrides sap.ui.core.Element.init
	 */
	FeedInput.prototype.init = function () {
		// override text defaults
		var oBundle = CoreLib.getResourceBundleFor("sap.m");
		this.setProperty("placeholder", oBundle.getText("FEEDINPUT_PLACEHOLDER"), true);
		this.setProperty("buttonTooltip", oBundle.getText("FEEDINPUT_SUBMIT"), true);
	};

	/**
	 * Overrides sap.ui.core.Element.exit
	 */
	FeedInput.prototype.exit = function () {
		if (this._oTextArea) {
			this._oTextArea.destroy();
		}
		if (this._oButton) {
			this._oButton.destroy();
		}
		if (this.oAvatar) {
			this.oAvatar.destroy();
		}
	};

	/////////////////////////////////// Properties /////////////////////////////////////////////////////////

	FeedInput.prototype.setRows = function (iRows) {
		var iMaxLines = this.getProperty("growingMaxLines");
		if (iRows > MAX_ROWS) {
			iRows = MAX_ROWS;
		} else if (iRows < MIN_ROWS) {
			iRows = MIN_ROWS;
		}
		if (iRows > iMaxLines && iMaxLines !== 0) {
			this.setProperty("growingMaxLines", iRows, true);
			this._getTextArea().setGrowingMaxLines(iRows);
		}
		this.setProperty("rows", iRows, true);
		this._getTextArea().setRows(iRows);
		return this;
	};

	FeedInput.prototype.setShowExceededText = function (bValue) {
		this.setProperty("showExceededText", bValue, true);
		this._getTextArea().setShowExceededText(bValue);
		return this;
	};

	FeedInput.prototype.setMaxLength = function (iMaxLength) {
		this.setProperty("maxLength", iMaxLength, true);
		this._getTextArea().setMaxLength(iMaxLength);
		return this;
	};

	FeedInput.prototype.setGrowing = function (bGrowing) {
		this.setProperty("growing", bGrowing, true);
		this._getTextArea().setGrowing(bGrowing);
		return this;
	};

	FeedInput.prototype.setGrowingMaxLines = function (iMaxLines) {
		var iRows = this.getProperty("rows");
		if (iMaxLines !== UNLIMITED_ROWS) {
			if (iMaxLines < iRows) {
				iMaxLines = iRows;
			} else if (iMaxLines > MAX_ROWS) {
				iMaxLines = MAX_ROWS;
			}
		}
		this.setProperty("growingMaxLines", iMaxLines, true);
		this._getTextArea().setGrowingMaxLines(iMaxLines);
		return this;
	};

	FeedInput.prototype.setValue = function (sValue) {
		this.setProperty("value", sValue, true);
		this._getTextArea().setValue(sValue);
		this.enablePostButton();
		return this;
	};

	FeedInput.prototype.setPlaceholder = function (sValue) {
		this.setProperty("placeholder", sValue, true);
		this._getTextArea().setPlaceholder(sValue);
		return this;
	};

	FeedInput.prototype.setEnabled = function (bEnabled) {
		this.setProperty("enabled", bEnabled, true);

		//Dynamically adding or removing the css
		if (this.getDomRef("outerContainer")) {
			if (bEnabled) {
				this.getDomRef("outerContainer").classList.remove("sapMFeedInDisabled");
			} else {
				this.getDomRef("outerContainer").classList.add("sapMFeedInDisabled");
			}
		}
		this._getTextArea().setEnabled(bEnabled);
		this.enablePostButton();
		return this;
	};

	FeedInput.prototype.setButtonTooltip = function (vButtonTooltip) {
		this.setProperty("buttonTooltip", vButtonTooltip, true);
		this._getPostButton().setTooltip(vButtonTooltip);
		return this;
	};

	/////////////////////////////////// Private /////////////////////////////////////////////////////////

	/**
	 * Access and initialization for the text area
	 * @returns {sap.m.TextArea} The text area
	 */
	FeedInput.prototype._getTextArea = function () {
		var that = this;

		if (!this._oTextArea) {
			this._oTextArea = new TextArea(this.getId() + "-textArea", {
				value : this.getValue(),
				maxLength : this.getMaxLength(),
				placeholder : this.getPlaceholder(),
				growing : this.getGrowing(),
				growingMaxLines : this.getGrowingMaxLines(),
				showExceededText : this.getShowExceededText(),
				rows : this.getRows(),
				liveChange : jQuery.proxy(function (oEvt) {
					var sValue = oEvt.getParameter("value");
					this.setProperty("value", sValue, true); // update myself without re-rendering
					this.enablePostButton();
				}, this)
			});
			this._oTextArea.setParent(this);
			this._oTextArea.addEventDelegate({
				onAfterRendering: function () {
					that.$("counterContainer").empty();
					that.$("counterContainer").html(that._oTextArea.getAggregation("_counter").$());
				}
			});
		}
		return this._oTextArea;
	};

	/**
	 * Access and initialization for the button
	 * @returns {sap.m.Button} The button
	 */
	FeedInput.prototype._getPostButton = function () {
		if (!this._oButton) {
			this._oButton = new Button(this.getId() + "-button", {
				enabled : false,
				type : ButtonType.Default,
				icon : "sap-icon://paper-plane",
				tooltip : this.getButtonTooltip(),
				press : jQuery.proxy(function () {
					this._oTextArea.focus();
					this.firePost({
						value : this._sanitizeHTML(this.getValue())
					});
					this.setValue(null);
				}, this)
			});
			this._oButton.setParent(this);
		}
		return this._oButton;
	};

	/**
	 * Enables or disables the post button.
	 * If a boolean parameter is provided, the post button's enabled state is set directly to that value.
	 * @param {boolean} [bEnabled] - Sets the enabled state of the post button.
	 */
	FeedInput.prototype.enablePostButton = function(bEnabled) {
		var oButton = this._getPostButton();
		// If bEnabled is a boolean, set the button's enabled state directly
		// Otherwise, check the control's validity to determine the button's enabled state
		if (typeof bEnabled === "boolean") {
			this._bEnablePostButton = bEnabled;
			oButton.setEnabled(bEnabled);
			// If the button is disabled and the current value is not empty, enable the button
			// This ensures that the button is enabled when the value is set but the button is disabled
			if (bEnabled == false && this.getValue()) {
				oButton.setEnabled(!bEnabled);
			}
		} else {
			var bPostButtonEnabled = this._isControlEnabled();
			oButton.setEnabled(bPostButtonEnabled);
		}
	};

	/**
	 * Checks if the control is valid based on the enablePostButton flag and the value.
	 * @param {boolean} bEnablePostButton
	 * @returns {boolean}
	 */
	FeedInput.prototype._isControlEnabled = function() {
		var sValue = this.getValue();
		if (this._bEnablePostButton) {
			// If bEnablePostButton is true, always return true regardless of value
			return true;
		} else {
			// If bEnablePostButton is false, only return true if there is a value
			return (typeof sValue === "string" || sValue instanceof String) && sValue.trim().length > 0;
		}
	};

	/**
	 * Returns the action button if it is a sap.m.Button, otherwise logs an error and returns null.
	 * @returns {sap.m.Button|null}
	 */
	FeedInput.prototype._getActionButtonIfValid = function () {
		var oActionButton = this.getActions()[0]; // Get the first action button, if any
		if (oActionButton && oActionButton.isA("sap.m.Button")) {
			var sText = oActionButton.getText();
			var sIcon = oActionButton.getIcon();
			if (sIcon && (!sText || sText.trim() === "")) {
				return oActionButton;
			} else {
				Log.error("FeedInput: The actionButton should only have an icon and no text.");
			}
		} else if (oActionButton) {
			Log.error("FeedInput: The provided actionButton aggregation is not a sap.m.Button instance.");
		}
		return;
	};

	/**
	 * Lazy load feed icon image.
	 *
	 * @private
	 * @returns {sap.m.Avatar} The Avatar control
	 */
	FeedInput.prototype._getAvatar = function() {
		var sIconSrc = this.getIcon();
		var sId = this.getId() + '-icon';

		this.oAvatar = this.getAggregation("_avatar");
		if (!this.oAvatar) {
			this.oAvatar = new Avatar({
				id: sId,
				src: sIconSrc,
				displayShape: this.getIconDisplayShape(),
				initials: this.getIconInitials(),
				displaySize: this.getIconSize()
			}).addStyleClass("sapMFeedInImage");
			if (sIconSrc) {
				this.oAvatar.addStyleClass("sapMFeedInImageBgColor");
			}
		} else {
			this.oAvatar
				.setSrc(sIconSrc)
				.setDisplayShape(this.getIconDisplayShape())
				.setInitials(this.getIconInitials())
				.setDisplaySize(this.getIconSize());
		}

		this.setAggregation("_avatar", this.oAvatar);

		return this.oAvatar;
	};

	return FeedInput;

});