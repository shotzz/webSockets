var webSocket   = null;

function openWSConnection() {
    var webSocketURL = "ws://stocks.mnet.website";
    console.log("openWSConnection::Connecting to: " + webSocketURL);
    try {
        webSocket = new WebSocket(webSocketURL);
        webSocket.onopen = function(openEvent) {
            console.log("WebSocket OPEN: " + JSON.stringify(openEvent, null, 4));
        };
        webSocket.onclose = function (closeEvent) {
            console.log("WebSocket CLOSE: " + JSON.stringify(closeEvent, null, 4));
        };
        webSocket.onerror = function (errorEvent) {
            console.log("WebSocket ERROR: " + JSON.stringify(errorEvent, null, 4));
        };
        webSocket.onmessage = function (messageEvent) {
            var wsMsg = messageEvent.data;
            console.log("WebSocket MESSAGE: " + wsMsg);
            renderStocks(wsMsg);
        };
    } catch (exception) {
        console.error(exception);
    }
}

openWSConnection();

var stockObj = {};

function renderStocks(wsMsg) {
    var newArray = JSON.parse(wsMsg);

    function getNewRow(id) {
        var div = document.createElement("div");
        div.setAttribute("id", id);
        div.setAttribute("class", "row");
        return div;
    }

    var table = document.getElementById("results");

    newArray.forEach(function (stockData) {
        var name = stockData[0];

        if(!stockObj[name]) {
            table.appendChild(getNewRow(name));
        }
        var stockElement = document.getElementById(name);
        updateStockObj(stockData, stockObj[name] || {});
        updateRow(stockElement, stockObj[name])
    });
}

function updateStockObj(stockData, stock) {
    var name = stockData[0],
        price = stockData[1],
        max = stock.max || price,
        min = stock.min || price,
        presentTime = Date.now(),
        time = stock.time || presentTime,
        priceRise = false,
        priceFall = false,
        displayTime = time;

    if(stock) {
        if(max<price) {
            max = price;
            priceRise = true;
        } else if(min>price) {
            min = price;
            priceFall = true;
        }

        if(time <= presentTime) {
            displayTime = Math.abs(presentTime - time)/1000;
        }
    }

    stockObj[name] = {
        name: name,
        price: price,
        max: max,
        min: min,
        priceRise: priceRise,
        priceFall: priceFall,
        time: presentTime,
        displayTime: displayTime
    };
}

function updateRow(element, data) {
    element.innerHTML = "";

    var name = document.createElement("div");
    var price = document.createElement("div");
    var time = document.createElement("div");
    var max = document.createElement("div");
    var min = document.createElement("div");

    time.setAttribute("id", name + "-time");

    name.innerText = data.name;
    price.innerText = data.price;
    time.innerText = Math.round(data.displayTime)==0? "Jus Now" : "Updated " + Math.round(data.displayTime) + " secs ago";
    max.innerText = data.max;
    min.innerText = data.min;

    element.appendChild(name);
    element.appendChild(price);
    element.appendChild(time);
    element.appendChild(max);
    element.appendChild(min);

    if(data.priceRise) {
        element.classList.add("priceRise");
    } else if(data.priceFall) {
        element.classList.add("priceFall");
    } else {
        element.classList.remove("priceRise");
        element.classList.remove("priceFall");
    }
}

setInterval(function () {
    var presentTime = Date.now();
    var names = Object.keys(stockObj);

    names.forEach(function(stock) {
        if(presentTime - stockObj[stock].time > 60000) {
            stockObj[stock].displayTime = stockObj[stock].displayTime + 60;

            document.getElementById(stock+"-time").innerText = stockObj[stock].displayTime;
        }
    });
}, 60000);