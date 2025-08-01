
/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Tokenizer",
	"sap/m/Token",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/MultiInput",
	"sap/ui/base/Event",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery"
], function(nextUIUpdate, Element, Library1, qutils, createAndAppendDiv, Tokenizer, Token, Dialog, Label, MultiInput, Event, Device, KeyCodes, Library, JSONModel, jQuery) {
	"use strict";

	createAndAppendDiv("content");


	var oRb = Library1.getResourceBundleFor("sap.m"),
		TokenizerRenderMode = Library.TokenizerRenderMode;


	QUnit.module("Init", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("test scroll width", function(assert) {
		assert.strictEqual(this.tokenizer.getScrollWidth(), 0, 'Scroll width should be 0 when control is not rendered');
	});

	QUnit.test("Resize handler is attached", async function(assert) {
		//arrange
		this.tokenizer.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.ok(this.tokenizer._sResizeHandlerId, "Tokenizer has resize handler.");
	});

	QUnit.module("Basic", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer("t1");
			this.tokenizer.placeAt("content");
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("clone", function(assert) {
		//arrange
		var token1 = new Token(),
			token2 = new Token(),
			token3 = new Token(),
			tokenizerClone;

		this.tokenizer.addToken(token1);
		this.tokenizer.addToken(token2);
		this.tokenizer.addToken(token3);

		//act
		tokenizerClone = this.tokenizer.clone();

		//assert
		assert.equal(tokenizerClone.getTokens().length, 3, "Clone has 3 tokens");

		//clean-up
		tokenizerClone.destroy();
	});

	QUnit.test("tokens aggregation", function(assert) {
		var token1 = new Token(),
			token2 = new Token(),
			token3 = new Token();

		this.tokenizer.addToken(token1);
		this.tokenizer.addToken(token2);
		this.tokenizer.addToken(token3);

		assert.equal(this.tokenizer.getTokens().length, 3, "Tokenizer contains 3 tokens");

		this.tokenizer.removeToken(token1);
		assert.equal(this.tokenizer.getTokens().length, 2, "Tokenizer contains 2 tokens");

		this.tokenizer.removeAllTokens();
		assert.equal(this.tokenizer.getTokens().length, 0, "Tokenizer contains 0 tokens");
	});

	QUnit.test("removeAllTokens should call setFirstTokenTruncated with 'false'.", async function(assert) {
		var oSpy = this.spy(this.tokenizer, "setFirstTokenTruncated");

		// Act
		this.tokenizer.removeAllTokens();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "setFirstTokenTruncated was called.");
		assert.strictEqual(oSpy.firstCall.args[0], false, "setFirstTokenTruncated was called with 'false'.");
	});

	QUnit.test("Should set the Tokenizer's opener", function(assert) {
		qutils.triggerKeydown(this.tokenizer.getDomRef(), KeyCodes.I, false, false, true);
		assert.strictEqual(document.getElementById(this.tokenizer.getProperty("opener")), this.tokenizer.getDomRef(), "The Tokenizer 'open' property is correct");
	});

	QUnit.test("_handleResize should call _useCollapsedMode and not scrollToEnd so as to show properly the tokens", function(assert) {
		var oUseCollapsedModeSpy = this.spy(this.tokenizer, "_useCollapsedMode"),
			oScrollToEndSpy = this.spy(this.tokenizer, "scrollToEnd");

		// Act
		this.tokenizer._handleResize();

		// Assert
		assert.strictEqual(oUseCollapsedModeSpy.callCount, 1, "_useCollapsedMode was called.");
		assert.strictEqual(oScrollToEndSpy.callCount, 0, "scrollToEnd was called.");
	});

	QUnit.test("DestroyTokens should call setFirstTokenTruncated with 'false'", async function (assert) {
		// arrange
		this.tokenizer.addToken(new Token());
		await nextUIUpdate();
		var oSpy = this.spy(this.tokenizer, "setFirstTokenTruncated");

		// Act
		this.tokenizer.destroyTokens();
		await nextUIUpdate();

		// assert
		assert.strictEqual(oSpy.callCount, 1, "setFirstTokenTruncated was called.");
		assert.ok(oSpy.calledWith(false), "The setFirstTokenTruncated is called with false value");
	});


	QUnit.test("updateTokens should call setFirstTokenTruncated with 'false'.", async function(assert) {
		var oSpy = this.spy(this.tokenizer, "setFirstTokenTruncated");

		// Arrange
		this.tokenizer.updateAggregation = this.stub().returns(true);

		// Act
		this.tokenizer.updateAggregation("tokens");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "setFirstTokenTruncated was called.");
		assert.strictEqual(oSpy.firstCall.args[0], false, "setFirstTokenTruncated was called with 'false'.");
	});

	QUnit.test("getSelectedTokens", function(assert) {
		var token1 = new Token({ selected : true });
		var token2 = new Token();
		var token3 = new Token({ selected : true });

		this.tokenizer.addToken(token1);
		this.tokenizer.addToken(token2);
		this.tokenizer.addToken(token3);

		var aSelectedTokens = this.tokenizer.getSelectedTokens();

		assert.equal(aSelectedTokens.length, 2, "2 selected tokens");
		assert.equal(aSelectedTokens[0], token1, "correct selected token1");
		assert.equal(aSelectedTokens[1], token3, "correct selected token3");
		assert.notEqual(aSelectedTokens.length, this.tokenizer.getTokens().length, "not all tokens are selected");

		// act
		token2.setSelected(true);
		aSelectedTokens = this.tokenizer.getSelectedTokens();

		// assert
		assert.equal(aSelectedTokens.length, this.tokenizer.getTokens().length, "all tokens are selected");
	});

	QUnit.test("test keyboard select all", function(assert) {
		// arrange
		var token1 = new Token(),
			token2 = new Token(),
			token3 = new Token();

		[token1, token2, token3].forEach(function(oToken) {
			this.tokenizer.addToken(oToken);
		}, this);

		// act
		this.tokenizer.onkeydown({ctrlKey: true, which: KeyCodes.A, preventDefault: function(){}, stopPropagation: function(){}});

		// assert
		assert.equal(token1.getSelected(), true, "Token1 got selected using ctrl+a");
		assert.equal(token2.getSelected(), true, "Token2 got selected using ctrl+a");
		assert.equal(token3.getSelected(), true, "Token3 got selected using ctrl+a");

		// act
		token1.setSelected(false);
		token2.setSelected(false);
		token3.setSelected(false);

		this.tokenizer.onkeydown({metaKey: true, which: KeyCodes.A, preventDefault: function(){}, stopPropagation: function(){}});

		// assert
		assert.equal(token1.getSelected(), true, "Token1 got selected using metaKey+a");
		assert.equal(token2.getSelected(), true, "Token2 got selected using metaKey+a");
		assert.equal(token3.getSelected(), true, "Token3 got selected using metaKey+a");
	});


	QUnit.test("token editable in tokenizer", async function(assert) {
		var oToken1 = new Token({text:"Dente", editable: false}),
			oToken2 = new Token({text:"Friese", editable: false}),
			oToken3 = new Token({text:"Mann", editable: true});

		[oToken1, oToken2, oToken3].forEach(function(oToken) {
			this.tokenizer.addToken(oToken);
		}, this);

		await nextUIUpdate();

		assert.equal(oToken1.$().hasClass("sapMTokenReadOnly"), true, "token1 is not editable");
		assert.equal(oToken2.$().hasClass("sapMTokenReadOnly"), true, "token2 is not editable");
		assert.equal(oToken3.$().hasClass("sapMTokenReadOnly"), false, "token3 is editable");
	});

	QUnit.test("checks if onsapmodifiers prevents broser navigation", async function(assert) {
		this.stub(Device, "os").value({
			windows: true,
			macintosh: false
		});

		var oTokenizer = new Tokenizer();
		var oSpy = this.spy(oTokenizer, "onsapprevious");
		var oNextSpy = this.spy(oTokenizer, "onsapnext");
		var oFakeEvent = {
			metaKey: false,
			altKey: true
		};

		oTokenizer.onsappreviousmodifiers(oFakeEvent);
		await nextUIUpdate();

		assert.notOk(oSpy.called, "onsappreviousmodifiers should not call onsapprevious on arrow left + alt");

		oTokenizer.onsapnextmodifiers(oFakeEvent);
		await nextUIUpdate();

		assert.notOk(oNextSpy.called, "onsapnextmodifiers should not call onsapnext on arrow right + alt");

		oTokenizer.destroy();
	});

	QUnit.test("checks if onsappreviousmodifiers prevents broser navigation", async function(assert) {
		this.stub(Device, "os").value({
			windows: false,
			macintosh: true
		});

		var oTokenizer = new Tokenizer();
		var oSpy = this.spy(oTokenizer, "onsapprevious");
		var oNextSpy = this.spy(oTokenizer, "onsapnext");
		var oFakeEvent = {
			metaKey: true,
			altKey: false
		};

		oTokenizer.onsappreviousmodifiers(oFakeEvent);
		await nextUIUpdate();

		assert.notOk(oSpy.called, "onsappreviousmodifiers should not call onsapprevious on arrow left + cmnd");

		oTokenizer.onsapnextmodifiers(oFakeEvent);
		await nextUIUpdate();

		assert.notOk(oNextSpy.called, "onsapnextmodifiers should not call onsapnext on arrow right + alt");

		oTokenizer.destroy();

		oTokenizer.destroy();
	});

	QUnit.test("selected token is visible after select with left arrow", async function(assert) {
		var oSpecialToken = new Token({text: "Token 5", key: "0005"}),
			oMultiInput = new MultiInput({
				width: '800px',
				tokens: [
					new Token({text: "Token 1", key: "0001"}),
					new Token({text: "Token 2", key: "0002"}),
					new Token({text: "Token 3", key: "0003"}),
					new Token({text: "Token 4", key: "0004"}),
					oSpecialToken,
					new Token("t6", {text: "Token 6", key: "0006"})
				],
				editable: true
			});

		oMultiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oTokenizerDomRef = oMultiInput.$().find('.sapMTokenizer')[0];

		// act
		qutils.triggerKeydown(oTokenizerDomRef, KeyCodes.ARROW_LEFT);

		// assert
		assert.strictEqual(Element.getElementById("t6").getDomRef().id, document.activeElement.id,
			"Token6 is selected.");

		// act
		qutils.triggerKeydown(oTokenizerDomRef, KeyCodes.ARROW_LEFT);

		// assert
		assert.strictEqual(oSpecialToken.getDomRef().id, document.activeElement.id,
			"Token5 is selected.");
		assert.ok(oSpecialToken.$().offset().left >= jQuery(oTokenizerDomRef).offset().left, "token 5 left side is visible.");

		oMultiInput.destroy();
	});

	QUnit.test("click on token or nMore indicator should expand tokenizer", async function(assert) {
		this.clock = sinon.useFakeTimers();

		var oTokenizer = new Tokenizer({width: "150px", renderMode: "Narrow"});
		var oToken1 = new Token({text:"Dente", editable: false}),
			oToken2 = new Token({text:"Friese", editable: false}),
			oToken3 = new Token({text:"Mann", editable: true});
		var oFakeEvent = {
			srcControl: oToken1
		};

		[oToken1, oToken2, oToken3].forEach(function(oToken) {
			oTokenizer.addToken(oToken);
		});

		oTokenizer.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		oTokenizer.onfocusin(oFakeEvent);
		this.clock.tick();

		assert.strictEqual(oTokenizer.getRenderMode(), "Loose", 'Tokenizer gets expanded on focus');

		oTokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		this.clock.tick();

		oTokenizer._handleNMoreIndicatorPress();
		this.clock.tick(500);

		assert.strictEqual(oTokenizer.getRenderMode(), "Loose", 'Tokenizer gets expanded on nMoreIndicator click');

		this.clock.restore();
		oTokenizer.destroy();
	});

	QUnit.test("test setEditable=false Tokenizer with editable tokens", async function(assert) {
		var aFirstToken,
			aSecondToken;

		//arrange
		this.tokenizer.addToken(new Token({text: "Token 1", key: "0001"}));
		this.tokenizer.addToken(new Token({text: "Token 2", key: "0002", editable: false}));

		aFirstToken = this.tokenizer.getTokens()[0];
		aSecondToken = this.tokenizer.getTokens()[1];

		await nextUIUpdate();

		//assert
		assert.ok(aFirstToken.getDomRef('icon'), 'First token has icon');
		assert.ok(!aSecondToken.getDomRef('icon'), 'Second token icon does not exist');

		//act
		this.tokenizer.setEditable(false);

		await nextUIUpdate();

		//assert
		assert.strictEqual(aFirstToken.$('icon').css('display'), 'none', 'First token icon is invisible');
		assert.ok(!aSecondToken.getDomRef('icon'), 'Second token icon does not exist');
	});

	QUnit.test("_getPixelWidth", async function(assert) {
		// Arrange
		var oToken1 = new Token({text:"Token 1"}),
			oToken2 = new Token({text:"Token 1"}),
			sTokenizerWidth,
			iPaddingLeft;

		// Act
		[oToken1, oToken2].forEach(function(oToken) {
			this.tokenizer.addToken(oToken);
		}, this);
		await nextUIUpdate();
		iPaddingLeft = parseInt(this.tokenizer.$().css("padding-left"));
		sTokenizerWidth = this.tokenizer._getPixelWidth();

		// Assert
		assert.strictEqual(sTokenizerWidth, this.tokenizer.getDomRef().clientWidth - iPaddingLeft, "When there is no maxWidth set, the client width of the tokenizer should be taken for calculation.");

		// Act
		this.tokenizer.setMaxWidth("3rem");
		await nextUIUpdate();
		sTokenizerWidth = this.tokenizer._getPixelWidth();

		// Assert
		assert.strictEqual(sTokenizerWidth, this.tokenizer.getDomRef().clientWidth - iPaddingLeft, "When the maxWidth is not set in pixels, the client width of the tokenizer should be taken for calculation.");

		// Act
		this.tokenizer.setMaxWidth("99px");
		await nextUIUpdate();
		sTokenizerWidth = this.tokenizer._getPixelWidth();

		// Assert
		assert.strictEqual(sTokenizerWidth, 99 - iPaddingLeft, "When the maxWidth is set in pixels, the maxWidth property should be taken for calculation.");
	});

	QUnit.test("_mapTokenToListItem with not escaped strings does not throw an exception", function (assert) {
		var sNotEscapedString = "asd{",
			oToken = new Token();

		oToken.setKey(sNotEscapedString);
		oToken.setText(sNotEscapedString);
		oToken.setTooltip(sNotEscapedString);

		this.tokenizer._mapTokenToListItem(oToken);

		assert.ok(true, "No exception is thrown");
	});

	/**
	 * @deprecated As of version 1.82
	 */
	 QUnit.test("Should fire tokenUpdate when mapping between List items and Tokens on Token deletion", async function (assert) {
		// Setup
		var oModel = new JSONModel({
				items: [{text: "Token 0"},
					{text: "Token 1"},
					{text: "Token 2"}
				]
			}),
			oTokenizer = new Tokenizer({
				tokens: {path: "/items", template: new Token({text: {path: "text"}})},
				width: "200px",
				renderMode: "Narrow"
			})
				.setModel(oModel)
				.placeAt("content"),
			oEvent = {
				getParameter: function () {
					return oTokenizer._getTokensList().getItems()[0];
				}
			};

		var oTokenUpdateSpy = this.spy(oTokenizer, "fireTokenUpdate");

		await nextUIUpdate();

		// Act
		oModel.setData({
			items: [
				{text: "Token 1"},
				{text: "Token 2"}
			]
		});

		oTokenizer._handleNMoreIndicatorPress();
		await nextUIUpdate();

		oTokenizer._handleListItemDelete(oEvent);
		await nextUIUpdate();

		// Assert
		assert.ok(oTokenUpdateSpy.called, "Token Update event should be called");

		// Cleanup
		oTokenizer.destroy();
	});

	QUnit.test("Handle mapping between List items and Tokens on Token deletion", async function (assert) {
		// Setup
		var aItems, oItem, oToken,
			oModel = new JSONModel({
				items: [{text: "Token 0"},
					{text: "Token 1"},
					{text: "Token 2"}
				]
			}),
			oTokenizer = new Tokenizer({
				tokens: {path: "/items", template: new Token({text: {path: "text"}})},
				width: "200px",
				renderMode: "Narrow"
			})
				.setModel(oModel)
				.placeAt("content"),
			oEvent = {
				getParameter: function () {
					return oTokenizer._getTokensList().getItems()[0];
				}
			};

		var oTokenDeleteSpy = this.spy(oTokenizer, "fireTokenDelete");

		await nextUIUpdate();

		// Act
		oModel.setData({
			items: [
				{text: "Token 1"},
				{text: "Token 2"}
			]
		});

		oTokenizer._handleNMoreIndicatorPress();
		await nextUIUpdate();

		oTokenizer._handleListItemDelete(oEvent);
		await nextUIUpdate();

		// Assert
		aItems = oTokenizer._getTokensList().getItems();
		oTokenizer.getTokens();
		assert.ok(oTokenDeleteSpy.called, "Token Delete event should be called");

		oItem = aItems[0];
		oToken = Element.getElementById(oItem.data("tokenId"));
		assert.strictEqual(oItem.getTitle(), oToken.getText(), "The first item in the list should be the same as the Token" + oItem.getTitle());

		// Cleanup
		oTokenizer.destroy();
	});

	QUnit.test("Handle mapping between List items and Tokens on Token deletion when fired from a token", async function (assert) {
		// Setup
		this.clock = sinon.useFakeTimers();
		const oModel = new JSONModel({
				items: [
					{text: "Token 0"},
					{text: "Token 1"},
					{text: "Token 2"}
				]
			}),
			oTokenizer = new Tokenizer({
				tokens: {path: "/items", template: new Token({text: {path: "text"}})},
				width: "150px",
				renderMode: "Narrow",
				tokenDelete: function(oEvent) {
					oModel.setData({
						items: [
							{text: "Token 1"},
							{text: "Token 2"}
						]
					});
				}
			})
			.setModel(oModel)
			.placeAt("content");
		await nextUIUpdate(this.clock);

		oTokenizer._handleNMoreIndicatorPress();
		this.clock.tick(500);

		// Act
		oTokenizer.getTokens()[0].getAggregation("deleteIcon").firePress();
		this.clock.tick(500);

		// Assert
		const aItems = oTokenizer._getTokensList().getItems();
		assert.strictEqual(aItems.length, 2, "There should be 2 items in the list");
		assert.strictEqual(oTokenizer.getTokens().length, 2, "The Tokenizer should have 2 tokens");

		// Cleanup
		this.clock.restore();
		oTokenizer.destroy();
	});

	QUnit.test("should fire press event coming from n-more list", function (assert) {
		// Setup
		var oList, oHandleListItemPressSpy,
			oModel = new JSONModel({
				items: [{text: "Token 0"},
					{text: "Token 1"},
					{text: "Token 2"}
				]
			}),
			oTokenizer = new Tokenizer({
				tokens: {path: "/items", template: new Token({text: {path: "text"}})},
				width: "200px",
				renderMode: "Narrow"
			})
				.setModel(oModel)
				.placeAt("content");

		oHandleListItemPressSpy = this.spy(oTokenizer, "_handleListItemPress");

		// Act
		oList = oTokenizer._getTokensList();
		oList.fireItemPress();

		// Assert
		assert.ok(oHandleListItemPressSpy.called, "List item pressed event should be called");

		// Cleanup
		oTokenizer.destroy();
	});

	QUnit.test("Handle firePress event mapping between List items and Tokens on n-more item pressed", async function (assert) {
		// Setup
		var aItems, oItem, oToken, oFirstItemPressFiredSpy,
			oModel = new JSONModel({
				items: [{text: "Token 0"},
					{text: "Token 1"},
					{text: "Token 2"}
				]
			}),
			oTokenizer = new Tokenizer({
				tokens: {path: "/items", template: new Token({text: {path: "text"}})},
				width: "200px",
				renderMode: "Narrow"
			})
				.setModel(oModel)
				.placeAt("content"),
			oEvent = {
				getParameter: function () {
					return oTokenizer._getTokensList().getItems()[0];
				}
			};

		await nextUIUpdate();

		oTokenizer._handleNMoreIndicatorPress();
		await nextUIUpdate();

		aItems = oTokenizer._getTokensList().getItems();
		oItem = aItems[0];
		oToken = Element.getElementById(oItem.data("tokenId"));
		oFirstItemPressFiredSpy = this.spy(oToken, "firePress");

		oTokenizer._handleListItemPress(oEvent);
		await nextUIUpdate();

		// Assert
		assert.ok(oFirstItemPressFiredSpy.called, "pressed event fired on the correct token since corresponding list item pressed");

		// Cleanup
		oTokenizer.destroy();
	});

	QUnit.test("Should select and deselect token on click", async function (assert) {
		// Setup
		var oTokenizer = new Tokenizer({
			tokens: [
				new Token({text: "Just a simple little token"})
			],
			width: "285px",
			renderMode: "Narrow"
		}).placeAt("content");
		var oToken = oTokenizer.getTokens()[0];

		await nextUIUpdate();


		qutils.triggerEvent("tap", oToken.getDomRef());
		await nextUIUpdate();

		// Assert
		assert.ok(oToken.getSelected(), "First token is selected");

		qutils.triggerEvent("tap", oToken.getDomRef());
		await nextUIUpdate();

		assert.notOk(oToken.getSelected(), "First token is not selected");

		// Cleanup
		oTokenizer.destroy();
	});

	QUnit.test("Should not throw exception when the association does not have text property", function (assert) {
		this.clock = sinon.useFakeTimers();

		var oTokenizer = new Tokenizer({
			width: "300px"
		}).placeAt("content");

		oTokenizer.addToken(new Token({text: "Token 1", key: "0001"}));
		oTokenizer.addToken(new Token({text: "Token 2", key: "0002"}));
		oTokenizer.addToken(new Token({text: "Token 3", key: "0003"}));

		oTokenizer.addAriaLabelledBy(new sap.m.Panel({ headerText: "Panel header text" }));
		const oTokenPopover = oTokenizer.getTokensPopup();
		oTokenPopover.isOpen();

		//assert
		assert.ok(true, "No exception is thrown");

		// Cleanup
		this.clock.restore();
		oTokenizer.destroy();
	});

	QUnit.test("Should open/close suggestion popover on CTRL + I", async function (assert) {
		this.clock = sinon.useFakeTimers();

		var oTokenizer = new Tokenizer({
			width: "300px"
		}).placeAt("content");

		oTokenizer.addToken(new Token({text: "Token 1", key: "0001"}));
		oTokenizer.addToken(new Token({text: "Token 2", key: "0002"}));
		oTokenizer.addToken(new Token({text: "Token 3", key: "0003"}));

		await nextUIUpdate(this.clock);

		var oToken = oTokenizer.getTokens()[1];

		oToken.focus();

		qutils.triggerKeydown(oToken.getDomRef(), KeyCodes.I, false, false, true);
		this.clock.tick(300);

		var oTokenPopover = oTokenizer.getTokensPopup();
		var oListToken = oTokenizer._getTokensList().getItems()[0].getDomRef();

		// Assert
		assert.ok(oTokenPopover.isOpen(), "Should open suggestion popover");

		// Act
		qutils.triggerKeydown(oListToken, KeyCodes.I, false, false, true);
		this.clock.tick(600);

		// Assert
		assert.notOk(oTokenPopover.isOpen(), "Should close suggestion popover");
		assert.strictEqual(oToken.getDomRef(), document.activeElement, "The focus should be on the token that was focused before the opening of the popover");

		qutils.triggerKeydown(oToken.getDomRef(), KeyCodes.I, false, false, true);
		this.clock.tick(300);

		oListToken = oTokenizer._getTokensList().getItems()[0].getDomRef();

		qutils.triggerKeydown(oListToken, KeyCodes.ESCAPE);
		this.clock.tick(600);

		assert.notOk(oTokenPopover.isOpen(), "ESC should close suggestion popover");

		this.clock.restore();
		oTokenizer.destroy();
	});

	QUnit.test("Should open/close suggestion popover on F4, ALT + ARROW DOWN and ALT + ARROW UP", async function (assert) {
		this.clock = sinon.useFakeTimers();

		var oTokenizer = new Tokenizer({
			width: "300px"
		}).placeAt("content");

		oTokenizer.addToken(new Token({text: "Token 1", key: "0001"}));
		oTokenizer.addToken(new Token({text: "Token 2", key: "0002"}));
		oTokenizer.addToken(new Token({text: "Token 3", key: "0003"}));

		await nextUIUpdate(this.clock);

		var oToken = oTokenizer.getTokens()[1];

		oToken.focus();

		qutils.triggerKeydown(oToken.getDomRef(), KeyCodes.F4);
		this.clock.tick(300);

		var oTokenPopover = oTokenizer.getTokensPopup();
		var oListToken = oTokenizer._getTokensList().getItems()[0].getDomRef();

		// Assert
		assert.ok(oTokenPopover.isOpen(), "Should open suggestion popover");

		// Act
		qutils.triggerKeydown(oListToken, KeyCodes.F4);
		this.clock.tick(600);

		// Assert
		assert.notOk(oTokenPopover.isOpen(), "Should close suggestion popover");
		assert.strictEqual(oToken.getDomRef(), document.activeElement, "The focus should be on the token that was focused before the opening of the popover");

		qutils.triggerKeydown(oToken.getDomRef(), KeyCodes.ARROW_DOWN, false, true, false);
		this.clock.tick(300);

		assert.ok(oTokenPopover.isOpen(), "ALT + ARROW DOWN should open suggestion popover");

		oListToken = oTokenizer._getTokensList().getItems()[0].getDomRef();

		qutils.triggerKeydown(oListToken, KeyCodes.ARROW_DOWN, false, true, false);
		this.clock.tick(600);

		assert.notOk(oTokenPopover.isOpen(), "ALT + ARROW DOWN should close suggestion popover");

		qutils.triggerKeydown(oToken.getDomRef(), KeyCodes.ARROW_UP, false, true, false);
		this.clock.tick(300);

		assert.ok(oTokenPopover.isOpen(), "ALT + ARROW UP should open suggestion popover");

		oListToken = oTokenizer._getTokensList().getItems()[0].getDomRef();

		qutils.triggerKeydown(oListToken, KeyCodes.ARROW_UP, false, true, false);
		this.clock.tick(600);

		assert.notOk(oTokenPopover.isOpen(), "ALT + ARROW UP should close suggestion popover");

		this.clock.restore();
		oTokenizer.destroy();
	});

	QUnit.test("Should reset focus on the nMore tokens popover after re-open", async function (assert) {
		this.clock = sinon.useFakeTimers();

		var oListToken;
		var oTokenizer = new Tokenizer({
			width: "300px"
		}).placeAt("content");

		oTokenizer.addToken(new Token({text: "Token 1", key: "0001"}));
		oTokenizer.addToken(new Token({text: "Token 2", key: "0002"}));
		oTokenizer.addToken(new Token({text: "Token 3", key: "0003"}));

		await nextUIUpdate(this.clock);

		var oToken = oTokenizer.getTokens()[1];
		oToken.focus();

		qutils.triggerKeydown(oToken.getDomRef(), KeyCodes.F4);
		this.clock.tick(300);

		oListToken = oTokenizer._getTokensList().getItems()[0].getDomRef();

		qutils.triggerKeydown(oListToken, KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oListToken, KeyCodes.ESCAPE);
		this.clock.tick(600);

		qutils.triggerKeydown(oToken.getDomRef(), KeyCodes.F4);
		this.clock.tick(600);

		assert.strictEqual(oTokenizer._getTokensList().getItems()[0].getDomRef(), document.activeElement, "First list item should be focused");

		this.clock.restore();
		oTokenizer.destroy();
	});

	QUnit.test("Should focus the closest token after multiple token deletion", async function (assert) {
		var oToken;
		var oTokenizer = new Tokenizer({
			width: "300px"
		}).placeAt("content");

		oTokenizer.addToken(new Token({text: "Token 1", key: "0001", selected: true}));
		oTokenizer.addToken(new Token({text: "Token 2", key: "0002",  selected: true}));
		oTokenizer.addToken(new Token({text: "Token 3", key: "0003"}));

		await nextUIUpdate();

		oToken = oTokenizer.getTokens()[1];
		oToken.focus();

		qutils.triggerKeydown(oToken.getDomRef(), KeyCodes.DELETE);
		assert.strictEqual(oTokenizer.getTokens()[2].getDomRef(), document.activeElement, "The closest token should be focused");

		oTokenizer.destroy();
	});

	QUnit.test("Non-editable tokens should not have aria-readonly attribute", async function(assert) {
		var oToken = new Token({text: "Token 1", key: "0001", editable: false});
		var oTokenizer = new Tokenizer({
			width: "300px"
		}).placeAt("content");

		oTokenizer.addToken(oToken);
		await nextUIUpdate();

		// aria-readonly is not valid for the current role of the token.
		assert.notOk(oToken.getDomRef().hasAttribute("aria-readonly"), "The token should not have aria-readonly attribute");
		oTokenizer.destroy();
	});

	QUnit.test("The nMore indicator should have the correct accessibility attributes", async function(assert) {
		var oTokenizer = new Tokenizer({
			width: "150px"
		}).placeAt("content");

		oTokenizer.addToken(new Token({text: "Token 1", key: "0001", selected: true}));
		oTokenizer.addToken(new Token({text: "Token 2", key: "0002",  selected: true}));
		oTokenizer.addToken(new Token({text: "Token 3", key: "0003"}));

		await nextUIUpdate();

		var nMoreLink = oTokenizer.getDomRef().querySelector(".sapMTokenizerIndicator");

		assert.notOk(nMoreLink.hasAttribute("aria-controls"), "The aria-controls attribute should not be set initially");

		var oResponsivePopover = oTokenizer.getTokensPopup();
		var oResponsivePopoverContent = oResponsivePopover._oControl;

		assert.strictEqual(nMoreLink.getAttribute("role"), "button", "The role of the nMore indicator should be button");
		assert.strictEqual(nMoreLink.getAttribute("aria-expanded"), "false", "The aria-expanded attribute should be false");

		oTokenizer._handleNMoreIndicatorPress();
		oTokenizer.invalidate();
		await nextUIUpdate();

		assert.strictEqual(nMoreLink.getAttribute("aria-haspopup"), "dialog", "The aria-haspopup attribute should be dialog");
		assert.strictEqual(nMoreLink.getAttribute("aria-controls"), oResponsivePopoverContent.getId(), "The aria-controls attribute should be set to the id of the responsive popover content");

		assert.strictEqual(nMoreLink.getAttribute("aria-expanded"), "true", "The aria-expanded attribute should be true");
		oTokenizer.destroy();
	});

	QUnit.test("Should render and not focus disabled tokenizer", async function(assert) {
		var oTokenizer = new Tokenizer({
			width: "300px",
			enabled: false
		}).placeAt("content");

		oTokenizer.addToken(new Token({text: "Token 1", key: "0001"}));
		oTokenizer.addToken(new Token({text: "Token 2", key: "0002"}));
		await nextUIUpdate();

		assert.ok(oTokenizer.getDomRef().classList.contains("sapMTokenizerDisabled"), "The aria-expanded attribute should be true");
		assert.ok(oTokenizer.getTokens()[0].getDomRef().getAttribute("tabindex"), "-1", "tabindex should be -1");

		oTokenizer.destroy();
	});

	QUnit.test("Should not throw exception on rendering when first token is hidden", async function(assert) {
		var oTokenizer = new Tokenizer({
			width: "300px",
			enabled: false
		}).placeAt("content");

		oTokenizer.addToken(new Token({text: "Token 1", key: "0001", visible: false}));
		oTokenizer.addToken(new Token({text: "Token 2", key: "0002"}));
		await nextUIUpdate();

		assert.ok(true, "No exception is thrown");

		oTokenizer.getTokens()[0].setSelected(true);

		// Cause a re-rendering
		oTokenizer.setRenderMode(TokenizerRenderMode.Loose);
		await nextUIUpdate();

		assert.ok(true, "No exception is thrown");

		oTokenizer.destroy();
	});

	QUnit.test("Should fire renderModeChange event when expanding/collapsing", async function (assert) {
		var oTokenizer = new Tokenizer({
			width: "300px"
		}).placeAt("content");

		oTokenizer.addToken(new Token({text: "Token 1", key: "0001"}));
		oTokenizer.addToken(new Token({text: "Token 2", key: "0002"}));
		oTokenizer.addToken(new Token({text: "Token 3", key: "0003"}));

		await nextUIUpdate();

		var oRenderModeChangeSpy = this.spy(oTokenizer, "fireRenderModeChange");
		var oFakeEvent = {
			srcControl: oTokenizer.getTokens()[0]
		};

		// renderModeChange when expanding on focusin
		oTokenizer.onfocusin(oFakeEvent);
		assert.ok(oRenderModeChangeSpy.calledWithMatch({renderMode: "Loose"}), "Should fire renderModeChange event when expanding on focusin");

		// renderModeChange when expanding on focus out
		oTokenizer.onsapfocusleave();
		assert.ok(oRenderModeChangeSpy.calledWithMatch({renderMode: "Narrow"}), "Should fire renderModeChange event when collapsing on focus out");

		// renderModeChange on nMore link click
		oTokenizer._handleNMoreIndicatorPress();
		assert.ok(oRenderModeChangeSpy.calledWithMatch({renderMode: "Loose"}), "Should fire renderModeChange event when expanding on nMore indicator click");

		// renderModeChange on nMore link click
		oTokenizer.getTokensPopup().close();
		assert.ok(oRenderModeChangeSpy.calledWithMatch({renderMode: "Narrow"}), "Should fire renderModeChange event when collapsing after nMore popover is closed");

		oTokenizer.destroy();
	});

	QUnit.module("Setters", {
		beforeEach : async function() {
			this.tokenizer = new Tokenizer();

			this.tokenizer.placeAt("content");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("setEditable", async function (assert) {
		var oToken;
		this.tokenizer.addToken(new Token({text: "Token 1", key: "0001"}));

		oToken = this.tokenizer.getTokens()[0];

		assert.ok(oToken.getProperty("editableParent"), "Token's parent is editable");

		this.tokenizer.setEditable(false);
		await nextUIUpdate();

		assert.strictEqual(this.tokenizer.getEditable(), false, "The property of the Tokenizer was set.");
		assert.strictEqual(oToken.getProperty("editableParent"), false, "The editableParent property of the Token was correctly set");
	});

	QUnit.test("setWidth and setPixelWidth", async function(assert) {
		var WIDTH = 300,
			S_WIDTH = "200px";

		// act
		this.tokenizer.setWidth(S_WIDTH);
		await nextUIUpdate();

		// assert
		assert.equal(this.tokenizer.getDomRef().style.width, S_WIDTH, "Tokenizer width is set to " + S_WIDTH);

		// act
		this.tokenizer.setPixelWidth("400px");
		await nextUIUpdate();

		assert.equal(this.tokenizer.getDomRef().style.width, S_WIDTH, "Tokenizer width remains " + S_WIDTH);

		// act
		this.tokenizer.setPixelWidth(WIDTH);
		await nextUIUpdate();

		// assert
		assert.equal(this.tokenizer.getDomRef().style.width, WIDTH + "px", "Tokenizer width is set to 300px");
	});

	QUnit.test("setMaxWidth", async function(assert) {
		var MAX_WIDTH = "300px";

		// act
		this.tokenizer.setMaxWidth(MAX_WIDTH);
		await nextUIUpdate();

		// assert
		assert.equal(this.tokenizer.getDomRef().style.maxWidth, MAX_WIDTH, "Tokenizer max-width is set to " + MAX_WIDTH);
	});

	QUnit.test("setMaxWidth in adjustable tokenizer calls _adjustTokensVisibility", async function(assert) {
		var MAX_WIDTH = "300px";
		this.tokenizer.addToken(new Token({key:"XXX", text: "XXX"}));
		await nextUIUpdate();

		// act
		var spy = this.spy(Tokenizer.prototype, "_adjustTokensVisibility");
		this.tokenizer.setMaxWidth(MAX_WIDTH);

		await nextUIUpdate();

		// assert
		assert.ok(spy.called, "tokenizer's _adjustTokensVisibility was called once");
	});

	QUnit.test("setEnabled", async function(assert) {
		// act
		this.tokenizer.setEnabled(false);
		await nextUIUpdate();

		// assert
		assert.ok(this.tokenizer.$().hasClass("sapMTokenizerDisabled"), "Tokenizer's dom has class sapMTokenizerDisabled");
	});

	QUnit.test("setHiddenTokensCount", function(assert) {
		var oSpy;

		// assert
		assert.strictEqual(this.tokenizer.getHiddenTokensCount(), 0, "Initially the hidden tokens count is 0");
		// act
		this.tokenizer._setHiddenTokensCount(5);
		// assert
		assert.strictEqual(this.tokenizer.getHiddenTokensCount(), 5, "The Token's count was correctly set to 5");

		oSpy = this.spy(this.tokenizer, "_setHiddenTokensCount");
		// act
		try {
			this.tokenizer._setHiddenTokensCount("x");
		} catch (e) {
			// do nothing here
		}
		// assert
		assert.strictEqual(oSpy.threw(), true, "The setter is checking for type match");
	});

	QUnit.module("Disabled state", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer("t1");
			this.tokenizer.placeAt("content");
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	/**
	 * @deprecated As of version 1.82
	 */
	QUnit.test("Pressing delete icon when Tokenizer is disabled should not fire tokenUpdate", async function(assert) {
		// arrange
		var oUpdateTokensSpy,
			oToken = new Token({text: "test"});

		oUpdateTokensSpy = this.spy(this.tokenizer, "fireTokenUpdate");
		this.tokenizer.addToken(oToken);
		this.tokenizer.setEnabled(false);
		await nextUIUpdate();

		// act
		oToken.getAggregation("deleteIcon").firePress();

		// assert
		assert.equal(oUpdateTokensSpy.callCount, 0, "TokenUpdate was NOT fired");
	});

	QUnit.test("Pressing delete icon when Tokenizer is disabled", async function(assert) {
		// arrange
		var oFireDeleteSpy,
			oToken = new Token({text: "test"});

		oFireDeleteSpy = this.spy(oToken, "fireDelete");
		this.tokenizer.addToken(oToken);
		this.tokenizer.setEnabled(false);
		await nextUIUpdate();

		// act
		oToken.getAggregation("deleteIcon").firePress();

		// assert
		assert.equal(oFireDeleteSpy.callCount, 0, "delete event was NOT BE fired");
		assert.ok(!oToken.bIsDestroyed, "Token1 is NOT destroyed");
	});

	QUnit.test("Pressing delete icon should fire delete event with cancel bubbling", async function(assert) {
		// arrange
		var oFireDeleteSpy,
			oToken = new Token({text: "test"});

		this.tokenizer.attachEvent("delete", function(oEvent) {
			assert.strictEqual(oEvent.bCancelBubble, true, "The event should not bubble.");
		});

		oFireDeleteSpy = this.spy(oToken, "fireDelete");
		this.tokenizer.addToken(oToken);
		await nextUIUpdate();

		// act
		oToken.getAggregation("deleteIcon").firePress();

		// assert
		assert.equal(oFireDeleteSpy.callCount, 1, "delete event was fired");
	});

	QUnit.module("Keyboard handling", {
		beforeEach : async function() {
			this.tokenizer = new Tokenizer("t", {
				tokens : [
					new Token("t1", { text : "Token 1", selected : true}),
					new Token("t2", { text : "Token 2", selected : false}),
					new Token("t3", { text : "Token 3", selected : true})
				],
				width: "500px"
			});

			this.tokenizer.placeAt("content");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("delete with editable=false", function(assert) {
		// arrange
		this.tokenizer.setEditable(false);

		// act
		qutils.triggerKeydown("t", KeyCodes.DELETE);

		// assert
		assert.equal(this.tokenizer.getTokens().length, 3, "No tokens were removed");
	});

	QUnit.test("delete with enabled=false", function(assert) {
		// arrange
		var oFakeEvent = {
			preventDefault: function () {},
			setMarked: function () {},
			keyCode: KeyCodes.DELETE,
			which: KeyCodes.DELETE
		};

		this.tokenizer.setEnabled(false);

		// act
		this.tokenizer.onkeydown(oFakeEvent);

		// assert
		assert.equal(this.tokenizer.getTokens().length, 3, "No tokens were removed");
	});

	QUnit.test("delete with editable=true", function(assert) {
		var oSpy = this.spy(this.tokenizer, "fireTokenDelete");

		// act
		qutils.triggerKeydown("t", KeyCodes.DELETE);

		var oCall = oSpy.getCalls()[0];

		// assert
		assert.equal(oCall.args[0].tokens.length, 2, "Two tokens were removed");
	});

	QUnit.test("tab", function(assert) {
		// act
		qutils.triggerKeydown("t", KeyCodes.TAB);

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 0, "There are no selected tokens");
	});

	QUnit.test("Ctrl + C (copy)", function(assert) {
		// arrange
		var fnCopySpy = this.spy(this.tokenizer, "_copy");

		// act
		qutils.triggerKeydown("t", KeyCodes.C, false, false, true);

		// assert
		assert.equal(fnCopySpy.callCount, 1, "Copy was triggered");

		// act
		qutils.triggerKeydown("t", KeyCodes.INSERT, false, false, true);

		// assert
		assert.equal(fnCopySpy.callCount, 2, "Copy was triggered");
	});

	QUnit.test("Ctrl + X (cut)", function(assert) {
		var fnCutSpy = this.spy(this.tokenizer, "_cut");

		// act
		qutils.triggerKeydown("t", KeyCodes.X, false, false, true);

		// assert
		assert.equal(fnCutSpy.callCount, 1, "Cut was triggered");
	});

	QUnit.test("Ctrl + X (cut) Disabled Tokenizer", function(assert) {
		var fnCutSpy = this.spy(this.tokenizer, "_cut"),
			oFakeEvent = {
				preventDefault: function () {},
				setMarked: function () {},
				keyCode: KeyCodes.BACKSPACE,
				which: KeyCodes.BACKSPACE,
				metaKey: true
			};

		// arrange
		this.tokenizer.setEnabled(false);

		// act
		this.tokenizer.onkeydown(oFakeEvent);

		// assert
		assert.equal(fnCutSpy.callCount, 0, "Cut was NOT triggered");
	});

	QUnit.test("Ctrl + X (copy)", function(assert) {
		// arrange
		var fnCopySpy = this.spy(this.tokenizer, "_copy");

		this.tokenizer.setEditable(false);

		// act
		qutils.triggerKeydown("t", KeyCodes.X, false, false, true);

		// assert
		assert.equal(fnCopySpy.callCount, 1, "Copy was triggered");
	});

	QUnit.test("Shift + DELETE (cut)", function(assert) {
		var fnCutSpy = this.spy(this.tokenizer, "_cut");

		// act
		qutils.triggerKeydown("t", KeyCodes.DELETE, true);

		// assert
		assert.equal(fnCutSpy.callCount, 1, "Cut was triggered");
	});

	QUnit.test("Shift + DELETE (cut) Disabled Tokenizer", function(assert) {
		var fnCutSpy = this.spy(this.tokenizer, "_cut"),
			oFakeEvent = {
				preventDefault: function () {},
				setMarked: function () {},
				keyCode: KeyCodes.DELETE,
				which: KeyCodes.DELETE
			};

		// arrange
		this.tokenizer.setEnabled(false);

		// act
		this.tokenizer.onkeydown(oFakeEvent);

		// assert
		assert.equal(fnCutSpy.callCount, 0, "Cut was NOT triggered");
	});

	QUnit.test("Shift + DELETE (copy)", function(assert) {
		// arrange
		var fnCopySpy = this.spy(this.tokenizer, "_copy");

		this.tokenizer.setEditable(false);

		// act
		qutils.triggerKeydown("t", KeyCodes.DELETE, true);

		// assert
		assert.equal(fnCopySpy.callCount, 1, "Copy was triggered");
	});

	QUnit.test("Arrow_right", function(assert) {
		// arrange
		Element.getElementById("t1").focus();

		// act
		qutils.triggerKeydown("t1", KeyCodes.ARROW_RIGHT);

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 2, "The initial selection is preserved");
		assert.equal(this.tokenizer.getTokens()[1].getId(), "t2", "The second token is not selected");
	});

	QUnit.test("Arrow_right when tokenizer is focused", function(assert) {
		//arrange
		this.tokenizer.getTokens()[0].getDomRef().focus();

		// act
		qutils.triggerKeydown(this.tokenizer.getId(), KeyCodes.ARROW_RIGHT);

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 2, "There are 2 selected tokens");
		assert.strictEqual(this.tokenizer.getTokens()[1].getId(), document.activeElement.id,
			"The second token in the multiinput is focused.");
	});

	QUnit.test("Arrow_right when last token in tokenizer is focused", function(assert) {
		// arrange
		var oTokenizer = this.tokenizer,
			oSpy = this.spy(oTokenizer, "onsapnext"),
			oEventArg;

		Element.getElementById("t3").focus();

		// act
		qutils.triggerKeydown("t", KeyCodes.ARROW_RIGHT);
		oEventArg = oSpy.getCall(0).args[0];

		// assert
		assert.equal(document.activeElement.id, "t3", "The third token is still selected");

		// The Tokenizer does not process right key press on its last token, but leaves the event
		// to bubble up.
		assert.equal(oSpy.callCount, 1, "Only one event is triggered");
		assert.equal(oEventArg.isMarked(), false, "The event was not processed by the Tokenizer");

		oTokenizer.destroy();
	});

	QUnit.test("Arrow_up", function(assert) {
		// arrange
		Element.getElementById("t1").focus();

		// act
		qutils.triggerKeydown("t1", KeyCodes.ARROW_UP);

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 2, "Token selection is not changed");
	});

	QUnit.test("_selectRange(true)", async function(assert) {
		var oTokenizer = new Tokenizer({ width: "500px"}).placeAt("content"),
			aSelectedTokens,
			oSecondToken = new Token("tok1");

		[
			new Token("tok0"),
			oSecondToken,
			new Token("tok2")
		].forEach(function(oToken) {
			oTokenizer.addToken(oToken);
		}, this);

		await nextUIUpdate();

		// act
		oSecondToken.focus();
		oTokenizer._selectRange(true); // select all tokens till the end

		// assert
		aSelectedTokens = oTokenizer.getSelectedTokens();
		assert.equal(aSelectedTokens.length, 2, "Two tokens are selected");
		assert.strictEqual(aSelectedTokens[0].getId(), oSecondToken.getId(), "The middle token is selected");
		assert.strictEqual(aSelectedTokens[1].getId(), "tok2", "The last token is selected");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.test("RIGHT_ARROW + invisible token", async function(assert) {
		// arrange
		var oTokenizer = new Tokenizer({
			width: "500px",
			tokens: [
				new Token({text: "Token1"}),
				new Token({text: "Token2", visible: false}),
				new Token({text: "Token3"})
			]
		}).placeAt("content");
		await nextUIUpdate();

		// act
		oTokenizer.getTokens()[0].getDomRef().focus();
		await nextUIUpdate();

		qutils.triggerKeydown(oTokenizer.getTokens()[0].getDomRef(), KeyCodes.ARROW_RIGHT);
		await nextUIUpdate();

		// assert
		assert.strictEqual(oTokenizer.getTokens()[2].getDomRef(), document.activeElement, "The navigation was successful.");
		oTokenizer.destroy();
	});

	QUnit.test("LEFT_ARROW + invisible token", async function(assert) {
		// arrange
		var oTokenizer = new Tokenizer({
			width: "500px",
			tokens: [
				new Token({text: "Token1"}),
				new Token({text: "Token2", visible: false}),
				new Token({text: "Token3"})
			]
		}).placeAt("content");
		await nextUIUpdate();

		// act
		oTokenizer.getTokens()[2].getDomRef().focus();
		await nextUIUpdate();

		qutils.triggerKeydown(oTokenizer.getTokens()[2].getDomRef(), KeyCodes.ARROW_LEFT);
		await nextUIUpdate();

		// assert
		assert.strictEqual(oTokenizer.getTokens()[0].getDomRef(), document.activeElement, "The navigation was successful.");
		oTokenizer.destroy();
	});

	QUnit.test("Should not render tabindex on the Tokenizer but on the first visible token", async function(assert) {
		// Arrange
		var oTokenizer = new Tokenizer({
			width: "500px",
			tokens: [
				new Token({text: "Token1", visible: false}),
				new Token({text: "Token2"}),
				new Token({text: "Token3"})
			]
		}).placeAt("content");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oTokenizer.getDomRef().hasAttribute("tabindex"), false, "tabindex is not rendererd");

		await nextUIUpdate();

		assert.strictEqual(oTokenizer.getTokens()[1].getDomRef().hasAttribute("tabindex"), true, "tabindex is rendererd on the first visible token (second token overall)");

		oTokenizer.destroy();
	});

	QUnit.test("Should set _bShouldRenderTabIndex to false", async function(assert) {
		var oTokenizer = new Tokenizer({}).placeAt("content");

		await nextUIUpdate();

		assert.strictEqual(oTokenizer._bShouldRenderTabIndex, null, "_bShouldRenderTabIndex is defined and asigned to null");

		oTokenizer.setShouldRenderTabIndex(false);
		await nextUIUpdate();

		assert.strictEqual(oTokenizer._bShouldRenderTabIndex, false, "_bShouldRenderTabIndex is not set");
		oTokenizer.destroy();
	});

	QUnit.test("_selectRange(false)", async function(assert) {
		var oTokenizer = new Tokenizer({ width: "500px"}).placeAt("content"),
			aSelectedTokens,
			oSecondToken = new Token("tok1");

		[
			new Token("tok0"),
			oSecondToken,
			new Token("tok2")
		].forEach(function(oToken) {
			oTokenizer.addToken(oToken);
		}, this);

		await nextUIUpdate();

		// act
		oSecondToken.focus();
		oTokenizer._selectRange(false); // select all tokens till the beginning

		// assert
		aSelectedTokens = oTokenizer.getSelectedTokens();
		assert.equal(aSelectedTokens.length, 2, "Two tokens are selected");
		assert.strictEqual(aSelectedTokens[0].getId(), "tok0", "The first token is selected");
		assert.strictEqual(aSelectedTokens[1].getId(), oSecondToken.getId(), "The middle token is selected");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.test("onsapend", async function(assert) {
		var oEvent = new jQuery.Event(),
			aTokens,
			oTokenizer = new Tokenizer({
				width: "500px",
				tokens: [new Token(), new Token(), new Token()]
			}).placeAt("content");

		aTokens = oTokenizer.getTokens();

		await nextUIUpdate();

		// act
		oTokenizer.onsapend(oEvent);

		// assert
		assert.strictEqual(aTokens[aTokens.length - 1].getDomRef(), document.activeElement, "The last token is focused.");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.test("onsaphome", async function(assert) {
		var oEvent = new jQuery.Event(),
			oTokenizer = new Tokenizer({
				width: "500px",
				tokens: [new Token(), new Token(), new Token()]
			}).placeAt("content");

		await nextUIUpdate();

		// act
		oTokenizer.onsaphome(oEvent);

		// assert
		assert.strictEqual(oTokenizer.getTokens()[0].getDomRef(), document.activeElement, "The first token is focused.");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.test("onsaphome + hidden tokens", async function(assert) {
		var oEvent = new jQuery.Event(),
			oTokenizer = new Tokenizer({
				width: "500px",
				tokens: [new Token(), new Token(), new Token()]
			}).placeAt("content");
		await nextUIUpdate();

		oTokenizer.getTokens()[0].addStyleClass("sapMHiddenToken");
		await nextUIUpdate();

		// act
		oTokenizer.onsaphome(oEvent);

		// assert
		assert.strictEqual(oTokenizer.getTokens()[1].getDomRef(), document.activeElement, "The second token (first visible) is focused.");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.test("HOME + SHIFT", function(assert) {
		var oSpySelection = this.spy(this.tokenizer, "_selectRange");

		// act
		qutils.triggerKeydown("t", KeyCodes.HOME, true);

		// assert
		assert.ok(oSpySelection.called, "Range selection is triggered");
		assert.ok(oSpySelection.calledWith(false), "Range selection should select all tokens until the beginning");
	});

	QUnit.test("END + SHIFT", function(assert) {
		var oSpySelection = this.spy(this.tokenizer, "_selectRange");

		// act
		qutils.triggerKeydown("t", KeyCodes.END, true);

		// assert
		assert.ok(oSpySelection.called, "Range selection is triggered");
		assert.ok(oSpySelection.calledWith(true), "Range selection should select all tokens until the end");
	});

	QUnit.test("ARROW_RIGHT + CTR", function(assert) {
		this.stub(Device, "os").value({
			windows: true,
			macintosh: false
		});

		var oSpyNext = this.spy(this.tokenizer, "onsapnext");

		// act
		qutils.triggerKeydown("t", KeyCodes.ARROW_RIGHT, false, false, true);

		// assert
		assert.ok(oSpyNext.called, "Forward navigation is triggered");
	});



	QUnit.module("Token selection", {
		beforeEach : async function() {
			this.t1 = new Token({ text : "Token 1"});
			this.t3 = new Token({ text : "Token 3", selected : true});
			this.t5 = new Token({ text : "Token 5"});
			this.tokenizer = new Tokenizer({
				tokens : [
					this.t1,
					new Token({ text : "Token 2"}),
					this.t3,
					new Token({ text : "Token 4"}),
					this.t5
				]
			});

			this.tokenizer.placeAt("content");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Test token selection with Shift and Ctrl", function(assert){
		// arrange
		qutils.triggerEvent("tap", this.t3.getDomRef(), {target : this.t3.getDomRef()});

		// act
		qutils.triggerEvent("tap", this.t1.getDomRef(), {target : this.t1.getDomRef(), shiftKey: true});

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 3, "Tokens 1 to 3 are selected");

		// act
		qutils.triggerEvent("tap", this.t5.getDomRef(), {target : this.t5.getDomRef(), shiftKey: true, ctrlKey: true});

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 5, "All 5 tokens are selected");
	});

	QUnit.module("Copy and paste", {
		beforeEach : async function() {
			this.tokenizer = new Tokenizer();

			this.tokenizer.placeAt("content");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("parsing for copy and paste", function(assert) {
		let text1 = "1\r\n2\r\n3",
			aTextArray1 = this.tokenizer._parseString(text1);

		assert.equal(aTextArray1[0], "1", "text separated");
		assert.equal(aTextArray1[1], "2", "text separated");
		assert.equal(aTextArray1[2], "3", "text separated");

		text1 = "1 2\n2+4\r3)\t(/&%$)";
		aTextArray1 = this.tokenizer._parseString(text1);

		assert.equal(aTextArray1[0], "1 2", "text separated");
		assert.equal(aTextArray1[1], "2+4", "text separated");
		assert.equal(aTextArray1[2], "3)\t(/&%$)", "text separated");
	});

	QUnit.test("Copy to clipboard", async function(assert) {
		assert.expect(6);
		var oAddListenerSpy = this.spy(document, "addEventListener"),
			oExecCommandSpy = this.spy(document, "execCommand"),
			fnCopyToClipboard = null,
			oDummyEvent1 = {
				clipboardData: {
					setData: function (sType, sText) {
						assert.strictEqual(
							sType,
							"text/plain",
							"Type 1: The correct type was added to the clipboard data object: " + sType
						);
						assert.strictEqual(
							sText,
							"Token 0\r\nToken 1\r\nToken 2\r\nToken 3",
							"Type 1: The correct text was added to the clipboard data object: " + sText
						);
					}
				},
				preventDefault: function () {}
			},
			oDummyEvent2 = {
				originalEvent : {
					clipboardData: {
						setData: function (sType, sText) {
							assert.strictEqual(
								sType,
								"text/plain",
								"Type 2: The correct type was added to the clipboard data object: " + sType
							);
							assert.strictEqual(
								sText,
								"Token 0\r\nToken 1\r\nToken 2\r\nToken 3",
								"Type 2: The correct text was added to the clipboard data object: " + sText
							);
						}
					}
				},
				preventDefault: function () {}
			};

		// arrange
		for (var i = 0; i < 4; i++) {
			this.tokenizer.addToken(new Token({text: "Token " + i, key: "000" + i}));
		}
		await nextUIUpdate();

		this.tokenizer.focus();
		this.tokenizer.selectAllTokens(true);

		// act
		this.tokenizer._copy();

		// assert
		// we can intercept the attached function by
		// getting the first call - called from inside the _copy method
		// and then its second argument
		fnCopyToClipboard = oAddListenerSpy.getCall(0).args[1];
		// Now we can check if it does attach the correct text
		// to the provided event object

		fnCopyToClipboard.call(this, oDummyEvent1);
		fnCopyToClipboard.call(this, oDummyEvent2);

		assert.strictEqual(oExecCommandSpy.callCount, 1, "The method was called only once");
		assert.strictEqual(oExecCommandSpy.getCall(0).args[0], "copy", "The command was copy");

		// cleanup
		document.removeEventListener("copy", oExecCommandSpy);
	});

	QUnit.module("useCollapsedMode", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Basic: ", async function(assert) {
		var aTokens, oIndicator, iHiddenTokens = 0;
		this.tokenizer = new Tokenizer({
			maxWidth:"200px",
			tokens: [
				new Token({text: "Token 1"}),
				new Token({text: "Token 2"}),
				new Token({text: "Token 3"})
			]
		});

		this.tokenizer.setRenderMode(TokenizerRenderMode.Loose);

		this.tokenizer.placeAt("content");
		await nextUIUpdate();
		aTokens = this.tokenizer.getTokens();
		aTokens.forEach(function(oToken, iIndex){
			assert.strictEqual(oToken.$().hasClass("sapMHiddenToken"), false, "Token on position " +  iIndex +  " is visible");
		});

		this.tokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		await nextUIUpdate();

		aTokens = this.tokenizer.getTokens();
		aTokens.forEach(function(oToken){
			if (oToken.$().hasClass("sapMHiddenToken")) {
				iHiddenTokens += 1;
			}
		});

		oIndicator = this.tokenizer.$().find(".sapMTokenizerIndicator")[0];
		assert.ok(oIndicator, true, "N-more label is added.");
		assert.strictEqual(oIndicator.innerHTML, oRb.getText("MULTIINPUT_SHOW_MORE_TOKENS", [iHiddenTokens]), "N-more label's text is correct.");
		assert.notOk(this.tokenizer.getTokens()[0].$().hasClass("sapMHiddenToken"), "The first token is visible.");

		this.tokenizer.setRenderMode(TokenizerRenderMode.Loose);
		await nextUIUpdate();

		aTokens = this.tokenizer.getTokens();
		aTokens.forEach(function(oToken, iIndex) {
			assert.strictEqual(oToken.$().hasClass("sapMHiddenToken"), false, "Token on position " + iIndex + " is shown when the tokenizer is collapsed.");
		});
	});

	QUnit.test("Small containers usage (N Items):", async function(assert) {
		var aTokens, oIndicator;
		this.tokenizer = new Tokenizer({
			maxWidth: "100px",
			tokens: [
				new Token({text: "XXXXXXXXXXXX"}),
				new Token({text: "XXXXXXXXXXXX"})
			]
		});

		this.tokenizer.placeAt("content");
		await nextUIUpdate();

		// act
		this.tokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		await nextUIUpdate();

		// assert
		aTokens = this.tokenizer.getTokens();
		oIndicator = this.tokenizer.$().find(".sapMTokenizerIndicator")[0];

		assert.ok(aTokens[0].$().hasClass("sapMHiddenToken"), "The first token should be hidden.");
		assert.ok(aTokens[1].$().hasClass("sapMHiddenToken"), "The last token is hidden.");

		assert.ok(oIndicator, true, "An indicator label is added.");
		assert.strictEqual(oIndicator.innerHTML, oRb.getText("TOKENIZER_SHOW_ALL_ITEMS", [2]), "N-items label's text is correct.");
	});

	QUnit.test("_handleNMoreIndicator", function(assert) {
		var oTokenizer = new Tokenizer();
		assert.strictEqual(oTokenizer._handleNMoreIndicator(), oTokenizer, "The method return a instance of the tokenizer");

		oTokenizer.destroy();
	});

	QUnit.test("N-More label + Invalidation", async function(assert) {
		var oTokenizer = new Tokenizer({
			maxWidth: "100px",
			tokens: [
				new Token({text: "XXXXXXXXXXXX"}),
				new Token({text: "XXXXXXXXXXXX"})
			]
		});

		oTokenizer.placeAt("content");
		await nextUIUpdate();

		// act
		oTokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		await nextUIUpdate();

		// assert
		assert.notOk(oTokenizer._oIndicator.hasClass("sapUiHidden"), "The indicator label is shown.");

		// act
		oTokenizer.invalidate();
		await nextUIUpdate();

		// assert
		assert.notOk(oTokenizer._oIndicator.hasClass("sapUiHidden"), "The indicator label is still shown.");

		// clean up
		oTokenizer.destroy();
		oTokenizer = null;
	});

	QUnit.test("Invalidating token should trigger layouting", async function(assert) {
		var oTokenizer = new Tokenizer({
			maxWidth: "100px",
			tokens: [
				new Token(),
				new Token(),
				new Token(),
				new Token()
			]
		}).placeAt("content");
		await nextUIUpdate();

		// spy _adjustTokensVisibility
		var oSpy = this.spy(oTokenizer, "_adjustTokensVisibility");

		// act
		oTokenizer.getTokens().forEach((token, indx) => {
			token.setText(`${indx}`);
		});

		await nextUIUpdate();
		assert.strictEqual(oSpy.callCount, 1, "The _adjustTokensVisibility method was called once.");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.module("Tokenizer ARIA", {
		beforeEach : async function() {
			this.tokenizer = new Tokenizer();

			this.tokenizer.placeAt("content");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Role listbox should be applied", function(assert) {
		assert.strictEqual(this.tokenizer.$().attr("role"), "listbox", "Tokenizer has role listbox");
	});

	QUnit.test("aria-hidden attribute", async function(assert) {
		var token1 = new Token();

		assert.strictEqual(this.tokenizer.$().attr("aria-hidden"), "true", "aria-hidden attribute should be presented when no token.");

		this.tokenizer.addToken(token1);
		await nextUIUpdate();

		assert.notOk(this.tokenizer.$().attr("aria-hidden"), "aria-hidden attribute should not be presented when there are tokens.");
	});

	QUnit.test("aria-readonly attribute", async function(assert) {
		// Assert
		assert.ok(!this.tokenizer.$().attr("aria-readonly"), "Tokenizer has no aria-readonly attribute");

		// Act
		this.tokenizer.setEditable(false);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.tokenizer.$().attr("aria-readonly"), "true", "Tokenizer has aria-readonly attribute set.");
	});

	QUnit.test("posinset and setsize ARIA attributes are set on the Tokens", async function(assert) {
		var token1, token2;

		this.tokenizer.addToken(token1 = new Token("t1"));
		this.tokenizer.addToken(token2 = new Token("t2"));
		await nextUIUpdate();

		assert.ok(token1.$().attr("aria-posinset"), "Token 1 has aria-posinset attribute");
		assert.ok(token2.$().attr("aria-posinset"), "Token 2 has aria-posinset attribute");
		assert.ok(token1.$().attr("aria-setsize"), "Token 1 has aria-setsize attribute");
		assert.ok(token2.$().attr("aria-setsize"), "Token 2 has aria-setsize attribute");

		assert.strictEqual(token1.$().attr("aria-posinset"), "1", "Token 1 has correct aria-posinset attribute");
		assert.strictEqual(token2.$().attr("aria-posinset"), "2", "Token 2 has correct aria-posinset attribute");
		assert.strictEqual(token1.$().attr("aria-setsize"), "2", "Token has correct aria-setsize attribute");
		assert.strictEqual(token2.$().attr("aria-setsize"), "2", "Token has correct aria-setsize attribute");
	});

	QUnit.test("posinset and setsize ARIA attributes are correct after removing token", async function(assert) {
		var token1, token2;

		this.tokenizer.addToken(token1 = new Token());
		this.tokenizer.addToken(token2 = new Token());
		await nextUIUpdate();

		this.tokenizer.removeToken(token1);
		await nextUIUpdate();

		assert.strictEqual(token2.$().attr("aria-setsize"), "1", "Token 2 has correct aria-setsize attribute");
		assert.strictEqual(token2.$().attr("aria-posinset"), "1", "Token 2 has correct aria-posinset attribute");

	});

	QUnit.module("One token handling", {
		beforeEach : async function() {
			this.tokenizer = new Tokenizer({
				maxWidth: "100px",
				tokens: [
					new Token({text: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"})
				]
			});

			this.tokenizer.placeAt("content");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("setFirstTokenTruncated", function(assert) {
		this.clock = sinon.useFakeTimers();
		var oToken = this.tokenizer.getTokens()[0],
			oSetTruncatedSpy = this.spy(oToken, "setTruncated"),
			oAddStyleClassSpy = this.spy(this.tokenizer, "addStyleClass"),
			oRemoveStyleClassSpy = this.spy(this.tokenizer, "removeStyleClass");

		// Act
		this.tokenizer.setFirstTokenTruncated(true);
		this.clock.tick();

		// Assert
		assert.strictEqual(oSetTruncatedSpy.callCount, 1, "The token's setTruncated method called once.");
		assert.strictEqual(oSetTruncatedSpy.calledWith(true), true, "Method called with correct parameter");
		assert.strictEqual(oAddStyleClassSpy.callCount, 1, "The tokenizer's addStyleClass method was called once.");
		assert.strictEqual(oAddStyleClassSpy.calledWith("sapMTokenizerOneLongToken"), true, "Method called with correct parameter");

		// Act
		this.tokenizer.setFirstTokenTruncated(false);
		this.clock.tick();

		// Assert
		assert.strictEqual(oSetTruncatedSpy.calledWith(false), true, "Method called with correct parameter");
		assert.strictEqual(oRemoveStyleClassSpy.callCount, 1, "The tokenizer's removeStyleClass method was called once.");
		assert.strictEqual(oAddStyleClassSpy.calledWith("sapMTokenizerOneLongToken"), true, "Method called with correct parameter");
		this.clock.restore();
	});

	QUnit.test("One token with later rebinding", async function(assert) {
		// Act
		var oModel = new JSONModel({items: [{text: "token1"}]});
		var oTokenizer = new Tokenizer({
			width: "18rem",
			tokens: {
				path: "/items",
				template: new Token({text: "{text}"})
			}
		}).placeAt("content").setModel(oModel);
		await nextUIUpdate();

		assert.notOk(oTokenizer.hasStyleClass("sapMTokenizerOneLongToken"), "Tokenizer does not have one long token");

		oTokenizer.setRenderMode(TokenizerRenderMode.Loose);
		oModel.setData({items:[{text:"token1"},{text:"token2"},{text:"token3"}]});
		await nextUIUpdate();

		assert.notOk(oTokenizer.hasStyleClass("sapMTokenizerOneLongToken"), "Tokenizer still does not have one long token");

		oTokenizer.destroy();
	});

	QUnit.test("Click on tokenizer should remove truncation", async function(assert) {
		// Arrange
		var oToken = this.tokenizer.getTokens()[0],
			oSpy = this.spy(this.tokenizer, "_togglePopup");

		this.tokenizer._adjustTokensVisibility();
		// await to set the truncation
		await nextUIUpdate();

		// Assert
		assert.ok(oToken.getTruncated(), "Token should be truncated");

		// Act
		this.tokenizer.ontap({
			getMark: function (sId) {
				return sId === "tokenTap" ? oToken : null;
			}
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "fnOnNMorePress should be called once.");
	});

	QUnit.test("Small container + One long token should set truncation to the token", function(assert) {
		// Arrange
		var oSpy = this.spy(this.tokenizer, 'setFirstTokenTruncated');

		// Act
		this.tokenizer._adjustTokensVisibility();

		// Assert
		assert.ok(oSpy.calledOnce, "Truncation function should be called once.");
		assert.ok(this.tokenizer.$().hasClass("sapMTokenizerOneLongToken"), "Should have class for one long token.");
		assert.ok(oSpy.calledWith(true), "Truncation function should be called with True value");
	});

	QUnit.test("Small container + One long truncated token should call setFirstTokenTruncated with false", async function(assert) {
		// Arrange
		var oSpy = this.spy(this.tokenizer, 'setFirstTokenTruncated');
		this.tokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		this.tokenizer.getTokens()[0].setTruncated(true);

		// Act
		this.tokenizer.setMaxWidth("500px");
		await nextUIUpdate();

		// Assert
		assert.ok(oSpy.calledOnce, "Truncation function should be called once.");
		assert.notOk(this.tokenizer.$().hasClass("sapMTokenizerOneLongToken"), "Should not have class for one long token.");
		assert.ok(oSpy.calledWith(false), "Truncation function should be called with false");
	});

	QUnit.test("Small containers usage (1 Item):", function(assert) {
		var oIndicator;

		// Act
		this.tokenizer._adjustTokensVisibility();

		// Assert
		oIndicator = this.tokenizer.$().find(".sapMTokenizerIndicator")[0];

		assert.ok(this.tokenizer.$().hasClass("sapMTokenizerOneLongToken"), "Should have class for one long token.");
		assert.ok(oIndicator, true, "An indicator label is added.");
		assert.strictEqual(oIndicator.innerHTML, "", "N-items label's text is not added for one token.");
	});

	QUnit.test("hasOneTruncatedToken returns correct value", function(assert) {
		// Assert
		assert.strictEqual(this.tokenizer.hasOneTruncatedToken(), true, "hasOneTruncatedToken should return false");

		// Act
		this.tokenizer.addToken(new Token({text: "test"}));
		// Assert
		assert.strictEqual(this.tokenizer.hasOneTruncatedToken(), false, "hasOneTruncatedToken should return false");
	});

	QUnit.test("Removes token truncation after resize", async function(assert) {
		// Arrange
		this.tokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		this.tokenizer.setFirstTokenTruncated(true);

		// Act
		this.tokenizer.setMaxWidth("500px");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.tokenizer.hasOneTruncatedToken(), false, "Token's truncation was removed.");

		this.tokenizer.setMaxWidth("100px");
		await nextUIUpdate();

		assert.strictEqual(this.tokenizer.hasOneTruncatedToken(), true, "Token's truncation was set again after resize.");
	});

	QUnit.module("Mobile Dialog", {
		stubPlatform: function () {
			this.stub(Device, "system").value({
				desktop: false,
				phone: true,
				tablet: false
			});
		},

		createTokenizer: function () {
			return new Tokenizer({
				width: "240px",
				tokens: [
					new Token({ text: "Token 1" }),
					new Token({ text: "Token 2" }),
					new Token({ text: "Token 3" }),
					new Token({ text: "Token 4" }),
					new Token({ text: "Token 5" }),
					new Token({ text: "Token 6" }),
					new Token({ text: "Token 7" }),
					new Token({ text: "Token 8" }),
					new Token({ text: "Token 9" }),
					new Token({ text: "Token 10" })
				]
			});
		}
	});

	QUnit.test("Checks if Dialog opens", async function (assert) {
		this.stubPlatform();
		var oTokenizer = this.createTokenizer();
		var oOpenSpy = this.spy(Dialog.prototype, "open");

		oTokenizer.setRenderMode(TokenizerRenderMode.Narrow);

		oTokenizer.placeAt("content");
		await nextUIUpdate();

		oTokenizer._handleNMoreIndicatorPress();
		await nextUIUpdate();

		assert.ok(oOpenSpy.called, "Dialog is open");

		oTokenizer.destroy();
	});

	QUnit.test("Checks Dialog's default title", async function (assert) {
		this.stubPlatform();
		var oTokenizer = this.createTokenizer();

		oTokenizer.placeAt("content");
		await nextUIUpdate();

		var oRPO = oTokenizer.getTokensPopup();

		assert.strictEqual(oRPO.getTitle(), Library1.getResourceBundleFor("sap.m").getText("COMBOBOX_PICKER_TITLE"), "Default title should be taken from Resource Bundle");

		oTokenizer.destroy();
	});

	QUnit.test("Checks Dialog's custom title", async function (assert) {
		this.stubPlatform();
		var oTokenizer = this.createTokenizer();
		var sTitleText = "Custom Title";

		oTokenizer.addAriaLabelledBy(new Label({ text: sTitleText }));

		oTokenizer.placeAt("content");
		await nextUIUpdate();

		var oRPO = oTokenizer.getTokensPopup();

		assert.strictEqual(oRPO.getTitle(), sTitleText, "Label should be set as title");
		assert.ok(oRPO.getShowHeader(), "Header should be shown");

		oTokenizer.destroy();
	});

	QUnit.test("Checks if title is shown on desktop", async function (assert) {
		var oTokenizer = this.createTokenizer();

		oTokenizer.placeAt("content");
		await nextUIUpdate();

		var oRPO = oTokenizer.getTokensPopup();

		assert.notOk(oRPO.getShowHeader(), "Header should be hidden");

		oTokenizer.destroy();
	});
});