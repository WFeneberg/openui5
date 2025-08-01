/*
 * ${copyright}
 */
sap.ui.define([
	"./SelectionPlugin",
	"./PluginBase",
	"./SelectionModelSelection",
	"./BindingSelection",
	"../library",
	"../utils/TableUtils",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/base/Log"
], function(
	SelectionPlugin,
	PluginBase,
	SelectionModelSelectionPlugin,
	BindingSelectionPlugin,
	library,
	TableUtils,
	Icon,
	IconPool,
	Log
) {

	"use strict";

	const SelectionMode = library.SelectionMode;

	/**
	 * Constructs an instance of sap.ui.table.plugins.MultiSelectionPlugin.
	 *
	 * @class
	 * Implements a plugin to enable a special multi-selection behavior:
	 * <ul>
	 *   <li>Select All checkbox for selecting rows up to the set limit.<br>If the number of selected rows is smaller than the limit,
	 *       all these rows can be selected at once with a single operation. If there are more rows than the limit,
	 *       the first x rows are selected until the limit x has been reached.</li>
	 *   <li>Dedicated Deselect All button for removing the selection</li>
	 *   <li>The number of indices which can be selected in a range is defined by the <code>limit</code> property.
	 *       If the user tries to select more indices, the selection is automatically limited, and the table scrolls to the last selected index.</li>
	 *   <li>The plugin makes sure that the corresponding binding contexts up to the given limit are available, by requesting them from the
	 *       binding.</li>
	 *   <li>Multiple consecutive selections are possible</li>
	 * </ul>
	 *
	 * This plugin is intended for server-side models and multi-selection mode. Range selections, including Select All, only work properly if the
	 * count is known. Make sure the model/binding is configured to request the count from the service.
	 * For ease of use, client-side models and single selection are also supported.
	 *
	 * With ODataV4, use the {@link sap.ui.table.plugins.ODataV4MultiSelection ODataV4MultiSelection} plugin or the
	 * {@link sap.ui.table.plugins.ODataV4SingleSelection ODataV4SingleSelection} plugin instead of this one.
	 *
	 * @extends sap.ui.table.plugins.SelectionPlugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.64
	 * @alias sap.ui.table.plugins.MultiSelectionPlugin
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const MultiSelectionPlugin = SelectionPlugin.extend("sap.ui.table.plugins.MultiSelectionPlugin", {metadata: {
		library: "sap.ui.table",
		properties: {
			/**
			 * Number of indices which can be selected in a range.
			 * Accepts positive integer values. If set to 0, the limit is disabled, and the Select All checkbox appears instead of the Deselect All
			 * button.
			 *
			 * <b>Note:</b> To avoid severe performance problems, the limit should only be set to 0 in the following cases:
			 * <ul>
			 *   <li>With client-side models</li>
			 *   <li>With server-side models if they are used in client mode</li>
			 *   <li>If the entity set is small</li>
			 * </ul>
			 *
			 * In other cases, we recommend to set the limit to at least double the value of the {@link sap.ui.table.Table#getThreshold threshold}
			 * property of the related <code>sap.ui.table.Table</code> control.
			 */
			limit: {type: "int", group: "Behavior", defaultValue: 200},
			/**
			 * Enables notifications that are displayed once a selection has been limited.
			 *
			 * @since 1.71
			 */
			enableNotification: {type: "boolean", group: "Behavior", defaultValue: false},
			/**
			 * Show header selector
			 */
			showHeaderSelector: {type: "boolean", group: "Appearance", defaultValue: true},
			/**
			 * Selection mode of the plugin. This property controls whether single or multiple rows can be selected. It also influences the visual
			 * appearance. When the selection mode is changed, the current selection is removed.
			 */
			selectionMode: {type: "sap.ui.table.SelectionMode", group: "Behavior", defaultValue: SelectionMode.MultiToggle}
		},
		aggregations: {
			icon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
		},
		events: {
			/**
			 * This event is fired when the selection is changed.
			 */
			selectionChange: {
				parameters: {

					/**
					 * Array of indices whose selection has been changed (either selected or deselected)
					 */
					indices: {type: "int[]"},

					/**
					 * Indicates whether the selection limit has been reached
					 */
					limitReached: {type: "boolean"},

					/**
					 * Contains the data passed to the function that triggered the event
					 */
					customPayload: {type: "object"}
				}
			}
		}
	}});

	MultiSelectionPlugin.findOn = PluginBase.findOn;

	MultiSelectionPlugin.prototype.init = function() {
		SelectionPlugin.prototype.init.apply(this, arguments);

		this._bLimitReached = false;
		this._bLimitDisabled = this.getLimit() === 0;
		this.oInnerSelectionPlugin = null;
	};

	/**
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.onActivate = function(oTable) {
		SelectionPlugin.prototype.onActivate.apply(this, arguments);
		this.oInnerSelectionPlugin = createInnerSelectionPlugin(oTable);
		this.oInnerSelectionPlugin.setSelectionMode(this.getSelectionMode());
		this.oInnerSelectionPlugin.attachSelectionChange(this._onSelectionChange, this);
		attachToBinding(this, oTable.getBinding());
		oTable.addAggregation("_hiddenDependents", this.oInnerSelectionPlugin);
		oTable.setProperty("selectionMode", this.getSelectionMode());
		updateHeaderSelectorIcon(this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RowsBound, onTableRowsBound, this);
	};

	function createInnerSelectionPlugin(oTable) {
		if (oTable.isA(["sap.ui.table.TreeTable", "sap.ui.table.AnalyticalTable"])) {
			return new BindingSelectionPlugin();
		} else {
			return new SelectionModelSelectionPlugin();
		}
	}

	/**
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.onDeactivate = function(oTable) {
		SelectionPlugin.prototype.onDeactivate.apply(this, arguments);
		oTable.setProperty("selectionMode", library.SelectionMode.None);
		detachFromBinding(this, oTable.getBinding());
		this.oInnerSelectionPlugin?.destroy();
		delete this.oInnerSelectionPlugin;
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RowsBound, onTableRowsBound, this);
	};

	MultiSelectionPlugin.prototype.setSelected = function(oRow, bSelected, mConfig) {
		if (!this.isIndexSelectable(oRow.getIndex())) {
			return;
		}

		if (mConfig && mConfig.range) {
			const iLastSelectedIndex = this.getSelectedIndex();

			if (iLastSelectedIndex >= 0) {
				this.addSelectionInterval(iLastSelectedIndex, oRow.getIndex());
			}
		} else if (bSelected) {
			this.addSelectionInterval(oRow.getIndex(), oRow.getIndex());
		} else {
			this.removeSelectionInterval(oRow.getIndex(), oRow.getIndex());
		}
	};

	MultiSelectionPlugin.prototype.isSelected = function(oRow) {
		return this.isIndexSelected(oRow.getIndex());
	};

	MultiSelectionPlugin.prototype.getRenderConfig = function() {
		if (!this.isActive()) {
			return SelectionPlugin.prototype.getRenderConfig.apply(this, arguments);
		}

		return {
			headerSelector: {
				type: this._bLimitDisabled ? "toggle" : "custom",
				icon: this.getAggregation("icon"),
				visible: this.getSelectionMode() === SelectionMode.MultiToggle && this.getShowHeaderSelector(),
				enabled: this.getSelectableCount() > 0,
				selected: this.getSelectableCount() > 0 && this.getSelectableCount() === this.getSelectedCount(),
				tooltip: this.getSelectedCount() === 0 ? TableUtils.getResourceText("TBL_SELECT_ALL") : TableUtils.getResourceText("TBL_DESELECT_ALL")
			}
		};
	};

	MultiSelectionPlugin.prototype.onHeaderSelectorPress = function() {
		const mRenderConfig = this.getRenderConfig();

		if (!mRenderConfig.headerSelector.visible || !mRenderConfig.headerSelector.enabled) {
			return;
		}

		if (mRenderConfig.headerSelector.type === "toggle") {
			toggleSelection(this);
		} else if (mRenderConfig.headerSelector.type === "custom") {
			 if (this.getSelectedCount() > 0) {
				 this.clearSelection();
			 } else {
				this.addSelectionInterval(0, this._getHighestSelectableIndex());
			 }
		}
	};

	MultiSelectionPlugin.prototype.onKeyboardShortcut = function(sType, oEvent) {
		if (sType === "toggle") { // ctrl + a
			if (this.getSelectionMode() !== SelectionMode.MultiToggle) {
				return;
			}

			if (this._bLimitDisabled) {
				if (!toggleSelection(this)) {
					oEvent.setMarked("sapUiTableClearAll");
				}
			} else {
				this.addSelectionInterval(0, this._getHighestSelectableIndex());
			}
		} else if (sType === "clear") { // ctrl + shift + a
			this.clearSelection();
			oEvent.setMarked("sapUiTableClearAll");
		}
	};

	/**
	 * If not all indices are selected, all indices are selected, otherwise the selection is removed.
	 *
	 * @param {sap.ui.table.plugins.MultiSelectionPlugin} oPlugin The plugin to toggle the selection on.
	 * @returns {boolean} The selection state. true - all selected, false - all cleared
	 */
	function toggleSelection(oPlugin) {
		if (oPlugin.getSelectableCount() > oPlugin.getSelectedCount()) {
			oPlugin.selectAll();
			return true;
		} else {
			oPlugin.clearSelection();
			return false;
		}
	}

	MultiSelectionPlugin.prototype.setSelectionMode = function(sSelectionMode) {
		this.setProperty("selectionMode", sSelectionMode, true);

		if (!this.isActive()) {
			return this;
		}

		this.getControl().setProperty("selectionMode", sSelectionMode);
		this.oInnerSelectionPlugin.setSelectionMode(sSelectionMode);
		updateHeaderSelectorIcon(this);

		return this;
	};

	MultiSelectionPlugin.prototype.setLimit = function(iLimit) {
		if (typeof iLimit === "number" && iLimit < 0) {
			Log.warning("The limit must be greater than or equal to 0", this);
			return this;
		}

		// invalidate only when the limit changes from 0 to a positive value or vice versa
		this.setProperty("limit", iLimit, !!this.getLimit() === !!iLimit);
		this._bLimitDisabled = iLimit === 0;

		updateHeaderSelectorIcon(this);

		return this;
	};

	MultiSelectionPlugin.prototype.setEnableNotification = function(bNotify) {
		this.setProperty("enableNotification", bNotify, true);
		return this;
	};

	/**
	 * Returns <code>true</code> if the selection limit has been reached (only the last selection), <code>false</code> otherwise.
	 *
	 * @return {boolean}
	 */
	MultiSelectionPlugin.prototype.isLimitReached = function() {
		return this._bLimitReached;
	};

	/**
	 * Sets the value.
	 *
	 * @param bLimitReached
	 */
	MultiSelectionPlugin.prototype.setLimitReached = function(bLimitReached) {
		this._bLimitReached = bLimitReached;
	};

	/**
	 * Requests the binding contexts and adds all indices to the selection if the limit is disabled or the binding length is smaller then the limit.
	 *
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @returns {Promise} A Promise that resolves after the selection has been completed or is rejected with an error
	 * @public
	 */
	MultiSelectionPlugin.prototype.selectAll = function(oEventPayload) {
		if (!this.isActive()) {
			return Promise.reject(new Error("Plugin is disabled"));
		}

		if (!this._bLimitDisabled) {
			return Promise.reject(new Error("Not possible if the limit is enabled"));
		}

		const iSelectableCount = this.getSelectableCount();

		if (iSelectableCount === 0) {
			return Promise.reject(new Error("Nothing to select"));
		}

		return this.addSelectionInterval(0, this._getHighestSelectableIndex(), oEventPayload);
	};

	/**
	 * Calculates the correct start and end index for the range selection and loads the corresponding contexts.
	 *
	 * @param {sap.ui.table.plugins.MultiSelectionPlugin} oPlugin The selection plugin.
	 * @param {int} iIndexFrom The start index of the range selection.
	 * @param {int} iIndexTo The end index of the range selection.
	 * @param {boolean} [bAddSelection=false] Whether to prepare for adding or setting the selection.
	 * @return {Promise|Promise<{indexTo: int, indexFrom: int}>} A promise that resolves with the corrected start and end index when the contexts are
	 * loaded. The Promise is rejected if the index is out of range.
	 */
	function prepareSelection(oPlugin, iIndexFrom, iIndexTo, bAddSelection) {
		const iHighestSelectableIndex = oPlugin._getHighestSelectableIndex();

		if (iIndexFrom < 0 && iIndexTo < 0 || iIndexFrom > iHighestSelectableIndex && iIndexTo > iHighestSelectableIndex) {
			// Selection is not possible if the index range it completely out of the selectable range.
			return Promise.reject(new Error("Out of range"));
		}

		// Restrict indices to boundaries.
		iIndexFrom = Math.min(Math.max(0, iIndexFrom), iHighestSelectableIndex);
		iIndexTo = Math.min(Math.max(0, iIndexTo), iHighestSelectableIndex);

		const iLimit = oPlugin.getLimit();
		const bReverse = iIndexTo < iIndexFrom; // Indicates whether the selection is made from bottom to top.
		let iGetContextsStartIndex = bReverse ? iIndexTo : iIndexFrom;
		let iGetContextsLength;

		// If the start index is already selected, the range starts from the next index.
		if (bAddSelection && oPlugin.isIndexSelected(iIndexFrom)) {
			if (bReverse) {
				iIndexFrom--;
			} else if (iIndexFrom !== iIndexTo) {
				iIndexFrom++;
				iGetContextsStartIndex++;
			}
		}

		iGetContextsLength = Math.abs(iIndexTo - iIndexFrom) + 1;

		if (!oPlugin._bLimitDisabled) {
			oPlugin.setLimitReached(iGetContextsLength > iLimit);

			if (oPlugin.isLimitReached()) {
				if (bReverse) {
					iIndexTo = iIndexFrom - iLimit + 1;
					iGetContextsStartIndex = iIndexTo - 1;
				} else {
					iIndexTo = iIndexFrom + iLimit - 1;
				}

				// The table will be scrolled one row further to make it transparent for the user where the selection ends.
				// load the extra row here to avoid additional batch request.
				iGetContextsLength = iLimit + 1;
			}
		}

		return TableUtils.loadContexts(oPlugin.getControl().getBinding(), iGetContextsStartIndex, iGetContextsLength).then(function() {
			return {indexFrom: iIndexFrom, indexTo: iIndexTo};
		});
	}

	/**
	 * Sets the given selection interval as the selection and requests the corresponding binding contexts.
	 * In single-selection mode it requests the context and sets the selected index to <code>iIndexTo</code>.
	 *
	 * If the number of indices in the range is greater than the value of the <code>limit</code> property, only n=limit
	 * indices, starting from <code>iIndexFrom</code>, are selected. The table is scrolled to display the index last
	 * selected.
	 *
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @returns {Promise} A Promise that resolves after the selection has been completed or is rejected with an error
	 * @public
	 */
	MultiSelectionPlugin.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo, oEventPayload) {
		const oTable = this.getControl();
		const sSelectionMode = this.getSelectionMode();

		if (!this.isActive()) {
			return Promise.reject(new Error("Plugin is disabled"));
		}

		if (sSelectionMode === SelectionMode.None) {
			return Promise.reject(new Error("SelectionMode is '" + SelectionMode.None + "'"));
		}

		if (sSelectionMode === SelectionMode.Single) {
			iIndexFrom = iIndexTo;
		}

		return prepareSelection(this, iIndexFrom, iIndexTo, false).then(function(mIndices) {
			this._oCustomEventPayloadTmp = oEventPayload;
			this.oInnerSelectionPlugin.setSelectionInterval(mIndices.indexFrom, mIndices.indexTo);
			delete this._oCustomEventPayloadTmp;

			if (!this.isLimitReached()) {
				return Promise.resolve();
			}

			return TableUtils.scrollTableToIndex(oTable, mIndices.indexTo, mIndices.indexFrom > mIndices.indexTo).then(function() {
				if (!this.getEnableNotification()) {
					return Promise.resolve();
				}

				return TableUtils.showNotificationPopoverAtIndex(oTable, mIndices.indexTo, this.getLimit());
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Requests the context and sets the selected index to <code>iIndex</code>.
	 *
	 * @param {int} iIndex The index to select
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @returns {Promise} A Promise that resolves after the selection has been completed or is rejected with an error
	 * @public
	 */
	MultiSelectionPlugin.prototype.setSelectedIndex = function(iIndex, oEventPayload) {
		return this.setSelectionInterval(iIndex, iIndex, oEventPayload);
	};

	/**
	 * Adds the given selection interval to the selection and requests the corresponding binding contexts.
	 * In single-selection mode it requests the context and sets the selected index to <code>iIndexTo</code>.
	 *
	 * If the number of indices in the range is greater than the value of the <code>limit</code> property, only n=limit
	 * indices, starting from <code>iIndexFrom</code>, are selected. The table is scrolled to display the index last
	 * selected.
	 *
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @returns {Promise} A Promise that resolves after the selection has been completed or is rejected with an error
	 * @public
	 */
	MultiSelectionPlugin.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo, oEventPayload) {
		const oTable = this.getControl();
		const sSelectionMode = this.getSelectionMode();

		if (!this.isActive()) {
			return Promise.reject(new Error("Plugin is disabled"));
		}

		if (sSelectionMode === SelectionMode.None) {
			return Promise.reject(new Error("SelectionMode is '" + SelectionMode.None + "'"));
		}

		if (sSelectionMode === SelectionMode.Single) {
			return this.setSelectionInterval(iIndexTo, iIndexTo);
		}

		if (sSelectionMode === SelectionMode.MultiToggle) {
			return prepareSelection(this, iIndexFrom, iIndexTo, true).then(function(mIndices) {
				this._oCustomEventPayloadTmp = oEventPayload;
				this.oInnerSelectionPlugin.addSelectionInterval(mIndices.indexFrom, mIndices.indexTo);
				delete this._oCustomEventPayloadTmp;

				if (!this.isLimitReached()) {
					return Promise.resolve();
				}

				return TableUtils.scrollTableToIndex(oTable, mIndices.indexTo, mIndices.indexFrom > mIndices.indexTo).then(function() {
					if (!this.getEnableNotification()) {
						return Promise.resolve();
					}

					return TableUtils.showNotificationPopoverAtIndex(oTable, mIndices.indexTo, this.getLimit());
				}.bind(this));
			}.bind(this));
		}
	};

	/**
	 * Removes the complete selection.
	 *
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @public
	 */
	MultiSelectionPlugin.prototype.clearSelection = function(oEventPayload) {
		if (this.oInnerSelectionPlugin) {
			this.setLimitReached(false);
			this._oCustomEventPayloadTmp = oEventPayload;
			this.oInnerSelectionPlugin.clearSelection();
			delete this._oCustomEventPayloadTmp;
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.getSelectedIndex = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.getSelectedIndex();
		}
		return -1;
	};

	/**
	 * Zero-based indices of selected indices, wrapped in an array. An empty array means nothing has been selected.
	 *
	 * @returns {int[]} An array containing all selected indices
	 * @public
	 */
	MultiSelectionPlugin.prototype.getSelectedIndices = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.getSelectedIndices();
		}
		return [];
	};

	/**
	 * Returns the number of selectable rows.
	 *
	 * @returns {int} The number of selectable rows.
	 */
	MultiSelectionPlugin.prototype.getSelectableCount = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.getSelectableCount();
		}
		return 0;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.getSelectedCount = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.getSelectedCount();
		}
		return 0;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	MultiSelectionPlugin.prototype.isIndexSelectable = function(iIndex) {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.isIndexSelectable(iIndex);
		}
		return false;
	};

	/**
	 * Returns the information whether the given index is selected.
	 *
	 * @param {int} iIndex The index for which the selection state is retrieved
	 * @returns {boolean} <code>true</code> if the index is selected
	 * @public
	 */
	MultiSelectionPlugin.prototype.isIndexSelected = function(iIndex) {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin.isIndexSelected(iIndex);
		}
		return false;
	};

	/**
	 * Removes the given selection interval from the selection. In case of single selection, only <code>iIndexTo</code> is removed from the selection.
	 *
	 * @param {int} iIndexFrom Index from which the deselection starts
	 * @param {int} iIndexTo Index up to which to deselect
	 * @param {object} [oEventPayload] If the function call triggers a {@link #event:selectionChange selectionChange} event, this object is
	 * transferred to the event in the <code>customPayload</code> parameter
	 * @public
	 */
	MultiSelectionPlugin.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo, oEventPayload) {
		if (this.oInnerSelectionPlugin) {
			this.setLimitReached(false);
			this._oCustomEventPayloadTmp = oEventPayload;
			this.oInnerSelectionPlugin.removeSelectionInterval(iIndexFrom, iIndexTo);
			delete this._oCustomEventPayloadTmp;
		}
	};

	/**
	 * Changes the current icon and tooltip text of the header selection icon in the given plugin object based on the selection.
	 *
	 * @param {sap.ui.table.plugins.MultiSelectionPlugin} oPlugin The plugin to toggle the selection on.
	 */
	function updateHeaderSelectorIcon(oPlugin) {
		if (oPlugin.getSelectionMode() === SelectionMode.MultiToggle && !oPlugin._bLimitDisabled) {
			if (!oPlugin.getAggregation("icon")) {
				const oIcon = new Icon({useIconTooltip: false});
				oIcon.addStyleClass("sapUiTableSelectClear");
				oPlugin.setAggregation("icon", oIcon, true);
			}

			const oIcon = oPlugin.getAggregation("icon");
			const iSelectedCount = oPlugin.getSelectedCount();

			if (oPlugin.getSelectableCount() === iSelectedCount && iSelectedCount !== 0) {
				oIcon.setSrc(IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon));
			} else if (iSelectedCount !== 0) {
				oIcon.setSrc(IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon));
			} else {
				oIcon.setSrc(IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon));
			}
		} else {
			oPlugin.destroyAggregation("icon");
		}
	}

	/**
	 * Fires the _onSelectionChange event.
	 *
	 * @param oEvent
	 * @private
	 */
	MultiSelectionPlugin.prototype._onSelectionChange = function(oEvent) {
		const aRowIndices = oEvent.getParameter("rowIndices");

		updateHeaderSelectorIcon(this);

		this.fireSelectionChange({
			rowIndices: aRowIndices,
			limitReached: this.isLimitReached(),
			customPayload: typeof this._oCustomEventPayloadTmp === "object" ? this._oCustomEventPayloadTmp : null,
			// _internalTrigger restricted for sap.ui.comp.valuehelpdialog.ValueHelpDialog and sap.ui.mdc.valuehelp.content.MDCTable
			_internalTrigger: oEvent.getParameter("_internalTrigger")
		});
	};

	/**
	 * Returns the highest index that can be selected. Returns -1 if there is nothing to select.
	 *
	 * @returns {int} The highest index that can be selected.
	 * @private
	 */
	MultiSelectionPlugin.prototype._getHighestSelectableIndex = function() {
		if (this.oInnerSelectionPlugin) {
			return this.oInnerSelectionPlugin._getHighestSelectableIndex();
		}
		return 0;
	};

	function onTableRowsBound(oBinding) {
		attachToBinding(this, oBinding);
	}

	function attachToBinding(oPlugin, oBinding) {
		oBinding?.attachChange(onBindingChange, oPlugin);
	}

	function detachFromBinding(oPlugin, oBinding) {
		oBinding?.detachChange(onBindingChange, oPlugin);
	}

	function onBindingChange(oEvent) {
		updateHeaderSelectorIcon(this);
	}

	MultiSelectionPlugin.prototype.onThemeChanged = function() {
		updateHeaderSelectorIcon(this);
	};

	return MultiSelectionPlugin;
});