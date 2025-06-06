/* global QUnit, sinon */
// These are some globals generated due to fl (signals, hasher) and m (hyphenation) libs.

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/ResponsiveColumnSettings",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/enums/TableRowActionType",
	"sap/m/Text",
	"sap/m/Menu",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Lib",
	"sap/ui/core/Icon",
	"sap/ui/model/Filter",
	"sap/ui/Device",
	"sap/ui/fl/variants/VariantManagement",
	"test-resources/sap/m/qunit/p13n/TestModificationHandler"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	Table,
	Column,
	ResponsiveTableType,
	ResponsiveColumnSettings,
	RowSettings,
	RowActionItem,
	RowActionType,
	Text,
	Menu,
	JSONModel,
	Lib,
	Icon,
	Filter,
	Device,
	VariantManagement,
	TestModificationHandler
) {
	"use strict";

	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	QUnit.module("Inner table settings", {
		beforeEach: async function() {
			this.oTable = new Table({
				type: new ResponsiveTableType()
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Control types", function(assert) {
		assert.ok(this.oTable._oTable.isA("sap.m.Table"), "Inner table type is sap.m.Table");
		assert.ok(this.oTable._oRowTemplate.isA("sap.m.ColumnListItem"), "Row template type is sap.m.ColumnListItem");
	});

	QUnit.test("Row template when changing type", function(assert) {
		this.spy(this.oTable._oRowTemplate, "destroy");
		const oRowTemplate = this.oTable._oRowTemplate;
		this.oTable.setType(new ResponsiveTableType());
		assert.ok(oRowTemplate.isDestroyed(), "Row template is destroyed when changing type");
		assert.notOk(this.oTable._oRowTemplate, "Reference to destroyed row template is removed");
	});

	QUnit.test("Default settings", function(assert) {
		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getAutoPopinMode(), true, "autoPopinMode");
		assert.equal(oInnerTable.getContextualWidth(), "Auto", "contextualWidth");
		assert.equal(oInnerTable.getGrowing(), true, "growing");
		assert.equal(oInnerTable.getGrowingScrollToLoad(), false, "growingScrollToLoad");
		assert.equal(oInnerTable.getGrowingThreshold(), 20, "growingThreshold");
		assert.deepEqual(oInnerTable.getSticky(), ["ColumnHeaders", "GroupHeaders", "HeaderToolbar", "InfoToolbar"], "sticky");
		assert.equal(oInnerTable.getPopinLayout(), "Block", "popinLayout");
		assert.deepEqual(oInnerTable.getAriaLabelledBy(), [this.oTable._oTitle.getId()], "ariaLabelledBy");
		assert.equal(oInnerTable.getHeaderToolbar(), this.oTable._oToolbar, "headerToolbar");
		assert.equal(oInnerTable.getEnableBusyIndicator(), true, "enableBusyIndicator");
	});

	QUnit.test("Initial settings", async function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			type: new ResponsiveTableType({
				growingMode: "None",
				popinLayout: "GridSmall"
			}),
			threshold: 30
		});
		await this.oTable.initialized();

		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getAutoPopinMode(), true, "autoPopinMode");
		assert.equal(oInnerTable.getContextualWidth(), "Auto", "contextualWidth");
		assert.equal(oInnerTable.getGrowing(), false, "growingMode=None: growing");
		assert.equal(oInnerTable.getGrowingScrollToLoad(), false, "growingMode=None: growingScrollToLoad");
		assert.equal(oInnerTable.getGrowingThreshold(), 30, "growingThreshold");
		assert.deepEqual(oInnerTable.getSticky(), ["ColumnHeaders", "GroupHeaders", "HeaderToolbar", "InfoToolbar"], "sticky");
		assert.equal(oInnerTable.getPopinLayout(), "GridSmall", "popinLayout");
		assert.deepEqual(oInnerTable.getAriaLabelledBy(), [this.oTable._oTitle.getId()], "ariaLabelledBy");
		assert.equal(oInnerTable.getHeaderToolbar(), this.oTable._oToolbar, "headerToolbar");
	});

	QUnit.test("Change settings", function(assert) {
		const oType = this.oTable.getType();
		const oInnerTable = this.oTable._oTable;

		oType.setGrowingMode("Scroll");
		assert.equal(oInnerTable.getGrowingScrollToLoad(), true, "Type.growingMode=Scroll: growingScrollToLoad");
		assert.equal(oInnerTable.getGrowing(), true, "Type.growingMode=Scroll: growing");

		oType.setGrowingMode("None");
		assert.equal(oInnerTable.getGrowingScrollToLoad(), false, "Type.growingMode=None: growingScrollToLoad");
		assert.equal(oInnerTable.getGrowing(), false, "Type.growingMode=None: growing");

		oType.setPopinLayout("GridSmall");
		assert.equal(oInnerTable.getPopinLayout(), "GridSmall", "Type.popinLayout=GridSmall: popinLayout");

		this.oTable.setThreshold(30);
		assert.equal(oInnerTable.getGrowingThreshold(), 30, "Table.threshold=30: growingThreshold");
	});

	QUnit.module("API", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: function(mSettings) {
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				...mSettings
			});
			return this.oTable;
		}
	});

	QUnit.test("#updateSortIndicators", async function(assert) {
		const oTable = this.createTable({
			columns: [
				new Column()
			]
		});

		await oTable.initialized();

		const oType = oTable.getType();
		const oColumn = oTable.getColumns()[0];
		const oInnerColumn = oTable._oTable.getColumns()[0];

		oType.updateSortIndicator(oColumn, "Ascending");
		assert.strictEqual(oInnerColumn.getSortIndicator(),"Ascending", "Inner table column sort order");

		oType.updateSortIndicator(oColumn, "Descending");
		assert.strictEqual(oInnerColumn.getSortIndicator(), "Descending", "Inner table column sort order");

		oType.updateSortIndicator(oColumn, "None");
		assert.strictEqual(oInnerColumn.getSortIndicator(), "None", "Inner table column sort order");
	});

	QUnit.module("Show Details", {
		beforeEach: async function() {
			this.createTable();
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		createTable: function() {
			this.oTable?.destroy();

			const oModel = new JSONModel();
			oModel.setData({
				testPath: [
					{test: "Test1"}, {test: "Test2"}, {test: "Test3"}, {test: "Test4"}, {test: "Test5"}
				]
			});

			this.oTable = new Table("table_test", {
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				},
				type: new ResponsiveTableType({
					showDetailsButton: true
				}),
				columns: [
					new Column({
						header: "Column A",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					}),
					new Column({
						header: "Column B",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					}),
					new Column({
						header: "Column C",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Medium"
						})
					}),
					new Column({
						header: "Column D",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Low"
						})
					}),
					new Column({
						header: "Column E",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Low"
						})
					}),
					new Column({
						header: "Column F",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					})
				]
			});

			this.oTable.setModel(oModel);
			this.oTable.placeAt("qunit-fixture");
			this.oType = this.oTable.getType();
		}
	});

	QUnit.test("Button creation", async function(assert) {
		const oRb = Lib.getResourceBundleFor("sap.ui.mdc");

		await TableQUnitUtils.waitForBinding(this.oTable);

		assert.ok(this.oType._oShowDetailsButton, "button is created");
		assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden since there are no popins");
		assert.strictEqual(this.oType._oShowDetailsButton.getItems()[0].getIcon(), "sap-icon://detail-more", "correct icon is set on the button");
		assert.strictEqual(this.oType._oShowDetailsButton.getItems()[0].getTooltip(), oRb.getText("table.SHOWDETAILS_TEXT"), "Correct tooltip");
		assert.strictEqual(this.oType._oShowDetailsButton.getItems()[1].getIcon(), "sap-icon://detail-less", "correct icon is set on the button");
		assert.strictEqual(this.oType._oShowDetailsButton.getItems()[1].getTooltip(), oRb.getText("table.HIDEDETAILS_TEXT"), "Correct tooltip");

		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");
		assert.strictEqual(this.oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "hideDetails button selected");

		this.oType._oShowDetailsButton.getItems()[0].firePress();
		assert.strictEqual(this.oType._oShowDetailsButton.getSelectedKey(), "showDetails", "showDetails button selected");

		this.oTable._oTable.setContextualWidth("4444px");
		await nextUIUpdate();
		assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden there are no popins");
	});

	QUnit.test("Button placement", async function(assert) {
		this.oTable._oTable.setContextualWidth("Tablet");
		await nextUIUpdate();
		let bButtonAddedToToolbar = this.oTable._oTable.getHeaderToolbar().getEnd().some(function(oControl) {
			return oControl.getId() === this.oType._oShowDetailsButton.getId();
		}, this);
		assert.ok(bButtonAddedToToolbar, "Button is correctly added to the table header toolbar");

		this.oType.setShowDetailsButton(false);
		await nextUIUpdate();
		assert.notOk(this.oType.getShowDetailsButton(), "showDetailsButton = false");
		bButtonAddedToToolbar = this.oTable._oTable.getHeaderToolbar().getEnd().some(function(oControl) {
			return this.oType._oShowDetailsButton && oControl.getId() === this.oType._oShowDetailsButton.getId();
		}, this);
		assert.notOk(bButtonAddedToToolbar, "Button is removed from the table header toolbar");
		assert.ok(!this.oType._oShowDetailsButton, "Button does not exist anymore");
	});

	QUnit.test("Inner table hiddenInPopin property in Desktop mode", function(assert) {
		assert.strictEqual(this.oTable._oTable.getHiddenInPopin().length, 1, "getHiddenInPopin() contains only 1 value");
		assert.strictEqual(this.oTable._oTable.getHiddenInPopin()[0], "Low", "Low importance is added to the hiddenInPopin property");
	});

	QUnit.test("Inner table hiddenInPopin property in Phone mode", async function(assert) {
		const oPhoneStub = sinon.stub(Device.system, "phone").value(true);

		this.createTable();
		await this.oTable.initialized();

		assert.deepEqual(this.oTable._oTable.getHiddenInPopin(), ["Low", "Medium"]);

		oPhoneStub.restore();
	});

	QUnit.test("Button should be hidden with filtering leads to no data and viceversa", async function(assert) {
		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");

		this.oTable._oTable.getBinding("items").filter(new Filter("test", "EQ", "foo"));
		assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden since there are no visible items");

		this.oTable._oTable.getBinding("items").filter();
		assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has visible items and popins");
	});

	QUnit.test("The controller is registered and deregistered properly", function(assert) {
		assert.ok(this.oTable.getEngine().getRegisteredControllers(this.oTable).includes("ShowDetails"), "ShowDetails controller is registered");
		this.oType.setShowDetailsButton(false);
		assert.notOk(this.oTable.getEngine().getRegisteredControllers(this.oTable).includes("ShowDetails"), "ShowDetails controller is deregistered");
	});

	QUnit.test("detailsButtonSetting property", function(assert) {
		const bDesktop = Device.system.desktop;
		const bTablet = Device.system.tablet;
		const bPhone = Device.system.phone;

		Device.system.desktop = false;
		Device.system.tablet = false;
		Device.system.phone = true;

		this.oType.setDetailsButtonSetting(["Medium", "High"]);

		this.oType._oShowDetailsButton.getItems()[0].firePress();
		assert.strictEqual(this.oTable._oTable.getHiddenInPopin(), undefined, "Inner table property 'hiddenInPopin'");

		this.oType._oShowDetailsButton.getItems()[1].firePress();
		assert.deepEqual(this.oTable._oTable.getHiddenInPopin(), ["Medium", "High"], "Inner table property 'hiddenInPopin'");

		Device.system.desktop = bDesktop;
		Device.system.tablet = bTablet;
		Device.system.phone = bPhone;
	});

	QUnit.test("Show Details button lifecycle", async function(assert) {
		let oType = this.oTable.getType();
		let oShowDetailsButton;

		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");

		oShowDetailsButton = oType._oShowDetailsButton;
		this.oTable.setType(new ResponsiveTableType({showDetailsButton: true}));
		assert.strictEqual(oShowDetailsButton.isDestroyed(), true, "Show Details button is destroyed when changing the type");
		assert.notOk(oType._oShowDetailsButton, "Reference to Show Details button is removed when changing the type");

		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		oType = this.oTable.getType();
		oShowDetailsButton = oType._oShowDetailsButton;
		oType.destroy();
		assert.strictEqual(oShowDetailsButton.isDestroyed(), true, "Show Details button is destroyed when the type is destroyed with Type#destroy");
		assert.notOk(oType._oShowDetailsButton, "Reference to Show Details button is removed when the type is destroyed Type#destroy");

		this.oTable.setType(new ResponsiveTableType({showDetailsButton: true}));
		oType = this.oTable.getType();
		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		oType = this.oTable.getType();
		oShowDetailsButton = oType._oShowDetailsButton;
		this.oTable.destroyType();
		assert.strictEqual(oShowDetailsButton.isDestroyed(), true,
			"Show Details button is destroyed when the type is destroyed with Table#destroyType");
		assert.notOk(oType._oShowDetailsButton, "Reference to Show Details button is removed when the type is destroyed Table#destroyType");
	});

	QUnit.test("State is persisted", async function(assert) {
		const done = assert.async();

		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		let counter = 0;
		const oModificationHandler = TestModificationHandler.getInstance();
		oModificationHandler.processChanges = function(aChanges) {
			counter++;
			let bExpectedValue, sExpectedName, sAction;

			if (counter === 1) {
				bExpectedValue = true;
				sAction = "setShowDetails";
				sExpectedName = "ResponsiveTable";
			} else if (counter === 2) {
				bExpectedValue = false;
				sAction = "setShowDetails";
				sExpectedName = "ResponsiveTable";
			}

			assert.strictEqual(aChanges.length, 1, "One change is created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, sAction, "Change type is correct");
			assert.strictEqual(aChanges[0].changeSpecificData.content.value, bExpectedValue, "Change content value is correct");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, sExpectedName, "Name is correct");

			if (counter === 2) {
				done();
			}

			return Promise.resolve(aChanges);
		};

		this.oTable.getEngine()._setModificationHandler(this.oTable, oModificationHandler);

		const oType = this.oTable.getType();

		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are initially hidden");

		oType._oShowDetailsButton.getItems()[0].firePress();
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are now shown");

		oType._oShowDetailsButton.getItems()[0].firePress();
		await nextUIUpdate();

		sinon.stub(this.oTable, "getCurrentState").returns({
			xConfig: { aggregations: { type: { ResponsiveTable: { showDetails: true } } } }
		});

		assert.equal(counter, 1, "No modification happened since show/hide state did not change");

		oType._oShowDetailsButton.getItems()[1].firePress();
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are now hidden");

		this.oTable.getCurrentState.restore();
	});

	QUnit.test("Add a new column to the table", async function(assert) {
		const oColumn = new Column({
			header: "Column F",
			hAlign: "Begin",
			template: new Text({
				text: "{test}"
			}),
			extendedSettings: new ResponsiveColumnSettings({
				importance: "High"
			})
		});
		this.oTable.addColumn(oColumn);
		const oType = this.oTable.getType();

		// Initial state
		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are initially hidden");

		// Case 1: Adding a new column that will not be hidden in the popin
		this.oTable._bUserPersonalizationActive = true; // Emulate personalization
		sinon.stub(oColumn, "getInnerColumn").returns({
			getImportance: function() {
				return "High";
			}
		});
		oType._onColumnInsert(oColumn);
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are not shown");

		// Case 2: Adding a new column that will be hidden in the popin
		oColumn.getInnerColumn.returns({
			getImportance: function() {
				return "Low";
			}
		});
		oType._onColumnInsert(oColumn);
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are shown");

		// Case 3: Adding a new column that will not be hidden in the popin, but state stays as before
		oColumn.getInnerColumn.returns({
			getImportance: function() {
				return "High";
			}
		});
		oType._onColumnInsert(oColumn);
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are still shown");

		oColumn.getInnerColumn.restore();
	});

	QUnit.test("Switch variant (emulation)", async function(assert) {
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		const oType = this.oTable.getType();

		// Initial state
		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are initially hidden");

		// State (none) => State (showDetails: true)
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": true
					}
				}
			}
		});
		oType.onModifications(); // Emulate change with ShowDetails
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are shown");

		// State (showDetails: true) => State (showDetails: false)
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": false
					}
				}
			}
		});
		oType.onModifications(); // Emulate change with ShowDetails
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are now hidden");

		// State (showDetails=false) => State (showDetails=true)
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": true
					}
				}
			}
		});
		oType.onModifications(); // Emulate change with ShowDetails
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are now shown again");

		// State (showDetails=true) => State (none)
		fnGetCurrentStateStub.returns({});
		oType.onModifications(); // Emulate change with ShowDetails
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are now hidden as default");

		fnGetCurrentStateStub.restore();
	});

	QUnit.test("State is applied (emulation)", async function(assert) {
		const oType = this.oTable.getType();
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": true
					}
				}
			}
		});

		const fnOnModificationsSpy = sinon.spy(oType, "onModifications");
		const fnSetShowDetailsState = sinon.spy(oType, "_setShowDetailsState");

		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are initially hidden");

		this.oTable._onModifications();
		await nextUIUpdate();

		assert.ok(fnOnModificationsSpy.calledOnce, "onModifications is called");
		assert.ok(fnSetShowDetailsState.calledOnce, "_setShowDetailsState is called");
		assert.ok(fnSetShowDetailsState.calledWith(true), "_setShowDetailsState is called with true");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are now shown");

		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": false
					}
				}
			}
		});

		this.oTable._onModifications();
		await nextUIUpdate();

		assert.ok(fnOnModificationsSpy.calledTwice, "onModifications is called");
		assert.ok(fnSetShowDetailsState.calledTwice, "_setShowDetailsState is called");
		assert.ok(fnSetShowDetailsState.calledWith(false), "_setShowDetailsState is called with false");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are now hidden");
	});

	QUnit.module("extendedSettings");

	QUnit.test("Merge cell", async function (assert) {
		const oModel = new JSONModel();
		oModel.setData({
			testPath: [{
				text1: "AA",
				icon: "sap-icon://message-success",
				text2: "11"
			}, {
				text1: "AA",
				icon: "sap-icon://message-success",
				text2: "22"
			}, {
				text1: "BB",
				icon: "sap-icon://message-error",
				text2: "33"
			}, {
				text1: "BB",
				icon: "sap-icon://message-error",
				text2: "44"
			}]
		});

		const oTable = new Table({
			type: "ResponsiveTable",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});

		oTable.addColumn(new Column({
			header: "Test 1",
			extendedSettings: [
				new ResponsiveColumnSettings({
					mergeFunction: "getText"
				})
			],
			template: new Text({
				text: "{text1}"
			})
		}));

		oTable.addColumn(new Column({
			header: "Test 2",
			extendedSettings: [
				new ResponsiveColumnSettings({
					mergeFunction: "getSrc"
				})
			],
			template: new Icon({
				src: "{icon}"
			})
		}));

		oTable.addColumn(new Column({
			header: "Test 3",
			template: new Text({
				text: "{text2}"
			})
		}));

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		return TableQUnitUtils.waitForBindingInfo(oTable).then(function () {
			const aColumns = oTable._oTable.getColumns();

			assert.ok(aColumns[0].getMergeDuplicates(), "First column property mergeDuplicates = true");
			assert.strictEqual(aColumns[0].getMergeFunctionName(), "getText", "First column property mergeFunctionName = getText");

			assert.ok(aColumns[1].getMergeDuplicates(), "Second column property mergeDuplicates = true");
			assert.strictEqual(aColumns[1].getMergeFunctionName(), "getSrc", "Second column property mergeFunctionName = getSrc");

			assert.notOk(aColumns[2].getMergeDuplicates(), "Third column property mergeDuplicates = false");
			assert.strictEqual(aColumns[0].getMergeFunctionName(), "getText", "Third column property mergeFunctionName = getText as it's the default value");
		});
	});

	QUnit.module("Row settings", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: [{
							type: "Navigation"
						}, {
							type: "Navigation", visible: true
						}, {
							type: "Navigation", visible: "true"
						}]
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
		},
		destroyTable: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("Row actions with default settings", function(assert) {
		return this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem()
				]
			})
		}).then(() => {
			assert.ok(false, "Promise should not resolve");
		}).catch((oError) => {
			assert.equal(oError.message,
				"No row action of type 'Navigation' found. ResponsiveTableType only accepts row actions of type 'Navigation'.",
				"Error message");
		});
	});

	QUnit.test("Row actions with static settings", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem(),
					new RowActionItem({
						type: RowActionType.Navigation,
						text: "My custom action",
						icon: "sap-icon://accept",
						visible: false
					})
				]
			})
		});

		const oInnerTableItemsTemplate = this.oTable._oTable.getBindingInfo("items").template;

		assert.strictEqual(oInnerTableItemsTemplate.getType(), "Inactive", "Item invisible: Inner table items template 'type' value");
		assert.notOk(oInnerTableItemsTemplate.isBound("type"), "Item invisible: Inner table items template 'type' not bound");

		this.oTable.getRowSettings().getRowActions()[1].setVisible(true);
		this.oTable.setRowSettings(this.oTable.getRowSettings());
		assert.strictEqual(oInnerTableItemsTemplate.getType(), "Navigation", "Item visible: Inner table items template 'type' value");
		assert.notOk(oInnerTableItemsTemplate.isBound("type"), "Item visible: Inner table items template 'type' not bound");

		assert.throws(() => {
			this.oTable.getRowSettings().getRowActions()[1].setType();
			this.oTable.setRowSettings(this.oTable.getRowSettings());
		}, new Error("No row action of type 'Navigation' found. ResponsiveTableType only accepts row actions of type 'Navigation'."),
			"Error thrown when setting wrong type");
	});

	QUnit.test("Row actions with bound settings", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					})
				]
			})
		});

		const oInnerTableItemsTemplate = this.oTable._oTable.getBindingInfo("items").template;

		assert.deepEqual({
			model: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].model,
			path: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].path
		}, {
			model: "namedModel",
			path: "visible"
		}, "'type' property binding");

		// The formatter needs to be tested in the context of the items aggregation.
		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[0].getType(), "Inactive", "Item 1 type");
		assert.strictEqual(aItems[1].getType(), "Navigation", "Item 2 type");
		assert.strictEqual(aItems[2].getType(), "Inactive", "Item 3 type");
	});

	QUnit.test("Row actions with bound settings and custom formatters", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: {
							path: "namedModel>visible",
							formatter: function(sValue) {
								return sValue === "true" ? true : sValue;
							}
						}
					})
				]
			})
		});

		const oInnerTableItemsTemplate = this.oTable._oTable.getBindingInfo("items").template;

		assert.deepEqual({
			model: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].model,
			path: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].path
		}, {
			model: "namedModel",
			path: "visible"
		}, "'type' property binding");

		// The formatter needs to be tested in the context of the items aggregation.
		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[0].getType(), "Inactive", "Item 1 type");
		assert.strictEqual(aItems[1].getType(), "Navigation", "Item 2 type");
		assert.strictEqual(aItems[2].getType(), "Navigation", "Item 3 type");
	});

	QUnit.test("Bound row actions", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: {
					path: "namedModel>/testPath",
					template: new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					})
				}
			})
		});

		const oInnerTableItemsTemplate = this.oTable._oTable.getBindingInfo("items").template;

		assert.deepEqual({
			model: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].model,
			path: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].path
		}, {
			model: "namedModel",
			path: "visible"
		}, "'type' property binding");

		// The formatter needs to be tested in the context of the items aggregation.
		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[0].getType(), "Inactive", "Item 1 type");
		assert.strictEqual(aItems[1].getType(), "Navigation", "Item 2 type");
		assert.strictEqual(aItems[2].getType(), "Inactive", "Item 3 type");
	});

	QUnit.test("press' event", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						id: "myRowActionitem",
						type: RowActionType.Navigation
					})
				]
			})
		});

		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("updateFinished", resolve);
		});

		this.oTable._oTable.getItems()[1].$().trigger("tap");
		let oEvent = await new Promise((resolve) => {
			this.oTable.getRowSettings().getRowActions()[0].attachEventOnce("press", resolve);
		});
		assert.deepEqual(oEvent.getParameters(), {
			id: "myRowActionitem",
			bindingContext: this.oTable._oTable.getItems()[1].getBindingContext("namedModel")
		}, "'press' event handler called with the correct parameters");

		this.oTable._oTable.getItems()[2].$().trigger("tap");
		oEvent = await new Promise((resolve) => {
			this.oTable.getRowSettings().getRowActions()[0].attachEventOnce("press", resolve);
		});
		assert.deepEqual(oEvent.getParameters(), {
			id: "myRowActionitem",
			bindingContext: this.oTable._oTable.getItems()[2].getBindingContext("namedModel")
		}, "'press' event handler called with the correct parameters");
	});

	QUnit.module("Events", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
			await new Promise((resolve) => {
				this.oTable._oTable.attachEventOnce("updateFinished", resolve);
			});
		},
		destroyTable: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("Table 'rowPress' event listener attached on init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable({
			rowPress: (oEvent) => {
				oRowPress(oEvent.getParameters());
			}
		});

		this.oTable._oTable.getItems()[1].$().trigger("tap");
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", resolve);
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getItems()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.skip("Table 'rowPress' event listener attached after init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable();
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", (oEvent) => {
				oRowPress(oEvent.getParameters());
				resolve();
			});
			this.oTable._oTable.getItems()[1].$().trigger("tap");
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getItems()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.module("Context menu", {
		beforeEach: async function() {
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					template: new Text()
				}),
				contextMenu: new Menu(),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				}
			});
			this.oTable.placeAt("qunit-fixture");
			await this.oTable.initialized();
			await new Promise((resolve) => {
				this.oTable._oTable.attachEventOnce("updateFinished", resolve);
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Standard context menu", function(assert) {
		const oContextMenu = this.oTable.getContextMenu();
		let oInnerTableEvent;

		this.spy(this.oTable, "_onBeforeOpenContextMenu");
		this.oTable._oTable.attachBeforeOpenContextMenu((oEvent) => {
			oInnerTableEvent = oEvent;
		});

		this.oTable._oTable.fireBeforeOpenContextMenu({
			column: this.oTable._oTable.getColumns()[0],
			listItem: this.oTable._oTable.getItems()[0]
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: this.oTable._oTable.getItems()[0].getBindingContext("namedModel"),
			column: this.oTable.getColumns()[0],
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: undefined
		});

		this.oTable._onBeforeOpenContextMenu.resetHistory();
		this.oTable._oTable.fireBeforeOpenContextMenu({
			column: undefined,
			listItem: this.oTable._oTable.getItems()[0]
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: this.oTable._oTable.getItems()[0].getBindingContext("namedModel"),
			column: undefined,
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: undefined
		});
	});
});