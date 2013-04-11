/// <reference path="../jquery-1.9.1.js" />
/// <reference path="../jquery-1.9.1.intellisense.js" />

var scanner = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('scan').addEventListener('click', this.scan, false);
    },
    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `scanner.receivedEvent(...);`
    onDeviceReady: function () {
        scanner.receivedEvent('deviceready');
        $('#scan').show();
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    scan: function () {
        console.log('scanning');
        try {
            window.plugins.barcodeScanner.scan(function (args) {
                console.log("scanner result: \n" +
                    "text: " + args.text + "\n" +
                    "format: " + args.format + "\n" +
                    "cancelled: " + args.cancelled + "\n");
                /*
                if (args.format == "QR_CODE") {
                window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
                }
                */
                var foundSku = args.text;
                console.log(foundSku);
                $('#sku').val(foundSku);
                lookupProduct(foundSku);
                //document.getElementById("info").innerHTML = args.text;
                console.log(args);
            });
        } catch (ex) {
            alert('Unable to scan barcode. Error message was ' + ex.message);
        }
    }

};
