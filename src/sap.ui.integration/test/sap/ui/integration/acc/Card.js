sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/m/Page",
	"sap/m/App"
], function(Card, Page, App) {
	"use strict";

	var oListCardInteractive_Manifest = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.highlight.list.card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"actions": [
					{
						"type": "Navigation",
						"parameters": {
							"url": "/quickLinks"
						}
					}
				],
				"title": "Top 5 Products",
				"subtitle": "These are the top sellers this month",
				"icon": {
					"src": "sap-icon://desktop-mobile"
				},
				"status": {
					"text": "5 of 20"
				}
			},
			"content": {
				"data": {
					"json": [{
						"Name": "Comfort Easy",
						"Description": "32 GB Digital Assistant with high-resolution color screen",
						"Highlight": "Error"
					},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
							"Highlight": "Warning"
						},
						{
							"Name": "Notebook Professional 15",
							"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
							"Highlight": "Success"
						},
						{
							"Name": "Ergo Screen E-I",
							"Description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
							"Highlight": "Information"
						},
						{
							"Name": "Laser Professional Eco",
							"Description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
							"Highlight": "None"
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};
	var oListCard_Manifest = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.highlight.list.card",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "5 Products - no actions",
				"subtitle": "These are the top sellers this month",
				"icon": {
					"src": "sap-icon://desktop-mobile"
				},
				"status": {
					"text": "5 of 20"
				}
			},
			"content": {
				"data": {
					"json": [{
						"Name": "Comfort Easy",
						"Description": "32 GB Digital Assistant with high-resolution color screen",
						"Highlight": "Error"
					},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
							"Highlight": "Warning"
						},
						{
							"Name": "Notebook Professional 15",
							"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
							"Highlight": "Success"
						},
						{
							"Name": "Ergo Screen E-I",
							"Description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
							"Highlight": "Information"
						},
						{
							"Name": "Laser Professional Eco",
							"Description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
							"Highlight": "None"
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};

	var oNumericHeaderInteractive = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.line.card"
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"actions": [
					{
						"type": "Navigation",
						"parameters": {
							"url": "/quickLinks"
						}
					}
				],
				"type": "Numeric",
				"data": {
					"json": {
						"number": "65.34",
						"unit": "K",
						"trend": "Down",
						"state": "Error",
						"target": {
							"number": 100,
							"unit": "K"
						},
						"deviation": {
							"number": 34.7
						},
						"details": "Q1, 2018"
					}
				},
				"title": "Project Cloud Transformation",
				"subtitle": "Revenue",
				"unitOfMeasurement": "EUR",
				"mainIndicator": {
					"number": "{number}",
					"unit": "{unit}",
					"trend": "{trend}",
					"state": "{state}"
				},
				"details": "{details}",
				"sideIndicators": [
					{
						"title": "Target",
						"number": "{target/number}",
						"unit": "{target/unit}"
					},
					{
						"title": "Deviation",
						"number": "{deviation/number}",
						"unit": "%"
					}
				]
			},
			"content": {
				"chartType": "Line",
				"legend": {
					"visible": "{legend/visible}",
					"position": "{legend/position}",
					"alignment": "{legend/alignment}"
				},
				"plotArea": {
					"dataLabel": {
						"visible": true
					},
					"categoryAxisText": {
						"visible": false
					},
					"valueAxisText": {
						"visible": false
					}
				},
				"title": {
					"text": "Line chart",
					"visible": true,
					"alignment": "Left"
				},
				"measureAxis": "valueAxis",
				"dimensionAxis": "categoryAxis",
				"data": {
					"json": {
						"dimensions": {
							"weekLabel": "Weeks"
						},
						"measures": {
							"revenueLabel": "Revenue",
							"costLabel": "Costs"
						},
						"legend": {
							"visible": true,
							"position": "Bottom",
							"alignment": "TopLeft"
						},
						"list": [
							{
								"Week": "CW14",
								"Revenue": 431000.22,
								"Cost": 230000.00,
								"Cost1": 24800.63,
								"Cost2": 205199.37,
								"Cost3": 199999.37,
								"Target": 500000.00,
								"Budget": 210000.00
							},
							{
								"Week": "CW15",
								"Revenue": 494000.30,
								"Cost": 238000.00,
								"Cost1": 99200.39,
								"Cost2": 138799.61,
								"Cost3": 200199.37,
								"Target": 500000.00,
								"Budget": 224000.00
							},
							{
								"Week": "CW16",
								"Revenue": 491000.17,
								"Cost": 221000.00,
								"Cost1": 70200.54,
								"Cost2": 150799.46,
								"Cost3": 80799.46,
								"Target": 500000.00,
								"Budget": 238000.00
							},
							{
								"Week": "CW17",
								"Revenue": 536000.34,
								"Cost": 280000.00,
								"Cost1": 158800.73,
								"Cost2": 121199.27,
								"Cost3": 108800.46,
								"Target": 500000.00,
								"Budget": 252000.00
							},
							{
								"Week": "CW18",
								"Revenue": 675000.00,
								"Cost": 230000.00,
								"Cost1": 140000.91,
								"Cost2": 89999.09,
								"Cost3": 100099.09,
								"Target": 600000.00,
								"Budget": 266000.00
							},
							{
								"Week": "CW19",
								"Revenue": 680000.00,
								"Cost": 250000.00,
								"Cost1": 172800.15,
								"Cost2": 77199.85,
								"Cost3": 57199.85,
								"Target": 600000.00,
								"Budget": 280000.00
							},
							{
								"Week": "CW20",
								"Revenue": 659000.14,
								"Cost": 325000.00,
								"Cost1": 237200.74,
								"Cost2": 87799.26,
								"Cost3": 187799.26,
								"Target": 600000.00,
								"Budget": 294000.00
							}
						]
					},
					"path": "/list"
				},
				"dimensions": [
					{
						"label": "{dimensions/weekLabel}",
						"value": "{Week}"
					}
				],
				"measures": [
					{
						"label": "{measures/revenueLabel}",
						"value": "{Revenue}"
					},
					{
						"label": "{measures/costLabel}",
						"value": "{Cost}"
					}
				]
			}
		}
	};

	var oNumericHeader = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.line.card"
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"type": "Numeric",
				"data": {
					"json": {
						"number": "65.34",
						"unit": "K",
						"trend": "Down",
						"state": "Error",
						"target": {
							"number": 100,
							"unit": "K"
						},
						"deviation": {
							"number": 34.7
						},
						"details": "Q1, 2018"
					}
				},
				"title": "Project Cloud Transformation - no actions",
				"subtitle": "Revenue",
				"unitOfMeasurement": "EUR",
				"mainIndicator": {
					"number": "{number}",
					"unit": "{unit}",
					"trend": "{trend}",
					"state": "{state}"
				},
				"details": "{details}",
				"sideIndicators": [
					{
						"title": "Target",
						"number": "{target/number}",
						"unit": "{target/unit}"
					},
					{
						"title": "Deviation",
						"number": "{deviation/number}",
						"unit": "%"
					}
				]
			},
			"content": {
				"chartType": "Line",
				"legend": {
					"visible": "{legend/visible}",
					"position": "{legend/position}",
					"alignment": "{legend/alignment}"
				},
				"plotArea": {
					"dataLabel": {
						"visible": true
					},
					"categoryAxisText": {
						"visible": false
					},
					"valueAxisText": {
						"visible": false
					}
				},
				"title": {
					"text": "Line chart",
					"visible": true,
					"alignment": "Left"
				},
				"measureAxis": "valueAxis",
				"dimensionAxis": "categoryAxis",
				"data": {
					"json": {
						"dimensions": {
							"weekLabel": "Weeks"
						},
						"measures": {
							"revenueLabel": "Revenue",
							"costLabel": "Costs"
						},
						"legend": {
							"visible": true,
							"position": "Bottom",
							"alignment": "TopLeft"
						},
						"list": [
							{
								"Week": "CW14",
								"Revenue": 431000.22,
								"Cost": 230000.00,
								"Cost1": 24800.63,
								"Cost2": 205199.37,
								"Cost3": 199999.37,
								"Target": 500000.00,
								"Budget": 210000.00
							},
							{
								"Week": "CW15",
								"Revenue": 494000.30,
								"Cost": 238000.00,
								"Cost1": 99200.39,
								"Cost2": 138799.61,
								"Cost3": 200199.37,
								"Target": 500000.00,
								"Budget": 224000.00
							},
							{
								"Week": "CW16",
								"Revenue": 491000.17,
								"Cost": 221000.00,
								"Cost1": 70200.54,
								"Cost2": 150799.46,
								"Cost3": 80799.46,
								"Target": 500000.00,
								"Budget": 238000.00
							},
							{
								"Week": "CW17",
								"Revenue": 536000.34,
								"Cost": 280000.00,
								"Cost1": 158800.73,
								"Cost2": 121199.27,
								"Cost3": 108800.46,
								"Target": 500000.00,
								"Budget": 252000.00
							},
							{
								"Week": "CW18",
								"Revenue": 675000.00,
								"Cost": 230000.00,
								"Cost1": 140000.91,
								"Cost2": 89999.09,
								"Cost3": 100099.09,
								"Target": 600000.00,
								"Budget": 266000.00
							},
							{
								"Week": "CW19",
								"Revenue": 680000.00,
								"Cost": 250000.00,
								"Cost1": 172800.15,
								"Cost2": 77199.85,
								"Cost3": 57199.85,
								"Target": 600000.00,
								"Budget": 280000.00
							},
							{
								"Week": "CW20",
								"Revenue": 659000.14,
								"Cost": 325000.00,
								"Cost1": 237200.74,
								"Cost2": 87799.26,
								"Cost3": 187799.26,
								"Target": 600000.00,
								"Budget": 294000.00
							}
						]
					},
					"path": "/list"
				},
				"dimensions": [
					{
						"label": "{dimensions/weekLabel}",
						"value": "{Week}"
					}
				],
				"measures": [
					{
						"label": "{measures/revenueLabel}",
						"value": "{Revenue}"
					},
					{
						"label": "{measures/costLabel}",
						"value": "{Cost}"
					}
				]
			}
		}
	};

	var oListCardInteractive = new Card({
		manifest: oListCardInteractive_Manifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	var oListCard = new Card({
		manifest: oListCard_Manifest,
		width: "400px"
	}).addStyleClass("sapUiSmallMargin");

	var oAnalyticalCardInteractive = new Card({
		manifest: oNumericHeaderInteractive,
		width: "400px",
		height: "300px"
	}).addStyleClass("sapUiSmallMargin");

	var oAnalyticalCard = new Card({
		manifest: oNumericHeader,
		width: "400px",
		height: "300px"
	}).addStyleClass("sapUiSmallMargin");

	var oPage = new Page("myPage", {
				content: [
					oListCardInteractive,
					oListCard,
					oAnalyticalCardInteractive,
					oAnalyticalCard
				]
		}),
		oApp = new App("myApp", {
				initialPage:"myPage"
		});
	oApp.addPage(oPage);
	oApp.placeAt("body");
});
