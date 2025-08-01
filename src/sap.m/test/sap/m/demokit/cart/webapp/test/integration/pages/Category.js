sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/I18NText",
	"sap/ui/test/actions/Press"
], (Opa5, PropertyStrictEquals, AggregationFilled, AggregationLengthEquals, BindingPath, Properties, I18NText,
	Press) => {
	"use strict";

	Opa5.createPageObjects({
		onTheCategory: {
			viewName: "Category",
			actions: {
				iPressOnTheFirstProduct() {
					return this.waitFor({
						controlType: "sap.m.ObjectListItem",
						matchers: new BindingPath({path: "/Products('HT-1254')"}),
						actions: new Press(),
						errorMessage: "The product list does not contain required selection"
					});
				},

				iPressTheFilterButton() {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://filter"}),
						actions: new Press(),
						errorMessage: "The filter button was not found and could not be pressed"
					});
				},

				iPressOnTheProductBlasterExtreme() {
					this.waitFor({
						controlType: "sap.m.ObjectListItem",
						matchers: new Properties({title: "Blaster Extreme"}),
						actions: new Press(),
						errorMessage: "The product Blaster Extreme was not found and could not be pressed"
					});
				},

				iSelectTheAvailabilityFilteringOption() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: {
							i18NText: {
								propertyName: "title",
								key: "availabilityFilterTitle"
							}
						},
						actions: new Press(),
						errorMessage: "The Availability filtering option was not found and could not be pressed"
					});
				},

				iSelectTheSupplierFilteringOption() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: {
							i18NText: {
								propertyName: "title",
								key: "supplierFilterTitle"
							}
						},
						actions: new Press(),
						errorMessage: "The supplier filtering option was not found and could not be pressed"
					});
				},

				iSelectTheAvailableFilter() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: {
							i18NText: {
								propertyName: "title",
								key: "statusA"
							}
						},
						actions: new Press(),
						errorMessage: "The available check box was not found and could not be selected"
					});
				},

				iSelectTheDiscontinuedFilter() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: {
							i18NText: {
								propertyName: "title",
								key: "statusD"
							}
						},
						actions: new Press(),
						errorMessage: "The discontinued check box was not found and could not be selected"
					});
				},

				iSelectTheTechnocomFilter() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Technocom"}),
						actions: new Press(),
						errorMessage: "The Technocom check box was not found and could not be selected"
					});
				},

				iSelectTheOutOfStockFilter() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: {
							i18NText: {
								propertyName: "title",
								key: "statusO"
							}
						},
						actions: new Press(),
						errorMessage: "The out of stock check box was not found and could not be selected"
					});
				},

				iDeselectTheAvailableFilter() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: {
							i18NText: {
								propertyName: "title",
								key: "statusA"
							}
						},
						actions: new Press(),
						errorMessage: "The available check box was not found and could not be deselected"
					});
				},

				iDeselectTheDiscontinuedFilter() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: {
							i18NText: {
								propertyName: "title",
								key: "statusD"
							}
						},
						actions: new Press(),
						errorMessage: "The discontinued check box was not found and could not be deselected"
					});
				},

				iDeselectTheTechnoComFilter() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Technocom"}),
						actions: new Press(),
						errorMessage: "The Technocom check box was not found and could not be deselected"
					});
				},

				iPressOkButton() {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers:
							new I18NText({key: "VIEWSETTINGS_ACCEPT", propertyName: "text", useLibraryBundle: true}),
						actions: new Press(),
						errorMessage: "The ok button in the dialog was not found and could not be pressed"
					});
				},

				iPressCancelButton() {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers:
							new I18NText({key: "VIEWSETTINGS_CANCEL", propertyName: "text", useLibraryBundle: true}),
						actions: new Press(),
						errorMessage: "The cancel button in the dialog was not found and could not be pressed"
					});
				},

				iPressTheBackButtonInCategory() {
					return this.waitFor({
						id: "page",
						actions: new Press(),
						errorMessage: "The nav back button was not displayed"
					});
				},

				iPressTheBackButtonInDialog() {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://nav-back"}),
						actions: new Press(),
						errorMessage: "The back button in the dialog was not found and could not be pressed"
					});
				},

				iPressResetButton() {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers:
							new I18NText({key: "VIEWSETTINGS_RESET", propertyName: "text", useLibraryBundle: true}),
						actions: new Press(),
						errorMessage: "The reset button in the dialog was not found and could not be pressed"
					});
				},

				iSelectThePriceFilteringOption() {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: {
							i18NText: {
								propertyName: "title",
								key: "priceFilterTitle"
							}
						},
						actions: new Press(),
						errorMessage: "The price filtering option was not found and could not be pressed"
					});
				},

				iSetPriceFilterValues() {
					this.waitFor({
						controlType: "sap.m.RangeSlider",
						matchers: new PropertyStrictEquals({name: "value2", value: 5000}),
						success(oSlider) {
							oSlider[0].setValue(200).setValue2(500);
						},
						errorMessage: "The range slider control was not displayed and could not be scrolled"
					});
				},

				iChangeThePriceFilterValues() {
					this.waitFor({
						controlType: "sap.m.RangeSlider",
						matchers: new PropertyStrictEquals({name: "value2", value: 500}),
						success(oSlider) {
							oSlider[0].setValue(500).setValue2(1000);
						},
						errorMessage: "The range slider control was not displayed and could not be scrolled"
					});
				},

				iChangeToTheDefaultPriceFilterValues() {
					this.waitFor({
						controlType: "sap.m.RangeSlider",
						matchers: new PropertyStrictEquals({name: "value2", value: 500}),
						success(oSlider) {
							oSlider[0].setValue(0).setValue2(5000);
							// the slider change event is not fired automatically and need to be manually fired
							oSlider[0].fireEvent("change", {range: oSlider[0].getRange()});
						},
						errorMessage: "The range slider control was not displayed and could not be scrolled"
					});
				},

				iFilterOnAvailability() {
					this.iPressTheFilterButton();
					this.iSelectTheAvailabilityFilteringOption();
					this.iSelectTheAvailableFilter();
					this.iSelectTheDiscontinuedFilter();
					this.iPressOkButton();
				},

				iFilterOnSupplier() {
					this.iPressTheFilterButton();
					this.iSelectTheSupplierFilteringOption();
					this.iSelectTheTechnocomFilter();
					this.iPressOkButton();
				},

				iFilterOnAvailabilityAndPrice() {
					this.iPressTheFilterButton();
					this.iSelectTheOutOfStockFilter();
					this.iPressTheBackButtonInDialog();
					this.iSelectThePriceFilteringOption();
					this.iSetPriceFilterValues();
					this.iPressOkButton();
				},

				iCancelAPriceFilterChange() {
					this.iPressTheFilterButton();
					this.iChangeThePriceFilterValues();
					this.iPressCancelButton();
				},

				iChangeToTheDefaultFilterPriceValues() {
					this.iSelectThePriceFilteringOption();
					this.iChangeToTheDefaultPriceFilterValues();
					this.iPressOkButton();
				},

				iRemoveTheAvailabilityFilters() {
					this.iPressTheFilterButton();
					this.iDeselectTheAvailableFilter();
					this.iDeselectTheDiscontinuedFilter();
					this.iPressOkButton();
				},

				iRemoveTheSupplierFilter() {
					this.iPressTheFilterButton();
					this.iDeselectTheTechnoComFilter();
					this.iPressOkButton();
				},

				iPressOnCompareLink(ProductId) {
					return this.waitFor({
						controlType: "sap.m.ObjectAttribute",
						matchers: [
							new BindingPath({path: "/Products('" + ProductId + "')"}),
							new Properties({text: "Compare"})
						],
						actions: new Press(),
						errorMessage: "The product list does not contain required selection " + ProductId
					});
				}
			},

			assertions: {

				iShouldSeeTheProductList() {
					return this.waitFor({
						id: "productList",
						timeout: 30,
						success(oList) {
							Opa5.assert.ok(
								oList,
								"The product list was found"
							);
						},
						errorMessage: "The product list was not found"
					});
				},

				iShouldBeTakenToTheFlatScreensCategory() {
					return this.waitFor({
						controlType: "sap.m.Page",
						matchers: new PropertyStrictEquals({name: "title", value: "Flat Screens"}),
						success(aPage) {
							Opa5.assert.ok(
								aPage,
								"The flat screens category page was found"
							);
						},
						errorMessage: "The flat screens category page was not found"
					});
				},

				iShouldBeTakenToTheSpeakerCategory() {
					return this.waitFor({
						controlType: "sap.m.Page",
						matchers: new PropertyStrictEquals({name: "title", value: "Speakers"}),
						success(aPage) {
							Opa5.assert.ok(
								aPage,
								"The speaker category page was found"
							);
						},
						errorMessage: "The speaker category page was not found"
					});
				},

				iShouldSeeSomeEntriesInTheProductList() {
					this.waitFor({
						id: "productList",
						matchers: new AggregationFilled({name: "items"}),
						success(oList) {
							Opa5.assert.ok(
								oList.getItems().length > 0,
								"The product list has entries"
							);
						},
						errorMessage: "The product list does not contain any entries"
					});
				},

				iShouldSeeAllProductsOfTheCategory() {
					this.waitFor({
						id: "productList",
						matchers: new AggregationFilled({name: "items"}),
						success(oList) {
							Opa5.assert.ok(
								oList.getItems().length === 3,
								"All products of the category are visible"
							);
						},
						errorMessage: "The product list was not filtered"
					});
				},

				iShouldSeeAFilterButton() {
					this.waitFor({
						id: "masterListFilterButton",
						success() {
							Opa5.assert.ok(true, "The Master list page has a filter button");
						},
						errorMessage: "The Master list page has no filter button"
					});
				},

				iShouldOnlySeeTheAvailableAndDiscontinuedProducts() {
					this.waitFor({
						id: "productList",
						matchers: new AggregationLengthEquals({name: "items", length: 2}),
						success(oList) {
							Opa5.assert.ok(oList, "The category list shows just the available and discontinued products");
						},
						errorMessage: "The category list shows products other than available or discontinued"
					});
				},

				iShouldOnlySeeTheOutOfStockProducts() {
					this.waitFor({
						id: "productList",
						matchers: new AggregationLengthEquals({name: "items", length: 1}),
						success(oList) {
							Opa5.assert.ok(oList, "The category list shows just the out of stock products");
						},
						errorMessage: "The category list shows products other than out of stock"
					});
				},

				iShouldOnlySeeTheTechnoComProducts() {
					this.waitFor({
						id: "productList",
						matchers: new AggregationLengthEquals({name: "items", length: 1}),
						success(oList) {
							Opa5.assert.ok(oList, "The category list shows just the TechnoCom products");
						},
						errorMessage: "The category list shows products from supplier other than TechnoCom "
					});
				},

				iShouldOnlySeeOutOfStockAndCheapProducts() {
					this.waitFor({
						id: "productList",
						matchers: new AggregationLengthEquals({name: "items", length: 1}),
						success(oList) {
							Opa5.assert.ok(oList, "The category list shows only cheap and out of stock products");
						},
						errorMessage: "The category list did not show cheap and out of stock products"
					});
				},

				iShouldSeeAnAvailabilityInfoToolbar() {
					this.waitFor({
						id: "categoryInfoToolbarTitle",
						matchers: new PropertyStrictEquals({name: "text", value: "Filtered by Availability"}),
						success() {
							Opa5.assert.ok(true, "The category list has an info toolbar");
						},
						errorMessage: "The info toolbar of the category list was not found"
					});
				},

				iShouldSeeAnAvailabilityAndPriceInfoToolbar() {
					this.waitFor({
						id: "categoryInfoToolbarTitle",
						matchers: new PropertyStrictEquals({name: "text", value: "Filtered by Availability, Price (200 - 500 EUR)"}),
						success() {
							Opa5.assert.ok(true, "The category list has info toolbar");
						},
						errorMessage: "The info toolbar of the category list was not found"
					});
				},

				iShouldSeeASupplierInfoToolbar() {
					this.waitFor({
						id: "categoryInfoToolbarTitle",
						matchers: new PropertyStrictEquals({name: "text", value: "Filtered by Supplier"}),
						success() {
							Opa5.assert.ok(true, "The category list has an info toolbar");
						},
						errorMessage: "The info toolbar of the category list was not found"
					});
				},

				iShouldNotSeeAnInfoToolbar() {
					this.waitFor({
						id: "productList",
						success(oList) {
							const oInfoToolbar = oList.getAggregation("infoToolbar");
							const sTitleText = oInfoToolbar.getAggregation("content")[0].getText();
							Opa5.assert.ok(oInfoToolbar.getVisible() === false &&
								sTitleText === "",
								"The category list has no info toolbar");
						},
						errorMessage: "The category list has an info toolbar"
					});
				},

				iShouldTestTheFilterCount(iCountNumber) {
					const sSuccessMessage = "The price filter count is correctly set up";
					const sErrorMessage = "The price filter count doesn't correctly set up";

					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: {
							i18NText: {
								propertyName: "title",
								key: "priceFilterTitle"
							}
						},
						success(oItem) {
							Opa5.assert.ok(oItem[0].getCounter() === iCountNumber, sSuccessMessage);
						},
						errorMessage: sErrorMessage
					});
				},

				iShouldOnlySeeAvailableAndDiscontinuedProductsWithInfoToolbar() {
					this.iShouldOnlySeeTheAvailableAndDiscontinuedProducts();
					this.iShouldSeeAnAvailabilityInfoToolbar();
				},

				iShouldOnlySeeTechnoComProductsAndAnInfoToolbar() {
					this.iShouldOnlySeeTheTechnoComProducts();
					this.iShouldSeeASupplierInfoToolbar();
				},

				iShouldOnlySeeOutOfStockProductsAndAnInfoToolbar() {
					this.iShouldOnlySeeTheOutOfStockProducts();
					this.iShouldSeeAnAvailabilityInfoToolbar();
				},

				iShouldOnlySeeOutOfStockAndCheapProductsWithInfoToolbar() {
					this.iShouldOnlySeeOutOfStockAndCheapProducts();
					this.iShouldSeeAnAvailabilityAndPriceInfoToolbar();
				},

				iShouldSeeAllProductsAndNoInfoToolbar() {
					this.iShouldSeeAllProductsOfTheCategory();
					this.iShouldNotSeeAnInfoToolbar();
				},

				iShouldSeeCompareLinkOnListEntry() {
					this.waitFor({
						controlType: "sap.m.ObjectAttribute",
						matchers: {
							i18NText: {
								propertyName: "text",
								key: "CompareWith"
							}
						},
						success() {
							Opa5.assert.ok(true, "List entry has an compare link");
						},
						errorMessage: "List entry has no compare link"
					});
				}
			}
		}
	});
});
