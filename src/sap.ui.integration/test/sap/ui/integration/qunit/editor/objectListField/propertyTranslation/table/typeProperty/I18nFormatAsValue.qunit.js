/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"qunit/designtime/EditorQunitUtils"
], function(
	x,
	Localization,
	Element,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	deepClone,
	EditorQunitUtils
) {
	"use strict";
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oValue03 = { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false, "_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}};
	var oManifestForObjectListFieldWithTranslation = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectListFieldWithTranslation",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectsWithPropertiesDefinedAndValueFromJsonList": {
						"value": [oValue03]
					}
				},
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					}
				}
			}
		}
	};
	var oDefaultNewObject = {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
	var _oOriginExpectedValues = {
		"string1": {
			"default": "String 1 English",
			"en": "String 1 English",
			"en-US": "String 1 US English",
			"es-MX": "String 1 Spanish MX",
			"fr": "String 1 French",
			"fr-FR": "String 1 French",
			"fr-CA": "String 1 French CA"
		},
		"string2": {
			"default": "String 2 English",
			"en": "String 2 English",
			"en-US": "String 2 US English",
			"es-MX": "String 2 Spanish MX",
			"fr": "String 2 French",
			"fr-FR": "String 2 French",
			"fr-CA": "String 2 French CA"
		},
		"string3": {
			"default": "String 3 English",
			"en": "String 3 English",
			"en-US": "String 3 US English",
			"es": "String 3 Spanish",
			"es-MX": "String 3 Spanish",
			"fr": "String 3 French",
			"fr-FR": "String 3 French",
			"fr-CA": "String 3 French CA"
		},
		"string4": {
			"default": "String 4 English",
			"en": "String 4 English",
			"en-US": "String 4 US English",
			"fr": "String 4 French",
			"fr-FR": "String 1 French",
			"fr-CA": "String 4 French CA"
		}
	};

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
	}

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function cleanUUIDAndPosition(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				if (oResult._dt) {
					delete oResult._dt._uuid;
					delete oResult._dt._position;
				}
				if (deepEqual(oResult._dt, {})) {
					delete oResult._dt;
				}
			});
		} else if (typeof oClonedValue === "object") {
			if (oClonedValue._dt) {
				delete oClonedValue._dt._uuid;
				delete oClonedValue._dt._position;
			}
			if (deepEqual(oClonedValue._dt, {})) {
				delete oClonedValue._dt;
			}
		}
		return oClonedValue;
	}

	QUnit.module("basic", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("update translation values and delete", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oSelectionColumn = oTable.getColumns()[0];
						var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
						var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oKeyColumn = oTable.getColumns()[1];
						assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel3 = oContents[4];
							var oFormField3 = oContents[5];
							assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
							assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
							assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
							assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
							assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
							assert.equal(oFormField3.getValue(), "text", "SimpleForm field 3: Has No value");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
							assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
							assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
							oValueHelpIcon3.firePress();
							EditorQunitUtils.wait(1500).then(function () {
								var oTranslationListPage3 = oField._oTranslationListPage;
								var oSaveButton3 = oTranslationListPage3.getFooter().getContent()[1];
								assert.ok(oSaveButton3.getVisible(), "TranslationListPage3 footer: save button visible");
								assert.ok(!oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button disabled");
								var oResetButton3 = oTranslationListPage3.getFooter().getContent()[2];
								assert.ok(oResetButton3.getVisible(), "TranslationListPage3 footer: reset button visible");
								assert.ok(!oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button disabled");
								var oCancelButton3 = oTranslationListPage3.getFooter().getContent()[3];
								assert.ok(!oCancelButton3.getVisible(), "TranslationListPage3 footer: cancel button visible");
								var oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "TranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "text";
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oTranslationListPage3._navBtn.firePress();
								EditorQunitUtils.wait().then(function () {
									oFormField3.setValue("{i18n>string1}");
									oFormField3.fireChange({ value: "{i18n>string1}"});
									EditorQunitUtils.wait().then(function () {
										assert.equal(oFormField3.getValue(), "{i18n>string1}", "SimpleForm field 3: Has new value");
										assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
										assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
										oValueHelpIcon3.firePress();
										EditorQunitUtils.wait().then(function () {
											oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
											assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
													var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
													assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												}
											}
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0 && oCustomData[0].getKey() === "en") {
													var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
													oInput.setValue("string1 en");
													oInput.fireChange({ value: "string1 en"});
													break;
												}
											}
											EditorQunitUtils.wait().then(function () {
												assert.ok(oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button enabled");
												assert.ok(oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button enabled");
												oSaveButton3.firePress();
												EditorQunitUtils.wait().then(function () {
													oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
													assert.equal(oLanguageItems3.length, 49, "oTranslationListPage3 Content: length");
													for (var i = 0; i < oLanguageItems3.length; i++) {
														var oCustomData = oLanguageItems3[i].getCustomData();
														if (oCustomData && oCustomData.length > 0) {
															var sLanguage = oCustomData[0].getKey();
															var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
															if (sLanguage === "en") {
																sExpectedValue = "string1 en";
															}
															var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
															assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
														}
													}
													var oNewObject = JSON.parse(oTextArea.getValue());
													assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
													var sUUID = oNewObject._dt._uuid;
													var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
													assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
													oTranslationListPage3._navBtn.firePress();
													EditorQunitUtils.wait().then(function () {
														oNewObject._dt._position = oField._positionCount;
														oAddButtonInPopover.firePress();
														EditorQunitUtils.wait().then(function () {
															assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
															// scroll to the bottom
															oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
															EditorQunitUtils.wait().then(function () {
																var oNewObjectValue = Object.assign(deepClone(oNewObject, 500), {"text": "{i18n>string1}"});
																delete oNewObjectValue._dt._selected;
																var oSelectedValue3 = deepClone(oValue03, 500);
																oSelectedValue3._dt._position = 1;
																assert.ok(deepEqual(oField._getCurrentProperty("value"), [oSelectedValue3, oNewObjectValue]), "Field 1: Field 1: new object added into value");
																var oRow5 = oTable.getRows()[4];
																assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oNewObject), "Table: new object is the last row");
																var oTextCell = oRow5.getCells()[3];
																assert.equal(oTextCell.getText(), "string1 en", "Row: text cell value");
																sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
																assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
																var oDeleteButton = oToolbar.getContent()[3];
																assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button not enabled");
																oTable.setSelectedIndex(8);
																oTable.fireRowSelectionChange({
																	rowIndex: 8,
																	userInteraction: true
																});
																assert.ok(oDeleteButton.getEnabled(), "Table toolbar: delete button enabled");
																oDeleteButton.firePress();
																EditorQunitUtils.wait().then(function () {
																	var sMessageBoxId = document.querySelector(".sapMMessageBox").id;
																	var oMessageBox = Element.getElementById(sMessageBoxId);
																	var oOKButton = oMessageBox._getToolbar().getContent()[1];
																	oOKButton.firePress();
																	EditorQunitUtils.wait().then(function () {
																		assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
																		sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
																		assert.ok(!sTranslationTextOfEN, "Texts: no value");
																		assert.ok(deepEqual(oField._getCurrentProperty("value"), [oSelectedValue3]), "Field 1: Field 1: added object deleted");
																		destroyEditor(that.oEditor);
																		resolve();
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("update translation values during adding new object, then cancel the add process", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oSelectionColumn = oTable.getColumns()[0];
						var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
						var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oKeyColumn = oTable.getColumns()[1];
						assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel3 = oContents[4];
							var oFormField3 = oContents[5];
							assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
							assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
							assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
							assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
							assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
							assert.equal(oFormField3.getValue(), "text", "SimpleForm field 3: Has No value");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
							assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
							assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
							oValueHelpIcon3.firePress();
							EditorQunitUtils.wait(1500).then(function () {
								var oTranslationListPage3 = oField._oTranslationListPage;
								var oSaveButton3 = oTranslationListPage3.getFooter().getContent()[1];
								assert.ok(oSaveButton3.getVisible(), "TranslationListPage3 footer: save button visible");
								assert.ok(!oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button disabled");
								var oResetButton3 = oTranslationListPage3.getFooter().getContent()[2];
								assert.ok(oResetButton3.getVisible(), "TranslationListPage3 footer: reset button visible");
								assert.ok(!oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button disabled");
								var oCancelButton3 = oTranslationListPage3.getFooter().getContent()[3];
								assert.ok(!oCancelButton3.getVisible(), "TranslationListPage3 footer: cancel button visible");
								var oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "TranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "text";
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oTranslationListPage3._navBtn.firePress();
								EditorQunitUtils.wait().then(function () {
									oFormField3.setValue("{i18n>string1}");
									oFormField3.fireChange({ value: "{i18n>string1}"});
									EditorQunitUtils.wait().then(function () {
										assert.equal(oFormField3.getValue(), "{i18n>string1}", "SimpleForm field 3: Has new value");
										assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
										assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
										oValueHelpIcon3.firePress();
										EditorQunitUtils.wait().then(function () {
											oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
											assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
													var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
													assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												}
											}
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0 && oCustomData[0].getKey() === "en") {
													var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
													oInput.setValue("string1 en");
													oInput.fireChange({ value: "string1 en"});
													break;
												}
											}
											EditorQunitUtils.wait().then(function () {
												assert.ok(oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button enabled");
												assert.ok(oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button enabled");
												oSaveButton3.firePress();
												EditorQunitUtils.wait().then(function () {
													oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
													assert.equal(oLanguageItems3.length, 49, "oTranslationListPage3 Content: length");
													for (var i = 0; i < oLanguageItems3.length; i++) {
														var oCustomData = oLanguageItems3[i].getCustomData();
														if (oCustomData && oCustomData.length > 0) {
															var sLanguage = oCustomData[0].getKey();
															var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
															if (sLanguage === "en") {
																sExpectedValue = "string1 en";
															}
															var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
															assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
														}
													}
													var oNewObject = JSON.parse(oTextArea.getValue());
													assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
													var sUUID = oNewObject._dt._uuid;
													var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
													assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
													oTranslationListPage3._navBtn.firePress();
													EditorQunitUtils.wait().then(function () {
														oCancelButtonInPopover.firePress();
														EditorQunitUtils.wait().then(function () {
															assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
															sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
															assert.ok(!sTranslationTextOfEN, "Texts: no value");
															destroyEditor(that.oEditor);
															resolve();
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("change translation values but reset", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oSelectionColumn = oTable.getColumns()[0];
						var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
						var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oKeyColumn = oTable.getColumns()[1];
						assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel3 = oContents[4];
							var oFormField3 = oContents[5];
							assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
							assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
							assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
							assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
							assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
							assert.equal(oFormField3.getValue(), "text", "SimpleForm field 3: Has No value");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
							assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
							assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
							oValueHelpIcon3.firePress();
							EditorQunitUtils.wait(1500).then(function () {
								var oTranslationListPage3 = oField._oTranslationListPage;
								var oSaveButton3 = oTranslationListPage3.getFooter().getContent()[1];
								assert.ok(oSaveButton3.getVisible(), "TranslationListPage3 footer: save button visible");
								assert.ok(!oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button disabled");
								var oResetButton3 = oTranslationListPage3.getFooter().getContent()[2];
								assert.ok(oResetButton3.getVisible(), "TranslationListPage3 footer: reset button visible");
								assert.ok(!oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button disabled");
								var oCancelButton3 = oTranslationListPage3.getFooter().getContent()[3];
								assert.ok(!oCancelButton3.getVisible(), "TranslationListPage3 footer: cancel button visible");
								var oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "TranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "text";
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oTranslationListPage3._navBtn.firePress();
								EditorQunitUtils.wait().then(function () {
									oFormField3.setValue("{i18n>string1}");
									oFormField3.fireChange({ value: "{i18n>string1}"});
									EditorQunitUtils.wait().then(function () {
										assert.equal(oFormField3.getValue(), "{i18n>string1}", "SimpleForm field 3: Has new value");
										assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
										assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
										oValueHelpIcon3.firePress();
										EditorQunitUtils.wait().then(function () {
											oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
											assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
													var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
													assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												}
											}
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0 && oCustomData[0].getKey() === "en") {
													var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
													oInput.setValue("string1 en");
													oInput.fireChange({ value: "string1 en"});
													break;
												}
											}
											EditorQunitUtils.wait().then(function () {
												assert.ok(oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button enabled");
												assert.ok(oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button enabled");
												oResetButton3.firePress();
												EditorQunitUtils.wait().then(function () {
													assert.ok(!oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button disabled");
													assert.ok(!oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button disabled");
													oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
													assert.equal(oLanguageItems3.length, 49, "TranslationListPage3 Content: length");
													for (var i = 0; i < oLanguageItems3.length; i++) {
														var oCustomData = oLanguageItems3[i].getCustomData();
														if (oCustomData && oCustomData.length > 0) {
															var sLanguage = oCustomData[0].getKey();
															var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
															var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
															assert.equal(sCurrentValue, sExpectedValue, "TranslationListPage3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
														}
													}
													var oNewObject = JSON.parse(oTextArea.getValue());
													assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
													var sUUID = oNewObject._dt._uuid;
													var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
													assert.ok(!sTranslationTextOfEN, "Texts: no value");
													destroyEditor(that.oEditor);
													resolve();
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("update translation values and change property value to normal value", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oSelectionColumn = oTable.getColumns()[0];
						var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
						var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oKeyColumn = oTable.getColumns()[1];
						assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel3 = oContents[4];
							var oFormField3 = oContents[5];
							assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
							assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
							assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
							assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
							assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
							assert.equal(oFormField3.getValue(), "text", "SimpleForm field 3: Has No value");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
							assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
							assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
							oValueHelpIcon3.firePress();
							EditorQunitUtils.wait(1500).then(function () {
								var oTranslationListPage3 = oField._oTranslationListPage;
								var oSaveButton3 = oTranslationListPage3.getFooter().getContent()[1];
								assert.ok(oSaveButton3.getVisible(), "TranslationListPage3 footer: save button visible");
								assert.ok(!oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button disabled");
								var oResetButton3 = oTranslationListPage3.getFooter().getContent()[2];
								assert.ok(oResetButton3.getVisible(), "TranslationListPage3 footer: reset button visible");
								assert.ok(!oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button disabled");
								var oCancelButton3 = oTranslationListPage3.getFooter().getContent()[3];
								assert.ok(!oCancelButton3.getVisible(), "TranslationListPage3 footer: cancel button visible");
								var oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "TranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "text";
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oTranslationListPage3._navBtn.firePress();
								EditorQunitUtils.wait().then(function () {
									oFormField3.setValue("{i18n>string1}");
									oFormField3.fireChange({ value: "{i18n>string1}"});
									EditorQunitUtils.wait().then(function () {
										assert.equal(oFormField3.getValue(), "{i18n>string1}", "SimpleForm field 3: Has new value");
										assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
										assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
										oValueHelpIcon3.firePress();
										EditorQunitUtils.wait().then(function () {
											oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
											assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
													var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
													assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												}
											}
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0 && oCustomData[0].getKey() === "en") {
													var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
													oInput.setValue("string1 en");
													oInput.fireChange({ value: "string1 en"});
													break;
												}
											}
											EditorQunitUtils.wait().then(function () {
												assert.ok(oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button enabled");
												assert.ok(oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button enabled");
												oSaveButton3.firePress();
												EditorQunitUtils.wait().then(function () {
													oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
													assert.equal(oLanguageItems3.length, 49, "oTranslationListPage3 Content: length");
													for (var i = 0; i < oLanguageItems3.length; i++) {
														var oCustomData = oLanguageItems3[i].getCustomData();
														if (oCustomData && oCustomData.length > 0) {
															var sLanguage = oCustomData[0].getKey();
															var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
															if (sLanguage === "en") {
																sExpectedValue = "string1 en";
															}
															var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
															assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
														}
													}
													var oNewObject = JSON.parse(oTextArea.getValue());
													assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
													var sUUID = oNewObject._dt._uuid;
													var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
													assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
													oTranslationListPage3._navBtn.firePress();
													EditorQunitUtils.wait().then(function () {
														oFormField3.setValue("string value 2");
														oFormField3.fireChange({ value: "string value 2"});
														EditorQunitUtils.wait().then(function () {
															oNewObject = JSON.parse(oTextArea.getValue());
															assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "string value 2"})), "SimpleForm: Value updated");
															assert.equal(oFormField3.getValue(), "string value 2", "SimpleForm field 3: Has new value");
															assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
															oValueHelpIcon3 = oFormField3._oValueHelpIcon;
															assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
															assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
															sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
															assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
															oValueHelpIcon3.firePress();
															EditorQunitUtils.wait().then(function () {
																oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
																assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
																for (var i = 0; i < oLanguageItems3.length; i++) {
																	var oCustomData = oLanguageItems3[i].getCustomData();
																	if (oCustomData && oCustomData.length > 0) {
																		var sLanguage = oCustomData[0].getKey();
																		var sExpectedValue = "string value 2";
																		if (sLanguage === "en"){
																			sExpectedValue = "string1 en";
																		}
																		var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
																		assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
																	}
																}
																destroyEditor(that.oEditor);
																resolve();
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("update translation values and change property value to another {i18n>KEY} format", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oSelectionColumn = oTable.getColumns()[0];
						var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
						var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oKeyColumn = oTable.getColumns()[1];
						assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel3 = oContents[4];
							var oFormField3 = oContents[5];
							assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
							assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
							assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
							assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
							assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
							assert.equal(oFormField3.getValue(), "text", "SimpleForm field 3: Has No value");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
							assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
							assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
							oValueHelpIcon3.firePress();
							EditorQunitUtils.wait(1500).then(function () {
								var oTranslationListPage3 = oField._oTranslationListPage;
								var oSaveButton3 = oTranslationListPage3.getFooter().getContent()[1];
								assert.ok(oSaveButton3.getVisible(), "TranslationListPage3 footer: save button visible");
								assert.ok(!oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button disabled");
								var oResetButton3 = oTranslationListPage3.getFooter().getContent()[2];
								assert.ok(oResetButton3.getVisible(), "TranslationListPage3 footer: reset button visible");
								assert.ok(!oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button disabled");
								var oCancelButton3 = oTranslationListPage3.getFooter().getContent()[3];
								assert.ok(!oCancelButton3.getVisible(), "TranslationListPage3 footer: cancel button visible");
								var oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "TranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "text";
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oTranslationListPage3._navBtn.firePress();
								EditorQunitUtils.wait().then(function () {
									oFormField3.setValue("{i18n>string1}");
									oFormField3.fireChange({ value: "{i18n>string1}"});
									EditorQunitUtils.wait().then(function () {
										assert.equal(oFormField3.getValue(), "{i18n>string1}", "SimpleForm field 3: Has new value");
										assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
										assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
										oValueHelpIcon3.firePress();
										EditorQunitUtils.wait().then(function () {
											oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
											assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
													var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
													assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												}
											}
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0 && oCustomData[0].getKey() === "en") {
													var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
													oInput.setValue("string1 en");
													oInput.fireChange({ value: "string1 en"});
													break;
												}
											}
											EditorQunitUtils.wait().then(function () {
												assert.ok(oSaveButton3.getEnabled(), "TranslationListPage3 footer: save button enabled");
												assert.ok(oResetButton3.getEnabled(), "TranslationListPage3 footer: reset button enabled");
												oSaveButton3.firePress();
												EditorQunitUtils.wait().then(function () {
													oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
													assert.equal(oLanguageItems3.length, 49, "oTranslationListPage3 Content: length");
													for (var i = 0; i < oLanguageItems3.length; i++) {
														var oCustomData = oLanguageItems3[i].getCustomData();
														if (oCustomData && oCustomData.length > 0) {
															var sLanguage = oCustomData[0].getKey();
															var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
															if (sLanguage === "en") {
																sExpectedValue = "string1 en";
															}
															var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
															assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
														}
													}
													var oNewObject = JSON.parse(oTextArea.getValue());
													assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
													var sUUID = oNewObject._dt._uuid;
													var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
													assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
													oTranslationListPage3._navBtn.firePress();
													EditorQunitUtils.wait().then(function () {
														oFormField3.setValue("{i18n>string2}");
														oFormField3.fireChange({ value: "{i18n>string2}"});
														EditorQunitUtils.wait().then(function () {
															oNewObject = JSON.parse(oTextArea.getValue());
															assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string2}"})), "SimpleForm: Value updated");
															assert.equal(oFormField3.getValue(), "{i18n>string2}", "SimpleForm field 3: Has new value");
															assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
															oValueHelpIcon3 = oFormField3._oValueHelpIcon;
															assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
															assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
															sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
															assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
															oValueHelpIcon3.firePress();
															EditorQunitUtils.wait().then(function () {
																oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
																assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
																for (var i = 0; i < oLanguageItems3.length; i++) {
																	var oCustomData = oLanguageItems3[i].getCustomData();
																	if (oCustomData && oCustomData.length > 0) {
																		var sLanguage = oCustomData[0].getKey();
																		var sExpectedValue = _oOriginExpectedValues["string2"][sLanguage] || _oOriginExpectedValues["string2"]["default"];
																		if (sLanguage === "en"){
																			sExpectedValue = "string1 en";
																		}
																		var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
																		assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
																	}
																}
																destroyEditor(that.oEditor);
																resolve();
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
