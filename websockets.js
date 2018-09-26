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
        var tr = document.createElement("tr");
        tr.setAttribute("id", id);
        return tr;
    }

    var table = document.getElementById("results");

    newArray.forEach(function (stockData) {
        var name = stockData[0],
            price = stockData[1],
            time = Date.now();
        if(!stockObj[name]) {
            table.appendChild(getNewRow(name));
        }
        var stockElement = document.getElementById(name);
        stockObj[name] = {
            name: name,
            price: price,
            time: time
        };
        updateRow(stockElement, stockObj[name])
    });
}

function updateRow(element, data) {
    element.innerHTML = "";

    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");

    td1.innerText = data.name;
    td2.innerText = data.price;
    td3.innerText = data.time;

    element.appendChild(td1);
    element.appendChild(td2);
    element.appendChild(td3);
}