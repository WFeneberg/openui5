/* global QUnit, sinon */

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/enums/TableRowCountMode",
	"sap/ui/mdc/enums/TableRowActionType",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Menu",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/variants/VariantManagement",
	"test-resources/sap/m/qunit/p13n/TestModificationHandler"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	Table,
	Column,
	GridTableType,
	RowSettings,
	RowActionItem,
	RowCountMode,
	RowActionType,
	Label,
	Text,
	Menu,
	JSONModel,
	VariantManagement,
	TestModificationHandler
) {
	"use strict";

	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	QUnit.module("Inner table settings", {
		beforeEach: async function() {
			this.oTable = new Table({
				type: new GridTableType()
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Control types", async function(assert) {
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "Inner table type is sap.ui.table.Table");
	});

	QUnit.test("Default settings", function(assert) {
		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getEnableColumnReordering(), false, "enableColumnReordering");
		assert.equal(oInnerTable.getSelectionMode(), "None", "selectionMode");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowSelector", "selectionBehavior");
		assert.equal(oInnerTable.getThreshold(), 100, "threshold");
		assert.deepEqual(oInnerTable.getAriaLabelledBy(), [this.oTable._oTitle.getId()], "ariaLabelledBy");
		assert.deepEqual(oInnerTable.getExtension(), [this.oTable._oToolbar], "extension");
		assert.equal(oInnerTable.getEnableBusyIndicator(), true, "enableBusyIndicator");
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Auto"), true, "rowMode");
		assert.equal(oInnerTable.getRowMode().getMinRowCount(), 10, "rowMode.minRowCount");
		assert.equal(oInnerTable.getFixedColumnCount(), 0, "fixedColumnCount");
	});

	QUnit.test("Initial settings", async function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			type: new GridTableType({
				rowCountMode: RowCountMode.Fixed,
				rowCount: 12,
				fixedColumnCount: 1
			}),
			threshold: 30,
			selectionMode: "SingleMaster"
		});
		await this.oTable.initialized();

		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getEnableColumnReordering(), false, "enableColumnReordering");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowOnly", "selectionBehavior");
		assert.equal(oInnerTable.getThreshold(), 30, "threshold");
		assert.deepEqual(oInnerTable.getAriaLabelledBy(), [this.oTable._oTitle.getId()], "ariaLabelledBy");
		assert.deepEqual(oInnerTable.getExtension(), [this.oTable._oToolbar], "extension");
		assert.equal(oInnerTable.getEnableBusyIndicator(), true, "enableBusyIndicator");
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), true, "rowMode");
		assert.equal(oInnerTable.getRowMode().getRowCount(), 12, "rowMode.minRowCount");
		assert.equal(oInnerTable.getFixedColumnCount(), 1, "fixedColumnCount");
	});

	QUnit.test("Change settings", function(assert) {
		const oType = this.oTable.getType();
		const oInnerTable = this.oTable._oTable;

		const oCreationRowStub = sinon.stub(this.oTable, "getCreationRow").returns({
			getVisible: function() {
				return true;
			}
		});

		this.oTable.setThreshold(30);
		assert.equal(oInnerTable.getThreshold(), 30, "Table.threshold=30: threshold");

		oType.setRowCountMode(RowCountMode.Fixed);
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), true, "Type.rowCountMode=Fixed: rowMode");
		assert.equal(oInnerTable.getRowMode().getHideEmptyRows(), true, `Type.rowCountMode=Fixed.hideEmptyRows: ${true}`);

		oType.setRowCount(12);
		assert.equal(oInnerTable.getRowMode().getRowCount(), 12, "Type.rowCount=12: rowMode.rowCount");

		oType.setFixedColumnCount(1);
		assert.equal(oInnerTable.getFixedColumnCount(), 1, "Type.fixedColumnCount=1: fixedColumnCount");

		this.oTable.setSelectionMode("SingleMaster");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowOnly", "Table.selectionMode=SingleMaster: selectionBehavior");

		this.oTable.setSelectionMode("Multi");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowSelector", "Table.selectionMode=MultiToggle: selectionBehavior");

		oType.setRowCountMode(RowCountMode.Interactive);
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Interactive"), true, "Type.rowCountMode=Interactive: rowMode");

		oType.setRowCount(15);
		assert.equal(oInnerTable.getRowMode().getRowCount(), 15, "Type.rowCount=15: rowMode.rowCount");

		oType.setRowCountMode(RowCountMode.Fixed);
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), true, "Type.rowCountMode=Fixed: rowMode");
		assert.equal(oInnerTable.getRowMode().getHideEmptyRows(), true, `Type.rowCountMode=Fixed.hideEmptyRows: ${true}`);

		oCreationRowStub.restore();
	});

	QUnit.module("API", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: function(mSettings) {
			this.oTable = new Table({
				type: new GridTableType(),
				...mSettings
			});
			return this.oTable;
		}
	});

	QUnit.test("scrollThreshold property", async function(assert) {
		const oTable = this.createTable({
			type: new GridTableType({scrollThreshold: 200})
		});

		await oTable.initialized();

		const oInnerTable = oTable._oTable;
		const oTableType = oTable.getType();
		const setThresholdSpy = sinon.spy(oTableType, "setScrollThreshold");
		const invalidateSpy = sinon.spy(oTable, "invalidate");

		oTableType.setScrollThreshold(25);

		assert.ok(invalidateSpy.notCalled, "Invalidation not called");
		assert.ok(setThresholdSpy.returned(oTableType), "Correct return value");
		assert.equal(oInnerTable.getScrollThreshold(), oTableType.getScrollThreshold(), "Inner table has correct scrollThreshold");

		oTableType.setScrollThreshold(-1);
		assert.equal(oInnerTable.getScrollThreshold(), oInnerTable.getMetadata().getProperty("scrollThreshold").defaultValue,
			"scrollThreshold is reset to default");

		oTableType.setScrollThreshold(50);
		assert.equal(oInnerTable.getScrollThreshold(), 50, "scrollThreshold is set correctly");

		oTableType.setScrollThreshold(undefined);
		assert.equal(oInnerTable.getScrollThreshold(), oInnerTable.getMetadata().getProperty("scrollThreshold").defaultValue,
			"scrollThreshold is reset to default");
		assert.ok(invalidateSpy.notCalled, "Invalidation not called");
	});

	QUnit.test("#getTableStyleClasses", function(assert) {
		const oTable = this.createTable();

		assert.deepEqual(oTable.getType().getTableStyleClasses(), ["sapUiMdcTableFitContainer"], "RowCountMode Auto");

		oTable.getType().setRowCountMode(RowCountMode.Fixed);
		assert.deepEqual(oTable.getType().getTableStyleClasses(), [], "RowCountMode Fixed");
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
		assert.strictEqual(oInnerColumn.getSortOrder(), "Ascending", "Inner table column sort order");

		oType.updateSortIndicator(oColumn, "Descending");
		assert.strictEqual(oInnerColumn.getSortOrder(), "Descending", "Inner table column sort order");

		oType.updateSortIndicator(oColumn, "None");
		assert.strictEqual(oInnerColumn.getSortOrder(), "None", "Inner table column sort order");
	});

	QUnit.module("Column Freeze", {
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
				type: new GridTableType({
					enableColumnFreeze: true,
					fixedColumnCount: 1
				}),
				columns: [
					new Column({
						label: new Label({text: "Column A"}),
						template: new Text({
							text: "{test}"
						})
					}),
					new Column({
						label: new Label({text: "Column B"}),
						template: new Text({
							text: "{test}"
						})
					}),
					new Column({
						label: new Label({text: "Column C"}),
						template: new Text({
							text: "{test}"
						})
					})
				]
			});

			this.oTable.setModel(oModel);
			this.oTable.placeAt("qunit-fixture");
			this.oType = this.oTable.getType();
		}
	});

	QUnit.test("The controller is registered and deregistered properly", function(assert) {
		assert.ok(this.oTable.getEngine().getRegisteredControllers(this.oTable).includes("ColumnFreeze"), "ColumnFreeze controller is registered");
		this.oTable.getType().setEnableColumnFreeze(false);
		assert.notOk(this.oTable.getEngine().getRegisteredControllers(this.oTable).includes("ColumnFreeze"),
			"ColumnFreeze controller is deregistered");
	});

	QUnit.test("fixedColumnCount property", function(assert) {
		assert.equal(this.oTable.getType().getFixedColumnCount(), 1, "fixedColumnCount for type is set to 1");
		assert.equal(this.oTable._oTable.getFixedColumnCount(), 1, "Inner table has a fixed column count of 1");

		this.oTable.getType().setFixedColumnCount(2);

		assert.equal(this.oTable.getType().getFixedColumnCount(), 2, "fixedColumnCount for type is set to 2");
		assert.equal(this.oTable._oTable.getFixedColumnCount(), 2, "Inner table has a fixed column count of 2");

		this.oTable.getType().setFixedColumnCount(0);

		assert.equal(this.oTable.getType().getFixedColumnCount(), 0, "fixedColumnCount for type is set to 0");
		assert.equal(this.oTable._oTable.getFixedColumnCount(), 0, "Inner table has a fixed column count of 0");
	});

	QUnit.test("State is persisted", async function(assert) {
		const done = assert.async();
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const oModificationHandler = TestModificationHandler.getInstance();
		oModificationHandler.processChanges = function(aChanges) {
			assert.strictEqual(aChanges.length, 1, "One change is created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "setFixedColumnCount", "Change type is correct");
			assert.strictEqual(aChanges[0].changeSpecificData.content.value, 2, "Change content value is correct");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, "GridTable", "Name is correct");

			done();
		};

		this.oTable.getEngine()._setModificationHandler(this.oTable, oModificationHandler);

		await TableQUnitUtils.waitForBinding(this.oTable);
		await nextUIUpdate();

		this.oTable._oTable.setFixedColumnCount(2);
		this.oTable._oTable.fireColumnFreeze();
	});

	QUnit.test("Switch variant (emulation)", async function(assert) {
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		const oType = this.oTable.getType();
		const oInnerTable = oType.getInnerTable();

		// Initial state
		await TableQUnitUtils.waitForBinding(this.oTable);
		await nextUIUpdate();
		assert.equal(oType.getFixedColumnCount(), 1, "Fixed column count is initially 1");

		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"GridTable": {
						"fixedColumnCount": 2
					}
				}
			}
		});
		oType.onModifications(); // Emulate change with ColumnFreeze
		await nextUIUpdate();

		assert.equal(oInnerTable.getFixedColumnCount(), 2, "Fixed column count is now 2");
		assert.equal(oType.getFixedColumnCount(), 1, "The value of the fixedColumnCount property is still 1");

		// State (none)
		fnGetCurrentStateStub.returns({});
		oType.onModifications(); // Emulate change with ColumnFreeze
		await nextUIUpdate();

		assert.equal(oInnerTable.getFixedColumnCount(), 1, "Fixed column count is equal to the configured fixedColumnCount");

		fnGetCurrentStateStub.restore();
	});

	QUnit.test("State is applied (emulation)", async function(assert) {
		const oType = this.oTable.getType();
		const oInnerTable = oType.getInnerTable();
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"GridTable": {
						"fixedColumnCount": 2
					}
				}
			}
		});

		const fnOnModificationsSpy = sinon.spy(oType, "onModifications");
		const fnSetShowDetailsState = sinon.spy(oInnerTable, "setFixedColumnCount");

		await TableQUnitUtils.waitForBinding(this.oTable);
		await nextUIUpdate();
		assert.equal(oInnerTable.getFixedColumnCount(), 1, "Fixed column count is initially 1");

		this.oTable._onModifications();
		await nextUIUpdate();

		assert.ok(fnOnModificationsSpy.calledOnce, "onModifications is called");
		assert.ok(fnSetShowDetailsState.calledOnce, "setFixedColumnCount is called");
		assert.ok(fnSetShowDetailsState.calledWith(2), "setFixedColumnCount is called with 2");
		assert.equal(oInnerTable.getFixedColumnCount(), 2, "Fixed column count is now 2");

		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"GridTable": {
						"fixedColumnCount": 0
					}
				}
			}
		});

		this.oTable._onModifications();
		await nextUIUpdate();

		assert.ok(fnOnModificationsSpy.calledTwice, "onModifications is called");
		assert.ok(fnSetShowDetailsState.calledTwice, "setFixedColumnCount is called");
		assert.ok(fnSetShowDetailsState.calledWith(0), "setFixedColumnCount is called with 0");
		assert.equal(oType.getInnerTable().getFixedColumnCount(), 0, "Fixed column count is now 0");
	});

	QUnit.test("State is applied before the table is initialized", async function(assert) {
		this.oTable.destroy();
		this.createTable();

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"GridTable": {
						"fixedColumnCount": 2
					}
				}
			}
		});

		assert.notOk(this.oTable.getType().getInnerTable(), "Inner table is not created yet");

		this.oTable._onModifications();
		await this.oTable.initialized();
		const oType = this.oTable.getType();
		const oInnerTable = oType.getInnerTable();

		assert.equal(oInnerTable.getFixedColumnCount(), 2, "Fixed column count is 2");
	});

	QUnit.module("Row settings", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new GridTableType(),
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
		},
		destroyTable: function() {
			this.oTable?.destroy();
		},
		assertRowActionValues: function(oItem, sType, sText, sIcon, bVisible) {
			QUnit.assert.strictEqual(oItem.getType(), sType, "Row action 'type' property");
			QUnit.assert.notOk(oItem.isBound("type"), "'type' binding");
			QUnit.assert.strictEqual(oItem.getText(), sText, "Row action 'text' property");
			QUnit.assert.notOk(oItem.isBound("text"), "'text' binding");
			QUnit.assert.strictEqual(oItem.getIcon(), sIcon, "Row action 'icon' property");
			QUnit.assert.notOk(oItem.isBound("icon"), "'icon' binding");
			QUnit.assert.strictEqual(oItem.getVisible(), bVisible, "Row action 'visible' property");
			QUnit.assert.notOk(oItem.isBound("visible"), "'visible' binding");
		},
		assertRowActionBindingInfos: function(oItem) {
			["type", "text", "icon", "visible"].forEach(function(sProperty) {
				QUnit.assert.deepEqual({
					model: oItem.getBindingInfo(sProperty).parts[0].model,
					path: oItem.getBindingInfo(sProperty).parts[0].path
				}, {
					model: "namedModel",
					path: sProperty
				}, sProperty + " binding");
			});
		}
	});

	QUnit.test("Row actions with default settings", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem()
				]
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 1, "Inner row action item count");
		this.assertRowActionValues(oInnerRowAction.getItems()[0], "Custom", "", "", true);
	});

	QUnit.test("Row actions with static settings", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: RowActionType.Navigation,
						text: "My custom action",
						icon: "sap-icon://accept",
						visible: false
					}),
					new RowActionItem({
						text: "My other custom action",
						icon: "sap-icon://decline"
					})
				]
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 2, "Inner row action item count");
		this.assertRowActionValues(oInnerRowAction.getItems()[0], "Navigation", "My custom action", "sap-icon://accept", false);
		this.assertRowActionValues(oInnerRowAction.getItems()[1], "Custom", "My other custom action", "sap-icon://decline", true);
	});

	QUnit.test("Row actions with bound settings", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					})
				]
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 1, "Inner row action item count");
		this.assertRowActionBindingInfos(oInnerRowAction.getItems()[0]);
	});

	QUnit.test("Bound row actions", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: {
					path: "namedModel>/testPath",
					template: new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					}),
					templateShareable: false
				}
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 0, "Inner row action item count");
		assert.deepEqual({
			model: this.oTable._oTable.getRowActionTemplate().getBindingInfo("items").model,
			path: this.oTable._oTable.getRowActionTemplate().getBindingInfo("items").path
		}, {
			model: "namedModel",
			path: "/testPath"
		}, "'items' binding");
		this.assertRowActionBindingInfos(oInnerRowAction.getBindingInfo("items").template);
	});

	QUnit.test("press' event", async function(assert) {
		const oPress = sinon.spy();

		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						id: "myRowActionitem",
						type: RowActionType.Navigation,
						press: (oEvent) => {
							oPress(oEvent.getParameters());
						}
					}),
					new RowActionItem({
						id: "myOtherRowActionitem",
						type: RowActionType.Navigation,
						press: (oEvent) => {
							oPress(oEvent.getParameters());
						}
					})
				]
			})
		});

		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
		});

		this.oTable._oTable.getRows()[1].getRowAction().$("icon0").trigger("click");
		assert.ok(oPress.calledOnceWithExactly({
			id: "myRowActionitem",
			bindingContext: this.oTable._oTable.getRows()[1].getBindingContext("namedModel")
		}), "'press' event handler called with the correct parameters");

		oPress.resetHistory();
		this.oTable._oTable.getRows()[2].getRowAction().$("icon1").trigger("click");
		assert.ok(oPress.calledOnceWithExactly({
			id: "myOtherRowActionitem",
			bindingContext: this.oTable._oTable.getRows()[2].getBindingContext("namedModel")
		}), "'press' event handler called with the correct parameters");
	});

	QUnit.module("Events", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new GridTableType(),
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
				this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
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

		this.oTable._oTable.getRows()[1].getCells()[0].$().trigger("tap");
		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getRows()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.test("Table 'rowPress' event listener attached after init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable();
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", (oEvent) => {
				oRowPress(oEvent.getParameters());
				resolve();
			});
			this.oTable._oTable.getRows()[1].getCells()[0].$().trigger("tap");
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getRows()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.module("Context menu", {
		beforeEach: async function() {
			this.oTable = new Table({
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
				this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
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
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: oContextMenu
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: this.oTable._oTable.getRows()[0].getBindingContext("namedModel"),
			column: this.oTable.getColumns()[0],
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: undefined
		});

		this.oTable._onBeforeOpenContextMenu.resetHistory();
		this.oTable._oTable.fireBeforeOpenContextMenu({
			rowIndex: 0,
			columnIndex: undefined,
			contextMenu: oContextMenu
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: this.oTable._oTable.getRows()[0].getBindingContext("namedModel"),
			column: undefined,
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: undefined
		});
	});

	QUnit.test("Group header row context menu", function(assert) {
		const oContextMenu = this.oTable._oTable.getAggregation("groupHeaderRowContextMenu");
		let oInnerTableEvent;

		assert.ok(oContextMenu.isA("sap.ui.mdc.table.menus.GroupHeaderRowContextMenu"), "GroupHeaderRowContextMenu is set");

		this.spy(this.oTable, "_onBeforeOpenContextMenu");
		this.oTable._oTable.attachBeforeOpenContextMenu((oEvent) => {
			oInnerTableEvent = oEvent;
		});

		this.oTable._oTable.fireBeforeOpenContextMenu({
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: oContextMenu
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: this.oTable._oTable.getRows()[0].getBindingContext("namedModel"),
			column: this.oTable.getColumns()[0],
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: 1
		});

		this.oTable._onBeforeOpenContextMenu.resetHistory();
		this.oTable._oTable.fireBeforeOpenContextMenu({
			rowIndex: 0,
			columnIndex: undefined,
			contextMenu: oContextMenu
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: this.oTable._oTable.getRows()[0].getBindingContext("namedModel"),
			column: undefined,
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: 1
		});
	});
});