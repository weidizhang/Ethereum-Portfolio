var totalCost = 0;
var totalHeld = 0;
var heldTimeline = {
	0: {
		amount: 0,
		cost : 0
	}
};

var dateObj = new Date();
var today = dateObj.toISOString().substring(0, 10);

var dayPriceData = [];
var chartFirstLoad = true;

var rowWidth = 0;

var mobileZoomer;

$(document).ready(function() {
	$.ajax({
		url: "data.csv",
		dataType: "text",
		success: function(data) {
			var parsedBuyData = $.csv.toObjects(data);
			
			fillDataTable(parsedBuyData);
			fillStatTable();

			createHeldTimeline(parsedBuyData);
		}
	});
	
	makeChartAutoResize();
	
	updatePrice();
	setInterval(updatePrice, config.refreshInterval * 1000);

	fixMobilePortraitMode();
});

function makeChartAutoResize() {
	var $statTable = $("#stat-table");
	rowWidth = $statTable.width();
	
	$(window).resize(function() {
		if (!chartFirstLoad && ($statTable.width() != rowWidth)) {
			drawChart();
			
			rowWidth = $statTable.width();
		}
	});
}

function fixMobilePortraitMode() {
	var bodyZoom = 1;

	mobileZoomer = setInterval(function() {
		if ($("body").get(0).scrollWidth > $(window).width()) {
			bodyZoom -= 0.15;
			$("body").css("zoom", bodyZoom);
		}
		else {
			clearInterval(mobileZoomer);
		}
	}, 1);
}

function createHeldTimeline(buyData) {
	var amountCumulative = 0;
	var costCumulative = 0;

	buyData.forEach(function(txData) {
		var date = txData.date + "T00:00:00Z";
		var timestamp = (new Date(date)).getTime() / 1000;

		amountCumulative += parseFloat(txData.amount);
		costCumulative += (txData.amount * txData.costPerETH);

		heldTimeline[timestamp] = {
			amount: amountCumulative,
			cost: costCumulative
		};
	});
}

function fillDataTable(buyData) {
	var $tableBody = $("#data-body");
	
	buyData.forEach(function(txData) {
		var cost = "";
		if (txData.costPerETH != "") {
			cost = txData.amount * txData.costPerETH;
			totalCost += cost;
			
			cost = "$" + cost.toFixed(2);
			
			var costPerETH = "$" + parseFloat(txData.costPerETH).toFixed(2);
		}
		
		totalHeld += parseFloat(txData.amount);
		
		$tableBody.append(
			"<tr class=\"data-row\">" +
				"<td>" + txData.date + "</td>" +
				"<td class=\"tx-amount\">" + txData.amount + "</td>" +
				"<td>" + costPerETH + "</td>" +
				"<td class=\"tx-cost\">" + cost + "</td>" +
				"<td class=\"tx-worth\"></td>" +
				"<td class=\"tx-pl\"></td>" +
			"</tr>"
		);
	});
}

function fillStatTable() {
	$("#stat-held").text(totalHeld.toFixed(8));
	$("#stat-cost").text("$" + totalCost.toFixed(2));
	
	var avgCostPer = totalCost / totalHeld;
	$("#stat-avg-cost").text("$" + avgCostPer.toFixed(2));	
	
	var desiredPercent = config.desiredProfitPercent / 100;
	var priceDesired = desiredPercent * avgCostPer + avgCostPer;
	
	$("#desired-percent").text(config.desiredProfitPercent);
	$("#stat-desired-cost").text("$" + priceDesired.toFixed(2));
}

function updatePrice(currency) {
	var apiUrl = "https://www.coinbase.com/api/v2/prices/ETH-USD/spot";
	
	$.getJSON(apiUrl, function(data) {
		price = data["data"]["amount"];		
		$("#eth-value").text(price);
		
		updateStatTable(price);
		updateDataTable(price);
		
		if (chartFirstLoad) {
			updateHistoricalPrices(price);
		}
		else {
			updateChartData(price);
		}
	});
}

function updateStatTable(spotPrice) {
	var worth = totalHeld * spotPrice;
	var netPL = worth - totalCost;
	var percentPL = netPL / totalCost * 100;
	
	var profitIndicator = "+";
	var textClass = "in-profit";
	if (netPL < 0) {
		profitIndicator = "-";
		textClass = "in-loss";
		
		netPL *= -1;
		percentPL *= -1;
	}
	
	$("#stat-worth").text("$" + worth.toFixed(2));
	
	$("#stat-pl-usd").text(profitIndicator + "$" + netPL.toFixed(2));
	$("#stat-pl-percent").text(profitIndicator + percentPL.toFixed(2));
	
	$("#stat-pl-usd").attr("class", textClass);
	$("#stat-pl-percent").attr("class", textClass);
}

function updateDataTable(spotPrice) {
	$(".data-row").each(function(i, element) {
		var $tx = $(element);
		
		var amount = parseFloat($tx.children(".tx-amount").text());
		var cost = parseFloat($tx.children(".tx-cost").text().substring(1));
		
		var worth = spotPrice * amount;
		$tx.children(".tx-worth").text("$" + worth.toFixed(2));
		
		var txPL = worth - cost;
		var txPercentPL = txPL / cost * 100;
		
		var profitIndicator = "+";
		var textClass = "in-profit";
		if (txPL < 0) {
			profitIndicator = "-";
			textClass = "in-loss";
			
			txPL *= -1;
			txPercentPL *= -1;
		}
		
		$tx.children(".tx-pl").removeClass("in-profit in-loss");
		$tx.children(".tx-pl").addClass(textClass);
		$tx.children(".tx-pl").text(profitIndicator + "$" + txPL.toFixed(2) + " (" + profitIndicator + txPercentPL.toFixed(2) + "%)");
	});
}

function getPortfolioAtTime(timestamp) {
	var timeBelow;

	$.each(heldTimeline, function(key, value) {
		var holdTime = parseInt(key);

		if (timestamp >= holdTime) {
			timeBelow = key;
		}
	});

	return heldTimeline[timeBelow];
}

function updateHistoricalPrices(spotPrice) {
	var apiUrl = "https://www.coinbase.com/api/v2/prices/ETH-USD/historic?period=" + config.chartTimeFrame;
	
	$.getJSON(apiUrl, function(data) {		
		var rawData = JSON.stringify(data);
		var firstHour = "";
		
		for (var hour = 0; hour < 10; hour++) {
			var hourString = "T0" + hour + ":00:00Z";
			
			if (rawData.indexOf(hourString) > -1) {
				firstHour = hourString;
				break;
			}
		}
		
		var prices = data.data.prices;
		
		$.each(prices, function(i, priceData) {
			if (priceData.time.indexOf(firstHour) > -1) {
				var date = priceData.time.substring(0, "YYYY-MM-DD".length);
				var price = priceData.price;
				
				var timestamp = (new Date(date + "T00:00:00Z")).getTime() / 1000;
				
				var portfolioAtTime = getPortfolioAtTime(timestamp);
				var totalHeldAtTime = portfolioAtTime.amount;
				var totalCostAtTime = portfolioAtTime.cost;

				var worth = price * totalHeldAtTime;
				var profitLoss = worth - totalCostAtTime;
				
				if (today != date) {
					dayPriceData.push({
						date: date,
						profitLoss: profitLoss.toFixed(2)
					});
				}
			}
		});
		
		dayPriceData.reverse();
		dayPriceData.push({
			date: today
		});
		
		updateChartData(spotPrice);
	});
	
	chartFirstLoad = false;
}

function updateChartData(spotPrice) {
	var lastPriceData = dayPriceData.pop();
	
	var currentWorth = spotPrice * totalHeld;
	var currentProfitLoss = currentWorth - totalCost;
	
	lastPriceData.profitLoss = currentProfitLoss.toFixed(2);	
	dayPriceData.push(lastPriceData);
	
	drawChart();
}

function drawChart() {
	$("#chart-pl").empty();
	
	new Morris.Line({
		element: "chart-pl",
		data: dayPriceData,
		xkey: "date",
		ykeys: ["profitLoss"],
		labels: ["Unrealized P/L (USD)"],
		xLabels: "day",
		hideHover: true
	});
}