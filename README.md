# Ethereum-Portfolio

Created by Weidi Zhang

## Description

Basic portfolio for keeping track of your Ethereum (ETH) holdings.


Uses coinbase API for price.

## Features

* Displays various statistics including total holdings, price needed for desired % gain, average cost per ETH, cost, worth, profit/loss
* Chart to visualize profit/loss (no database required, compares against historical price data)
* Price, statistics, and chart update every x seconds while page is open

## Usage

1. Rename data.example.csv to data.csv, input purchase data accordingly using your favorite spreadsheet application with dates in yyyy-mm-dd format
2. Edit js/config.js to change desired profit percentage, chart time frame, and refersh interval (in seconds)

### Using with Google Chrome without a Local Server

Though *not an issue with Firefox*, using it on the file: protocol on Chrome results in a cross origin request error.

This can be avoided by running it on an online web server or a simple local server (**recommended**) which can be accessed through localhost.

#### Alternatively:

1. Rename data.example.js to data.js, input data accordingly
2. Set useJsonInsteadOfCSV to true in js/config.js

## Modifying

The main code is located in [main.js](https://github.com/weidizhang/Ethereum-Portfolio/blob/master/js/main.js)

## Libraries Used

* jquery: https://jquery.com/
* jquery-csv: https://github.com/evanplaice/jquery-csv
* raphael: http://dmitrybaranovskiy.github.io/raphael/
* morris.js: http://morrisjs.github.io/morris.js/

## License

Please read LICENSE.md to learn about what you can and cannot do with this source code.