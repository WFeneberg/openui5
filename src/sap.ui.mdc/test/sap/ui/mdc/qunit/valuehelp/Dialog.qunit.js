// Use this test page to test the API and features of the Dialog container.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 10]*/

sap.ui.define([
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/Dialog",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/type/String",
	"sap/ui/Device",
	"sap/base/strings/formatMessage",
	"sap/base/util/merge",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate"
], (
	ControlBehavior,
	Library,
	jQuery,
	ValueHelpDelegate,
	Dialog,
	Content,
	Condition,
	ValueHelpSelectionType,
	FieldDisplay,
	OperatorName,
	Icon,
	JSONModel,
	JSONListBinding,
	StringType,
	Device,
	formatMessage,
	merge,
	mLibrary,
	nextUIUpdate
) => {
	"use strict";

	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

	JSONListBinding.prototype.__getContexts = JSONListBinding.prototype._getContexts;
	JSONListBinding.prototype._getContexts = function(iStartIndex, iLength) { // fake ManagedObjectModel functionality
		if (iStartIndex < 0) {
			iStartIndex = 0;
		}
		return this.__getContexts(iStartIndex, iLength);
	};

	let oDialog;
	const iDialogDuration = ControlBehavior.getAnimationMode() === "none" ? 15 : 500;

	const _fPressHandler = (oEvent) => {}; // just dummy handler to make Icon focusable
	let oField;
	let oContentField;
	let oContent;
	const oValueHelp = { //to fake ValueHelp
		getControl() {
			return oField;
		},
		_handleClosed() {

		},
		_handleOpened() {

		},
		getTypeahead() {
			return null;
		},
		getControlDelegate() {
			return ValueHelpDelegate;
		},
		awaitControlDelegate() {
			return Promise.resolve();
		},
		bDelegateInitialized: true,
		getParent() {
			return null;
		},
		invalidate() {
			return null;
		},
		getId() {
			return "VH";
		},
		_retrievePromise() {
			return Promise.resolve();
		}
	};
	let oValueHelpConfig;
	let oModel; // to fake ManagedObjectModel of ValueHelp
	let oType;
	let oAdditionalType;

	/* use dummy control to simulate Field */

	const _teardown = () => {
		oContent = undefined;
		oDialog.destroy();
		oDialog = undefined;
		oValueHelpConfig = undefined;
		if (oModel) {
			oModel.destroy();
			oModel = undefined;
		}
		if (oField) {
			oField.destroy();
			oField = undefined;
		}
		if (oContentField) {
			oContentField.destroy();
			oContentField = undefined;
		}
		if (oType) {
			oType.destroy();
			oType = undefined;
		}
		if (oAdditionalType) {
			oAdditionalType.destroy();
			oAdditionalType = undefined;
		}
	};

	QUnit.module("basic features", {
		beforeEach() {
			oDialog = new Dialog("D1", {
			});
		},
		afterEach: _teardown
	});

	QUnit.test("default values", async (assert) => {

		assert.equal(oDialog.getMaxConditions(), undefined, "getMaxConditions");
		assert.ok(oDialog.isMultiSelect(), "isMultiSelect");
		assert.notOk(oDialog.isSingleSelect(), "isSingleSelect");
		assert.notOk(oDialog.getUseAsValueHelp(), "getUseAsValueHelp");

		/**
		 * @deprecated As of version 1.137
		 */
		assert.notOk(await oDialog.shouldOpenOnClick(), "shouldOpenOnClick");
		/**
		 * @deprecated As of version 1.137
		 */
		assert.notOk(await oDialog.shouldOpenOnFocus(), "shouldOpenOnFocus");
		/**
		 *  @deprecated As of version 1.137
		 */
		assert.notOk(oDialog.shouldOpenOnNavigate(), "shouldOpenOnNavigate");

		assert.ok(oDialog.isFocusInHelp(), "isFocusInHelp");
		assert.equal(oDialog.getValueHelpIcon(), "sap-icon://value-help", "getValueHelpIcon");
		sinon.stub(oDialog, "getUIArea").returns("X"); // to test result
		assert.equal(oDialog.getUIAreaForContent(), "X", "getUIAreaForContent returns own UiArea");
		oDialog.getUIArea.restore();

	});

	QUnit.test("getContainerControl", (assert) => {

		oDialog.setTitle("Test");
		const oContainer = oDialog.getContainerControl();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		return oContainer.then((oContainer) => {
			assert.ok(oContainer, "Container returned");
			assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
			assert.equal(oContainer.getContentHeight(), "700px", "contentHeight");
			assert.equal(oContainer.getContentWidth(), "1080px", "contentWidth");
			assert.notOk(oContainer.getHorizontalScrolling(), "horizontalScrolling");
			assert.notOk(oContainer.getVerticalScrolling(), "verticalScrolling");
			assert.equal(oContainer.getTitle(), "Test", "title");
			assert.equal(oContainer.getStretch(), Device.system.phone, "stretch");
			assert.ok(oContainer.getResizable(), "resizable");
			assert.ok(oContainer.getDraggable(), "draggable");
			assert.notOk(oContainer.isPopupAdaptationAllowed(), "isPopupAdaptationAllowed");
			assert.ok(oContainer.hasStyleClass("sapUiSizeCozy"), "content density is set explicitly");


			const aButtons = oContainer.getButtons();
			assert.equal(aButtons.length, 2, "Buttons added");
			assert.equal(aButtons[0].getText(), oResourceBundle.getText("valuehelp.OK"), "Button text");
			assert.equal(aButtons[1].getText(), oResourceBundle.getText("valuehelp.CANCEL"), "Button text");

			assert.ok(oContainer.getModel("$help").isA("sap.ui.model.base.ManagedObjectModel"), "ManagedObjectModel assigned");

			const aDialogContent = oContainer.getContent();
			assert.equal(aDialogContent.length, 1, "Dialog content length");
			assert.ok(aDialogContent[0].isA("sap.m.VBox"), "VBox is inside Dialog");

			// call again
			oContainer = oDialog.getContainerControl();
			assert.ok(oContainer.isA("sap.m.Dialog"), "sap.m.Dialog directly returned on second call");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("placeContent", (assert) => {

		oDialog.setTitle("Test");

		const oContainer = oDialog.getContainerControl().then((oCont) => {
			return oDialog.placeContent(oCont);
		});

		return oContainer.then((oContainer) => {
			const aDialogContent = oContainer.getContent();
			// No content
			assert.notOk(aDialogContent[0].getItems()[0], "No content wrapper created");


			const oFirstContent = new Content("Content1", {title: "Content title", shortTitle: "ShortTitle", tokenizerTitle: "TokenizerTitle", displayContent: new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false})});
			oDialog.addContent(oFirstContent);

			return oDialog.placeContent(oContainer).then(() => {
				// Singular content
				const oDialogTab = aDialogContent[0].getItems()[0];
				assert.ok(oDialogTab.isA("sap.ui.mdc.valuehelp.base.DialogTab"), "DialogTab is first VBox item");

				const oSecondContent = new Content("Content2", {title: "Content title", shortTitle: "ShortTitle", tokenizerTitle: "TokenizerTitle", displayContent: new Icon("I2", {src:"sap-icon://sap-ui5", decorative: false})});
				oDialog.addContent(oSecondContent);

				return oDialog.placeContent(oContainer).then(() => {
					// Multiple contents
					const oIconTabBar = aDialogContent[0].getItems()[0];
					assert.ok(oIconTabBar.isA("sap.m.IconTabBar"), "IconTabBar is first VBox item");
					assert.notOk(oIconTabBar.getExpandable(), "IconTabBar expandable");
					assert.notOk(oIconTabBar.getUpperCase(), "IconTabBar upperCase");
					assert.ok(oIconTabBar.getStretchContentHeight(), "IconTabBar stretchContentHeight");
					assert.equal(oIconTabBar.getHeaderMode(), mLibrary.IconTabHeaderMode.Inline, "IconTabBar headerMode");
					assert.equal(oIconTabBar.getSelectedKey(), "Content1", "IconTabBar selectedKey");
					assert.ok(oIconTabBar.getModel("$help").isA("sap.ui.model.base.ManagedObjectModel"), "ManagedObjectModel assigned");
					assert.equal(oIconTabBar.getItems().length, 2, "2 items assigned");
				});
			});
		});

	});

	QUnit.test("providesScrolling", (assert) => {

		const bScrolling = oDialog.providesScrolling();
		assert.notOk(bScrolling, "provides no scrolling");

	});

	QUnit.module("assigned to ValueHelp", {
		beforeEach: async () => {
			oType = new StringType();
			oAdditionalType = new StringType();

			oValueHelpConfig = {
				maxConditions: -1,
				dataType: oType,
				additionalDataType: oAdditionalType,
				operators: [OperatorName.EQ, OperatorName.BT],
				display: FieldDisplay.Description
			};
			oModel = new JSONModel({
				_config: oValueHelpConfig,
				filterValue: "X",
				conditions: [Condition.createItemCondition("X", "Text")]
			});

			oContentField = new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oContent = new Content("Content1", {title: "Content title", shortTitle: "ShortTitle", tokenizerTitle: "TokenizerTitle"});
			sinon.stub(oContent, "getContent").returns(oContentField);
			sinon.stub(oContent, "getInitialFocusedControl").returns(oContentField);
			oContent.setAggregation("displayContent", oContentField);
			sinon.stub(oContent, "getCount").callsFake((aConditions) => {return aConditions.length;});

			oDialog = new Dialog("D1", {
				content: [oContent]
			}).setModel(oModel, "$valueHelp");
			sinon.stub(oDialog, "getParent").returns(oValueHelp);
			oField = new Icon("I2", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oField.getFocusElementForValueHelp = (bTypeahed) => { // fake
				return oField;
			};
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: _teardown
	});

	QUnit.test("getContainerControl with single content for multi-select", (assert) => {

		oDialog.setTitle("Test");
		sinon.spy(oContent,"getFormattedTitle");
		const oContainer = oDialog.getContainerControl().then((oCont) => {
			return oDialog.placeContent(oCont);
		});

		return oContainer?.then((oContainer) => {
			assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title");
			const aButtons = oContainer.getButtons();
			assert.ok(aButtons[0].getVisible(), "OK-Button visible");

			const aDialogContent = oContainer.getContent();
			let aItems = aDialogContent[0].getItems();
			const oDialogTab = aItems[0];
			const oPanel = aItems[1];
			assert.equal(oDialogTab.getContent(), oContent.getDisplayContent(), "Content control");

			assert.ok(oPanel.isA("sap.m.Panel"), "Panel is second VBox item");
			assert.ok(oPanel.getVisible, "Panel is visible");
			assert.equal(oPanel.getHeaderText(), "TokenizerTitle", "Panel headerText");
			assert.equal(oPanel.getBackgroundDesign(), mLibrary.BackgroundDesign.Transparent, "Panel backgroundDesign");
			assert.ok(oPanel.getExpanded(), "Panel expanded");
			assert.notOk(oPanel.getExpandable(), "Panel expandable");
			const aPanelContent = oPanel.getContent();
			assert.equal(aPanelContent.length, 1, "Panel content length");
			assert.ok(aPanelContent[0].isA("sap.m.HBox"), "HBox is inside Panel");
			aItems = aPanelContent[0].getItems();
			assert.equal(aItems.length, 2, "HBox content length");
			const oTokenizer = aItems[0];
			const oBindingInfo = oTokenizer.getBindingInfo("tokens");
			assert.equal(oBindingInfo.length, 50, "Tokens - Bindinginfo length");
			assert.equal(oBindingInfo.startIndex, -50, "Tokens - Bindinginfo startIndex");
			const aTokens = oTokenizer.getTokens();
			assert.equal(aTokens.length, 1, "number of tokens");
			assert.equal(aTokens[0].getText(), "Text", "Token text");
			const oBinding = aTokens[0].getBinding("text");
			const oBindingType = oBinding.getType();
			assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
			const oFormatOptions = {
				maxConditions: -1, // as for tokens there should not be a limit on type side
				valueType: oType,
				additionalValueType: oAdditionalType,
				operators: [OperatorName.EQ, OperatorName.BT],
				display: FieldDisplay.Description,
				valueHelpID: "VH",
				control: oField,
				delegate: undefined,
				delegateName: undefined,
				payload: undefined,
				convertWhitespaces: true
			};
			assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");
			const oButton = aItems[1];
			assert.ok(oTokenizer.isA("sap.m.Tokenizer"), "Tokenizer is first HBox item");
			assert.ok(oButton.isA("sap.m.Button"), "Button is second HBox item");
			assert.equal(oButton.getType(), mLibrary.ButtonType.Transparent, "Button type");
			assert.equal(oButton.getIcon(), "sap-icon://decline", "Button icon");
			assert.equal(oButton.getTooltip(), oResourceBundle.getText("valuehelp.REMOVEALLTOKEN"), "Button tooltip");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("getContainerControl with multiple content for multi-select", (assert) => {

		const oContentField2 = new Icon("I3", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		const oContent2 = new Content("Content2", {title: "Content title2", shortTitle: "ShortTitle2", tokenizerTitle: "TokenizerTitle2"});
		sinon.stub(oContent2, "getContent").returns(oContentField2);
		oContent2.setAggregation("displayContent", oContentField2);
		sinon.stub(oContent2, "getCount").callsFake((aConditions) => {return aConditions.length;});

		oDialog.setTitle("Test");
		sinon.spy(oContent,"getFormattedTitle");
		sinon.spy(oContent2,"getFormattedTitle");
		oDialog.addContent(oContent2);
		const oContainer = oDialog.getContainerControl().then((oCont) => {
			return oDialog.placeContent(oCont);
		});

		return oContainer?.then((oContainer) => {
			assert.equal(oContainer.getTitle(), "Test", "sap.m.Dilaog title");
			const aButtons = oContainer.getButtons();
			assert.ok(aButtons[0].getVisible(), "OK-Button visible");

			const aDialogContent = oContainer.getContent();
			let aItems = aDialogContent[0].getItems();
			const oIconTabBar = aItems[0];
			const oPanel = aItems[1];
			//assert.notOk(oIconTabBar.getSelectedKey(), "IconTabBar selectedKey"); // as only set on opening
			assert.equal(oIconTabBar.getItems().length, 2, "items assigned");
			const oIconTabHeader = oIconTabBar._getIconTabHeader();
			assert.ok(oIconTabHeader.getVisible(), "IconTabHeader visible");
			let oIconTabFilter = oIconTabBar.getItems()[0];
			assert.equal(oIconTabFilter.getKey(), "Content1", "oIconTabFilter key");
			let aIconTabContent = oIconTabFilter.getContent();
			assert.equal(aIconTabContent.length, 1, "IconTabFilter content length");
			assert.ok(aIconTabContent[0].isA("sap.ui.mdc.valuehelp.base.DialogTab"), "Content of IconTabFilter");
			assert.equal(aIconTabContent[0].getContent(), oContentField, "Content control");
			assert.equal(oIconTabFilter.getText(), "Content title", "IconTabFilter text");
			assert.ok(oContent.getFormattedTitle.calledWith(1), "Content getFormattedTitle called with Count");

			// second content
			oIconTabFilter = oIconTabBar.getItems()[1];
			assert.equal(oIconTabFilter.getKey(), "Content2", "oIconTabFilter key");
			aIconTabContent = oIconTabFilter.getContent();
			assert.equal(aIconTabContent.length, 1, "IconTabFilter content length");
			assert.ok(aIconTabContent[0].isA("sap.ui.mdc.valuehelp.base.DialogTab"), "Content of IconTabFilter");
			assert.equal(aIconTabContent[0].getContent(), oContentField2, "Content control");
			assert.equal(oIconTabFilter.getText(), "Content title2", "IconTabFilter text");
			assert.ok(oContent2.getFormattedTitle.calledWith(1), "Content2 getFormattedTitle called with Count");

			assert.ok(oPanel.isA("sap.m.Panel"), "Panel is second VBox item");
			assert.ok(oPanel.getVisible, "Panel is visible");
			assert.equal(oPanel.getHeaderText(), formatMessage(oResourceBundle.getText("valuehelp.TOKENIZERTITLE"), 1), "Panel headerText");
			assert.equal(oPanel.getBackgroundDesign(), mLibrary.BackgroundDesign.Transparent, "Panel backgroundDesign");
			assert.ok(oPanel.getExpanded(), "Panel expanded");
			assert.notOk(oPanel.getExpandable(), "Panel expandable");
			const aPanelContent = oPanel.getContent();
			assert.equal(aPanelContent.length, 1, "Panel content length");
			assert.ok(aPanelContent[0].isA("sap.m.HBox"), "HBox is inside Panel");
			aItems = aPanelContent[0].getItems();
			assert.equal(aItems.length, 2, "HBox content length");
			const oTokenizer = aItems[0];
			const aTokens = oTokenizer.getTokens();
			assert.equal(aTokens.length, 1, "number of tokens");
			assert.equal(aTokens[0].getText(), "Text", "Token text");
			const oBinding = aTokens[0].getBinding("text");
			const oBindingType = oBinding.getType();
			assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
			const oFormatOptions = {
				maxConditions: -1, // as for tokens there should not be a limit on type side
				valueType: oType,
				additionalValueType: oAdditionalType,
				operators: [OperatorName.EQ, OperatorName.BT],
				display: FieldDisplay.Description,
				valueHelpID: "VH",
				control: oField,
				delegate: undefined,
				delegateName: undefined,
				payload: undefined,
				convertWhitespaces: true
			};
			assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");
			const oButton = aItems[1];
			assert.ok(oTokenizer.isA("sap.m.Tokenizer"), "Tokenizer is first HBox item");
			assert.ok(oButton.isA("sap.m.Button"), "Button is first HBox item");
			assert.equal(oButton.getType(), mLibrary.ButtonType.Transparent, "Button type");
			assert.equal(oButton.getIcon(), "sap-icon://decline", "Button icon");
			assert.equal(oButton.getTooltip(), oResourceBundle.getText("valuehelp.REMOVEALLTOKEN"), "Button tooltip");

			// invalidation of content should invalidate IconTabFilter, not ValueHelp
			sinon.spy(oIconTabFilter, "invalidate");
			sinon.spy(oValueHelp, "invalidate");
			oContent2.invalidate();
			assert.ok(oIconTabFilter.invalidate.calledOnce, "invalidate called on IconTabFilter");
			assert.ok(oValueHelp.invalidate.notCalled, "invalidate not called on ValueHelp");
			oValueHelp.invalidate.restore();
			oIconTabFilter.invalidate.restore();
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("getContainerControl with content for single-select", (assert) => {

		oDialog.removeAllContent(); // remove and add again to update quickSelect
		oValueHelpConfig.maxConditions = 1;
		sinon.stub(oContent, "isQuickSelectSupported").returns(true);
		oDialog.addContent(oContent);
		oDialog.setTitle("Test");
		sinon.spy(oContent,"getFormattedTitle");
		const oContainer = oDialog.getContainerControl().then((oCont) => {
			return oDialog.placeContent(oCont);
		});

		return oContainer?.then((oContainer) => {
			assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title");
			const aButtons = oContainer.getButtons();
			assert.notOk(aButtons[0].getVisible(), "OK-Button not visible");

			const aDialogContent = oContainer.getContent();
			const aItems = aDialogContent[0].getItems();

			assert.equal(aItems.length, 1, "No Panel is visible");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("open / close", (assert) => {

		let iOpened = 0;
		oDialog.attachEvent("opened", (oEvent) => {
			iOpened++;
		});
		let iClosed = 0;
		oDialog.attachEvent("closed", (oEvent) => {
			iClosed++;
		});
		let iConfirm = 0;
		let bClose = false;
		oDialog.attachEvent("confirm", (oEvent) => {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});

		sinon.spy(oContent, "onShow");
		sinon.spy(oContent, "onHide");
		sinon.spy(oDialog, "handleClose");

		oDialog.setTitle("Test");
		oField.focus(); // to test focus restore
		const oPromise = oDialog.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					const oContainer = oDialog.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
					assert.ok(oContainer.isOpen(), "sap.m.Dialog is open");
					assert.ok(oContent.onShow.calledOnce, "Content onShow called");
					assert.equal(oDialog.getDomRef(), oContainer.getDomRef(), "DomRef of sap.m.Dialog returned");
					assert.equal(oContainer.getInitialFocus(), oContentField.getId(), "Content Field has initial focus");
					sinon.stub(oContainer, "getUIArea").returns("X"); // to test result
					assert.equal(oDialog.getUIAreaForContent(), "X", "getUIAreaForContent returns UiArea of sap.m.Dialog");
					oContainer.getUIArea.restore();
					assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title");
					const aDialogContent = oContainer.getContent();
					let aItems = aDialogContent[0].getItems();

					const oPanel = aItems[1];
					const aPanelContent = oPanel.getContent();
					aItems = aPanelContent[0].getItems();
					const oTokenizer = aItems[0];
					let aTokens = oTokenizer.getTokens();
					let oBinding = aTokens[0].getBinding("text");
					let oBindingType = oBinding.getType();
					assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
					let oFormatOptions = {
						maxConditions: -1, // as for tokens there should not be a limit on type side
						valueType: oType,
						additionalValueType: oAdditionalType,
						operators: [OperatorName.EQ, OperatorName.BT],
						display: FieldDisplay.Description,
						valueHelpID: "VH",
						control: oField,
						delegate: undefined,
						delegateName: undefined,
						payload: undefined,
						convertWhitespaces: true
					};
					assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");

					// the inner input element has to been set to transparent.
					assert.ok(oTokenizer.isA("sap.m.Tokenizer"), "Tokenizer is first HBox item");

					// simulate ok-button click
					const aButtons = oContainer.getButtons();
					aButtons[0].firePress();
					assert.equal(iConfirm, 1, "Confirm event fired");
					assert.ok(bClose, "close parameter");


					sinon.spy(oField, "focus");
					oDialog.close();
					assert.ok(oDialog.handleClose.calledOnce, "handleClose called");
					oDialog.handleClose.restore();

					setTimeout(() => { // wait until closed
						assert.equal(iClosed, 1, "Closed event fired once");
						assert.notOk(oContainer.isOpen(), "sap.m.Dialog is not open");
						assert.ok(oContent.onHide.calledOnce, "Content onHide called");
						assert.ok(oField.focus.calledOnce, "previous focus restored");

						// open again // config changes needs to be applied
						oType.destroy();
						oType = new StringType(undefined, {maxLength: 10});
						oValueHelpConfig.dataType = oType;
						oValueHelpConfig.operators = [OperatorName.EQ, OperatorName.BT, OperatorName.GT, OperatorName.LT];
						oValueHelpConfig.display = FieldDisplay.ValueDescription;
						const oPromise = oDialog.open(Promise.resolve());
						assert.ok(oPromise instanceof Promise, "open returns promise");

						if (oPromise) {
							oPromise.then(() => {
								setTimeout(() => { // wait until open
									assert.equal(iOpened, 2, "Opened event fired again");
									assert.ok(oContainer.isOpen(), "sap.m.Dialog is open");
									aTokens = oTokenizer.getTokens();
									oBinding = aTokens[0].getBinding("text");
									oBindingType = oBinding.getType();
									assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
									oFormatOptions = {
										maxConditions: -1, // as for tokens there should not be a limit on type side
										valueType: oType,
										additionalValueType: oAdditionalType,
										operators: [OperatorName.EQ, OperatorName.BT, OperatorName.GT, OperatorName.LT],
										display: FieldDisplay.ValueDescription,
										valueHelpID: "VH",
										control: oField,
										delegate: undefined,
										delegateName: undefined,
										payload: undefined,
										convertWhitespaces: true
									};
									assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");

									oField.focus(); // to test focus restore
									oField.focus.reset();
									oDialog.close(true);
									setTimeout(() => { // wait until closed
										assert.equal(iClosed, 2, "Closed event fired again");
										assert.notOk(oContainer.isOpen(), "sap.m.Dialog is not open");
										assert.ok(oContent.onHide.calledTwice, "Content onHide called again");
										assert.ok(oField.focus.notCalled, "previous focus not restored");
										fnDone();
									}, iDialogDuration);
								}, iDialogDuration);
							}).catch((oError) => {
								assert.notOk(true, "Promise Catch called");
								fnDone();
							});
						}
					}, iDialogDuration);
				}, iDialogDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("switch content", (assert) => {

		const oContentField2 = new Icon("I3", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		const oContent2 = new Content("Content2", {title: "Content2 title"});
		sinon.stub(oContent2, "getContent").returns(oContentField2);
		oContent2.setAggregation("displayContent", oContentField2);
		sinon.stub(oContent2, "getCount").callsFake((aConditions) => {return aConditions.length;});
		oDialog.addContent(oContent2);

		sinon.spy(oContent, "onShow");
		sinon.spy(oContent, "onHide");
		sinon.spy(oContent2, "onShow");
		sinon.spy(oContent2, "onHide");

		oDialog.setTitle("Test");
		const oPromise = oDialog.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					const oContainer = oDialog.getAggregation("_container");
					assert.equal(oContainer.getTitle(), "Test", "sap.m.Dialog title");
					const aDialogContent = oContainer.getContent();
					const aItems = aDialogContent[0].getItems();
					const oIconTabBar = aItems[0];
					const oIconTabHeader = oIconTabBar.getAggregation("_header");
					assert.equal(oIconTabBar.getItems().length, 2, "items assigned");
					oIconTabHeader.setSelectedItem(oIconTabHeader.getItems()[1], false); // simulate swith

					setTimeout(() => { // as _onTabBarSelect is async
						assert.equal(oIconTabBar.getSelectedKey(), "Content2", "IconTabBar selectedKey");
						assert.ok(oContent.onHide.calledOnce, "Content onHide called");
						assert.ok(oContent2.onShow.calledOnce, "Content2 onShow called");
						assert.equal(oContainer.getTitle(), "Test", "sap.m.Dialog title");

						oDialog.close();
						setTimeout(() => { // wait until closed
							assert.ok(oContent2.onHide.calledOnce, "Content2 onHide called");

							fnDone();
						}, iDialogDuration);
					}, 0);
				}, iDialogDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("CollectiveSearch", (assert) => {

		const oContentField2 = new Icon("I3", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		const oContent2 = new Content("Content2", {title: "Content title2", shortTitle: "ShortTitle2", tokenizerTitle: "TokenizerTitle2"});
		sinon.stub(oContent2, "getContent").returns(oContentField2);
		oContent2.setAggregation("displayContent", oContentField2);
		sinon.stub(oContent2, "getCount").callsFake((aConditions) => {return aConditions.length;});

		const oContentField3 = new Icon("I4", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		const oContent3 = new Content("Content3", {title: "Content title3", shortTitle: "ShortTitle3", tokenizerTitle: "TokenizerTitle3", visible: false}); // must not be available
		sinon.stub(oContent3, "getContent").returns(oContentField3);
		oContent3.setAggregation("displayContent", oContentField3);
		sinon.stub(oContent3, "getCount").callsFake((aConditions) => {return aConditions.length;});

		oDialog.setTitle("Test");
		oDialog.setGroupConfig({Group1: {label: "Group 1 ({0})", nnLabel: "Group 1"}});
		sinon.spy(oContent, "onShow");
		sinon.spy(oContent, "onBeforeShow");
		sinon.spy(oContent, "onHide");
		sinon.spy(oContent2, "onShow");
		sinon.spy(oContent2, "onBeforeShow");
		sinon.spy(oContent2, "onHide");
		oContent.getGroup = () => "Group1"; // fake property
		oContent.setCollectiveSearchSelect = (oCollectiveSearchSelect) => {oContent._oCollectiveSearchSelect = oCollectiveSearchSelect;}; // fake collective search support
		oContent2.getGroup = () => "Group1";
		oContent2.setCollectiveSearchSelect = (oCollectiveSearchSelect) => {oContent2._oCollectiveSearchSelect = oCollectiveSearchSelect;};
		oContent2.getGroup = () => "Group1";
		oContent3.setCollectiveSearchSelect = (oCollectiveSearchSelect) => {oContent3._oCollectiveSearchSelect = oCollectiveSearchSelect;};
		oDialog.addContent(oContent2);
		oDialog.addContent(oContent3);
		const oPromise = oDialog.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					const oContainer = oDialog.getAggregation("_container");
					assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title"); // as only one seletable Tab
					assert.ok(oDialog._oGroupSelect, "CollectiveSearchSelect created");
					const aGroupSelectItems = oDialog._oGroupSelect?.getItems();
					assert.equal(aGroupSelectItems?.length, 2, "2 Items on CollectiveSearchSelect");
					assert.equal(aGroupSelectItems?.[0].getKey(), "Content1", "GollectiveSearchItem key");
					assert.equal(aGroupSelectItems?.[0].getText(), "Content title", "GollectiveSearchItem Text");
					assert.equal(aGroupSelectItems?.[1].getKey(), "Content2", "GollectiveSearchItem key");
					assert.equal(aGroupSelectItems?.[1].getText(), "Content title2", "GollectiveSearchItem Text");

					const aDialogContent = oContainer.getContent();
					const aItems = aDialogContent[0].getItems();
					const oDialogTab = aItems[0];
					assert.equal(oDialogTab.getContent(), oContent.getDisplayContent(), "active Content control");
					assert.ok(oContent._oCollectiveSearchSelect, "CollectiveSearchSelect added to active Content");
					assert.notOk(oContent2._oCollectiveSearchSelect, "CollectiveSearchSelect not added to inactive Content");
					assert.ok(oContent.onBeforeShow.calledOnce, "active Content onBeforeShow called");
					assert.notOk(oContent2.onBeforeShow.called, "inactive Content onBeforeShow not called");

					oContent.onBeforeShow.reset();
					oContent2.onBeforeShow.reset();
					oDialog._oGroupSelect.focus();
					sinon.spy(oDialog._oGroupSelect, "focus");
					oDialog._oGroupSelect.fireSelect({key: "Content2"});
					setTimeout(() => { // wait until content changed
						setTimeout(() => { // wait until content rendering finished
							assert.equal(oDialogTab.getContent(), oContent2.getDisplayContent(), "active Content control");
							assert.notOk(oContent._oCollectiveSearchSelect, "CollectiveSearchSelect not added to active Content");
							assert.ok(oContent2._oCollectiveSearchSelect, "CollectiveSearchSelect added to inactive Content");
							assert.ok(oContent.onHide.calledOnce, "Content onHide called");
							assert.notOk(oContent.onBeforeShow.calledOnce, "inactive Content onBeforeShow not called");
							assert.ok(oContent2.onBeforeShow.called, "active Content onBeforeShow called");
							assert.ok(oDialog._oGroupSelect.focus.calledOnce, "CollectiveSearchSelect focussed");

							oDialog.close();
							setTimeout(() => { // wait until closed
								assert.ok(oContent2.onHide.calledOnce, "Content2 onHide called");

								fnDone();
							}, iDialogDuration);
						}, 0);
					}, 0);
				}, iDialogDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("CollectiveSearch with additional content", (assert) => {

		const oContentField2 = new Icon("I3", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		const oContent2 = new Content("Content2", {title: "Content title2", shortTitle: "ShortTitle2", tokenizerTitle: "TokenizerTitle2"});
		sinon.stub(oContent2, "getContent").returns(oContentField2);
		oContent2.setAggregation("displayContent", oContentField2);
		sinon.stub(oContent2, "getCount").callsFake((aConditions) => {return aConditions.length;});

		const oContentField3 = new Icon("I4", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		const oContent3 = new Content("Content3", {title: "Content title3", shortTitle: "ShortTitle3", tokenizerTitle: "TokenizerTitle3"});
		sinon.stub(oContent3, "getContent").returns(oContentField3);
		oContent3.setAggregation("displayContent", oContentField3);
		sinon.stub(oContent3, "getCount").callsFake((aConditions) => {return aConditions.length;});

		oDialog.setTitle("Test");
		oDialog.setGroupConfig({Group1: {label: "Group 1 ({0})", nnLabel: "Group 1"}});
		sinon.spy(oContent, "onShow");
		sinon.spy(oContent, "onBeforeShow");
		sinon.spy(oContent, "onHide");
		sinon.spy(oContent2, "onShow");
		sinon.spy(oContent2, "onBeforeShow");
		sinon.spy(oContent2, "onHide");
		sinon.spy(oContent3, "onShow");
		sinon.spy(oContent3, "onBeforeShow");
		sinon.spy(oContent3, "onHide");
		oContent.getGroup = () => "Group1"; // fake property
		oContent.setCollectiveSearchSelect = (oCollectiveSearchSelect) => {oContent._oCollectiveSearchSelect = oCollectiveSearchSelect;}; // fake collective search support
		oContent2.getGroup = () => "Group1";
		oContent2.setCollectiveSearchSelect = (oCollectiveSearchSelect) => {oContent2._oCollectiveSearchSelect = oCollectiveSearchSelect;};
		oDialog.addContent(oContent2);
		oDialog.addContent(oContent3);
		oModel.getData().conditions = []; // check Tokenizer Title
		oModel.checkUpdate(true);
		const oPromise = oDialog.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					const oContainer = oDialog.getAggregation("_container");
					assert.equal(oContainer.getTitle(), "Test", "sap.m.Dialog title");
					const aDialogContent = oContainer.getContent();
					const aItems = aDialogContent[0].getItems();
					const oIconTabBar = aItems[0];
					assert.equal(oIconTabBar.getItems().length, 2, "items assigned");
					let oIconTabFilter = oIconTabBar.getItems()[0];
					assert.equal(oIconTabFilter.getKey(), "Content1", "oIconTabFilter key");
					let aIconTabContent = oIconTabFilter.getContent();
					assert.equal(aIconTabContent.length, 1, "IconTabFilter content length");
					assert.ok(aIconTabContent[0].isA("sap.ui.mdc.valuehelp.base.DialogTab"), "Content of IconTabFilter");
					assert.equal(aIconTabContent[0].getContent(), oContentField, "Content control");
					assert.equal(oIconTabFilter.getText(), "Group 1", "IconTabFilter text");
					oIconTabFilter = oIconTabBar.getItems()[1];
					assert.equal(oIconTabFilter.getKey(), "Content3", "oIconTabFilter key");
					aIconTabContent = oIconTabFilter.getContent();
					assert.equal(aIconTabContent.length, 1, "IconTabFilter content length");
					assert.ok(aIconTabContent[0].isA("sap.ui.mdc.valuehelp.base.DialogTab"), "Content of IconTabFilter");
					assert.equal(aIconTabContent[0].getContent(), oContentField3, "Content control");
					assert.equal(oIconTabFilter.getText(), "Content title3", "IconTabFilter text");

					oIconTabFilter = oIconTabBar.getItems()[0];
					aIconTabContent = oIconTabFilter.getContent();
					assert.ok(oDialog._oGroupSelect, "CollectiveSearchSelect created");
					const aGroupSelectItems = oDialog._oGroupSelect?.getItems();
					assert.equal(aGroupSelectItems?.length, 2, "2 Items on CollectiveSearchSelect");
					assert.equal(aGroupSelectItems?.[0].getKey(), "Content1", "GollectiveSearchItem key");
					assert.equal(aGroupSelectItems?.[0].getText(), "Content title", "GollectiveSearchItem Text");
					assert.equal(aGroupSelectItems?.[1].getKey(), "Content2", "GollectiveSearchItem key");
					assert.equal(aGroupSelectItems?.[1].getText(), "Content title2", "GollectiveSearchItem Text");

					assert.ok(oContent._oCollectiveSearchSelect, "CollectiveSearchSelect added to active Content");
					assert.notOk(oContent2._oCollectiveSearchSelect, "CollectiveSearchSelect not added to inactive Content");
					assert.ok(oContent.onBeforeShow.calledOnce, "active Content onBeforeShow called");
					assert.notOk(oContent2.onBeforeShow.called, "inactive Content onBeforeShow not called");

					oContent.onBeforeShow.reset();
					oContent2.onBeforeShow.reset();
					oDialog._oGroupSelect.focus();
					sinon.spy(oDialog._oGroupSelect, "focus");
					oDialog._oGroupSelect.fireSelect({key: "Content2"});
					setTimeout(() => { // wait until content changed
						setTimeout(() => { // wait until content rendering finished
							assert.equal(aIconTabContent[0].getContent(), oContent2.getDisplayContent(), "active Content control");
							assert.notOk(oContent._oCollectiveSearchSelect, "CollectiveSearchSelect not added to active Content");
							assert.ok(oContent2._oCollectiveSearchSelect, "CollectiveSearchSelect added to inactive Content");
							assert.ok(oContent.onHide.calledOnce, "Content onHide called");
							assert.notOk(oContent.onBeforeShow.calledOnce, "inactive Content onBeforeShow not called");
							assert.ok(oContent2.onBeforeShow.called, "active Content onBeforeShow called");
							assert.ok(oDialog._oGroupSelect.focus.calledOnce, "CollectiveSearchSelect focussed");

							const oPanel = aItems[1];
							assert.equal(oPanel.getHeaderText(), formatMessage(oResourceBundle.getText("valuehelp.TOKENIZERTITLENONUMBER")), "Panel headerText");

							oDialog.close();
							setTimeout(() => { // wait until closed
								assert.ok(oContent2.onHide.calledOnce, "Content2 onHide called");

								fnDone();
							}, iDialogDuration);
						}, 0);
					}, 0);
				}, iDialogDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("getAriaAttributes", (assert) => {

		const oCheckAttributes = {
			contentId: null,
			ariaHasPopup: "dialog",
			role: null,
			roleDescription: null,
			valueHelpEnabled: true,
			autocomplete: "none"
		};
		const oAttributes = oDialog.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("isMultiSelect", (assert) => {

		assert.ok(oDialog.isMultiSelect(), "isMultiSelect");

		oValueHelpConfig.maxConditions = 1;
		assert.notOk(oDialog.isMultiSelect(), "isMultiSelect");

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("isTypeaheadSupported", (assert) => {

		const bSupported = oDialog.isTypeaheadSupported();
		assert.notOk(bSupported, "not supported for dialog");

	});

	QUnit.test("select event", (assert) => {

		let iSelect = 0;
		let aConditions;
		let sType;
		oDialog.attachEvent("select", (oEvent) => {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		let iConfirm = 0;
		let bClose = false;
		oDialog.attachEvent("confirm", (oEvent) => {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});

		const oContent2 = new Content("Content2", {title: "Content title 2", shortTitle: "ShortTitle 2"});
		sinon.stub(oContent2, "isQuickSelectSupported").returns(true);
		oDialog.addContent(oContent2);

		const oPromise = oDialog.open(Promise.resolve());
		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					oContent.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: ValueHelpSelectionType.Set});
					assert.equal(iSelect, 1, "select event fired");
					assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
					assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
					assert.equal(iConfirm, 0, "ConfirmEvent not fired");

					iSelect = 0;
					iConfirm = 0;
					oContent2.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: ValueHelpSelectionType.Set});
					assert.equal(iSelect, 0, "select event not fired for hidden content");

					oValueHelpConfig = merge({}, oValueHelpConfig);
					oValueHelpConfig.maxConditions = 1;
					oModel.setProperty("/_config", oValueHelpConfig); // update Model to use Binding updates
					oDialog._handleContentSelectionChange("Content2"); // fake switch of content
					oDialog.removeContent(oContent); // to enable quick select
					oContent.destroy();

					setTimeout(() => { // wait until switched and model updated
						iSelect = 0;
						iConfirm = 0;
						oContent.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: ValueHelpSelectionType.Set});
						assert.equal(iSelect, 0, "select event not fired for hidden content");

						iSelect = 0;
						iConfirm = 0;

						oContent2.fireSelect({conditions: [], type: ValueHelpSelectionType.Set});
						assert.deepEqual(aConditions, [], "select event conditions");
						assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
						assert.equal(iConfirm, 0, "ConfirmEvent not fired");
						assert.notOk(bClose, "Close parameter not set");

						oContent2.fireSelect({conditions: [], type: ValueHelpSelectionType.Add});
						assert.deepEqual(aConditions, [], "select event conditions");
						assert.equal(sType, ValueHelpSelectionType.Add, "select event type");
						assert.equal(iConfirm, 0, "ConfirmEvent not fired");
						assert.notOk(bClose, "Close parameter not set");

						oContent2.fireSelect({conditions: [Condition.createItemCondition("Y", "Text")], type: ValueHelpSelectionType.Set});
						assert.deepEqual(aConditions, [Condition.createItemCondition("Y", "Text")], "select event conditions");
						assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
						assert.equal(iConfirm, 1, "ConfirmEvent fired");
						assert.ok(bClose, "Close parameter set");

						bClose = false;
						oContent2.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: ValueHelpSelectionType.Add});
						assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
						assert.equal(sType, ValueHelpSelectionType.Add, "select event type");
						assert.equal(iConfirm, 2, "ConfirmEvent fired");
						assert.ok(bClose, "Close parameter set");

						oContent2.destroy();
						fnDone();
					}, iDialogDuration);
				}, iDialogDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("delete tokens via Tokenizer", (assert) => {

		let iSelect = 0;
		let aConditions;
		let sType;
		oDialog.attachEvent("select", (oEvent) => {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		const oContainer = oDialog.getContainerControl().then((oCont) => {
			return oDialog.placeContent(oCont);
		});

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then((oContainer) => {
				const aDialogContent = oContainer.getContent();
				let aItems = aDialogContent[0].getItems();
				const oPanel = aItems[1];
				const aPanelContent = oPanel.getContent();
				aItems = aPanelContent[0].getItems();
				const oTokenizer = aItems[0];
				const aTokens = oTokenizer.getTokens();

				sinon.spy(oContent, "getFocusControlAfterTokenRemoval");
				sinon.spy(oDialog.oButtonOK, "focus");
				oTokenizer.fireTokenDelete({tokens: aTokens});
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
				assert.equal(sType, ValueHelpSelectionType.Remove, "select event type");
				assert.ok(oContent.getFocusControlAfterTokenRemoval.calledOnce, "getFocusControlAfterTokenRemoval called on Content");

				oModel.setData({
					_config: oValueHelpConfig,
					filterValue: "X",
					conditions: []
				}); // simulate data update
				assert.equal(oPanel.getHeaderText(), "TokenizerTitle", "Panel headerText");
				assert.ok(oDialog.oButtonOK.focus.calledOnce, "OK-Button focussed");

				fnDone();
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("delete tokens via Button", (assert) => {

		let iSelect = 0;
		let aConditions;
		let sType;
		oDialog.attachEvent("select", (oEvent) => {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		const oContainer = oDialog.getContainerControl().then((oCont) => {
			return oDialog.placeContent(oCont);
		});

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then((oContainer) => {
				const aDialogContent = oContainer.getContent();
				let aItems = aDialogContent[0].getItems();
				const oPanel = aItems[1];
				const aPanelContent = oPanel.getContent();
				aItems = aPanelContent[0].getItems();
				const oButton = aItems[1];
				sinon.spy(oContent, "getFocusControlAfterTokenRemoval");
				sinon.spy(oDialog.oButtonOK, "focus");

				oButton.firePress();
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, [], "select event conditions");
				assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
				assert.ok(oContent.getFocusControlAfterTokenRemoval.calledOnce, "getFocusControlAfterTokenRemoval called on Content");
				assert.ok(oDialog.oButtonOK.focus.calledOnce, "OK-Button focussed");

				fnDone();
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	let oDeviceSystemStub;
	let oDeviceOrientationStub;
	QUnit.module("Tablet", {
		beforeEach() {
			const oSystem = {
				desktop: false,
				phone: false,
				tablet: true
			};
			const oOrientation = {landscape: false};

			oDeviceSystemStub = sinon.stub(Device, "system").value(oSystem);
			oDeviceOrientationStub = sinon.stub(Device, "orientation").value(oOrientation);
			oDialog = new Dialog("D1", {
			});
		},
		afterEach() {
			_teardown();
			oDeviceSystemStub.restore();
			oDeviceOrientationStub.restore();
		}
	});

	QUnit.test("getContainerControl", (assert) => {

		oDialog.setTitle("Test");
		const oContainer = oDialog.getContainerControl();

		return oContainer?.then((oContainer) => {
			assert.ok(oContainer, "Container returned");
			assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
			assert.equal(oContainer.getContentHeight(), "600px", "contentHeight");
			assert.equal(oContainer.getContentWidth(), "600px", "contentWidth");
			assert.notOk(oContainer.getHorizontalScrolling(), "horizontalScrolling");
			assert.notOk(oContainer.getVerticalScrolling(), "verticalScrolling");
			assert.equal(oContainer.getTitle(), "Test", "title");
			assert.equal(oContainer.getStretch(), Device.system.phone, "stretch");
			assert.ok(oContainer.getResizable(), "resizable");
			assert.ok(oContainer.getDraggable(), "draggable");
			assert.notOk(oContainer.isPopupAdaptationAllowed(), "isPopupAdaptationAllowed");
			assert.ok(oContainer.hasStyleClass("sapUiSizeCozy"), "content density is set explicitly");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("getContainerControl - landscape", (assert) => {

		oDeviceOrientationStub.value({landscape: true});
		oDialog.setTitle("Test");
		const oContainer = oDialog.getContainerControl();

		return oContainer?.then((oContainer) => {
			assert.ok(oContainer, "Container returned");
			assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
			assert.equal(oContainer.getContentHeight(), "600px", "contentHeight");
			assert.equal(oContainer.getContentWidth(), "920px", "contentWidth");
			assert.notOk(oContainer.getHorizontalScrolling(), "horizontalScrolling");
			assert.notOk(oContainer.getVerticalScrolling(), "verticalScrolling");
			assert.equal(oContainer.getTitle(), "Test", "title");
			assert.equal(oContainer.getStretch(), Device.system.phone, "stretch");
			assert.ok(oContainer.getResizable(), "resizable");
			assert.ok(oContainer.getDraggable(), "draggable");
			assert.notOk(oContainer.isPopupAdaptationAllowed(), "isPopupAdaptationAllowed");
			assert.ok(oContainer.hasStyleClass("sapUiSizeCozy"), "content density is set explicitly");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

});
