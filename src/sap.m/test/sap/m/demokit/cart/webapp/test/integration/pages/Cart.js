sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/AggregationEmpty",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/AggregationContainsPropertyEqual",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/actions/Press"
], (Opa5, AggregationFilled, AggregationEmpty, Properties, AggregationContainsPropertyEqual,
		AggregationLengthEquals, BindingPath, Press) => {
	"use strict";

	Opa5.createPageObjects({
		onTheCart: {
			viewName: "Cart",
			actions: {
				iPressOnTheEditButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new Properties({icon: "sap-icon://edit"}),
						actions: new Press(),
						errorMessage: "The edit button could not be pressed"
					});
				},

				iPressOnTheDeleteButton() {
					return this.waitFor({
						id: "entryList",
						matchers: new Properties({mode: "Delete"}),
						actions: (oList) => {
							oList.fireDelete({listItem: oList.getItems()[0]});
						},
						errorMessage: "The delete button could not be pressed"
					});
				},

				iPressOnTheSaveChangesButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: {
							i18NText: {
								propertyName: "text",
								key: "cartDoneButtonText"
							}
						},
						actions: new Press(),
						errorMessage: "The accept button could not be pressed"
					});
				},

				iPressOnTheProceedButton() {
					return this.waitFor({
						id: "proceedButton",
						actions: new Press()
					});
				},

				iPressOnSaveForLaterForTheFirstProduct() {
					return this.waitFor({
						controlType: "sap.m.ObjectAttribute",
						matchers: new BindingPath({path: "/cartEntries/HT-1254", modelName: "cartProducts"}),
						actions: new Press()
					});
				},

				iPressOnAddBackToBasketForTheFirstProduct() {
					return this.waitFor({
						controlType: "sap.m.ObjectAttribute",
						matchers: new BindingPath({path: "/savedForLaterEntries/HT-1254", modelName: "cartProducts"}),
						actions: new Press()
					});
				},

				iPressTheBackButton() {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new Properties({type: "Back"}),
						actions: new Press(),
						errorMessage: "The back button was not found and could not be pressed"
					});
				}
			},

			assertions: {
				iShouldSeeTheProductInMyCart() {
					return this.waitFor({
						id: "entryList",
						matchers: new AggregationFilled({name: "items"}),
						success() {
							Opa5.assert.ok(true, "The cart has entries");
						},
						errorMessage: "The cart does not contain any entries"
					});
				},

				iShouldSeeTheCart() {
					return this.waitFor({
						success() {
							Opa5.assert.ok(true, "The cart was successfully displayed");
						},
						errorMessage: "The cart was not displayed"
					});
				},

				iShouldNotSeeASaveForLaterFooter() {
					return this.waitFor({
						id: "entryList",
						success(oList) {
							Opa5.assert.strictEqual("", oList.getFooterText(), "The footer is not visible");
						},
						errorMessage: "The footer is still visible"
					});
				},

				iShouldSeeAnEmptyCart() {
					return this.waitFor({
						id: "entryList",
						matchers: new AggregationEmpty({name: "items"}),
						success() {
							Opa5.assert.ok(true, "The cart has no entries");
						},
						errorMessage: "The cart does not contain any entries"
					});
				},

				theProceedHelper(bIsEnabled) {
					let sErrorMessage = "The proceed button is enabled";
					let sSuccessMessage = "The proceed button is disabled";
					if (bIsEnabled) {
						sErrorMessage = "The proceed button is disabled";
						sSuccessMessage = "The proceed button is enabled";
					}
					return this.waitFor({
						controlType: "sap.m.Button",
						autoWait: bIsEnabled,
						matchers: new Properties({
							type: "Accept"
						}),
						success(aButtons) {
							Opa5.assert.strictEqual(
								aButtons[0].getEnabled(), bIsEnabled, sSuccessMessage
							);
						},
						errorMessage: sErrorMessage
					});
				},

				iShouldSeeTheProceedButtonDisabled() {
					return this.theProceedHelper(false);
				},

				iShouldSeeTheProceedButtonEnabled() {
					return this.theProceedHelper(true);
				},

				theEditButtonHelper(bIsEnabled) {
					let sErrorMessage = "The edit button is enabled";
					let sSuccessMessage = "The edit button is disabled";
					if (bIsEnabled) {
						sErrorMessage = "The edit button is disabled";
						sSuccessMessage = "The edit button is enabled";
					}
					return this.waitFor({
						controlType: "sap.m.Button",
						autoWait: bIsEnabled,
						matchers: new Properties({
							icon: "sap-icon://edit",
							enabled: bIsEnabled
						}),
						success(aButtons) {
							Opa5.assert.strictEqual(
								aButtons[0].getEnabled(), bIsEnabled, sSuccessMessage
							);
						},
						errorMessage: sErrorMessage
					});
				},

				iShouldSeeTheEditButtonDisabled() {
					return this.theEditButtonHelper(false);
				},

				iShouldSeeTheEditButtonEnabled() {
					return this.theEditButtonHelper(true);
				},

				iShouldSeeTheDeleteButton() {
					return this.waitFor({
						controlType: "sap.m.List",
						matchers: new Properties({mode: "Delete"}),
						success(aLists) {
							Opa5.assert.ok(
								aLists[0],
								"The delete button was found"
							);
						},
						errorMessage: "The delete button was not found"
					});
				},

				iShouldNotSeeTheDeletedItemInTheCart() {
					return this.waitFor({
						id: "entryList",
						matchers(oList) {
							const bExist =  new AggregationContainsPropertyEqual({
								aggregationName: "items",
								propertyName: "title",
								propertyValue: "Bending Screen 21HD"
							}).isMatching(oList);
							return !bExist;
						},
						success() {
							Opa5.assert.ok(true, "The cart does not contain our product");
						},
						errorMessage: "The cart contains our product"
					});
				},

				iShouldBeTakenToTheCart() {
					return this.waitFor({
						id: "entryList",
						success(oList) {
							Opa5.assert.ok(
								oList,
								"The cart was found"
							);
						},
						errorMessage: "The cart was not found"
					});
				},

				iShouldSeeOneProductInMySaveForLaterList() {
					return this.waitFor({
						id: "saveForLaterList",
						success(oList) {
							Opa5.assert.strictEqual(oList.getItems().length, 1, "Product saved for later");
						}
					});
				},

				iShouldSeeAnEmptySaveForLaterList() {
					return this.waitFor({
						id: "saveForLaterList",
						matchers: new AggregationEmpty({name: "items"}),
						success(oList) {
							Opa5.assert.ok(true, "The savelist was empty");
						},
						errorMessage: "The savelist still has entries"
					});
				},

				iShouldSeeTheWelcomeScreen() {
					return this.waitFor({
						id: "saveForLaterList",
						success(oList) {
							Opa5.assert.strictEqual(oList.getItems().length, 1, "Product saved for later");
						}
					});
				},

				iShouldSeeTheTotalPriceEqualToZero() {
					return this.waitFor({
						id: "totalPriceText",
						matchers: {
							i18NText: {
								propertyName: "text",
								key: "cartTotalPrice",
								parameters: ["0,00", "EUR"]
							}
						},
						success() {
							Opa5.assert.ok(true, "Total price is updated correctly");
						},
						errorMessage: "Total price is not updated correctly"
					});
				},

				iShouldSeeTheTotalPriceUpdated() {
					return this.waitFor({
						id: "totalPriceText",
						matchers: {
							i18NText: {
								propertyName: "text",
								key: "cartTotalPrice",
								parameters: ["250,00", "EUR"]
							}
						},
						success() {
							Opa5.assert.ok(true, "Total price is updated correctly");
						},
						errorMessage: "Total price is not updated correctly"
					});
				}
			}
		}
	});
});
