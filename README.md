# Ethereum-Portfolio

Created by Weidi Zhang

## Description

Basic portfolio for keeping track of your Ethereum (ETH) holdings.


Uses coinbase API for price.

## Features

* Displays various statistics including total holdings, price needed for desired % gain, average cost per ETH, cost, worth, profit/loss
* Chart to visualize profit/loss (no database required, compares against historical price data)
* Price, statistics, and chart update every 30 seconds while page is open

## Usage

1. Rename data.example.csv to data.csv, input purchase data accordingly using your favorite spreadsheet application with dates in yyyy-mm-dd format
2. Edit js/config.js to change desired profit percentage and chart time frame

## Libraries Used

* jquery: https://jquery.com/
* jquery-csv: https://github.com/evanplaice/jquery-csv
* raphael: http://dmitrybaranovskiy.github.io/raphael/
* morris.js: http://morrisjs.github.io/morris.js/

## License

Please read LICENSE.md to learn about what you can and cannot do with this source code.