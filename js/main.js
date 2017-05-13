var totalCost = 0;
var totalHeld = 0;

var dateObj = new Date();
var today = dateObj.toISOString().substring(0, 10);
var chartFirstLoad = true;

$(document).ready(function() {
	$.ajax({
		url: "data.csv",
		dataType: "text",
		success: function(data) {
			var parsedBuyData = $.csv.toObjects(data);
			
			fillDataTable(parsedBuyData);
			fillStatTable();
		}
	});
	
	updatePrice();
	setInterval(updatePrice, 30000);
});

function fillDataTable(buyData) {
	var $tableBody = $("#data-body");
	
	buyData.forEach(function(txData) {
		var cost = "";
		if (txData.costPerETH != "") {
			cost = txData.amount * txData.costPerETH;
			totalCost += cost;
			
			cost = "$" + cost.toFixed(2);
			
			txData.costPerETH = "$" + parseFloat(txData.costPerETH).toFixed(2);
		}
		
		totalHeld += parseFloat(txData.amount);
		
		$tableBody.append(
			"<tr>" +
				"<td>" + txData.date + "</td>" +
				"<td>" + txData.amount + "</td>" +
				"<td>" + txData.costPerETH + "</td>" +
				"<td>" + cost + "</td>" +
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
		
		if (chartFirstLoad) {
			updateChart(price);
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

function updateChart(spotPrice) {
	var apiUrl = "https://www.coinbase.com/api/v2/prices/ETH-USD/historic?period=month";
	
	$.getJSON(apiUrl, function(data) {
		var dayPriceData = [];
		var prices = data.data.prices;
		
		$.each(prices, function(i, priceData) {
			if (priceData.time.indexOf("T00:00:00Z") > -1) {
				var date = priceData.time.substring(0, "YYYY-MM-DD".length);
				var price = priceData.price;
				
				var worth = price * totalHeld;
				var profitLoss = worth - totalCost;
				
				if (today != date) {
					dayPriceData.push({
						date: date,
						profitLoss: profitLoss.toFixed(2)
					});
				}
			}
		});
		
		dayPriceData.reverse();
		
		var currentWorth = spotPrice * totalHeld;
		var currentProfitLoss = currentWorth - totalCost;
		
		dayPriceData.push({
			date: today,
			profitLoss: currentProfitLoss.toFixed(2)
		});
		
		console.log(dayPriceData); // debug
		drawChart(dayPriceData);
	});
	
	chartFirstLoad = false;
}

function drawChart(data) {
	new Morris.Line({
		element: "chart-pl",
		data: data,
		xkey: "date",
		ykeys: ["profitLoss"],
		labels: ["Unrealized P/L (USD)"],
		xLabels: "day"
	});
}