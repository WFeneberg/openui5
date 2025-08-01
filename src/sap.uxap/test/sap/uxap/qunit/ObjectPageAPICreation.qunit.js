/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery",
	"sap/uxap/library",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Link",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/NavContainer",
	"sap/uxap/testblocks/GenericDiv",
	"sap/base/Log",
	"sap/ui/Device",
	"sap/ui/dom/getScrollbarSize",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/base/ManagedObject",
	"sap/m/OverflowToolbar",
	"sap/uxap/ObjectPageAccessibleLandmarkInfo",
	"sap/ui/qunit/utils/nextUIUpdate"
],
function(
	Element,
	jQuery,
	lib,
	coreLib,
	Core,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageHeader,
	ObjectPageDynamicHeaderTitle,
	Text,
	Title,
	Link,
	Button,
	Page,
	App,
	NavContainer,
	GenericDiv,
	Log,
	Device,
	getScrollbarSize,
	XMLView,
	ManagedObject,
	OverflowToolbar,
	ObjectPageAccessibleLandmarkInfo,
	nextUIUpdate
) {

	"use strict";

	//eslint-disable-next-line no-void
	const makeVoid = (fn) => (...args) => void fn(...args);

	var TitleLevel = coreLib.TitleLevel;
	var oFactory = {
			getSection: function (iNumber, sTitleLevel, aSubSections, visibility) {
				return new ObjectPageSection({
					title: "Section" + iNumber,
					titleLevel: sTitleLevel,
					subSections: aSubSections || [],
					visible: visibility
				});
			},
			getSubSection: function (iNumber, aBlocks, sTitleLevel) {
				return new ObjectPageSubSection({
					title: "SubSection " + iNumber,
					titleLevel: sTitleLevel,
					blocks: aBlocks || []
				});
			},
			getBlocks: function (sText) {
				return [
					new Text({text: sText || "some text"})
				];
			},
			getHeaderTitle: function() {
				return new ObjectPageHeader({
					objectTitle: "Long title that wraps and goes over more lines",
					objectSubtitle: "Long subtitle that wraps and goes over more lines"
				});
			},
			getObjectPageDynamicHeaderTitle: function () {
				return new ObjectPageDynamicHeaderTitle({
					content: [new Text({text: "some text"})],
					expandedContent: [new GenericDiv({"height":"100px", text:"some content"})]
				});
			},
			getHeaderContent: function() {
				return new GenericDiv({"height":"100px", text:"some content"});
			},
			getObjectPage: function () {
				return new ObjectPageLayout();
			},
			getObjectPageLayoutWithIconTabBar: function () {
				return new ObjectPageLayout({
					useIconTabBar: true
				});
			},
			getObjectPageLayoutWithSectionTitleLevel: function (sSectionTitleLevel) {
				return new ObjectPageLayout({
					sectionTitleLevel: sSectionTitleLevel,
					sections:
						oFactory.getSection(1, null, [
							oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(3, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(4, [oFactory.getBlocks(), oFactory.getBlocks()], null)
						])

				});
			},
			getObjectPageLayoutWithOneVisibleSection: function () {
				return new ObjectPageLayout({
					sections: [
						oFactory.getSection(1, null, [
							oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null)
						]),
						oFactory.getSection(2, null, [
							oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null)
						], false)
					]
				});
			}
	},

		helpers = {
			generateObjectPageWithContent: function (oFactory, iNumberOfSection, bUseIconTabBar, bFooter) {
				var oObjectPage = bUseIconTabBar ? oFactory.getObjectPageLayoutWithIconTabBar() : oFactory.getObjectPage(),
					oSection,
					oSubSection;

				for (var i = 0; i < iNumberOfSection; i++) {
					oSection = oFactory.getSection(i);
					oSubSection = oFactory.getSubSection(i, oFactory.getBlocks());
					oSection.addSubSection(oSubSection);
					oObjectPage.addSection(oSection);
				}

				if (bFooter) {
					oObjectPage.setFooter(new OverflowToolbar());
				}

				return oObjectPage;
			},
			generateObjectPageWithSubSectionContent: function (oFactory, iNumberOfSection, iNumberOfSubSection, bUseIconTabBar) {
				var oObjectPage = bUseIconTabBar ? oFactory.getObjectPageLayoutWithIconTabBar() : oFactory.getObjectPage(),
					oSection,
					oSubSection,
					sSectionId,
					sSubSectionId;

				for (var i = 0; i < iNumberOfSection; i++) {
					sSectionId = "s" + i;
					oSection = oFactory.getSection(sSectionId);

					for (var j = 0; j < iNumberOfSubSection; j++) {
						sSubSectionId = sSectionId + "ss" + j;
						oSubSection = oFactory.getSubSection(sSubSectionId, oFactory.getBlocks());
						oSection.addSubSection(oSubSection);
					}

					oObjectPage.addSection(oSection);
				}

				return oObjectPage;
			},
			renderObject: async function (oSapUiObject) {
				oSapUiObject.placeAt("qunit-fixture");
				await nextUIUpdate();
				return oSapUiObject;
			},
			toPhoneMode: function (oObjectPage) {
				oObjectPage.$().removeClass("sapUxAPObjectPageLayout-Std-Desktop")
				.removeClass("sapUxAPObjectPageLayout-Std-Desktop-XL")
				.removeClass("sapUxAPObjectPageLayout-Std-Tablet")
				.addClass("sapUxAPObjectPageLayout-Std-Phone");
		Device.system.desktop = false;
		Device.system.tablet = false;
		Device.system.phone = true;
	},
	toTabletMode: function (oObjectPage) {
		oObjectPage.$().removeClass("sapUxAPObjectPageLayout-Std-Desktop")
				.removeClass("sapUxAPObjectPageLayout-Std-Desktop-XL")
				.removeClass("sapUxAPObjectPageLayout-Std-Phone")
				.addClass("sapUxAPObjectPageLayout-Std-Tablet");
		Device.system.desktop = false;
		Device.system.phone = false;
		Device.system.tablet = true;
	},
	toDesktopMode: function (oObjectPage) {
		oObjectPage.$().addClass("sapUxAPObjectPageLayout-Std-Desktop")
				.removeClass("sapUxAPObjectPageLayout-Std-Desktop-XL")
				.removeClass("sapUxAPObjectPageLayout-Std-Tablet")
				.removeClass("sapUxAPObjectPageLayout-Std-Phone");
		Device.system.desktop = true;
		Device.system.tablet = false;
		Device.system.phone = false;
	},
	toDesktopXLMode: function (oObjectPage) {
		oObjectPage.$().addClass("sapUxAPObjectPageLayout-Std-Desktop-XL")
				.removeClass("sapUxAPObjectPageLayout-Std-Desktop")
				.removeClass("sapUxAPObjectPageLayout-Std-Tablet")
				.removeClass("sapUxAPObjectPageLayout-Std-Phone");
				Device.system.desktop = true;
				Device.system.tablet = false;
				Device.system.phone = false;
			},
			exists: function (vObject) {
				if (arguments.length === 1) {
					return vObject && ("length" in vObject) ? vObject.length > 0 : !!vObject;
				}

				return Array.prototype.slice.call(arguments).every(function (oObject) {
					return this.exists(oObject);
				});
			}
		};

	QUnit.module("Section without sub-section");

	QUnit.test("Section without sub-section simulation", async function(assert) {

		// Arrange
		var oMainSection = new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							blocks: [new Text({text: "test"})]
						}),
						new ObjectPageSubSection({
							blocks: [new Text({text: "text"})]
						})
					]
			}),
			oObjectPageLayout = new ObjectPageLayout({
				sections: oMainSection
			}),
			sClosestID, done = assert.async();

		// Assert
		assert.expect(1); // The test is expected to have one assert
		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {

			oMainSection.removeAllSubSections();
			sClosestID = oObjectPageLayout._getClosestScrolledSectionBaseId(0, "iPageHeight is not defined", true);

			// Assert
			assert.strictEqual(sClosestID, oMainSection.sId, "check if _getClosestScrolledSectionBaseId returns the correct value");

			// Cleanup
			oObjectPageLayout.destroy();
			done();
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.module("IconTabBar is initially enabled", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Using UseIconTabBar via Control settings", function (assert) {
		assert.strictEqual(this.oObjectPage.getUseIconTabBar(), true);
	});
	QUnit.test("Using UseIconTabBar does not disable the use of an AnchorBar", function (assert) {
		assert.strictEqual(this.oObjectPage.getShowAnchorBar(), true);
	});

	QUnit.module("IconTabBar is initially not enabled", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPage();
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("The default value of UseIconTabBar", function (assert) {
		assert.strictEqual(this.oObjectPage.getUseIconTabBar(), false, "is correctly set to false");
	});

	QUnit.test("test UseIconTabBar APIs", async function(assert) {
		// Act
		this.oObjectPage.setUseIconTabBar(false);
		await nextUIUpdate();

		// Assert
		assert.ok(!this.oObjectPage.getUseIconTabBar(), false);
		assert.notOk(this.oObjectPage.$().hasClass("sapUxAPObjectPageLayoutIconTabBar"),
			"'sapUxAPObjectPageLayoutIconTabBar' is not applied when OPL is not in iconTabBar mode");

		// Act
		this.oObjectPage.setUseIconTabBar(true);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oObjectPage.$().hasClass("sapUxAPObjectPageLayoutIconTabBar"),
			"'sapUxAPObjectPageLayoutIconTabBar' is  applied when OPL is in iconTabBar mode");
		assert.ok(this.oObjectPage.getUseIconTabBar(), true);
	});

	QUnit.module("IconTabBar enabled with one visible section", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPageLayoutWithOneVisibleSection();
			this.oObjectPage.setUseIconTabBar(true);
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Object Page shows first section title when only one section is visible", function (assert) {
		//Arrange
		var oFirstSection = this.oObjectPage.getSections()[0],
			oSubSection = oFirstSection.getSubSections()[0];

		oFirstSection.setShowTitle(true);

		//Assert
		assert.ok(oFirstSection.$().find(".sapUxAPObjectPageSectionHeader").hasClass("sapUxAPObjectPageSectionHeaderHidden"),
			"Header container of Section is not visible in the DOM");
		assert.ok(oFirstSection.$().hasClass("sapUxAPObjectPageSectionNoTitle"), "CSS class for no title shown is there");
		assert.ok(oSubSection.$().find(".sapUxAPObjectPageSubSectionTitle ").length > 0, "Title container of SubSection is visible in the DOM");

	});

	QUnit.module("test scrollToSection API", {
		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Calling scrollToSection when OPL is not rendered should do nothing", function (assert) {
		assert.ok(Log, "Log module should be available");

		var oObjectPage = this.oObjectPage,
			oFirstSection = oObjectPage.getSections()[0],
			oLoggerSpy = this.spy(Log, "warning"),
			oComputeScrollPositionSpy = this.spy(oObjectPage, "_computeScrollPosition");

		assert.ok(!oObjectPage.getDomRef(), "ObjectPage is not rendered");

		oObjectPage.scrollToSection(oFirstSection.getId());

		assert.ok(!oComputeScrollPositionSpy.called, "Compute scroll position not called when OPL is not rendered");

		assert.ok(oLoggerSpy.calledWith("scrollToSection can only be used after the ObjectPage is rendered", oObjectPage), "Warning message is logged");
	});

	QUnit.test("Calling scrollToSection before its onAfterRendring hook should not throw error", async function (assert) {
		var oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5),
			oAnchorBar,
			oFirstSection = oObjectPage.getSections()[0];

		oObjectPage.addEventDelegate({
			onBeforeRendering: function() {
				oAnchorBar = oObjectPage.getAggregation("_anchorBar");
				oAnchorBar.addEventDelegate({
					onAfterRendering: function() {
						assert.strictEqual(oObjectPage._bDomReady, false, "ObjectPage DOM is not ready");
						try {
							oObjectPage.scrollToSection(oFirstSection.getId());
							assert.ok(true, "No error is thrown");
						} catch (e) {
							assert.notOk(e, "Error should be thrown");
						}
						oAnchorBar.removeEventDelegate(this);
					}
				});
				oObjectPage.removeEventDelegate(this);
			}
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("Use IconTabBar with no sections", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("test IconTabBar is empty", function (assert) {
		assert.strictEqual(this.oObjectPage._oABHelper._getAnchorBar().getItems().length, 0, 'The IconTabBar content aggregation is empty');
	});

	QUnit.test("test IconTabBar shoud not be created when 0 section is provided", function (assert) {
		var expectedNumberOfSections = 0;

		assert.strictEqual(this.oObjectPage.getSections().length, expectedNumberOfSections, 'The ObjectPage has ' +
		expectedNumberOfSections + ' sections');
		assert.ok(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation").length, "anchor bar when no sections");
		assert.strictEqual(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation *").length, 0, "empty anchor bar when no sections");
	});

	QUnit.module("Use IconTabBar with one section", {
		beforeEach: async function () {
			this.NUMBER_OF_SECTIONS = 1;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("test empty anchorBar when one section is provided", function (assert) {
		var expectedNumberOfSections = this.NUMBER_OF_SECTIONS;

		// one section only
		assert.strictEqual(this.oObjectPage.getSections().length, expectedNumberOfSections, 'The ObjectPage has ' +
		expectedNumberOfSections + ' sections');

		//empty anchor bar
		assert.ok(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation").length, "anchor bar when no sections");
		assert.strictEqual(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation *").length, 0, "empty anchor bar when no sections");
		assert.ok(this.oObjectPage.$().find(".sapUxAPObjectPageContainerNoBar").length, "Empty bar when single section");
	});

	QUnit.test("test the section is rendered", function (assert) {
		//section is rendered
		var sSectionId = this.oObjectPage.getSections()[0].getId();
		assert.ok(this.oObjectPage.$().find("#" + sSectionId + " *").length, "section is rendered");
	});

	QUnit.module("test selectedSection association API", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			this.oSecondSection = this.oObjectPage.getSections()[1];
			this.oThirdSection = this.oObjectPage.getSections()[2];
			this.oObjectPage.setSelectedSection(this.oSecondSection.getId());
			this.iLoadingDelay = 1000;

		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oSecondSection = null;
			this.oThirdSection = null;
			this.iLoadingDelay = 0;
		}
	});

	QUnit.test("test user defined selected section", async function (assert) {
		var oObjectPage = this.oObjectPage,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("test selected section when hiding another one", async function (assert) {
		/* Arrange */
		var oObjectPage = this.oObjectPage,
			oExpected = {
				oSelectedSection: this.oSecondSection,
				sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle()
			},
			done = assert.async();

		/* Act: Hide the third section.
		 /* which used to cause a failure, see BCP: 1770148914 */
		this.oThirdSection.setVisible(false);

		setTimeout(function () {
			/* Assert:
			 /* The ObjectPage adjusts its layout, */
			/* but the selected section should remain the same. */
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("test selected section when removing another one", async function (assert) {
		/* Arrange */
		var oObjectPage = this.oObjectPage,
			iNonIntegerHeaderContentHeight = 99.7, // header content height should not be an integer
			oHeaderContent = new GenericDiv({
				height: iNonIntegerHeaderContentHeight + "px",
				margin: "0", // to suppress any margin imposed by the OP laoyut
				padding: "0", // to suppress any padding imposed by the OP layout
				text: "some content"}),
			oExpected = {
				oSelectedSection: this.oSecondSection,
				sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle()
			},
			done = assert.async(),
			_pxToNumber = function (sSizeToConvert) {
				return (sSizeToConvert.substring(0, (sSizeToConvert.length - 2)) ) * 1;
			};

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.addHeaderContent(oHeaderContent);
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function() {
				var oHeaderContentDOM = oObjectPage._getHeaderContent().getDomRef(),
				sPaddingTop = _pxToNumber(window.getComputedStyle(oHeaderContentDOM, null).getPropertyValue('padding-top')),
				sPaddingBottom = _pxToNumber(window.getComputedStyle(oHeaderContentDOM, null).getPropertyValue('padding-bottom'));

				// assert that the page internally rounds (ceils) the header content heights
				assert.notEqual(oObjectPage.iHeaderContentHeight, iNonIntegerHeaderContentHeight, "cached headerContent height is rounded");
				assert.strictEqual(oObjectPage.iHeaderContentHeight, 100 + sPaddingTop + sPaddingBottom, "cached headerContent height is ceiled");

				// Act: make an action that causes the page to have (1) first visible section selected but (2) header snapped
				oObjectPage.removeSection(0);

				// as the above causes invalidation, hook to onAfterRendering to check resulting state:
				oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
					setTimeout(function () {
						sectionIsSelected(oObjectPage, assert, oExpected);
						assert.ok(isTolerableDifference(oObjectPage._$opWrapper.scrollTop(), oObjectPage.iHeaderContentHeight, 1), "top section is selected");
						assert.strictEqual(oObjectPage._bStickyAnchorBar, true, "anchor bar is snapped");
						assert.strictEqual(oObjectPage._bHeaderExpanded, false, "header is snapped");

						oObjectPage._onScroll({target: {scrollTop: iNonIntegerHeaderContentHeight + sPaddingTop + sPaddingBottom}}); // scrollEnablement kicks in to restore last saved Y position, which is not rounded (ceiled)
						assert.strictEqual(oObjectPage._bStickyAnchorBar, true, "anchor bar is still snapped");
						assert.strictEqual(oObjectPage._bHeaderExpanded, false, "header is still snapped");
						done();
					}, 100);
				});
			}, 1000);
		});
		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("unset selected section", async function (assert) {
		// Arrange
		var oObjectPage = this.oObjectPage,
			oFirstSection = this.oObjectPage.getSections()[0],
			oSecondSection = this.oSecondSection,
			oExpected,
			oAnchorBarRebuildSpy,
			oSubSectionVisibilityEventSpy,
			oSectionPreloadSpy,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		setTimeout(function () {

			// initially, the second section is selected (from the module setup)
			oExpected = {
				oSelectedSection: oSecondSection,
				sSelectedTitle: oSecondSection.getSubSections()[0].getTitle()
			};

			// Assert
			sectionIsSelected(oObjectPage, assert, oExpected);

			oAnchorBarRebuildSpy = this.spy(oObjectPage._oABHelper, "_buildAnchorBar");
			oSubSectionVisibilityEventSpy = this.spy(oObjectPage, "_checkSubSectionVisibilityChange");
			oSectionPreloadSpy = this.spy(oObjectPage, "_preloadSectionsOnBeforeScroll");

			// Act: unset the currently selected section
			oObjectPage.setSelectedSection(null);

			// Check: the selection moved to the first visible section
			oExpected = {
				oSelectedSection: oFirstSection,
				sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
			};

			// Assert
			sectionIsSelected(oObjectPage, assert, oExpected);
			assert.ok(oAnchorBarRebuildSpy.notCalled, "AnchorBar is not rebuilt in IconTabBar mode when setSelectedSection is called with null");
			assert.ok(oSubSectionVisibilityEventSpy.calledOnce, "_checkSubSectionVisibilityChange is called once");
			assert.ok(oSectionPreloadSpy.calledOnce, "Section is loaded");

			// Clean up
			done();
		}.bind(this), this.iLoadingDelay);

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("unset selected section resets expanded state", async function (assert) {
		// Arrange
		var oObjectPage = this.oObjectPage,
			oFirstSection = this.oObjectPage.getSections()[0],
			oSecondSection = this.oSecondSection,
			oExpected,
			oAnchorBarRebuildSpy,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		// add header content
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function () {

				// initially, the second section is selected (from the module setup)
				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getSubSections()[0].getTitle()
				};

				// Assert
				sectionIsSelected(oObjectPage, assert, oExpected);
				assert.equal(oObjectPage._bHeaderExpanded, false, "Header is snapped");

				oAnchorBarRebuildSpy = this.spy(oObjectPage._oABHelper, "_buildAnchorBar");

				// Act: unset the currently selected section
				oObjectPage.setSelectedSection(null);

				// Check: the selection moved to the first visible section
				oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
				};

				setTimeout(function () {
					// Assert
					sectionIsSelected(oObjectPage, assert, oExpected);
					assert.equal(oObjectPage._bHeaderExpanded, true, "Header is expnded");
					assert.ok(oAnchorBarRebuildSpy.notCalled, "AnchorBar is not rebuilt when setSelectedSection is called with null");

					// Clean up
					done();
				}, 0);
			}.bind(this), this.iLoadingDelay);
		}.bind(this));

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("unset selected section when header always in title area", async function (assert) {
		var oObjectPage = this.oObjectPage,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		assert.expect(2);

		// add header content
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());
		oObjectPage.setIsHeaderContentAlwaysExpanded(true);

		// ensure desktop mode
		helpers.toDesktopMode(oObjectPage);
		this.stub(lib.Utilities, "isPhoneScenario").returns(false);
		this.stub(lib.Utilities, "isTabletScenario").returns(false);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Act: unset the currently selected section
			oObjectPage.setSelectedSection(null);

			// Check: the header is still expanded in the title
			setTimeout(function() {
				// Assert
				assert.equal(oObjectPage._bHeaderExpanded, true, "Header is expanded");
				assert.equal(oObjectPage._bHeaderInTitleArea, true, "Header is still in the title area");

				// Clean up
				done();
			}, 0);
		});

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("unset selected section of hidden page", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = this.oObjectPage.getSections()[0],
			oSecondSection = this.oSecondSection,
			oSpy = this.spy(oObjectPage, "_scrollTo"),
			sOrigDisplay,
			oExpected,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());

		// add header content
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
			// initially, the second section is selected (from the module setup)
			oExpected = {
				oSelectedSection: oSecondSection,
				sSelectedTitle: oSecondSection.getSubSections()[0].getTitle()
			};
			sectionIsSelected(oObjectPage, assert, oExpected);
			assert.equal(oObjectPage._bHeaderExpanded, false, "Header is snapped");
			sOrigDisplay = oObjectPage.getDomRef().style.display;

			// Act
			oObjectPage.getDomRef().style.display = "none";
			oSpy.resetHistory();
			oObjectPage.setSelectedSection(null);

			oObjectPage.getDomRef().style.display = sOrigDisplay;
			oObjectPage._onUpdateScreenSize({ // mock resize handler call after size restored
				size: { width: 1000, height: 1000 },
				oldSize: { width: 0, height: 0 }
			});

			setTimeout(function() {
				assert.ok(oSpy.calledWith(0, 0), "page is scrolled to top");
				// synchronously call the scroll listener to save adding a timeout in the test
				oObjectPage._onScroll({target: {scrollTop: 0}});
				// Check: the selection moved to the first visible section
				oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
				};
				sectionIsSelected(oObjectPage, assert, oExpected);
				assert.strictEqual(oObjectPage._bHeaderExpanded, true, "Header is expnded");

				// cleanup
				oObjectPage.destroy();
				done();
			}, oObjectPage._getDOMCalculationDelay());

		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("unset selected section before layout adjusted", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = this.oObjectPage.getSections()[0],
			oExpected,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		// add header content
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());

		oFirstSection.setVisible(false);

		var oDelegate = {
			onAfterRendering: function () {
				oObjectPage.removeEventDelegate(oDelegate);

				// Act: change first section to *make it the first visible* AND unset selectedSection
				oFirstSection.setVisible(true);
				oObjectPage.setSelectedSection(null);

				setTimeout(function() {
					// Check: the selection moved to the first visible section
					oExpected = {
						oSelectedSection: oFirstSection,
						sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
					};
					sectionIsSelected(oObjectPage, assert, oExpected);
					assert.equal(oObjectPage._bHeaderExpanded, true, "Header is expnded");
					assert.equal(oObjectPage._$opWrapper.scrollTop(), 0, "page is scrolled to top");
					done();
				}, 500);
			}
		};

		oObjectPage.addEventDelegate(oDelegate);

		await helpers.renderObject(oObjectPage);
	});


	QUnit.test("call setSelectedSection(null) when the first visible section is already selected", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = this.oObjectPage.getSections()[0],
			oSecondSection = this.oObjectPage.getSections()[1],
			oExpected,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		// add header content
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());

		oFirstSection.setVisible(false);

		var oDelegate = {
			onAfterRendering: function () {
				oObjectPage.removeEventDelegate(oDelegate);

				setTimeout(function() {
					// Act: change first section to *make it the first visible* AND unset selectedSection
					oObjectPage.setSelectedSection(null);

					setTimeout(function() {
						// Check: the selection moved to the first visible section
						oExpected = {
							oSelectedSection: oSecondSection,
							sSelectedTitle: oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
						};
						sectionIsSelected(oObjectPage, assert, oExpected);
						assert.equal(oObjectPage._bHeaderExpanded, true, "Header is expanded");
						assert.equal(oObjectPage._$opWrapper.scrollTop(), 0, "page is scrolled to top");
						done();
					}, 500);
				}, 500);
			}
		};

		oObjectPage.addEventDelegate(oDelegate);

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("reset setSelectedSection when single visible section", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oSubSection = oFactory.getSubSection(1, oFactory.getBlocks()),
			oSection = oFactory.getSection(1, null, oSubSection);

		oObjectPage.setUseIconTabBar(false);

		// single section only
		oObjectPage.removeAllSections();
		oObjectPage.addSection(oSection);

		await helpers.renderObject(oObjectPage);
		oObjectPage.setSelectedSection(null);

		assert.strictEqual(oObjectPage.getSelectedSection(), oSection.getId(), "selected section is correct");
	});


	QUnit.test("scroll to selected section on rerender", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oSecondSection = this.oObjectPage.getSections()[1],
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		assert.expect(2);

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setSelectedSection(oSecondSection);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			// assert state before second rendering
			assert.ok(oObjectPage._$opWrapper.get(0).scrollTop > 0, "selected section is bellow scrollTop");

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				// assert state after second rendering
				assert.ok(oObjectPage._$opWrapper.get(0).scrollTop > 0, "selected section is bellow scrollTop");
				done();
			});

			// act: rerender
			oObjectPage.invalidate();
			await nextUIUpdate();
		}));

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("scrollEnablement obtains container ref onAfterRendering", async function (assert) {
		var oObjectPage = this.oObjectPage,
			done = assert.async(),  //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)
			vOriginalHeight = jQuery("#qunit-fixture").height();

		// ensure page can be scrolled
		jQuery("#qunit-fixture").height("200"); // container small enough
		oObjectPage.setUseIconTabBar(false); // content can be scrolled across sections

		assert.expect(3);

		var oDelegate = {
			onAfterRendering: function () {
				assert.ok(oObjectPage._oScroller._$Container, "scroller has container referefnce");
				assert.strictEqual(oObjectPage._oScroller._$Container.get(0), oObjectPage._$opWrapper.get(0), "scroller has correct container reference");

				oObjectPage._oScroller.scrollTo(0, 10);
				assert.strictEqual(Math.round(oObjectPage._$opWrapper.scrollTop()), 10, "scroller can correctly scroll after we have externally provided the container reference");

				oObjectPage.removeEventDelegate(oDelegate);
				jQuery("#qunit-fixture").height(vOriginalHeight); // restore the original height
				done();
			}
		};
		oObjectPage.addEventDelegate(oDelegate);

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("not scrolled to selected section when navigation is canceled", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oSecondSection = this.oObjectPage.getSections()[1],
			fnDone = assert.async(),
			oSpy = this.spy(oObjectPage, "scrollToSection");

		assert.expect(1);

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.attachBeforeNavigate(function (oEvent) {
			oEvent.preventDefault();
		});

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSpy.reset();

			// Act
			oObjectPage.onAnchorBarTabPress(oSecondSection.getId());

			// Assert
			assert.ok(oSpy.notCalled, "scroll to selected section is prevented");

			fnDone();
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("Resizing", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, false);
			this.iLoadingDelay = 2000;
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.iLoadingDelay = 0;
		}
	});

	QUnit.test("adjust selected section", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oHhtmBlock,
			oFirstSection = oObjectPage.getSections()[0],
			oSecondSection = oObjectPage.getSections()[1],
			oBlockDomElement,
			iScrollTopBefore,
			iScrollTopAfter,
			iBlockHeightBefore,
			iBlockHeightAfter,
			iHeightDiff = 40,
			oAdjustLayoutSpy = this.spy(oObjectPage, "_requestAdjustLayout"),
			oUpdateSelectionSpy = this.spy(oObjectPage, "_updateSelectionOnScroll"),
			done = assert.async();

		// setup step1: add content with defined height
		oHhtmBlock = new GenericDiv("b1", {height: "300px"}).addStyleClass("innerDiv");
		oFirstSection.getSubSections()[0].addBlock(oHhtmBlock);

		// setup step2
		oObjectPage.setSelectedSection(oSecondSection.getId());

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {

			oBlockDomElement = oHhtmBlock.getDomRef();

			iBlockHeightBefore = oBlockDomElement.offsetHeight;
			iScrollTopBefore = oObjectPage._$opWrapper.scrollTop();

			iBlockHeightAfter = iBlockHeightBefore - iHeightDiff;
			iScrollTopAfter = iScrollTopBefore - iHeightDiff;

			oAdjustLayoutSpy.resetHistory();
			oUpdateSelectionSpy.resetHistory();


			// Act: change height without invalidating any control => on the the resize handler will be responsible for re-adjusting the selection
			oBlockDomElement.style.height = iBlockHeightAfter + "px";

			// mock the (1) scroll and (2) resize listeners that will be fired
			// as a result of the resize of the content:
			// (1) call the scroll listener synchronously to speed-up the test
			oObjectPage._onScroll({target: { scrollTop:  iScrollTopAfter }});
			// (2) call the resize listener synchronously to speed up the test
			oObjectPage._onUpdateContentSize({ size: {}, oldSize: { height: 600, width: 400} });

			// Check
			assert.equal(oAdjustLayoutSpy.callCount, 1, "layout adjustment is called");
			assert.ok(oUpdateSelectionSpy.called, "update selection is called");
			assert.equal(oObjectPage.getSelectedSection(), oSecondSection.getId(), "selected section is correct");
			done();
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("ObjectPage resize handler is regestered in onAfterRendering", async function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			done = assert.async(),
			oDelegate = { onAfterRendering: function() {
					oObjectPage.removeEventDelegate(oDelegate);
					// assert
					assert.ok(oObjectPage._iResizeId !== null, "Resize handler is registered in onAfterRendering function");
					done();
				}};

		assert.expect(2);

		// assert
		assert.strictEqual(oObjectPage._iResizeId, null, "Resize handler is not registered before onAfterRendering function");

		// act
		oObjectPage.addEventDelegate(oDelegate);
		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("ObjectPage DOM element resize listeners deregistered on exit", async function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			oSpy1 = this.spy(oObjectPage, "_deregisterScreenSizeListener"),
			oSpy2 = this.spy(oObjectPage, "_deregisterTitleSizeListener");

		await helpers.renderObject(oObjectPage);

		// act
		oSpy1.reset();
		oSpy2.reset();
		oObjectPage.destroy();

		// assert
		assert.strictEqual(oSpy1.callCount, 1, "screen size listener is deregistered");
		assert.strictEqual(oSpy2.callCount, 1, "title-area size listener is deregistered");
	});

	QUnit.test("height metrics are updated on content-resize", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oHtmlBlock,
			oFirstSection = oObjectPage.getSections()[0],
			oSpy = this.spy(oObjectPage, "_adjustHeaderHeights"),
			done = assert.async();

		assert.expect(1);

		// setup step1: add content with defined height
		oHtmlBlock = new GenericDiv("b1", {height: "300px"}).addStyleClass("innerDiv");
		oFirstSection.getSubSections()[0].addBlock(oHtmlBlock);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Act: change height without invalidating any control
			Element.getElementById("b1").getDomRef().style.height = "250px";
			oSpy.resetHistory();
			oObjectPage._onUpdateContentSize({ size: {}, oldSize: {} });

			assert.equal(oSpy.callCount, 1, "recalculation of heights is called");
			done();
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("media range is updated on-resize", async function (assert) {
		var oObjectPage = this.oObjectPage,
			done = assert.async(),
			iWidth = 0;

		this.stub(oObjectPage, "_getMediaContainerWidth").callsFake(function() {
			return iWidth;
		});

		assert.expect(1);

		oObjectPage.addEventDelegate({
			onAfterRendering: function() {
				oObjectPage.removeEventDelegate(this);
				iWidth = 1024; // change to desktop size
				// invoke the resize listener synchronously to save a timeout
				oObjectPage._onUpdateScreenSize({size: {width: 1024}, oldSize: {}});
				assert.notOk(oObjectPage._bMobileScenario, "media range is updated");
				done();
			}
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("test setSelectedSection functionality");

	QUnit.test("test setSelectedSection with initially empty ObjectPage", function (assert) {
		var oObjectPage = oFactory.getObjectPage(),
			sSectionId = "section1";

		// act
		oObjectPage.setSelectedSection(sSectionId);

		// assert
		assert.strictEqual(oObjectPage.getSelectedSection(), sSectionId, "The given section should be the selected one");

		oObjectPage.destroy();
	});

	QUnit.module("IconTabBar section selection", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.NUMBER_OF_SUB_SECTIONS = 2;
			this.oObjectPage = helpers.generateObjectPageWithSubSectionContent(oFactory, this.NUMBER_OF_SECTIONS, this.NUMBER_OF_SUB_SECTIONS, true);
			this.oFirstSection = this.oObjectPage.getSections()[0];
			this.oSecondSection = this.oObjectPage.getSections()[1];
			this.iLoadingDelay = 500;
			this.oObjectPage.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oFirstSection = null;
			this.oSecondSection = null;
			this.iLoadingDelay = 0;
		}
	});

	function sectionIsSelected(oObjectPage, assert, oExpected) {

		var oAnchorBar = oObjectPage.getAggregation('_anchorBar'),
			sSelectedSectionId = oAnchorBar.getSelectedKey(),
			oSelectedFilter = oAnchorBar.getItems().find((i) => i.getKey() === sSelectedSectionId),
			bExpectedSnapped = oExpected.bSnapped,
			iExpectedScrollTop = oExpected.iScrollTop;

		assert.ok(oSelectedFilter, "anchorBar has selected filter");
		assert.strictEqual(oSelectedFilter.getText(), oExpected.sSelectedTitle, "section is selected in anchorBar");
		assert.strictEqual(oObjectPage.getSelectedSection(), oExpected.oSelectedSection.getId(), "section is selected in objectPage");
		assert.ok(oObjectPage.$().find("#" + oExpected.oSelectedSection.getId() + "*").length, "section is rendered");

		if (bExpectedSnapped !== undefined) {
			assert.strictEqual(oObjectPage._bStickyAnchorBar, bExpectedSnapped, "header snapped state is correct");
		}
		if (iExpectedScrollTop !== undefined) {
			assert.ok(isTolerableDifference(Math.ceil(oObjectPage._$opWrapper[0].scrollTop), Math.floor(iExpectedScrollTop), 1), "scroll position is correct");
		}
	}

	QUnit.test("test first visible section is initially selected", function (assert) {

		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);
				done();
			};
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("scrollTo another section", function (assert) {

		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			bTabsMode = oPage.getUseIconTabBar(),
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oPage.scrollToSection(oSecondSection.getId(), 0, null, true);

				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: !bTabsMode
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("scrollTo another subSection (first subsection)", function (assert) {

		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			bTabsMode = oPage.getUseIconTabBar(),
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oPage.scrollToSection(oSecondSection.getSubSections()[0].getId(), 0, null, true);

				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: !bTabsMode
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("scrollTo another subSection (second subsection)", function (assert) {

		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			oSubSectionToScrollTo = oSecondSection.getSubSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oPage.scrollToSection(oSubSectionToScrollTo.getId(), 0, null, true);

				//check
				setTimeout(function() {

					var iExpectedScrollTop = oPage._oSectionInfo[oSubSectionToScrollTo.getId()].positionTop;

					var oExpected = {
						oSelectedSection: oSecondSection,
						sSelectedTitle: oSecondSection.getTitle(),
						bSnapped: true,
						iScrollTop: iExpectedScrollTop
					};

					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("select another section before rendering completed", function (assert) {
		var oPage = this.oObjectPage,
			oSecondSection = this.oSecondSection,
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle() //subsection is promoted
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};

		//act
		oPage.setSelectedSection(this.oSecondSection.getId());
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("select another section on before page rendering", function (assert) {

		var oPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 3, 2, true),
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle()
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);

					oPage.destroy();//cleanup
					done();
				}, 0);
			};

		oPage.addEventDelegate({onBeforeRendering: function() {
			oPage.setSelectedSection(oSecondSection.getId());
		}});
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
		oPage.placeAt("qunit-fixture");
	});

	QUnit.test("select another section on after page rendering", function (assert) {
		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle()
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};

		oPage.addEventDelegate({onAfterRendering: function() {
			oPage.setSelectedSection(oSecondSection.getId());
		}});
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("select another section after dom rendering completed", function (assert) {
		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oPage.setSelectedSection(oSecondSection.getId());

				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle()
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test hide selectedSection when selectedSection is first", function (assert) {
		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

				//initial state
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);

				// act
				oFirstSection.setVisible(false); /* hide first section */

				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: false
				};

				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 1000);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test hide a subsection of selectedSection when selectedSection is first", function (assert) {
		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			done = assert.async(),
			fnOnDomReady = function() {
				oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

				//initial state
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);

				// act
				oFirstSection.getSubSections()[0].setVisible(false);

				oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getSubSections()[1].getTitle(),
					bSnapped: false
				};

				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 1000);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test hide all subsections of selectedSection when selectedSection is first", function (assert) {
		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

				//initial state
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);

				// act
				//hide all subsections => no content left to display
				oFirstSection.getSubSections()[0].setVisible(false);
				oFirstSection.getSubSections()[1].setVisible(false);

				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: false
				};

				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 1000);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test remove selected section", async function(assert) {

		var oObjectPage = this.oObjectPage,
			iLoadingDelay = 500,
			done = assert.async();

		//act
		oObjectPage.removeSection(this.oFirstSection);
		await nextUIUpdate();

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getTitle() //subsection is promoted
		};

		//check
		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, iLoadingDelay);
	});

	QUnit.test("test rename selected section", async function(assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = this.oFirstSection,
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: "Updated Title"
				};

				//check
				sectionIsSelected(oObjectPage, assert, oExpected);
				done();
			};

		//act
		this.oFirstSection.setTitle("Updated Title");
		await nextUIUpdate();

		oObjectPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("section modified during layout calculation", function (assert) {

		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			oThirdSection = oPage.getSections()[2],
			bTabsMode = oPage.getUseIconTabBar(),
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oFirstSection.setVisible(false); // will trigger async request to adjust layout
				oPage.setSelectedSection(oThirdSection.getId());

				var oExpected = {
					oSelectedSection: oThirdSection,
					sSelectedTitle: oThirdSection.getTitle(),
					bSnapped: !bTabsMode
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("_isClosestScrolledSection", function (assert) {

		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			oThirdSection = oPage.getSections()[2],
			done = assert.async(),
			fnOnDomReady = function() {

				//check
				assert.strictEqual(oPage._isClosestScrolledSection(oFirstSection.getId()), true, "first section is currently scrolled");

				oPage.setSelectedSection(oThirdSection.getId());

				//check
				setTimeout(function() {
					assert.strictEqual(oPage._isClosestScrolledSection(oThirdSection.getId()), true, "third section is currently scrolled");
					done();
				}, 0);
			};
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("setSelectedSection to subsection", function (assert) {

		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			oSecondSectionSecondSubSection = oSecondSection.getSubSections()[1],
			done = assert.async(),
			fnOnDomReady = async function() {
				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);
				oPage.invalidate();
				await nextUIUpdate();
				sectionIsSelected(oPage, assert, oExpected);
				done();
			};
		oPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(fnOnDomReady));
		oPage.setSelectedSection(oSecondSectionSecondSubSection);
	});

	QUnit.module("ObjectPage API: sectionTitleLevel");

	QUnit.test("test sections/subsections aria-level when sectionTitleLevel is TitleLevel.Auto", async function (assert) {
		var oObjectPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 2, 2),
			oSection,
			$sectionHeaderTitle,
			oSubSection,
			$subSectionTitle,
			oFirstSection,
			$firstSectionSubSectionTitle,
			sTitleLevel3 = "h3",
			sTitleLevel4 = "h4";

		await helpers.renderObject(oObjectPage);

		// subsection titles inside the first section should have aria-level 4 because the section title is no longer hidden
		oFirstSection = oObjectPage.getSections()[0];
		$firstSectionSubSectionTitle = oFirstSection.getSubSections()[0].$("headerTitle");

		// get the second section to test the aria-level of the section title and the subsection title
		oSection = oObjectPage.getSections()[1];
		$sectionHeaderTitle = oSection.$("title");
		oSubSection = oSection.getSubSections()[0];
		$subSectionTitle = oSubSection.$("headerTitle");

		assert.equal($sectionHeaderTitle[0].tagName.toLowerCase(), sTitleLevel3, "The section has the correct aria-level");
		assert.equal($firstSectionSubSectionTitle[0].tagName.toLowerCase(), sTitleLevel4, "The subSection in the first section has the correct aria-level");
		assert.equal($subSectionTitle[0].tagName.toLowerCase(), sTitleLevel4, "The subSection has the correct aria-level");
	});

	QUnit.test("test sections/subsections aria-level when sectionTitleLevel is not TitleLevel.Auto", async function(assert) {
		var oObjectPageSectionTitleLevel = TitleLevel.H1,
			oObjectPageMinimumSectionTitleLevel = TitleLevel.H6,
			oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(oObjectPageSectionTitleLevel),
			oSection,
			$sectionHeaderTitle,
			oSubSection,
			$subSectionTitle,
			sSectionExpectedAriaLevel = "h1", // equal to the  sectionTitleLevel(H1)
			sSubSectionExpectedAriaLevel = "h2", // lower than sectionTitleLevel(H1) by 1
			sMinimumAriaLevel = "h6";

		await helpers.renderObject(oObjectPage);

		oSection = oObjectPage.getSections()[0];
		$sectionHeaderTitle = oSection.$("title");
		oSubSection = oSection.getSubSections()[0];
		$subSectionTitle = oSubSection.$("headerTitle");

		assert.equal($sectionHeaderTitle[0].tagName.toLowerCase(), sSectionExpectedAriaLevel, "The section has the correct aria-level");
		assert.equal($subSectionTitle[0].tagName.toLowerCase(), sSubSectionExpectedAriaLevel, "The subSection has the correct aria-level");

		oObjectPage.setSectionTitleLevel(oObjectPageMinimumSectionTitleLevel);
		await nextUIUpdate();
		$sectionHeaderTitle = oSection.$("title");
		$subSectionTitle = oSubSection.$("headerTitle");

		assert.equal($sectionHeaderTitle[0].tagName.toLowerCase(), sMinimumAriaLevel, "The section has the correct aria-level");
		assert.equal($subSectionTitle[0].tagName.toLowerCase(), sMinimumAriaLevel, "The subSection has the correct aria-level");

	});

	QUnit.test("test sections/subsections aria-level when sectionTitleLevel and titleLevel are defined", async function (assert) {
		var oObjectPageSectionTitleLevel = TitleLevel.H4,
			oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(oObjectPageSectionTitleLevel),
			aSections = oObjectPage.getSections(),
			oSection = aSections[0],
			aSubSections = oSection.getSubSections(),
			oFirstSubSection = aSubSections[0],
			oSecondSubSection  = aSubSections[1],
			oThirdSubSection = aSubSections[2],
			$firstSubSectionTitle,
			$secondSubSectionTitle,
			$thirdSubSectionTitle,
			sSubSectionDefaultAriaLevel = "h5", // lower than sectionTitleLevel(H4) by 1
			sFirstSubSectionExpectedAriaLevel = "h1", // titleLevel(H1) is set explicitly
			sSecondSubSectionExpectedAriaLevel = "h2"; // titleLevel(H2) is set explicitly

		oFirstSubSection.setTitleLevel(TitleLevel.H1);
		oSecondSubSection.setTitleLevel(TitleLevel.H2);

		await helpers.renderObject(oObjectPage);
		$firstSubSectionTitle = oFirstSubSection.$("headerTitle");
		$secondSubSectionTitle = oSecondSubSection.$("headerTitle");
		$thirdSubSectionTitle = oThirdSubSection.$("headerTitle");

		assert.equal($firstSubSectionTitle[0].tagName.toLowerCase(), sFirstSubSectionExpectedAriaLevel,
			"SubSection aria-level " + sFirstSubSectionExpectedAriaLevel + ", although op sectionTitleLevel is " + oObjectPageSectionTitleLevel);

		assert.equal($secondSubSectionTitle[0].tagName.toLowerCase(), sSecondSubSectionExpectedAriaLevel,
			"SubSection aria-level " + sSecondSubSectionExpectedAriaLevel + ", although op sectionTitleLevel is " + oObjectPageSectionTitleLevel);

		assert.equal($thirdSubSectionTitle[0].tagName.toLowerCase(), sSubSectionDefaultAriaLevel,
			"SubSection aria-level " + sSubSectionDefaultAriaLevel + ", lower than sectionTitleLevel:" + oObjectPageSectionTitleLevel + " by 1");
	});

	QUnit.module("ObjectPage API: sectionTitleLevel - private methods");

	QUnit.test("test _determineSectionBaseInternalTitleLevel and _shouldApplySectionTitleLevel", async function (assert) {
		var oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(TitleLevel.H2),
			oSection = oObjectPage.getSections()[0],
			aSubSections = oSection.getSubSections(),
			oFirstSubSection = aSubSections[0],
			oThirdSubSection = aSubSections[2];

		oFirstSubSection.setTitleLevel(TitleLevel.H1);
		await helpers.renderObject(oObjectPage);

		assert.equal(oObjectPage._shouldApplySectionTitleLevel(oFirstSubSection), false,
			"OP should not apply sectionTitleLevel as the subSection has titleLevel, explicitly defined and different from TitleLevel.Auto: " + oFirstSubSection.getTitleLevel());

		assert.equal(oObjectPage._shouldApplySectionTitleLevel(oThirdSubSection), true,
			"OP should apply sectionTitleLevel as the subSection has no titleLevel, explicitly defined");
		assert.equal(oObjectPage._determineSectionBaseInternalTitleLevel(oThirdSubSection), TitleLevel.H3,
			"SubSection internal titleLevel is: " + TitleLevel.H3 + ", lower than sectionTitleLevel:" + oObjectPage.getSectionTitleLevel() + " by 1");
	});

	QUnit.test("test _getNextTitleLevelEntry", function (assert) {
		var sCurrentTitleLevel = TitleLevel.H1;

		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), TitleLevel.H2,
			"Correct, next TitleLevel is: " + TitleLevel.H2 + " one level lower than: " + sCurrentTitleLevel);

		sCurrentTitleLevel = TitleLevel.H4;
		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), TitleLevel.H5,
			"Correct, next TitleLevel is: " + TitleLevel.H5 + " one level lower than: " + sCurrentTitleLevel);

		sCurrentTitleLevel = TitleLevel.H6;
		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), TitleLevel.H6,
			"Correct, starting from the last entry should return the last entry itself: " + sCurrentTitleLevel);

		sCurrentTitleLevel = TitleLevel.H7;
		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), TitleLevel.Auto,
			"Correct, if the provided TitleLevel is not valid, TitleLevel.Auto should be returned " + TitleLevel.Auto);
	});

	QUnit.module("ObjectPage API: AnchorBar", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "objectPageViewSample",
				viewName: "view.UxAP-77_ObjectPageSample"
			}).then(async function(oView) {
				this.oSampleView = oView;
				this.appControl = new App();
				this.appControl.addPage(this.oSampleView);
				this.appControl.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.appControl.destroy();
			this.oSampleView.destroy();
		}
	});

	QUnit.test("test AnchorBar not rendering using ShowAnchorBar within XMLView", async function(assert) {
		var oObjectPage = this.oSampleView.byId("objectPage13");

		oObjectPage.setShowAnchorBar(false);
		await nextUIUpdate();

		assert.equal(oObjectPage.getShowAnchorBar(), false);
		assert.strictEqual(oObjectPage.$().find(".sapUxAPAnchorBar").length, 0, "AnchorBar is not rendered");
	});

	QUnit.test("test AnchorBar rendering using ShowAnchorBar within XMLView", async function(assert) {
		var oObjectPage = this.oSampleView.byId("objectPage13");

		oObjectPage.setShowAnchorBar(true);
		await nextUIUpdate();

		assert.equal(oObjectPage.getShowAnchorBar(), true);
		assert.equal(checkObjectExists(".sapUxAPObjectPageNavigation .sapMITH"), true);
	});

	QUnit.test("test AnchorBar showPopover setting through ObjectPageLayout", async function(assert) {
		var oObjectPage = this.oSampleView.byId("objectPage13"),
			oAnchorBar =  oObjectPage.getAggregation("_anchorBar"),
			oSectionButton = oAnchorBar.getItems()[0];

		assert.ok(oSectionButton.getDomRef().querySelector(".sapMITBFilterExpandIcon"), "Drop-down icon in AnchorBar button is shown initially");

		oObjectPage.setShowAnchorBarPopover(false);
		await nextUIUpdate();
		oSectionButton = oAnchorBar.getItems()[0];

		assert.notOk(oSectionButton.getDomRef().querySelector(".sapMITBFilterExpandIcon"), "Drop-down icon in AnchorBar button is not shown");
	});

	QUnit.test("test AnchorBar menu items IDs build correctly", async function(assert) {
		assert.expect(1);
		var done = assert.async(),
			sIds = [],
			oPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 5, 2),
			aSections,
			oAnchorBar,
			oMenuItems,
			aSubSections,
			bAllIdsMatched = true,
			fnOnDomReady = function () {
				aSections = oPage.getSections() || [];
				oAnchorBar = oPage._oABHelper._getAnchorBar();

				// we store the expected subsection MenuItems IDs
				aSections.forEach(function (oSection, index) {
					aSubSections = oSection.getSubSections() || [];

					// second Level (subsections)
					aSubSections.forEach(function (oSubSection) {
						sIds.push(oAnchorBar.getId() + "-" + oSubSection.getId() + "-anchor");
					});
				});

				// Check MenuItems IDs if match stored IDs
				oAnchorBar.getItems().forEach(function (oAggregation) {
					if (oAggregation.getMenu) {
						oMenuItems = oAggregation.getMenu().getItems();
						oMenuItems.forEach(function (item) {
							if (sIds.indexOf(item.getId()) < 0) {
								bAllIdsMatched = false;
								return;
							}
						});
					}
				});

				// Assert
				assert.equal(bAllIdsMatched, true, "All AnchorBar MenuItems are with correct IDs");
				oPage.destroy();
				done();
			};

		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		oPage.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("test AnchorBar focus section synchronously and immediate after anchor press to prevent loss of focus when header is snapping", async function(assert) {
		assert.expect(1);
		// Arrange
		var done = assert.async(),
			iSectionCount = 3,
			iSubSectionCount = 1,
			oPage = helpers.generateObjectPageWithSubSectionContent(oFactory, iSectionCount, iSubSectionCount),
			oABHelper = oPage._oABHelper,
			oAnchorBar = oABHelper._getAnchorBar(),
			oLastSectionButton,
			oLastSection = oPage.getSections()[iSectionCount - 1],
			fnOnDomReady = function () {
				// Arrange
				oLastSectionButton = oAnchorBar.getItems()[iSectionCount - 1];
				// Act
				oAnchorBar.fireSelect({
					key: oLastSectionButton.getKey()
				});

				// Assert
				assert.strictEqual(document.activeElement, oLastSection.getDomRef(), "Section is focused synchronously");

				// Clean
				oPage.destroy();
				done();
			};

		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		oPage.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.module("ObjectPage API: ObjectPageHeader", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "objectPageViewSample",
				viewName: "view.UxAP-77_ObjectPageSample"
			}).then(async function(oView) {
				this.oSampleView = oView;
				this.appControl = new App();
				this.appControl.addPage(this.oSampleView);
				this.appControl.placeAt("qunit-fixture");

				await nextUIUpdate();
				this.oObjectPage = this.oSampleView.byId("objectPage13");
				this.oObjectPageClone = this.oObjectPage.clone();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.appControl.destroy();
			this.oSampleView.destroy();

			this.oObjectPage.destroy();
			this.oObjectPageClone.destroy();
		}
	});

	QUnit.test("test ObjectPageHeader for ObjectPageLayout defined into XMLView", async function(assert) {
		var oHeader = this.oObjectPage.getHeaderTitle(),
			oNewHeader;

		assert.ok(oHeader);
		assert.equal(this.oObjectPage.getHeaderContent()[0].getText(), "Personal description");

		this.oObjectPage.destroyHeaderTitle();
		this.oObjectPage.destroyHeaderContent();
		assert.ok(!this.oObjectPage.getHeaderTitle());

		oNewHeader = new ObjectPageHeader(this.oSampleView.createId("newHeader"));
		this.oObjectPage.addHeaderContent(new Text(this.oSampleView.createId("newHeaderText"), {text: "test"}));
		this.oObjectPage.setHeaderTitle(oNewHeader);
		assert.ok(this.oObjectPage.getHeaderTitle());
		assert.equal(this.oObjectPage.getHeaderContent()[0].getText(), "test");

		await nextUIUpdate();

		assert.strictEqual(checkObjectExists("#objectPageViewSample--newHeader"), true);
	});

	QUnit.test("Should not call ObjectPageHeader _toggleFocusableState in non DynamicPageTitle case", function (assert) {

		var oHeader = this.oObjectPage.getHeaderTitle(),
		oHeaderSpy = this.spy(oHeader, "_toggleFocusableState");

		// act
		this.oObjectPage.setToggleHeaderOnTitleClick(false);

		// assert
		assert.strictEqual(oHeaderSpy.callCount, 0, "ObjectPageHeader _toggleFocusableState is not called");
	});

	QUnit.test("Should copy _headerContent hidden aggregation to the ObjectPage clone", function (assert) {

		var oHeaderContent = this.oObjectPage.getHeaderContent(),
			oHeaderContentClone = this.oObjectPageClone.getHeaderContent();

		assert.strictEqual(oHeaderContentClone !== null, true, "HeaderContent aggregation should exist in the clone");
		assert.strictEqual(oHeaderContent.length, oHeaderContentClone.length, "HeaderContent and it's clone should have the same nubmer of elements");
	});

	QUnit.test("Should destroy cloned _headerContent hidden aggregation", function (assert) {
		var oDestroySpy = this.spy(ManagedObject.prototype, "destroy"),
			aDestroyedObjectIds,
			sHeaderContentId = this.oObjectPageClone.getHeaderContent()[0].getId();

		// act
		this.oObjectPageClone.destroy();

		// check
		aDestroyedObjectIds = oDestroySpy.thisValues.map(function(x) {return x.getId();});
		assert.ok(aDestroyedObjectIds.indexOf(sHeaderContentId) > -1, "default headerContent clone is destroyed");
	});

	QUnit.module("ObjectPage API", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "objectPageViewSample",
				viewName: "view.UxAP-77_ObjectPageSample"
			}).then(function (oView) {
				this.oSampleView = oView;
				XMLView.create({
					id: "objectPageView",
					viewName: "view.UxAP-77_ObjectPage"
				}).then(async function(oView) {
					this.oView = oView;
					this.appControl = new App();
					this.appControl.addPage(this.oView);
					this.appControl.placeAt("qunit-fixture");
					await nextUIUpdate();
					done();
				}.bind(this));
			}.bind(this));
		},
		afterEach: function () {
			this.appControl.destroy();
			this.oSampleView.destroy();
			this.oView.destroy();
		}
	});

	QUnit.test("create instance ObjectPageLayout via javascript", function (assert) {
		var oObjectPage = new ObjectPageLayout("myObjectPage1");
		assert.equal(oObjectPage.getId(), "myObjectPage1");
	});
	QUnit.test("add ObjectPageLayout in XMLView via API", function (assert) {
		var oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage2"));
		this.oView.addContent(oObjectPage);
		var referenceObjectPage = this.oView.byId("myObjectPage2");
		assert.ok(referenceObjectPage != undefined, "ObjectPageLayout created in View");

	});
	QUnit.test("test default value of ShowAnchorBar", function (assert) {
		this.oView.removeAllContent();
		var oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage3"));
		assert.equal(oObjectPage.getShowAnchorBar(), true);
	});
	QUnit.test("test ShowAnchorBar via Control settings", function (assert) {
		var oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage4"), {showAnchorBar: false});
		assert.equal(oObjectPage.getShowAnchorBar(), false);
	});

	QUnit.test("test ShowAnchorBar APIs", function (assert) {
		var oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage5"));
		oObjectPage.setShowAnchorBar(false);
		assert.equal(oObjectPage.getShowAnchorBar(), false);
		oObjectPage.setShowAnchorBar(true);
		assert.equal(oObjectPage.getShowAnchorBar(), true);
	});

	QUnit.test("test showEditHeaderButton API", function (assert) {
		var oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage6"));
		assert.strictEqual(oObjectPage.getShowEditHeaderButton(), false, "showEditHeaderButton is false by default");
		oObjectPage.setShowEditHeaderButton(true);
		assert.strictEqual(oObjectPage.getShowEditHeaderButton(), true, "showEditHeaderButton is set to true correctly");
		oObjectPage.setShowEditHeaderButton(false);
		assert.strictEqual(oObjectPage.getShowEditHeaderButton(), false, "showEditHeaderButton is set to false correctly");
	});

	QUnit.test("test Section APIs", function (assert) {
		var oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage7"));
		var oSection1 = new ObjectPageSection({title: "Recognition"});
		var oSection2 = new ObjectPageSection({title: "Employee"});
		oObjectPage.addSection(oSection1);
		oObjectPage.addSection(oSection2);
		var aSections = oObjectPage.getSections();
		assert.equal(aSections.length, 2);

		assert.equal(oObjectPage.indexOfSection(oSection1), 0);
		assert.equal(oObjectPage.indexOfSection(oSection2), 1);

		assert.equal(aSections[0].getTitle(), "Recognition");
		assert.equal(aSections[1].getTitle(), "Employee");
		var oSection3 = new ObjectPageSection({title: "Goal"});
		oObjectPage.insertSection(oSection3, 1);
		assert.equal(oObjectPage.getSections().length, 3);
		assert.equal(oObjectPage.indexOfSection(oSection1), 0);
		assert.equal(oObjectPage.indexOfSection(oSection3), 1);
		assert.equal(oObjectPage.indexOfSection(oSection2), 2);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Recognition");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Goal");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Employee");
		oObjectPage.removeSection(oSection1);
		assert.equal(oObjectPage.getSections().length, 2);
		assert.equal(oObjectPage.indexOfSection(oSection3), 0);
		assert.equal(oObjectPage.indexOfSection(oSection2), 1);

		oObjectPage.removeAllSections();
		assert.equal(oObjectPage.getSections().length, 0);
		oObjectPage.addSection(oSection1);
		assert.equal(oObjectPage.getSections().length, 1);
		oObjectPage.destroySections();
		assert.equal(oObjectPage.getSections().length, 0);
	});

	QUnit.test("test Height APIs", function (assert) {
		var oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage10"));
		assert.equal(oObjectPage.getHeight(), '100%');
		oObjectPage.setHeight('50%');
		assert.equal(oObjectPage.getHeight(), '50%');
	});
	QUnit.test("test Header APIs", function (assert) {
		var oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage11"));
		var oHeader = new ObjectPageHeader("header");
		oObjectPage.addHeaderContent(new Text({text: "test"}));
		oObjectPage.setHeaderTitle(oHeader);
		var aContent = oObjectPage.getHeaderContent();
		assert.equal(aContent[0].getText(), "test");
	});

	QUnit.test("test ShowAnchorBar for ObjectPageLayout defined into XMLView", function (assert) {
		this.appControl.removeAllPages();
		this.appControl.addPage(this.oSampleView);
		var oObjectPage = this.oSampleView.byId("objectPage13");
		assert.equal(oObjectPage.getShowAnchorBar(), true);
		oObjectPage.setShowAnchorBar(false);
		assert.equal(oObjectPage.getShowAnchorBar(), false);
		oObjectPage.setShowAnchorBar(true);
		assert.equal(oObjectPage.getShowAnchorBar(), true);
	});

	QUnit.test("test Section for ObjectPageLayout defined into XMLView", function (assert) {
		this.appControl.removeAllPages();
		this.appControl.addPage(this.oSampleView);

		var oObjectPage = this.oSampleView.byId("objectPage13");
		assert.equal(oObjectPage.getSections().length, 3);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Payroll");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Status");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Wage Type");

		var oSection1 = new ObjectPageSection(this.oSampleView.createId("sectionGoal"), {title: "Goal"});
		oObjectPage.insertSection(oSection1, 1);
		assert.equal(oObjectPage.getSections().length, 4);
		assert.equal(oObjectPage.indexOfSection(oSection1), 1);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Payroll");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Goal");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Status");
		assert.equal(oObjectPage.getSections()[3].getTitle(), "Wage Type");
		oObjectPage.removeSection(oObjectPage.getSections()[0]);
		assert.equal(oObjectPage.getSections().length, 3);
		assert.equal(oObjectPage.indexOfSection(oSection1), 0);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Goal");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Status");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Wage Type");
		var oSection2 = new ObjectPageSection(this.oSampleView.createId("sectionRecognition"), {title: "Recognition"});
		oObjectPage.addSection(oSection2);
		assert.equal(oObjectPage.getSections().length, 4);
		assert.equal(oObjectPage.indexOfSection(oSection2), 3);
		assert.equal(oObjectPage.getSections()[3].getTitle(), "Recognition");
		oSection2.addDelegate({
			onAfterRendering: function () {
				QUnit.test("Sections Rendering", function (assert) {
					//check sections
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionGoal"), true);
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionStatus"), true);
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionWageType"), true);
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionRecognition"), true);
				});
			}
		});
	});

	QUnit.module("ObjectPage HeaderContent");

	QUnit.test("test getHeaderContent returns array if empty", function (assert) {
		// setup: object page without header content
		var oPage = new ObjectPageLayout(),
			aHeaderContent = oPage.getHeaderContent();

		// check
		assert.ok(Array.isArray(aHeaderContent), "array is returned");
		assert.strictEqual(aHeaderContent.length, 0, "empty array is returned");

		// cleanup
		oPage.destroy();
	});

	QUnit.module("ObjectPage API: sections removal", {
		beforeEach: function () {
			this.iDelay = 500;
			this.oSelectedSection = oFactory.getSection(2, null, [
				oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null)
			]);

			this.oOP = oFactory.getObjectPage();
			this.oOP.addSection(oFactory.getSection(1, null, [
					oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null)
			])).addSection(this.oSelectedSection)
				.setSelectedSection(this.oSelectedSection.getId());

			this.oOP.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oOP.destroy();
			this.oOP = null;
			this.oSelectedSection.destroy();
			this.oSelectedSection = null;
		}
	});

	QUnit.test("test removeAllSections should reset selectedSection", async function(assert) {
		var oObjectPage = this.oOP,
			done = assert.async();

		// Act
		oObjectPage.removeAllSections();
		await nextUIUpdate();

		setTimeout(function () {
			assert.equal(oObjectPage.getSections().length, 0, "There are no sections.");
			assert.equal(oObjectPage.getSelectedSection(), null, "Selected section is null as there are no sections.");
			done();
		},  this.iDelay);
	});

	QUnit.test("applyLayout is not called on invalidated SubSection without parent ObjectPage", async function(assert) {
		var oObjectPage = this.oOP,
			sNewTitle = "New SubSection Title",
			oSectionToRemove = this.oSelectedSection,
			oSubSectionToSpy = this.oSelectedSection.getSubSections()[0],
			oSubSectionMethodSpy = this.spy(oSubSectionToSpy, "_applyLayout");

		// Act: invalidate the SubSection and remove its parent Section
		oSubSectionToSpy.setTitle(sNewTitle); // invalidate the SubSection
		oObjectPage.removeSection(oSectionToRemove); // remove the Section

		await nextUIUpdate();

		// Assert
		assert.equal(oSubSectionMethodSpy.callCount, 0,
			"applyLayout is called: " + oSubSectionMethodSpy.callCount + " times.");
	});


	QUnit.test("test destroySections should reset selectedSection", async function(assert) {
		var oObjectPage = this.oOP,
			done = assert.async();

		// Act
		oObjectPage.destroySections();
		await nextUIUpdate();

		setTimeout(function () {
			assert.equal(oObjectPage.getSections().length, 0, "There are no sections.");
			assert.equal(oObjectPage.getSelectedSection(), null, "Selected section is null as there are no sections.");
			done();
		}, this.iDelay);
	});

	QUnit.test("test removing and destroying Section on mobile (with binding)", function (assert) {
		var oObjectPage = this.oOP,
			done = assert.async();

			this.stub(lib.Utilities, "isPhoneScenario").returns(true);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function () {
			// Act
			oObjectPage.removeSection(oObjectPage.getSections()[1]).destroy("KeepDom");
			await nextUIUpdate();

			setTimeout(function () {
				assert.ok(true, "Error is not thrown");
				done();
			},  this.iDelay);
		}.bind(this)));
	});

	QUnit.module("ObjectPage API: invalidate");

	QUnit.test("inactive section does not invalidate the objectPage", async function (assert) {

		var oObjectPage = new ObjectPageLayout({
			useIconTabBar: true,
			selectedSection: "section1",
			sections: [
				new ObjectPageSection("section1", {
					subSections: [
						new ObjectPageSubSection({
							blocks: [
								new Link("section1Link", {})
							]
						})
					]
				}),
				new ObjectPageSection("section2", {
					subSections: [
						new ObjectPageSubSection({
							blocks: [
								new Link("section2Link", {})
							]
						})
					]
				})

			]
		}),
		oObjectPageRenderSpy = this.spy(),
		done = assert.async();

		await helpers.renderObject(oObjectPage);

		oObjectPage.addEventDelegate({
			onBeforeRendering: oObjectPageRenderSpy
		});

		//act
		Element.getElementById("section2Link").invalidate();

		//check
		setTimeout(function() {
			assert.equal(oObjectPageRenderSpy.callCount, 0,
				"OP is not rerendered");
			oObjectPage.destroy();
			done();
		}, 0);
	});

	QUnit.test("adding section does invalidate the objectPage", async function (assert) {

		var oObjectPage = new ObjectPageLayout({
				useIconTabBar: true,
				selectedSection: "section1",
				sections: [
					new ObjectPageSection("section1", {
						subSections: [
							new ObjectPageSubSection({
								blocks: [
									new Link("section1Link", {})
								]
							})
						]
					})
				]
			}),
			section2 = new ObjectPageSection("section2", {
				subSections: [
					new ObjectPageSubSection({
						blocks: [
							new Link("section2Link", {})
						]
					})
				]
			}),
			oObjectPageRenderSpy = this.spy(),
			done = assert.async();

		await helpers.renderObject(oObjectPage);

		oObjectPage.addEventDelegate({
			onBeforeRendering: oObjectPageRenderSpy
		});

		//act
		oObjectPage.addSection(section2);

		//check
		setTimeout(function() {
			assert.equal(oObjectPageRenderSpy.callCount, 1,
				"OP is rerendered");
			oObjectPage.destroy();
			done();
		}, 0);
	});

	QUnit.test("browser events not attached twice on rerender", async function (assert) {

		var oButton = new Button("btn1", {text: "test"}),
			oObjectPage = new ObjectPageLayout({
				useIconTabBar: true,
				selectedSection: "section1",
				sections: [
					new ObjectPageSection("section1", {
						subSections: [
							new ObjectPageSubSection({
								blocks: [
									oButton
								]
							})
						]
					})
				]
			}),
			fnBrowserEventHandler = this.spy(),
			fnOnDomReady = async function() {
				oObjectPage.invalidate();
				await nextUIUpdate();
				var event,
					$buttonDomRef = Element.getElementById("btn1").getDomRef();
				if (typeof Event === 'function') {
					event = new Event("click");
				} else {
					event = document.createEvent('Event');
					event.initEvent("click", true, true);
				}
				$buttonDomRef.dispatchEvent(event);
				assert.equal(fnBrowserEventHandler.callCount, 1, "browser event listener called only once");
				oObjectPage.destroy();
				done();
			},
			done = assert.async();

		assert.expect(1); //number of assertions

		oButton.attachBrowserEvent("click", fnBrowserEventHandler);

		await helpers.renderObject(oObjectPage);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("onAfterRenderingDomReady cancelled on invalidate", function (assert) {

		var oObjectPage = new ObjectPageLayout({
			useIconTabBar: true,
			selectedSection: "section1",
			sections: [
				new ObjectPageSection("section1", {
					subSections: [
						new ObjectPageSubSection({
							blocks: [
								new Text({ text: "content"})
							]
						})
					]
				})
			]
		}),
		done = assert.async(),
		oSpy = this.spy(window, "clearTimeout");

		assert.expect(3);

		// hook to onAfterRendering to *make a change that caused invalidation* before _onAfterRenderingDomReady is called
		var oDelegate = {"onAfterRendering": function() {

			// clean up to avoid calling the same hook again
			oObjectPage.removeDelegate(oDelegate);
			oSpy.resetHistory();

			assert.ok(oObjectPage._iAfterRenderingDomReadyTimeout > 0, "the task is scheduled");

			// Act
			oObjectPage.invalidate();

			// Check
			assert.ok(oSpy.called, "the task is cancelled");
			assert.strictEqual(oObjectPage._iAfterRenderingDomReadyTimeout, null, "the field is cleared");

			oObjectPage.destroy();
			done();
		}};

		oObjectPage.addEventDelegate(oDelegate);
		oObjectPage.placeAt("qunit-fixture");
	});

	QUnit.test("setShowHeaderContent does not invalidate the objectPage", async function (assert) {
		// Arrange
		var oObjectPage = new ObjectPageLayout({
			headerTitle: new ObjectPageDynamicHeaderTitle({
				backgroundDesign: "Solid"
			}),
			headerContent: new Button({
				text: "Button"
			}),
			sections:
						oFactory.getSection(1, null, [
							oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(3, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(4, [oFactory.getBlocks(), oFactory.getBlocks()], null)
						])
			}),
			oObjectPageRenderSpy = this.spy(),
			oAdjustHeaderHeightsSpy,
			oRequestAdjustLayoutSpy,
			oHeaderContentRenderSpy,
			oUpdateTitleVisualStateSpy,
			done = assert.async();

		assert.expect(6);
		await helpers.renderObject(oObjectPage);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			oObjectPage.addEventDelegate({
				onAfterRendering: oObjectPageRenderSpy
			});

			oAdjustHeaderHeightsSpy = this.spy(oObjectPage, "_adjustHeaderHeights");
			oRequestAdjustLayoutSpy = this.spy(oObjectPage, "_requestAdjustLayout");
			oUpdateTitleVisualStateSpy = this.spy(oObjectPage, "_updateTitleVisualState");
			oHeaderContentRenderSpy = this.spy(oObjectPage._getHeaderContent(), "invalidate");

			// Act
			oObjectPage.setShowHeaderContent(false);
			await nextUIUpdate();

			setTimeout(async function() {
				// Assert
				assert.equal(oObjectPageRenderSpy.callCount, 0, "OPL is not rerendered");
				assert.equal(oHeaderContentRenderSpy.callCount, 1, "headerContent is rerendered");
				assert.equal(oAdjustHeaderHeightsSpy.callCount, 1, "_adjustHeaderHeights is called once");
				assert.equal(oRequestAdjustLayoutSpy.callCount, 1, "_requestAdjustLayout is called once");
				assert.equal(oUpdateTitleVisualStateSpy.callCount, 1, "_updateTitleVisualState is called once when the showHeaderContent property is changed");

				oUpdateTitleVisualStateSpy.resetHistory();
				oObjectPage.setShowHeaderContent(true);
				await nextUIUpdate();

				setTimeout(function() {
					// Assert
					assert.equal(oUpdateTitleVisualStateSpy.callCount, 1, "_updateTitleVisualState is called once when the showHeaderContent property is changed");

					// Clean up
					oObjectPage.destroy();
					done();
				}, 500);
			}, 500);
		}.bind(this)));
	});

	QUnit.test("setShowHeaderContent updates the toggle header buttons", function (assert) {
		// Arrange
		var oObjectPage = new ObjectPageLayout({
				headerTitle: new ObjectPageDynamicHeaderTitle(),
				headerContent: new Button({
					text: "Button"
				}),
				showHeaderContent: false
			}),
			updateToggleHeaderVisualIndicatorsSpy = this.spy(oObjectPage, "_updateToggleHeaderVisualIndicators");

		oObjectPage.setShowHeaderContent(true);
		assert.ok(updateToggleHeaderVisualIndicatorsSpy.calledOnce, "buttons visibility is updated");
	});

	QUnit.module("ObjectPage API: Header", {
		beforeEach: async function() {
			this.oObjectPageLayout = new ObjectPageLayout();
			this.oObjectPageLayout.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oObjectPageLayout.destroy();
			this.oObjectPageLayout = null;
		}
	});

	QUnit.test("ObjectPageLayout - setHeaderTitle", function (assert) {
		var oHeaderTitle = new ObjectPageDynamicHeaderTitle({
				backgroundDesign: "Solid"
			});

		// act
		this.oObjectPageLayout.setHeaderTitle(oHeaderTitle);

		// assert
		assert.ok(this.oObjectPageLayout._oObserver.isA("sap.ui.base.ManagedObjectObserver"), true, "ManagedObjectObserver is created");
	});

	QUnit.test("ObjectPageLayout - update Header Title", function (assert) {
		// Arrange
		var oObjectPageLayout = this.oObjectPageLayout,
			oHeaderTitle = new ObjectPageHeader({
				objectTitle: "First Title"
			}),
			oSpy = this.spy(this.oObjectPageLayout, "_adjustHeaderHeights"),
			fnDone = assert.async();

		assert.expect(2);

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			oObjectPageLayout.setHeaderTitle(oHeaderTitle);
			await nextUIUpdate();

			oSpy.resetHistory();

			// Act - already have a title, so changing its text should not affect height
			oHeaderTitle.setObjectTitle("New Title");
			await nextUIUpdate();

			// Assert
			assert.ok(oSpy.notCalled, "_adjustHeaderHeights is not called when there is no change in Header's height");

			// Act - no subTitle yet, so setting one will change the height
			oHeaderTitle.setObjectSubtitle("New SubTitle");
			await nextUIUpdate();

			// Assert
			assert.ok(oSpy.calledOnce, "_adjustHeaderHeights is called when there is a change in Header's height");

			// Clean up
			fnDone();
		}));
	});

	QUnit.test("ObjectPageLayout - backgroundDesignAnchorBar", async function(assert) {
		var $oAnchorBarDomRef = this.oObjectPageLayout.$("anchorBar");

		// assert
		assert.equal(this.oObjectPageLayout.getBackgroundDesignAnchorBar(), null, "Default value of backgroundDesign property = null");

		// act
		this.oObjectPageLayout.setBackgroundDesignAnchorBar("Solid");
		await nextUIUpdate();

		// assert
		assert.ok($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationSolid"), "Should have sapUxAPObjectPageNavigationSolid class");
		assert.strictEqual(this.oObjectPageLayout.getBackgroundDesignAnchorBar(), "Solid", "Should have backgroundDesign property = 'Solid'");

		// act
		this.oObjectPageLayout.setBackgroundDesignAnchorBar("Transparent");
		await nextUIUpdate();

		// assert
		assert.notOk($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationSolid"), "Should not have sapUxAPObjectPageNavigationSolid class");
		assert.ok($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationTransparent"), "Should have sapUxAPObjectPageNavigationTransparent class");
		assert.strictEqual(this.oObjectPageLayout.getBackgroundDesignAnchorBar(), "Transparent", "Should have backgroundDesign property = 'Transparent'");

		// act
		this.oObjectPageLayout.setBackgroundDesignAnchorBar("Translucent");
		await nextUIUpdate();

		// assert
		assert.notOk($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationTransparent"), "Should not have sapUxAPObjectPageNavigationTransparent class");
		assert.ok($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationTranslucent"), "Should have sapUxAPObjectPageNavigationTranslucent class");
		assert.strictEqual(this.oObjectPageLayout.getBackgroundDesignAnchorBar(), "Translucent", "Should have backgroundDesign property = 'Translucent'");
	});

	QUnit.module("Object Page Private API", {
		beforeEach: function () {
			this.oObjectPageLayout = new ObjectPageLayout("layout", {
				headerTitle: new ObjectPageDynamicHeaderTitle({
					backgroundDesign: "Solid"
				}),
				headerContent: new Button({
					text: "Button"
				})
			});
		},
		afterEach: function () {
			this.oObjectPageLayout.destroy();
			this.oObjectPageLayout = null;
		}
	});

	QUnit.test("safe-check _adjustLayoutAndUxRules", function (assert) {
		// arrange
		var oObjectPage = this.oObjectPageLayout,
			oSection,
			oSubSection,
			oSelectedSection;

		for (var i = 0; i < 2; i++) {
			oSection = oFactory.getSection(i);
			oSubSection = oFactory.getSubSection(i, oFactory.getBlocks());
			oSection.addSubSection(oSubSection);
			oObjectPage.addSection(oSection);
		}

		oSelectedSection = oObjectPage.getSections()[1];
		oObjectPage.setSelectedSection(oSelectedSection);

		try {
			// act
			// call the function before ObjectPageLayout is rendered
			oObjectPage._adjustLayoutAndUxRules();
			// assert
			assert.ok(true, "No error is thrown");
		} catch (e) {
			// assert
			assert.notOk(e, "Error should not be thrown");
		}
	});


	QUnit.test("_getStickyAreaHeight calculation while header expanded in the title-area", async function (assert) {
		var iStickyAreaHeight,
			done = assert.async();
		this.oObjectPageLayout.setHeaderTitle(oFactory.getHeaderTitle());
		this.oObjectPageLayout.addHeaderContent(oFactory.getHeaderContent());

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// pre-calculate the height of the sticky area in snapped mode
			iStickyAreaHeight = this.oObjectPageLayout._getStickyAreaHeight(true /*snapped header*/);
			this.oObjectPageLayout._expandHeader(true);
			assert.strictEqual(this.oObjectPageLayout._getStickyAreaHeight(true /*snapped header*/), iStickyAreaHeight, "sticky area correctly calculated while header expanded");
			done();
		}.bind(this));
		await helpers.renderObject(this.oObjectPageLayout);
	});

	QUnit.test("_obtainExpandedTitleHeight using clone", async function (assert) {
		var iExpandedTitleHeight,
			iClonedExpandedTitleHeight,
			done = assert.async();
		this.oObjectPageLayout.setHeaderTitle(oFactory.getHeaderTitle());
		this.oObjectPageLayout.addHeaderContent(oFactory.getHeaderContent());
		// add two sections
		for (var i = 0; i < 2; i++) {
			this.oObjectPageLayout.addSection(oFactory.getSection(i, null, [
				oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null)
			]));
		}

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// save the actual title height in expanded mode
			iExpandedTitleHeight = this.oObjectPageLayout.getHeaderTitle().$().height();
			// scroll to switch to snapped mode
			this.oObjectPageLayout._scrollTo(this.oObjectPageLayout._getSnapPosition() + 1, 0);

			// Act
			iClonedExpandedTitleHeight = this.oObjectPageLayout._obtainExpandedTitleHeight(true /* use clone */);
			// Check
			assert.strictEqual(iClonedExpandedTitleHeight, iExpandedTitleHeight, "height is correct");
			done();
		}.bind(this));
		await helpers.renderObject(this.oObjectPageLayout);
	});

	QUnit.test("_calculateShiftOffset on FireFox", async function (assert) {
		var done = assert.async(),
			oStubBrowser = this.stub(Device, "browser").value({
				firefox: true
			}),
			oStubScrollbar = this.stub(this.oObjectPageLayout, "_hasVerticalScrollBar").returns(true);

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Assert
			assert.strictEqual(this.oObjectPageLayout._calculateShiftOffset().iMarginalsOffset, ObjectPageLayout.SCROLLBAR_SIZE_FF, "Header and footer offset on FireFox is set correctly");
			oStubBrowser.restore();
			oStubScrollbar.restore();
			done();
		}.bind(this));
		await helpers.renderObject(this.oObjectPageLayout);
	});


	QUnit.module("ObjectPage with ObjectPageDynamicHeaderTitle without header content", {
		beforeEach: async function () {
			this.NUMBER_OF_SECTIONS = 2;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, false);
			this.oObjectPage.setHeaderTitle(new ObjectPageDynamicHeaderTitle());
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("ObjectPage headerContent not rendered", function (assert) {
		var oObjectPage = this.oObjectPage,
			oTitle = oObjectPage.getHeaderTitle(),
			done = assert.async();

		this.oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function () {
				assert.notOk(helpers.exists(oObjectPage.getHeaderContent()), "The DynamicPage Header does not exist.");
				assert.equal(oTitle._getFocusSpan().is(":hidden"), true, "Focus span should be excluded from the tab chain");
				assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayoutTitleClickEnabled"), "No ObjectPage Header content - sapUxAPObjectPageLayoutTitleClickEnabled not added");

				oObjectPage.setToggleHeaderOnTitleClick(true);

				assert.equal(oTitle._getFocusSpan().is(":hidden"), true, "Focus span should still be excluded from the tab chain");
				assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayoutTitleClickEnabled"), "No ObjectPage Header content - sapUxAPObjectPageLayoutTitleClickEnabled not added");
				done();
			}, 0);
		});
	});

	QUnit.module("ObjectPage with ObjectPageDynamicHeaderTitle", {
		beforeEach: async function () {
			this.NUMBER_OF_SECTIONS = 2;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			this.oObjectPage.setHeaderTitle(new ObjectPageDynamicHeaderTitle());
			this.oObjectPage.addHeaderContent(new Text({text: "test"}));
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Object Page has the correct CSS class", function (assert) {
		// Assert
		assert.ok(this.oObjectPage.hasStyleClass("sapUxAPObjectPageHasDynamicTitle"),
				"Object Page page has the sapUxAPObjectPageHasDynamicTitle CSS class" +
				" when Dynamic Header Title is being used.");
	});

	QUnit.test("ObjectPageDynamicHeaderTitle with snappedTitleOnMobile on desktop", function (assert) {
		// Arrange
		var oObjectPage = this.oObjectPage,
			oDomObjectPageHeaderTitle = oObjectPage.getDomRef("headerTitle"),
			oDynamicPageTitle = oObjectPage.getHeaderTitle();

		// Act
		helpers.toDesktopMode(oObjectPage);
		oDynamicPageTitle.setAggregation("snappedTitleOnMobile", new Title("Test"));
		oObjectPage._snapHeader();

		// Assert
		assert.notOk(oObjectPage._hasDynamicTitleWithSnappedTitleOnMobile(),
				"ObjectPageDynamicHeaderTitle hasn't snappedTitleOnMobile while on desktop.");

		assert.notOk(oDomObjectPageHeaderTitle.classList.contains("sapUxAPObjectPageHeaderSnappedTitleOnMobile"),
				"Object Page Header Dom node hasn't sapUxAPObjectPageHeaderSnappedTitleOnMobile class while on desktop.");

		assert.ok(oDynamicPageTitle._getShowExpandButton(), "Expand button of Dynamic Page Title is shown.");
	});

	QUnit.test("ObjectPageDynamicHeaderTitle with snappedTitleOnMobile on tablet", function (assert) {
		// Arrange
		var oObjectPage = this.oObjectPage,
			oDomObjectPageHeaderTitle = oObjectPage.getDomRef("headerTitle"),
			oDynamicPageTitle = oObjectPage.getHeaderTitle();

		// Act
		helpers.toTabletMode(oObjectPage);
		oDynamicPageTitle.setAggregation("snappedTitleOnMobile", new Title("Test"));
		oObjectPage._snapHeader();

		// Assert
		assert.notOk(oObjectPage._hasDynamicTitleWithSnappedTitleOnMobile(),
				"ObjectPageDynamicHeaderTitle hasn't snappedTitleOnMobile while on tablet.");

		assert.notOk(oDomObjectPageHeaderTitle.classList.contains("sapUxAPObjectPageHeaderSnappedTitleOnMobile"),
				"Object Page Header Dom node hasn't sapUxAPObjectPageHeaderSnappedTitleOnMobile class while on tablet.");

		assert.ok(oDynamicPageTitle._getShowExpandButton(), "Expand button of Dynamic Page Title is shown.");

		// Clean up
		helpers.toDesktopMode(oObjectPage);
	});

	QUnit.test("ObjectPageDynamicHeaderTitle with snappedTitleOnMobile on phone", function (assert) {
		// Arrange
		var oObjectPage = this.oObjectPage,
			oDomObjectPageHeaderTitle = oObjectPage.getDomRef("headerTitle"),
			oDynamicPageTitle = oObjectPage.getHeaderTitle();

		// Act
		helpers.toPhoneMode(oObjectPage);
		oDynamicPageTitle.setAggregation("snappedTitleOnMobile", new Title("Test"));
		oObjectPage._snapHeader();

		// Assert
		assert.ok(oObjectPage._hasDynamicTitleWithSnappedTitleOnMobile(),
				"ObjectPageDynamicHeaderTitle has snappedTitleOnMobile while on phone.");

		assert.ok(oDomObjectPageHeaderTitle.classList.contains("sapUxAPObjectPageHeaderSnappedTitleOnMobile"),
				"Object Page Header Dom node has the sapUxAPObjectPageHeaderSnappedTitleOnMobile class while on phone.");

		assert.notOk(oDynamicPageTitle._getShowExpandButton(), "Expand button of Dynamic Page Title is not shown.");

		// Clean up
		helpers.toDesktopMode(oObjectPage);
	});

	QUnit.test("ObjectPage Header pinnable and not pinnable", async function(assert) {

		var oHeader = this.oObjectPage._getHeaderContent(),
			oPinButton = oHeader.getAggregation("_pinButton");

		this.oObjectPage.setHeaderContentPinnable(false);
		await nextUIUpdate();

		assert.ok(!oPinButton.$()[0],
			"The ObjectPage Header Pin Button not rendered");

		this.oObjectPage.setHeaderContentPinnable(true);
		await nextUIUpdate();

		assert.ok(oPinButton.$()[0],
			"The ObjectPage Header Pin Button rendered");

		assert.equal(oPinButton.$().hasClass("sapUiHidden"), false,
			"The ObjectPage Header Pin Button is visible");
	});

	QUnit.test("ObjectPage Header Pin Button focus preservation", async function(assert) {
		// Arrange
		var oHeader = this.oObjectPage._getHeaderContent(),
			oPinButton = oHeader.getAggregation("_pinButton"),
			oPinButtonDomRef = oPinButton.$();
			oPinButton.$ = function () {
				return {
					attr: function () {},
					removeClass: function () {},
					off: function () {},
					trigger: function (sMethod) {
						if (sMethod === "focus") {
							// Assert
							assert.ok(true, "The Pin Button remain focused after triggering");
						}
					}
				};
			};

		// Act
		await nextUIUpdate();
		oPinButtonDomRef.focus();

		// Act
		oPinButton.firePress();
	});

	QUnit.test("ObjectPage Header - expanding/collapsing by clicking the title", function (assert) {

		var oObjectPage = this.oObjectPage,
			oObjectPageTitle = oObjectPage.getHeaderTitle(),
			oHeaderContent = oObjectPage._getHeaderContent(),
			oPinButton = oHeaderContent._getPinButton(),
			oFakeEvent = {
				srcControl: oObjectPageTitle
			};

		this.oObjectPage._bHeaderInTitleArea = true;

		assert.equal(oObjectPage._bHeaderExpanded, true, "Initially the header is expanded");
		assert.equal(oObjectPage.getToggleHeaderOnTitleClick(), true, "Initially toggleHeaderOnTitleClick = true");

		oObjectPageTitle.ontap(oFakeEvent);

		assert.equal(oObjectPage._bHeaderExpanded, false, "After one click, the header is collapsed");

		oObjectPage.setToggleHeaderOnTitleClick(false);

		oObjectPageTitle.ontap(oFakeEvent);
		assert.equal(oObjectPage._bHeaderExpanded, false, "The header is still collapsed, because toggleHeaderOnTitleClick = false");

		oObjectPage.setToggleHeaderOnTitleClick(true);

		oObjectPageTitle.ontap(oFakeEvent);
		assert.equal(oObjectPage._bHeaderExpanded, true, "After restoring toggleHeaderOnTitleClick to true, the header again expands on click");

		oPinButton.firePress();
		oObjectPageTitle.ontap(oFakeEvent);

		assert.strictEqual(oObjectPage._bHeaderExpanded, false, "After one click, the header is collapsed even it's pinned");
		assert.strictEqual(oPinButton.getPressed(), false, "Pin button pressed state should be reset.");
		assert.strictEqual(oObjectPage.$().hasClass("sapUxAPObjectPageLayoutHeaderPinned"), false, "ObjectPage header should be unpinned.");
	});

	QUnit.test("ObjectPage Header - expanding/collapsing by clicking the title", function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			oObjectPageTitle = oObjectPage.getHeaderTitle(),
			oStateChangeListener = this.spy(),
			oFakeEvent = {
				srcControl: oObjectPageTitle
			};

		oObjectPageTitle.attachEvent("stateChange", oStateChangeListener);

		// act
		oObjectPageTitle.ontap(oFakeEvent);

		// assert
		assert.ok(oStateChangeListener.calledOnce, "stateChange event was fired once");

		// act
		oObjectPageTitle.ontap(oFakeEvent);

		// assert
		assert.strictEqual(oStateChangeListener.callCount, 2, "stateChange event was fired twice");
	});

	QUnit.test("ObjectPage Header - expanding/collapsing by clicking the expand/collapse arrow", function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			oObjectPageTitle = oObjectPage.getHeaderTitle(),
			oStateChangeListener = this.spy();

		oObjectPageTitle.attachEvent("stateChange", oStateChangeListener);

		// act
		oObjectPage.getAggregation("_headerContent").getAggregation("_collapseButton").firePress();

		// assert
		assert.ok(oStateChangeListener.calledOnce, "stateChange event was fired once");

		// act
		oObjectPage.getAggregation("headerTitle").getAggregation("_expandButton").firePress();

		// assert
		assert.strictEqual(oStateChangeListener.callCount, 2, "stateChange event was fired twice");
	});

	QUnit.test("ObjectPage header is preserved in title on screen resize", function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			oFakeEvent = {
				size: {
					width: 100,
					height: 300
				},
				oldSize: {
					width: 100,
					height: 400
				}
			},
			// this delay is already introduced in the ObjectPage resize listener
			iDelay = ObjectPageLayout.HEADER_CALC_DELAY + 100,
			oSpy,
			done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// setup: expand the header in the title
			oObjectPage._scrollTo(0, 200);
			oObjectPage._expandHeader(true);
			assert.ok(oObjectPage._bHeaderInTitleArea);

			oSpy = this.spy(ObjectPageLayout.prototype, "invalidate");

			// act: resize and check if the page invalidates in the resize listener
			oObjectPage._onUpdateScreenSize(oFakeEvent);

			setTimeout(function() {
				assert.strictEqual(oSpy.called, false, "page was not invalidated during resize");
				done();
			}, iDelay);
		}.bind(this));

	});

	QUnit.test("ObjectPage header is preserved in title on content resize", function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			// this delay is already introduced in the ObjectPage resize listener
			done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// setup: expand the header in the title
			oObjectPage._scrollTo(0, 200);
			oObjectPage._expandHeader(true);
			assert.ok(oObjectPage._bHeaderInTitleArea);

			// act: resize and check if the page invalidates in the resize listener
			oObjectPage._onUpdateContentSize({ size: {}, oldSize: {} });

			assert.strictEqual(oObjectPage._bHeaderInTitleArea, true, "page is not snapped on resize");
			done();
		});
	});

	QUnit.test("ObjectPage is not attached to MouseOut/MouseOver events of title on tablet/phone device", async function (assert) {
		// Setup
		helpers.toPhoneMode(this.oObjectPage);

		var oVisualIndicatorMouseoOverSpy = this.spy(this.oObjectPage, "_attachVisualIndicatorMouseOverHandlers"),
			oTitleMouseOverSpy = this.spy(this.oObjectPage, "_attachTitleMouseOverHandlers");

		// Act
		this.oObjectPage.invalidate();
		await nextUIUpdate();

		// Assert
		assert.ok(oVisualIndicatorMouseoOverSpy.notCalled, "ObjectPage is not attached to MouseOut/MouseOver events of snap/expand button");
		assert.ok(oTitleMouseOverSpy.notCalled, "ObjectPage is not attached to MouseOut/MouseOver events of title");

		helpers.toDesktopMode(this.oObjectPage);
	});

	QUnit.test("ObjectPage obtains correct anchorBar height", function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			done = assert.async();

		assert.expect(2);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			assert.strictEqual(oObjectPage.iAnchorBarHeight, this.getDomRef("anchorBar").offsetHeight, "correct anchorBar height");

			oObjectPage._snapHeader(true);
			assert.strictEqual(oObjectPage.iAnchorBarHeight, this.getDomRef("stickyAnchorBar").offsetHeight, "correct sticky anchorBar height");
			done();
		});
	});

	QUnit.test("AnchorBar height includes paddings", function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			done = assert.async();

		assert.expect(1);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			var oAnchorBarDOM = this.getDomRef("anchorBar"),
				iPadding = parseInt(getComputedStyle(oAnchorBarDOM).paddingTop) || 0,
				iABHeight = oObjectPage.iAnchorBarHeight,
				iDiff = 10;

			// Act: increase padding
			oAnchorBarDOM.style.paddingTop = (iPadding + iDiff) + "px";
			oObjectPage._adjustHeaderHeights(); // call the function that recalculates anchorBar height

			//Check: the new padding is included
			assert.ok(isTolerableDifference(oObjectPage.iAnchorBarHeight, iABHeight + iDiff, 1), "anchorBar height is also augmented");
			done();
		});
	});

	QUnit.test("unset selected section when preserveHeaderStateOnScroll enabled", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oSecondSection = this.oObjectPage.getSections()[1],
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		assert.expect(1);

		this.oObjectPage.setSelectedSection(oSecondSection);
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setPreserveHeaderStateOnScroll(true);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Act: unset the currently selected section
			oObjectPage.setSelectedSection(null);

			// Check
			setTimeout(function() {
				assert.equal(oObjectPage._bHeaderInTitleArea, true, "Header is still in the title area");
				done();
			}, 0);
		});

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.module("ObjectPage with alwaysShowContentHeader", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
			this.oObjectPage.setAlwaysShowContentHeader(true);
			this.oObjectPage.addHeaderContent(new Text({text: "Some header content"}));
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Should not call toggleHeader", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oHeaderContent,
			oSecondSection = oObjectPage.getSections()[1],
			oToggleHeaderSpy = this.spy(oObjectPage, "_toggleHeader"),
			done = assert.async(),
			fnOnDomReady = function() {
				oObjectPage.scrollToSection(oSecondSection.getId(), 0);
				assert.strictEqual(oToggleHeaderSpy.callCount, 0, "Toggle header is not called");
				oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnRerenderedDomReady2);
				oObjectPage.invalidate();
			},
			fnOnRerenderedDomReady2 = function() {
				// Assert
				assert.equal(oObjectPage._bHeaderExpanded, true, "Flag for expandedHeader has correct value");
				oHeaderContent = oObjectPage._getHeaderContent();
				assert.equal(oHeaderContent.$().hasClass("sapUxAPObjectPageHeaderContentHidden"), false, "Header content is not hidden");

				// Clean up
				done();
			};

			// ensure desktop mode
			helpers.toDesktopMode(oObjectPage);
			this.stub(lib.Utilities, "isPhoneScenario").returns(false);
			this.stub(lib.Utilities, "isTabletScenario").returns(false);

			assert.expect(3);
			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
			await helpers.renderObject(oObjectPage);
	});

	QUnit.test("'alwaysShowContentHeader' is applied correctly on screen resize", async function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			oFakeEvent = {
				size: {
					width: 100,
					height: 300
				},
				oldSize: {
					width: 100,
					height: 400
				}
			},
			done = assert.async();

		// mock tablet mode
		this.stub(lib.Utilities, "isPhoneScenario").returns(false);
		this.stub(lib.Utilities, "isTabletScenario").returns(true);

		assert.expect(2);


		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// setup: expand the header in the title
			oObjectPage._scrollTo(0, 200);
			assert.ok(!oObjectPage._bHeaderInTitleArea);

			// act: resize and check if the page invalidates in the resize listener
			lib.Utilities.isTabletScenario.returns(false);
			oObjectPage._onUpdateScreenSize(oFakeEvent);

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				assert.ok(oObjectPage._bHeaderInTitleArea);
				done();
			});
		}, this);

		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("Modifying hidden page", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Object Page has the correct CSS class", function (assert) {
		// Assert
		assert.notOk(this.oObjectPage.hasStyleClass("sapUxAPObjectPageHasDynamicTitle"),
				"Object Page page hasn't the sapUxAPObjectPageHasDynamicTitle CSS class" +
				" when Dynamic Header Title is not being used.");
	});

	QUnit.test("Should change selectedSection", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oSecondPage = new Page(),
			oNavContainer = new App(),
			oSecondSection = oObjectPage.getSections()[1],
			iCompleteResizeCalculationTimeout = ObjectPageLayout.HEADER_CALC_DELAY + 100,
			oExpected,
			done = assert.async(),
			fnOnDomReady = function() {
				oNavContainer.attachEventOnce("afterNavigate", fnOnHideObjectPage);
				oNavContainer.to(oSecondPage.getId()); // nav to the second page to hide the object page
			},
			fnOnHideObjectPage = function() {
				// act: change selectedSection while page is HIDDEN
				oObjectPage.setSelectedSection(oSecondSection);
				// call the listener to the <code>scroll</code> event synchonously to avoid waiting a timeout
				oObjectPage._onScroll({ target: {scrollTop: oObjectPage._computeScrollPosition(oSecondSection)}});
				oNavContainer.attachEventOnce("afterNavigate", fnOnShowBackObjectPage);
				oNavContainer.to(oObjectPage.getId()); // nav back to the object page
			},
			fnOnShowBackObjectPage = function() {
				setTimeout(onResizeCheckCompleted, iCompleteResizeCalculationTimeout);
			},
			onResizeCheckCompleted = function() {
				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getSubSections()[0].getTitle(), // the only subsection is promoted
					bSnapped: true
				};
				//check
				sectionIsSelected(oObjectPage, assert, oExpected);
				done();
			};

		assert.expect(5);
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		oNavContainer.addPage(oObjectPage);
		oNavContainer.addPage(oSecondPage);
		await helpers.renderObject(oNavContainer);
	});

	QUnit.module("First visible section", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 5, 2);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("iconTabBar mode selected section", async function (assert) {
		this.oObjectPage.setUseIconTabBar(true);

		var oSectionToSelect = this.oObjectPage.getSections()[1];
		this.oObjectPage.setSelectedSection(oSectionToSelect);

		await helpers.renderObject(this.oObjectPage);

		assert.ok(this.oObjectPage._isFirstVisibleSectionBase(oSectionToSelect), "the selected section is the first visible one");
	});

	QUnit.test("iconTabBar mode selected section first subSection", async function (assert) {
		this.oObjectPage.setUseIconTabBar(true);

		var oSectionToSelect = this.oObjectPage.getSections()[1],
			oSectionToSelectFirstSubSection = oSectionToSelect.getSubSections()[0];
		this.oObjectPage.setSelectedSection(oSectionToSelect);

		await helpers.renderObject(this.oObjectPage);

		assert.ok(this.oObjectPage._isFirstVisibleSectionBase(oSectionToSelectFirstSubSection), "the first visible subSection is correct");
	});

	QUnit.test("iconTabBar mode selected section non-first subSection", async function (assert) {
		this.oObjectPage.setUseIconTabBar(true);

		var oSectionToSelect = this.oObjectPage.getSections()[1],
			oSectionToSelectSecondSubSection = oSectionToSelect.getSubSections()[1];
		this.oObjectPage.setSelectedSection(oSectionToSelect);

		await helpers.renderObject(this.oObjectPage);

		assert.ok(!this.oObjectPage._isFirstVisibleSectionBase(oSectionToSelectSecondSubSection), "the first visible subSection is correct");
	});

	QUnit.test("resize of empty page", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oSelectSpy = this.spy(oObjectPage, "_selectFirstVisibleSection"),
			done = assert.async();

		// Setup
		this.oObjectPage.setUseIconTabBar(true);
		this.oObjectPage.removeAllSections(); //ensure no first visible section

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSelectSpy.resetHistory();

			// Act: update height from 0 to greater than 0
			oObjectPage._onUpdateScreenSize({
				oldSize: {width: 1000, height:0},
				size: { width: 1000, height:1000}
			});

			setTimeout(function() {
				assert.equal(oSelectSpy.callCount, 1, "reset of selected section is called");
				assert.ok(oSelectSpy.returned(undefined), "the function returned");
				done();
			}, oObjectPage._getDOMCalculationDelay());

		});

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.module("ScrollDelegate", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("getScrollDelegate", async function (assert) {
		var oObjectPage = this.oObjectPage,
			iInitScrollTop,
			iNewScrollTop,
			done = assert.async();

		assert.expect(1);

		// wait for the event when the page is rendered and ready
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Setup: save init scroll position
			iInitScrollTop = Math.round(oObjectPage._$opWrapper.scrollTop());

			// Act: call scrolling while scrolling is suppressed
			iNewScrollTop = iInitScrollTop + 10;
			oObjectPage.getScrollDelegate().scrollTo(0 /* x */, iNewScrollTop /* y */);

			// Check if scroll was effective
			assert.strictEqual(Math.round(oObjectPage._$opWrapper.scrollTop()), iNewScrollTop, "scroll top is changed");
			done();
		});

		// Act: render page to test scrolling behavior
		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("RTA util functions", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("_suppressScroll", async function (assert) {
		var oObjectPage = this.oObjectPage,
			iScrollTopBefore,
			iScrollTopAfter,
			done = assert.async();

		assert.expect(1);

		// wait for the event when the page is rendered and ready
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Setup: save current scroll position and suppress scroll
			iScrollTopBefore = oObjectPage._$opWrapper.scrollTop();
			oObjectPage._suppressScroll();

			// Act: call scrolling while scrolling is suppressed
			oObjectPage._scrollTo(iScrollTopBefore + 10);

			// Check if scroll suppression was effective
			iScrollTopAfter = oObjectPage._$opWrapper.scrollTop();
			assert.strictEqual(iScrollTopBefore, iScrollTopAfter, "scroll top is unchanged");
			done();
		});

		// Act: render page to test scrolling behavior
		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("_resumeScroll", async function (assert) {
		var oObjectPage = this.oObjectPage,
			iUpdatedScrollTop = 0,
			oFirstSection = oObjectPage.getSections()[0],
			oFourthSection = oObjectPage.getSections()[3],
			done = assert.async();

		// Arrange: set selection to a (non-first) section that requires page scrolling
		oObjectPage.setSelectedSection(oFourthSection.getId());

		assert.expect(3);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			// Arrange: save current scroll position and suppress scroll
			oObjectPage._suppressScroll();

			// Act: Change scrollTop (effect of RTA operation)
			oObjectPage._$opWrapper.scrollTop(iUpdatedScrollTop);

			// Act: resume page's own scrolling and restore state
			oObjectPage._resumeScroll();

			// Check that the restored section corresponds to the current scroll position
			assert.strictEqual(oObjectPage.getSelectedSection(), oFirstSection.getId(), "selected section is correct");
			assert.strictEqual(oObjectPage._$opWrapper.scrollTop(), iUpdatedScrollTop, "scroll top is correct");

			// Check that the state is correctly preserved even of the page is meanwhile invalidated and rerendered
			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				setTimeout(function() {
					assert.strictEqual(oObjectPage._$opWrapper.scrollTop(), iUpdatedScrollTop, "scroll top is correct");
					done();
				}, 0);
			});
			// Act: invalidate and apply changes to cause rerendering
			oObjectPage.invalidate();
			await nextUIUpdate();
		}));

		// Act: render page to test scrolling behavior
		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("Private methods");

	QUnit.test("BCP:1870298358 - cloned header should not introduce scrollbar - _appendTitleCloneToDOM", async function(assert) {

		// Arrange
		var oObjectPage = helpers.generateObjectPageWithContent(oFactory, 2, true),
			oClone,
			oWrapperElement,
			done = assert.async();

		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			oWrapperElement = oObjectPage._$opWrapper.get(0);

			// Act: obtain snapped title height
			oClone = oObjectPage._appendTitleCloneToDOM(true /* snap title */);

			// Assert
			assert.strictEqual(oWrapperElement.offsetHeight, oWrapperElement.scrollHeight, "no scrolling");

			oClone.remove();

			// ACT: obtain expanded title height
			oObjectPage._appendTitleCloneToDOM(false /* do not snap title */);

			// Assert
			assert.strictEqual(oWrapperElement.offsetHeight, oWrapperElement.scrollHeight, "no scrolling");

			// Cleanup
			oObjectPage.destroy();
			done();
		});

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("_obtainExpandedTitleHeight does not change element overflow", async function(assert) {

		// Arrange
		var oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar(),
			oCSSSpy;

		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		oCSSSpy = this.spy(oObjectPage._$opWrapper, "css");

		// Act - render OP and call method
		oObjectPage._obtainExpandedTitleHeight(false/* snap directly */);

		// Assert
		assert.notOk(oCSSSpy.calledWith("overflow-y", "hidden"), "no disabling of scrolling of the wrapper (BCP 002075129400005875712019)");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("_getHeaderContentDomRef works as expected", async function(assert) {

		// Arrange
		var oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oObjectPage._getHeaderContentDomRef(), oObjectPage._getHeaderContent().getDomRef(),
			"The new '_getHeaderContentDomRef' method is returning the Dom Ref of headerContent as expected.");


		// Act - scroll to snap the header
		oObjectPage._setSectionInfoIsDirty(false);
		oObjectPage._onScroll({ target: { scrollTop: oObjectPage._getSnapPosition() + 1} });
		// Assert
		assert.strictEqual(oObjectPage._getHeaderContentDomRef(),
			oObjectPage.$().find(".sapUxAPObjectPageHeaderTitle .sapUxAPObjectPageHeaderDetails").get(0),
			"return an empty placeholder if the header is hidden in the scroll overflow.");


		// Act - remove header content
		oObjectPage.setAggregation("_headerContent", null);

		// Assert
		assert.strictEqual(oObjectPage._getHeaderContentDomRef(), null,
			"The new '_getHeaderContentDomRef' method is returning null, when there is no headerContent available.");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("_obtainSnappedTitleHeight does not change element overflow", async function(assert) {

		// Arrange
		var oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar(),
			oCSSSpy;

		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());
		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		oCSSSpy = this.spy(oObjectPage._$opWrapper, "css");

		// Act - render OP and call method
		oObjectPage._obtainSnappedTitleHeight(false/* expand directly */);

		// Assert
		assert.notOk(oCSSSpy.calledWith("overflow-y", "hidden"), "no disabling of scrolling of the wrapper (BCP 002075129400005875712019)");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("Unsnapping/snapping header for measurements should update spacer height and should not introduce scrollbar",
	async function (assert) {

		// Arrange
		var oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar(),
			oSection,
			oSubSection,
			iSpacerInitialHeight,
			iSpacerNewHeight,
			done = assert.async();

			assert.expect(1);

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());
		oSection = oFactory.getSection(0);
		oSubSection = oFactory.getSubSection(0, oFactory.getBlocks());
		oSection.addSubSection(oSubSection);
		oObjectPage.addSection(oSection);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			iSpacerInitialHeight = oObjectPage._$spacer.height();
			oObjectPage._adjustSpacerHeightUponUnsnapping(150, 200);
			iSpacerNewHeight = oObjectPage._$spacer.height();

			// Assert
			assert.equal(iSpacerInitialHeight, iSpacerNewHeight,
				"Spacer height remains 0 when unsnapping leads to change of content height and there is only one SubSection");
			done();

			// Cleanup
			oObjectPage.destroy();
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("Snapping Header with ObjectPageDynamicHeaderTitle when expandedHeading has bigger height than snappedHeading",
	async function (assert) {

		// Arrange
		var oObjectPage = oFactory.getObjectPageLayoutWithOneVisibleSection(),
			oHeader = oFactory.getObjectPageDynamicHeaderTitle(),
			fnDone = assert.async();

		assert.expect(1);

		oHeader.setSnappedHeading(new Button({text: "Heading Button"}));
		oHeader.setExpandedHeading(new Button({text: "Heading Button"}));
		oObjectPage.setShowAnchorBar(false);
		oObjectPage.addHeaderContent(new Button());
		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Act - Snap header
			oObjectPage._handleDynamicTitlePress();

			setTimeout(function() {
				// Assert
				assert.strictEqual(oObjectPage._bHeaderExpanded, false, "Header is collapsed");

				// Cleanup
				oObjectPage.destroy();
				fnDone();
			}, 100);
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("_updateMedia called with proper arguments onAfterRendering when _hasDynamicTitle",
	async function (assert) {

		// Arrange
		var oObjectPage = oFactory.getObjectPageLayoutWithOneVisibleSection(),
			oUpdateMediaSpy,
			that = this,
			fnDone = assert.async();

		assert.expect(1);
		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			oUpdateMediaSpy = that.spy(oObjectPage, "_updateMedia");

			oObjectPage.onAfterRendering();

			assert.strictEqual(oUpdateMediaSpy.getCalls()[0].args[1],
				ObjectPageLayout.DYNAMIC_HEADERS_MEDIA,
				"_updateMedia is correctly called with dynamic headers args when needed");

			oObjectPage.destroy();
			oUpdateMediaSpy.reset();
			fnDone();
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("BCP:1870298358 - _getScrollableViewportHeight method should acquire the exact height", async function(assert) {

		// Arrange
		var oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar(),
			oGetBoundingClientRectSpy;

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		oGetBoundingClientRectSpy = this.spy(oObjectPage.getDomRef(), "getBoundingClientRect");

		// Act - call method
		oObjectPage._getScrollableViewportHeight();

		// Assert
		assert.strictEqual(oGetBoundingClientRectSpy.callCount, 1, "Exact height is acquired using getBoundingClientRect");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("BCP:1870470695/1970034947 - check _updateMedia is called initially when ObjectPage has correct size", async function (assert) {
		var oObjectPage = new ObjectPageLayout({}),
			oUpdateMediaSpy = this.spy(oObjectPage, "_updateMedia"),
			oGetWidthSpy = this.spy(oObjectPage, "_getWidth"),
			done = assert.async();

		assert.expect(2);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				assert.strictEqual(oUpdateMediaSpy.callCount, 2, "_updateMedia is called on after rendering and after DOM ready to ensure coorect size classes are set");
				assert.strictEqual(oGetWidthSpy.callCount, 2, "_getWidth is called once on after rendering and once after DOM ready");
				oObjectPage.destroy();
				done();
		});

		await helpers.renderObject(oObjectPage);
	});

    QUnit.test("ObjectPage _updateMedia: Call with falsy value should not take action", function (assert) {
        // setup
        var oObjectPage = new ObjectPageLayout({}),
            oToggleStyleClassSpy = this.spy(oObjectPage, "toggleStyleClass");

        // act
        oObjectPage._updateMedia(0);

        // assert
        assert.ok(oToggleStyleClassSpy.notCalled, "Media styles were not changed");

        // clean up
        oObjectPage.destroy();
	});

	QUnit.test("ObjectPage _applyContextualSettings: changes media classes", async function(assert) {
        // Arrange
		var oObjectPage = new ObjectPageLayout({}),
			oContextualSettings = {contextualWidth: 800},
			oSpy;

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oSpy = this.spy(ManagedObject.prototype, "_applyContextualSettings");
		oObjectPage._applyContextualSettings(oContextualSettings);

		// Assert
		assert.ok(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Tablet"), "Tablet class is applied");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop-XL"), "Desktop XL class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop"), "Desktop class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Phone"), "Phone class is removed");
		assert.deepEqual(oSpy.getCall(0).args[0], oContextualSettings, "Contextual settings object is passed");

		// Act
		oObjectPage._applyContextualSettings({contextualWidth: 500});

		// Assert
		assert.ok(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Phone"), "Phone class is applied");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Tablet"), "Tablet class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop"), "Desktop class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop-XL"), "Desktop XL class is removed");

		// Act
		oObjectPage._applyContextualSettings({contextualWidth: 1440});

		// Assert
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Phone"), "Phone class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Tablet"), "Tablet class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop"), "Desktop class is removed");
		assert.ok(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop-XL"), "Desktop XL class is applied");
    });

	QUnit.test("ObjectPage _computeLastVisibleHeight floors the top position of the spacer", function (assert) {
		// setup
		var oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5),
			oSpy;

		oObjectPage.placeAt("qunit-fixture");
		Core.applyChanges();

		// act
		oSpy = this.spy(Math, "floor");
		oObjectPage._computeLastVisibleHeight(oObjectPage.getSections()[4].getSubSections()[0]);

		// assert
		assert.ok(oSpy.calledOnce, "Spacer's top positioned is floored");

		// clean up
		oObjectPage.destroy();
	});

    QUnit.module("Header DOM changes", {
		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
			this.oObjectPage.addHeaderContent(oFactory.getHeaderContent());
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});


	QUnit.test("Change in title size retrigger layout calculations", async function (assert) {

		var oObjectPage = this.oObjectPage,
			sShortText = "sample object subtitle text",
			sLongText = (function(s) {
				for (var i = 0; i < 100; i++) {
					s += sShortText;
				}
				return s;
			}("")),
			oHeaderTitle = new ObjectPageHeader({
				objectTitle: "Title",
				objectSubtitle: sLongText
			}),
			layoutCalcSpy = this.spy(oObjectPage, "_requestAdjustLayout"),
			headerCalcSpy = this.spy(oObjectPage, "_adjustHeaderHeights"),
			done = assert.async();

		assert.expect(2);

		oObjectPage.setHeaderTitle(oHeaderTitle);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			layoutCalcSpy.resetHistory();
			headerCalcSpy.resetHistory();

			// Act: change size of title dom element [without control invalidation]
			var $titleDescription = oObjectPage.getHeaderTitle().$().find('.sapUxAPObjectPageHeaderIdentifierDescription').get(0);
			$titleDescription.innerText = sShortText;

			oObjectPage.getHeaderTitle()._onHeaderResize({ size: { width: "800px", height: "800px"}});
			assert.strictEqual(layoutCalcSpy.callCount, 1, "layout recalculations called once");
			assert.strictEqual(headerCalcSpy.callCount, 1, "header height recalculation called");
			done();
		});

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("Title is toggled only upon snap/unsnap", async function (assert) {

		var oObjectPage = this.oObjectPage,
			oHeaderTitle = new ObjectPageHeader({
				objectTitle: "Title"
			}),
			toggleTitleSpy = this.spy(oObjectPage, "_toggleHeaderTitle"),
			done = assert.async();

		assert.expect(2);

		oObjectPage.setHeaderTitle(oHeaderTitle);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			toggleTitleSpy.resetHistory();

			// Act: scroll to position that does not require snap
			oObjectPage._$opWrapper.scrollTop(20);

			setTimeout(function() {
				assert.strictEqual(toggleTitleSpy.callCount, 0, "title is not toggled");

				// Act: scroll to position that does not require snap
				oObjectPage._$opWrapper.scrollTop(oObjectPage._getSnapPosition());

				setTimeout(function() {
					assert.strictEqual(toggleTitleSpy.callCount, 1, "title is toggled");
					done();
				}, 100);
			}, 100);
		});

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.module("events", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPage();
			this.oObjectPage.addSection(oFactory.getSection(1, null, [
				oFactory.getSubSection(1, [oFactory.getBlocks()], null),
				oFactory.getSubSection(2, [oFactory.getBlocks()], null)
			]));
			this.oObjectPage.addSection(oFactory.getSection(1, null, [
				oFactory.getSubSection(1, [oFactory.getBlocks()], null)]));

			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("sectionChange event is fired for single/not promoted SubSection", async function (assert) {
		// Arrange
		var fnDone = assert.async(),
			oSubSection = new ObjectPageSubSection({
				blocks: new Button()
			}),
			oSection = oFactory.getSection(1, null, [ oSubSection ]);

		this.oObjectPage.addSection(oSection);
		await nextUIUpdate();

		this.oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			this.oObjectPage.attachEventOnce("sectionChange", function(oEvent) {
				// Assert
				assert.strictEqual(oEvent.getParameter("section").getId(), oSection.getId(),
					"sectionChange event is fired for the new Section");
				assert.strictEqual(oEvent.getParameter("subSection").getId(), oSubSection.getId(),
					"sectionChange event is fired for the new SubSection");
				fnDone();
			});

			// Act
			this.oObjectPage.onAnchorBarTabPress(oSection.getId());
			this.oObjectPage._onScroll({ target: {scrollTop: this.oObjectPage._computeScrollPosition(oSection)}});
		}.bind(this));
	});

	QUnit.test("subSectionVisibilityChange without IconTabBar and changing visibility", function (assert) {
		// Arrange
		var fnDone = assert.async();
		this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
			// Assert
			var oVisibleSubSections = oEvent.getParameter("visibleSubSections");
			assert.strictEqual(Object.keys(oVisibleSubSections).length, 2,
				"Two visible subSections are reported when visibility of one of the three subSections is changed to false");

			fnDone();
		});

		assert.expect(1);

		// Act
		this.oObjectPage.getSections()[0].getSubSections()[0].setVisible(false);
	});

	QUnit.test("subSectionVisibilityChange with IconTabBar and changing visibility", function (assert) {
		// Arrange
		var fnDone = assert.async();

		this.oObjectPage.setUseIconTabBar(true);
		this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
			// Assert
			var oVisibleSubSections = oEvent.getParameter("visibleSubSections");
			assert.strictEqual(Object.keys(oVisibleSubSections).length, 1,
				"One visible subSection is reported when visibility of one of the two subSections in the first section is changed to false");

			// Clean-up
			fnDone();
		});

		assert.expect(1);

		// Act
		this.oObjectPage.getSections()[0].getSubSections()[0].setVisible(false);
	});

	QUnit.test("subSectionVisibilityChange adding new SubSection and Section without IconTabBar", function (assert) {
		// Arrange
		var fnDone = assert.async();
		this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
			// Assert
			var oVisibleSubSections = oEvent.getParameter("visibleSubSections");
			assert.strictEqual(Object.keys(oVisibleSubSections).length, 4,
				"Four visible subSections are reported when new subSection is added");

			//Act
			this.oObjectPage.addSection(oFactory.getSection(4, null, [
				oFactory.getSubSection(5, [oFactory.getBlocks()], null)
			]));

			this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
				// Assert
				var oVisibleSubSections = oEvent.getParameter("visibleSubSections");
				assert.strictEqual(Object.keys(oVisibleSubSections).length, 5,
					"Five visible subSections are reported when new Section with one subSection is added");

				// Clean-up
				fnDone();
			});
		}.bind(this));

		assert.expect(2);

		//Act
		this.oObjectPage.getSections()[0].addSubSection(oFactory.getSubSection(3, [oFactory.getBlocks()], null));
	});

	QUnit.test("subSectionVisibilityChange adding new SubSection and Section with IconTabBar", function (assert) {
		// Arrange
		var fnDone = assert.async(),
			oSpy;

		this.oObjectPage.setUseIconTabBar(true);
		this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
			// Assert
			var oVisibleSubSections = oEvent.getParameter("visibleSubSections");
			assert.strictEqual(Object.keys(oVisibleSubSections).length, 3,
				"Three visible subSections are reported when new visible subSection is added to the selected section");

			oSpy = this.spy(this.oObjectPage, "fireEvent");

			// Act
			this.oObjectPage.getSections()[1].addSubSection(oFactory.getSubSection(4, [oFactory.getBlocks()], null));
			this.oObjectPage._checkSubSectionVisibilityChange();

			// Assert
			assert.ok(oSpy.notCalled, "sectionVisibilityChange event is not fired when new subsSection is added to not selected section");

			// Clean-up
			fnDone();
		}.bind(this));

		assert.expect(2);

		// Act
		this.oObjectPage.getSections()[0].addSubSection(oFactory.getSubSection(3, [oFactory.getBlocks()], null));
	});

	QUnit.module("ObjectPage landmarkInfo API");

	QUnit.test("DynamicPage landmark info is set correctly", async function(assert) {
		var oObjectPage = helpers.generateObjectPageWithContent(oFactory, 3, false, true),
			oLandmarkInfo = new ObjectPageAccessibleLandmarkInfo({
				rootRole: "Region",
				rootLabel: "Root",
				contentRole: "Main",
				contentLabel: "Content",
				headerRole: "Banner",
				headerLabel: "Header",
				footerRole: "Region",
				footerLabel: "Footer",
				navigationRole: "Navigation",
				navigationLabel: "Navigation"
			});

		oObjectPage.placeAt('qunit-fixture');
		oObjectPage.setLandmarkInfo(oLandmarkInfo);
		await nextUIUpdate();

		assert.strictEqual(oObjectPage.$().attr("role"), "region", "Root role is set correctly.");
		assert.strictEqual(oObjectPage.$().attr("aria-label"), "Root", "Root label is set correctly.");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("role"), "main", "Content role is set correctly.");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("aria-label"), "Content", "Content label is set correctly.");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("role"), "banner", "Header role is set correctly.");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("aria-label"), "Header", "Header label is set correctly.");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("role"), "region", "Footer role is set correctly.");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("aria-label"), "Footer", "Footer label is set correctly.");
		assert.strictEqual(oObjectPage.$("anchorBar").attr("role"), "navigation", "Navigation role is set correctly.");
		assert.strictEqual(oObjectPage.$("anchorBar").attr("aria-label"), "Navigation", "Navigation label is set correctly.");

		oLandmarkInfo = new ObjectPageAccessibleLandmarkInfo({
			rootRole: "None",
			rootLabel: "Root",
			contentRole: "None",
			contentLabel: "Content",
			headerRole: "None",
			headerLabel: "Header",
			footerRole: "None",
			footerLabel: "Footer",
			navigationRole: "None",
			navigationLabel: "Navigation"
		});

		oObjectPage.setLandmarkInfo(oLandmarkInfo);
		await nextUIUpdate();

		assert.strictEqual(oObjectPage.$().attr("role"), undefined, "Root role is not set");
		assert.strictEqual(oObjectPage.$().attr("aria-label"), undefined, "Root label is not");
		assert.strictEqual(oObjectPage.$().attr("aria-roledescription"), undefined, "Root roledescription is not set");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("role"), undefined, "Content role  is not set");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("aria-label"), undefined, "Content label is not set");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("aria-roledescription"), undefined, "Content roledescription is not set");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("role"), undefined, "Header role is not set");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("aria-label"), undefined, "Header label is set correctly.");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("aria-roledescription"), undefined, "Header roledescription is not set");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("role"), undefined, "Footer role is not set");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("aria-label"), undefined, "Footer label is not set");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("aria-roledescription"), undefined, "Footer roledescription is not set");
		assert.strictEqual(oObjectPage.$("anchorBar").attr("role"), undefined, "Navigation role is not set");
		assert.strictEqual(oObjectPage.$("anchorBar").attr("aria-label"), undefined, "Navigation label  is not set");
		assert.strictEqual(oObjectPage.$("anchorBar").attr("aria-roledescription"), undefined, "Navigation roledescription is not set");

		oLandmarkInfo = new ObjectPageAccessibleLandmarkInfo({
			rootRole: "None",
			headerRole: "None"
		});

		oObjectPage.setLandmarkInfo(oLandmarkInfo);
		await nextUIUpdate();

		assert.strictEqual(oObjectPage.$().attr("aria-label"), undefined, "When rootRole is None and no label is set, root label is not set.");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("aria-label"), undefined, "When headerRole is None and no label is set, header label is not set.");


		oObjectPage.destroy();
	});


	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.module("ObjectPageComponentContainer", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-27_ObjectPageConfig",
				viewName: "view.UxAP-27_ObjectPageConfig"
			}).then(function (oView) {
				this.oView = oView;
				this.oComponentContainer = this.oView.byId("objectPageContainer");
				this.oView.placeAt("qunit-fixture");
				Core.applyChanges();
				this.oComponentContainer.attachEventOnce("componentCreated", function () {
					done();
				});
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("component instance", function (assert) {
		var oComponent = this.oComponentContainer._oComponent;

		// assert init state
		assert.ok(oComponent, "component is created");

		// Act: mock rerendering of the component container
		this.oComponentContainer.onBeforeRendering();

		// Check
		assert.strictEqual(this.oComponentContainer._oComponent, oComponent, "component instance is not changed");
	});

	QUnit.module("ObjectPageLayout - API - headerContentPinned property", {
		beforeEach: async function () {

			// Setup
			this.oObjectPage = oFactory.getObjectPage();
			this.oObjectPage.setHeaderContentPinned(true);
			this.oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());
			this.oHeader = this.oObjectPage._getHeaderContent();
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {

			// Clean up
			this.oObjectPage.destroy();
			this.oObjectPage = null;
			this.oHeader = null;
		}
	});

	QUnit.test("Pin button is pinned initially when all the requirements are met and the headerContentPinned property is true", function (assert) {

		// Assert
		assert.strictEqual(this.oObjectPage._bPinned, true, "Internal pin flag of the ObjectPage is 'true'");
		assert.strictEqual(this.oHeader._getPinButton().getPressed(), true, "The pin button of the header is pressed.");
	});

	QUnit.test("Pin button is pinned initially, but becomes unpinned once the headerContentPinned property of the ObjectPage is set to 'false'", function (assert) {

		// Act - Setting the headerContentPinned property to 'false' and forcing re-rendering
		this.oObjectPage.setHeaderContentPinned(false);
		this.oObjectPage.onAfterRendering();

		// Assert
		assert.strictEqual(this.oObjectPage._bPinned, false, "Internal pin flag of the ObjectPage is 'false'");
		assert.strictEqual(this.oHeader._getPinButton().getPressed(), false, "The pin button of the header is not pressed.");
	});

	QUnit.test("The headerContentPinned property is altered and an event is fired when the pin button is toggled", function (assert) {

		// Assert
		assert.expect(3);

		// Arrange
		var oObjectPage = this.oObjectPage,
			done = assert.async();
		this.oObjectPage.attachEventOnce("headerContentPinnedStateChange", function (oEvent) {

			// Assert
			assert.strictEqual(oObjectPage._bPinned, false, "Internal pin flag of the ObjectPage is 'false'");
			assert.strictEqual(oObjectPage.getHeaderContentPinned(), false, "headerContentPinned property is forced to 'false'");
			assert.strictEqual(oEvent.getParameter("pinned"), false, "headerContentPinnedStateChange event is fired with 'false' as parameter'");

			done();
		});

		// Act - Simulating pin button press
		this.oObjectPage._onPinUnpinButtonPress();
	});

	QUnit.test("The headerContentPinned property is altered and an event is fired when header is snapped by the user", function (assert) {

		// Assert
		assert.expect(3);

		// Arrange
		var oObjectPage = this.oObjectPage,
			done = assert.async();
		this.oObjectPage.attachEventOnce("headerContentPinnedStateChange", function (oEvent) {

			// Assert
			assert.strictEqual(oObjectPage._bPinned, false, "Internal pin flag of the ObjectPage is 'false'");
			assert.strictEqual(oObjectPage.getHeaderContentPinned(), false, "headerContentPinned property is forced to 'false'");
			assert.strictEqual(oEvent.getParameter("pinned"), false, "headerContentPinnedStateChange event is fired with 'false' as parameter'");

			done();
		});

		// Act - Simulating snapping of header by user interaction
		this.oObjectPage._snapHeader(true, true);
	});

	QUnit.test("The headerContentPinned property is preserved when screen is resized", function (assert) {

		// Arrange
		var oObjectPage = this.oObjectPage,
			done = assert.async(),
			vOriginalHeight = jQuery("#qunit-fixture").height();

		assert.expect(3);


		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Act
			jQuery("#qunit-fixture").height("100"); // container small enough

			setTimeout(function() {
				// Assert
				assert.strictEqual(oObjectPage._bPinned, false, "Header is unpinned /not by user interaction/");
				assert.strictEqual(oObjectPage.getHeaderContentPinned(), true, "headerContentPinned property is preserved");
				assert.strictEqual(oObjectPage._getHeaderContent()._getPinButton().getVisible(), false, "Pin button is hidden");

				jQuery("#qunit-fixture").height(vOriginalHeight);
				done();
			}, 800);
		});
	});

	QUnit.module("ObjectPageLayout rendering in hidden parent", {
		beforeEach: function () {

			// Setup
			this.oObjectPage = oFactory.getObjectPage();
		},
		afterEach: function () {

			// Clean up
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Store scroll location, when Object page DOM is not visible on the document on onBeforeRendering", async function(assert) {
		var oParentNode = document.getElementById("content");

		//Hiding parent element
		this.oObjectPage.placeAt("content");
		oParentNode.style.display = "none";

		await nextUIUpdate();
		//We want the _bDdomReady to be set to true on initial rendering
		this.oObjectPage._onAfterRenderingDomReady();
		//Assert
		assert.equal(this.oObjectPage._storeScrollLocation(), false, "We make sure we don`t store scroll location on hidden ObjectPage DOM reference");
	});

	function checkObjectExists(sSelector) {
		var oObject = jQuery(sSelector);
		return oObject.length !== 0;
	}

	function isTolerableDifference(iPos, iPos2, iTolerance) {
		return Math.abs(iPos - iPos2) <= iTolerance;
	}

});