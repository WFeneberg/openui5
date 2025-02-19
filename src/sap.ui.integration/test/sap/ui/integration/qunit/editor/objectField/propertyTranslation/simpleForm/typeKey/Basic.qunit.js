/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/base/i18n/Localization",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"qunit/designtime/EditorQunitUtils"
], function (
	x,
	Localization,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	deepClone,
	EditorQunitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oManifestForObjectFieldWithPropertiesDefinedWithTranslation = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldWithPropertiesDefined",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefined": {}
				},
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};

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
	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function cleanUUID(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				if (oResult._dt) {
					delete oResult._dt._uuid;
				}
				if (deepEqual(oResult._dt, {})) {
					delete oResult._dt;
				}
			});
		} else if (typeof oClonedValue === "object") {
			if (oClonedValue._dt) {
				delete oClonedValue._dt._uuid;
			}
			if (deepEqual(oClonedValue._dt, {})) {
				delete oClonedValue._dt;
			}
		}
		return oClonedValue;
	}

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("check translation icon", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oLabel1.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel1.getText(), "Object properties defined", "Label 2: Has label text");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField1._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField1.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel1 = oContents[0];
						var oFormField1 = oContents[1];
						assert.equal(oFormLabel1.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel1.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField1.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField1.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField1.getValue(), "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("string value 1");
						oFormField1.fireChange({ value: "string value 1"});
						assert.equal(oFormField1.getValue(), "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("{i18n>string1}");
						oFormField1.fireChange({ value: "{i18n>string1}"});
						EditorQunitUtils.wait().then(function () {
							assert.equal(oFormField1.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							assert.ok(oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon exist");
							assert.ok(oFormField1._oValueHelpIcon.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oFormField1._oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.equal(oFormField1._oValueHelpIcon.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oFormField1.setValue("string1");
							oFormField1.fireChange({ value: "string1"});
							EditorQunitUtils.wait().then(function () {
								assert.equal(oFormField1.getValue(), "string1", "SimpleForm field 1: Has new value");
								assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "string1"}), "Field 1: DT Value updated");
								assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
								assert.ok(oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon exist");
								assert.ok(!oFormField1._oValueHelpIcon.getVisible(), "SimpleForm field 1: Value help icon not visible");
								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("check translation values for {{KEY}} format", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oLabel1.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel1.getText(), "Object properties defined", "Label 2: Has label text");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField1._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField1.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel1 = oContents[0];
						var oFormField1 = oContents[1];
						assert.equal(oFormLabel1.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel1.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField1.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField1.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField1.getValue(), "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("string value 1");
						oFormField1.fireChange({ value: "string value 1"});
						assert.equal(oFormField1.getValue(), "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("{{string1}}");
						oFormField1.fireChange({ value: "{{string1}}"});
						EditorQunitUtils.wait().then(function () {
							assert.equal(oFormField1.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oField1.attachEventOnce("translationPopoverOpened", function () {
								var oTranslationPopover1 = oField1._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
										assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
									}
								}
								oCancelButton1.firePress();
								oFormField1.setValue("{{string2}}");
								oFormField1.fireChange({ value: "{{string2}}"});
								EditorQunitUtils.wait().then(function () {
									assert.equal(oFormField1.getValue(), "{i18n>string2}", "SimpleForm field 1: Has new value");
									assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string2}"}), "Field 1: DT Value updated");
									assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
									var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
									assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
									assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
									assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
									assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
									oField1.attachEventOnce("translationPopoverOpened", function () {
										var oTranslationPopover1 = oField1._oTranslationPopover;
										var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string2"][sLanguage] || _oOriginExpectedValues["string2"]["default"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
												assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
											}
										}
										resolve();
									});
									oValueHelpIcon1.firePress();
									oValueHelpIcon1.focus();
								});
							});
							oValueHelpIcon1.firePress();
							oValueHelpIcon1.focus();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("check translation values for {i18n>KEY} format", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oLabel1.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel1.getText(), "Object properties defined", "Label 2: Has label text");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField1._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField1.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel1 = oContents[0];
						var oFormField1 = oContents[1];
						assert.equal(oFormLabel1.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel1.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField1.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField1.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField1.getValue(), "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("{i18n>string1}");
						oFormField1.fireChange({ value: "{i18n>string1}"});
						EditorQunitUtils.wait().then(function () {
							assert.equal(oFormField1.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oField1.attachEventOnce("translationPopoverOpened", function () {
								var oTranslationPopover1 = oField1._oTranslationPopover;
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
										assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
									}
								}
								resolve();
							});
							oValueHelpIcon1.firePress();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("change translation values but reset", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oLabel1.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel1.getText(), "Object properties defined", "Label 2: Has label text");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField1._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField1.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel1 = oContents[0];
						var oFormField1 = oContents[1];
						assert.equal(oFormLabel1.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel1.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField1.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField1.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField1.getValue(), "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("string value 1");
						oFormField1.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.equal(oFormField1.getValue(), "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("{i18n>string1}");
						oFormField1.fireChange({ value: "{i18n>string1}"});
						EditorQunitUtils.wait().then(function () {
							assert.equal(oFormField1.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oField1.attachEventOnce("translationPopoverOpened", function () {
								var oTranslationPopover1 = oField1._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
										assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
										if (sLanguage === "en"){
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											assert.equal(oInput.getValueState(), "Information", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + oInput.getValueState() + ", expected: " + oInput.getValueState());
										}
									}
								}
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button enabled");
									assert.ok(oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button enabled");
									oResetButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
										assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
										var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
												assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
											}
										}
										assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value");
										var sUUID = oField1._getCurrentProperty("value")._dt._uuid;
										var sTranslationTextOfEN = oField1.getTranslationValueInTexts("en", sUUID, "key");
										assert.ok(!sTranslationTextOfEN, "Texts: no value");
										resolve();
									});
								});
							});
							oValueHelpIcon1.firePress();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values and delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oLabel1.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel1.getText(), "Object properties defined", "Label 2: Has label text");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField1._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField1.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel1 = oContents[0];
						var oFormField1 = oContents[1];
						assert.equal(oFormLabel1.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel1.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField1.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField1.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField1.getValue(), "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("string value 1");
						oFormField1.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.equal(oFormField1.getValue(), "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("{i18n>string1}");
						oFormField1.fireChange({ value: "{i18n>string1}"});
						EditorQunitUtils.wait().then(function () {
							assert.equal(oFormField1.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oField1.attachEventOnce("translationPopoverOpened", function () {
								var oTranslationPopover1 = oField1._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										if (sLanguage === "en"){
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
								}
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button enabled");
									assert.ok(oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button enabled");
									oSaveButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												if (sLanguage === "en") {
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value");
										var sUUID = oField1._getCurrentProperty("value")._dt._uuid;
										var sTranslationTextOfEN = oField1.getTranslationValueInTexts("en", sUUID, "key");
										assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");

										oDeleteButton.firePress();
										EditorQunitUtils.wait().then(function () {
											assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
											assert.ok(!oField1._getCurrentProperty("value"), "Field 1: no Value");
											sTranslationTextOfEN = oField1.getTranslationValueInTexts("en", sUUID, "key");
											assert.ok(!sTranslationTextOfEN, "Texts: no value");
											resolve();
										});
									});
								});
							});
							oValueHelpIcon1.firePress();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values and change property value to normal value to close translation feature", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oLabel1.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel1.getText(), "Object properties defined", "Label 2: Has label text");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField1._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField1.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel1 = oContents[0];
						var oFormField1 = oContents[1];
						assert.equal(oFormLabel1.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel1.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField1.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField1.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField1.getValue(), "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("string value 1");
						oFormField1.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.equal(oFormField1.getValue(), "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("{i18n>string1}");
						oFormField1.fireChange({ value: "{i18n>string1}"});
						EditorQunitUtils.wait().then(function () {
							assert.equal(oFormField1.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oField1.attachEventOnce("translationPopoverOpened", function () {
								var oTranslationPopover1 = oField1._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										if (sLanguage === "en"){
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
								}
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button enabled");
									assert.ok(oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button enabled");
									oSaveButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												if (sLanguage === "en") {
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value");
										var sUUID = oField1._getCurrentProperty("value")._dt._uuid;
										var sTranslationTextOfEN = oField1.getTranslationValueInTexts("en", sUUID, "key");
										assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");

										oFormField1.setValue("string value 2");
										oFormField1.fireChange({ value: "string value 2"});
										EditorQunitUtils.wait().then(function () {
											assert.equal(oFormField1.getValue(), "string value 2", "SimpleForm field 1: Has new value");
											assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "string value 2"}), "Field 1: DT Value updated");
											assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
											var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
											assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
											assert.ok(!oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon not visible");
											sTranslationTextOfEN = oField1.getTranslationValueInTexts("en", sUUID, "key");
											assert.ok(!sTranslationTextOfEN, "Texts: no value");
											resolve();
										});
									});
								});
							});
							oValueHelpIcon1.firePress();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values and change property value to another {i18n>KEY}", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oLabel1.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel1.getText(), "Object properties defined", "Label 2: Has label text");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField1._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField1.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel1 = oContents[0];
						var oFormField1 = oContents[1];
						assert.equal(oFormLabel1.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel1.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField1.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField1.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField1.getValue(), "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("string value 1");
						oFormField1.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.equal(oFormField1.getValue(), "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("{i18n>string1}");
						oFormField1.fireChange({ value: "{i18n>string1}"});
						EditorQunitUtils.wait().then(function () {
							assert.equal(oFormField1.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oField1.attachEventOnce("translationPopoverOpened", function () {
								var oTranslationPopover1 = oField1._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										if (sLanguage === "en"){
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
								}
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button enabled");
									assert.ok(oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button enabled");
									oSaveButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												if (sLanguage === "en") {
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value");
										var sUUID = oField1._getCurrentProperty("value")._dt._uuid;
										var sTranslationTextOfEN = oField1.getTranslationValueInTexts("en", sUUID, "key");
										assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");

										oFormField1.setValue("{i18n>string2}");
										oFormField1.fireChange({ value: "{i18n>string2}"});
										EditorQunitUtils.wait().then(function () {
											assert.equal(oFormField1.getValue(), "{i18n>string2}", "SimpleForm field 1: Has new value");
											assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string2}"}), "Field 1: DT Value updated");
											assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
											var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
											assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
											assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
											sTranslationTextOfEN = oField1.getTranslationValueInTexts("en", sUUID, "key");
											assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
											oValueHelpIcon1.firePress();
											EditorQunitUtils.wait().then(function () {
												oTranslationPopover1 = oField1._oTranslationPopover;
												oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
												assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
												for (var i = 0; i < oLanguageItems1.length; i++) {
													var oCustomData = oLanguageItems1[i].getCustomData();
													if (oCustomData && oCustomData.length > 0) {
														var sLanguage = oCustomData[0].getKey();
														var sExpectedValue = _oOriginExpectedValues["string2"][sLanguage] || _oOriginExpectedValues["string2"]["default"];
														if (sLanguage === "en"){
															sExpectedValue = "string1 en";
														}
														var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
														assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
													}
												}
												resolve();
											});
										});
									});
								});
							});
							oValueHelpIcon1.firePress();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
