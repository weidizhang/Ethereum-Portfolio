var totalCost = 0;
var totalHeld = 0;

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
}

function updatePrice(currency) {
	var apiUrl = "https://www.coinbase.com/api/v2/prices/ETH-USD/spot";
	
	$.getJSON(apiUrl, function(data) {
		price = data["data"]["amount"];		
		$("#eth-value").text(price);
		
		updateStatTable(price);
	});
}

function updateStatTable(price) {
	var worth = totalHeld * price;
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