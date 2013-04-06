/// <reference path="_references.js" />
var dataLocation = 'http://grocerybuddydata.azurewebsites.net';
//var dataLocation = 'http://localhost:54328';

$(function () {
//    // setup all jquery ajax calls to use this error function by default (this can be overridden simply by specifying the error property as normal in the ajax call). 
//    $.ajaxSetup({
//        // put your favorite error function here: 
//        error:
//            function (XMLHttpRequest, textStatus, errorThrown) {
//                // release any existing ui blocks 
//                $.unblockUI;
//                var errorObj = JSON.parse(XMLHttpRequest.responseText);
//                // send the user to the system error page if system error, otherwise popup the user error div 
//                if (!errorObj.Success) {
//                    if (errorObj.ErrorType != "system") {
//                        $('#UserError').html(errorObj.Message);
//                        $.blockUI({
//                            message: $('#UserErrorWrapper'),
//                            css: { width: '400px', height: '300px', overflow: 'scroll' }
//                        });
//                    }
//                    else {
//                        window.location = errorObj.ErrorPageUrl;
//                    }
//                }
//            }
//    });


    //NOTE: The below 2 "focus" functions could have been put in the applicable "navigate" methods... done below
    //just to show an alternative method

    /// When the add cart page shows, set focus to the name field
    $("#addCartPage").on("pageshow", function (e) {
        $('#currentCartName').focus();
    });

    // When the add item page shows, set focus on the name field
    $("#addCartItemPage").on("pageshow", function (e) {
        $('#itemName').focus();
    });

    // TODO: find better event perhaps?
    $('#sku').on('change', function (e) {
        alert('call service to get name, etc');
        $('#itemName').val('Something');
    });


    //var Store = function() {

    //    name

    //    streetAddress

    //    city

    //    province

    //    postalcode

    //    telephone

    //    lat

    //    long

    //}

 

    //var Product = function() {

    //    sku

    //    name


//    ?? collection of ProductStorePrice

//}

    //    var ProductStorePrice = function() {

    //        sku

    //        storeName

    //        price

    //        priceDate

    //    }


    /// Class to represent a category
    var Category = function (value, name, icon) {
        var self = this;
        
// #region Properties
        self.value = value;
        self.name = name;
        self.icon = icon;
// #endregion Properties

        return self;
    };

    /// Class to represent a measurement
    var Measurement = function (value, name, icon) {
        var self = this;

// #region Properties
        self.value = value;
        self.name = name;
        self.icon = icon;
// #endregion Properties

        return self;
    };

    /// Class to represent a product
    var Product = function (sku, name, description, isDeleted) {
        var self = this;

// #region Properties
        Sku: ko.observable(sku);
        Name: ko.observable(name);
        Description: ko.observable(description);
        IsDeleted: ko.observable(isDeleted);
// #endregion Properties

        return self;
    };

    /// Class to represent a grocery cart
    var GroceryCart = function (name) {
        var self = this;

// #region Properties
        /// Cart has a name...
        self.name = ko.observable(name).extend({ minLength: 2, maxLength: 10 });
        /// Cart has items...
        self.cartItems = ko.observableArray([]);
        //TODO: reminder?? use this for validation .extend({ date: true });

        //self.dirtyFlag = new ko.DirtyFlag([
        //    self.name)];
// #endregion Properties

// #region Computed properties
        /// Make english wording better for number of items in a cart
        self.numberOfItemsDisplay = ko.computed(function () {
            if (self.cartItems().length == 0) {
                return 'There are no items in the cart';
            } else {
                if (self.cartItems().length == 1) {
                    return 'There is 1 item in the cart';
                } else {
                    return 'There are ' + self.cartItems().length + ' items in this cart';
                }
            }
        });

        // Simply returns the number of items
        self.numberOfItems = ko.computed(function () {
            return self.cartItems().length;
            //NOTE: the below shows how could have used a "foreach" method too... 
            //note also that if using "destroy" method in Knockout will need to do something ehre
            //var total = 0;
            //$.each(self.cartItems(), function () { total += 1; })
            //return total;
        });
// #endregion Computed properties

// #region Operations
        self.addItem = function (item) {
            self.cartItems.push(item);
        };

        self.removeItem = function (item) {
            //self.cartItems.destroy(item); //This is probably the better way, but causes complication with count
            self.cartItems.remove(item);
        };
// #endregion Operations

        return self;
    };

    /// Class to represent an item in a cart
    var CartItem = function (sku, name, category, numberOfPieces, size, measurement) {
        var self = this;

// #region Properties
        self.sku = ko.observable(sku);
        self.name = ko.observable(name).extend({ minLength: 2, maxLength: 10 });
        //self.name = ko.observable(name).extend({ required: true });
        self.category = ko.observable(category).extend({ required: true });
        self.numberOfPieces = ko.observable(numberOfPieces).extend({ min: 1 });
        //.extend({ number: true });
        //.extend({ digit: true });
        self.size = ko.observable(size).extend({ min: 1 });
        self.measurement = ko.observable(measurement).extend({ required: true });
// #endregion Properties

// #region Computed properties
        self.displayValue = ko.computed(function () {
            return self.name() + ' (' + self.category() + ') ' + self.numberOfPieces() + ' x ' + self.size() + ' @ ' + self.measurement();
            //var total = 0;
            //$.each(self.cartItems(), function () { total += 1; })
            //return total;
        });
// #endregion Computed properties

        return self;
    };

    /// Overall view model for the application
    var ShoppingCartViewModel = function () {
        var self = this;

        var
// #region Properties
            /// Main carts collection
            carts = ko.observableArray([])
            /// Used to store the currently selected shopping cart
            , selectedCart = ko.observable()
            /// A list of all available categories that may be selected when entering an item
            , availableCategories = ko.observableArray([])
            /// A list of all available measurements that may be selected when entering an item
            , availableMeasurements = ko.observableArray([])
            /// A list of all available products... pretty heavy handed but...
            , products = ko.observableArray([])
// #endregion Properties

// #region Operations
            /// Loads up carts collection with a couple of sample grocery carts
            , getCarts = function () {
                carts = ko.observableArray([]);
                carts.push(new GroceryCart("Shopping Cart 1"));
                carts.push(new GroceryCart("Shopping Cart 2"));
            }
            /// Loads up availableCategories collection with a few category types
            , getCategories = function () {
                availableCategories = ko.observableArray([]);
                availableCategories.push(new Category("Produce", "Produce", "TODO"));
                availableCategories.push(new Category("Dairy", "Dairy", "TODO"));
                availableCategories.push(new Category("Junk Food", "Junk Food", "TODO"));
            }
            /// Loads up availableMeasurements collection with a few measurement types
            , getMeasurements = function () {
                availableMeasurements = ko.observableArray([]);
                availableMeasurements.push(new Measurement("Grams", "Grams", "TODO"));
                availableMeasurements.push(new Measurement("KG", "KG", "TODO"));
                availableMeasurements.push(new Measurement("ML", "ML", "TODO"));
                availableMeasurements.push(new Measurement("L", "L", "TODO"));
            }
            /// Called when want to start adding a new cart
            , addCartBegin = function () {
                $('#currentCartName').val('');
                navigateToAddCartPage();
            }
            /// Cancels the save cart operation and navigates back to the main carts page
            , addCartCancel = function () {
                $('#currentCartName').val('');
                navigateToCartsPage();
            }
            /// Saves a cart to the carts collection and then navigates back to the main carts page
            , addCartSave = function () {
                var gc = new GroceryCart($('#currentCartName').val());
                //TODO: need to figure out a way to get validation to work... I made a reference to knockout validation but not sure how to use properly yet
                //gc.errors = ko.validation.group(gc);
                //if (gc.errors().length == 0) {
                //    alert('Thank you.');
                //} else {
                //    alert('Please check your submission.');
                //    gc.errors.showAllMessages();
                //}
                carts.push(gc);
                $('#currentCartName').val('');
                navigateToCartsPage();
            }

            /// Called when want to start adding a new item into a cart
            , addCartItemBegin = function () {
                $('#itemName').val('');
                $('#itemCategory').val('');
                $('#itemNumberOfPieces').val('');
                $('#itemSize').val('');
                $('#itemMeasurement').val('');
                navigateToAddCartItemPage();
            }
            /// Saves a cart items to the currently selected cart
            , addCartItemSave = function () {
                //TODO: better way to do this is to have an observable item on this page... for now using standard jQuery to get values
                var ci = new CartItem(123, $('#itemName').val(), $('#itemCategory').val(), $('#itemNumberOfPieces').val(), $('#itemSize').val(), $('#itemMeasurement').val());
                if (selectedCart() != null) {
                    selectedCart().addItem(ci);
                }
                navigateToCartItemsPage();
            }
            /// Removes the currently selected cart from the collection after confirming that want to delete it
            , removeCartItem = function (cartItem) {
                //TODO... better confirm needed!... look at split listview
                //TODO... this does not work yet... must have syntax incorrect
                if (confirm('Are you sure you want to remove this item?')) {
                    selectedCart().removeItem(cartItem);
                    $('#cartItemsListView').listview('refresh');
                }
            }

            /// Removes the currently selected cart from the collection after confirming that want to delete it
            , removeCart = function (cart) {
                //TODO... better confirm needed!... look at split listview
                if (confirm('Are you sure you want to remove the following cart: ' + cart.name() + ' that currently has ' + cart.numberOfItems() + ' number of items?')) {
                    //carts.destroy(cart); //This is probably the better way, but causes complication with count
                    carts.remove(cart);
                    $('#theCartList').listview("refresh");
                }
            }
            /// Shows the contents of the cart
            , viewCartBegin = function (cart) {
                selectedCart(cart);
                navigateToCartItemsPage();
            }

// #region NAVIGATION operations
            ///Navigates to the "cartsPage". Wrapped to ensure jQuery mobile "redraws" screen correctly
            , navigateToCartsPage = function () {
                $.mobile.changePage("#cartsPage");
                $('#cartsPage').trigger('pagecreate');
                $('#theCartList').listview('refresh');
            }

            ///Navigates to the "addCartPage". Wrapped to ensure jQuery mobile "redraws" screen correctly
            , navigateToAddCartPage = function () {
                $.mobile.changePage("#addCartPage");
                $('#addCartPage').trigger('pagecreate');
            }

            ///Navigates to the "cartItemsPage". Wrapped to ensure jQuery mobile "redraws" screen correctly
            , navigateToCartItemsPage = function () {
                $.mobile.changePage("#cartItemsPage");
                //clear out previous values...

                $('#cartItemsPage').trigger('pagecreate');
                $('#cartItemsListView').listview('refresh');
            }

            ///Navigates to the "addCartItemPage". Wrapped to ensure jQuery mobile "redraws" screen correctly
            , navigateToAddCartItemPage = function () {
                $.mobile.changePage("#addCartItemPage");
                $('#addCartItemPage').trigger('pagecreate');
            }
// #endregion NAVIGATION operations
            , startBarCodeScanning = function () {
                scanner.scan();
            }

// #region Product stuff
            , selectedProduct = ko.observable(null)
            , newProduct = function () {
                this.products.push({
                    Sku: ko.observable(this.products().length + 1),
                    Name: ko.observable("New " + this.products().length),
                    Description: ko.observable("Description " + this.products().length),
                    IsNew: ko.observable(true)
                });
            }
            //url: "http://localhost:54328/",  http://grocerybuddydata.azurewebsites.net/api/Products",
            , getProducts = function () {
                alert('making ajax call now');

                $.ajax(
                    {
                        url: (dataLocation + "/api/Products"),
                        contentType: "text/jsonp",
                        type: "GET",
                        success: function (data) {
                            alert('success. products before load: ' + shoppingCartViewModel.products().length + ' data to load ' + data.length);
                            $.each(data, function (index) {
                                shoppingCartViewModel.products.push(toProductKoObservable(data[index]));
                            });
                            alert('success. products after load: ' + shoppingCartViewModel.products().length + ' data to load ' + data.length);
                        },
                        error: function(xhr, status, error) {
                            debugger;
                            alert("ERROR");
                            var err = eval("(" + xhr.responseText + ")");
                            // Display the specific error raised by the server (e.g. not a
                            //   valid value for Int32, or attempted to divide by zero).
                            alert(err.Message);
                        }
                    });

                //alert('making ajax call');
                //$.ajax(
                //{
                //    url: "http://localhost:54328/api/Products",
                //    contentType: "text/json",
                //    type: "GET",
                //    success: function (data) {
                //        //$.each(data, function (index) {
                //        //    viewModel.products.push(toKoObserable(data[index]));
                //        //});
                //        alert('Found ' + products.length() + ' products');
                //        //ko.applyBindings(viewModel);
                //    },
                //    error: function (data) {
                //        alert("ERROR " + data.message);
                //    }
                //});
            }
//#endregion Product stuff

// #endregion Operations
        ;

        /// Make the call to initialize the carts
        getCarts();
        /// Make the call to initialize the categories
        getCategories();
        /// Make the call to initialize the measurements
        getMeasurements();
        
        /* NOTE: if want to do the "best practice" of selectively determining what to expose, would do the below */
        return {
            carts: carts
            , availableCategories: availableCategories
            , availableMeasurements: availableMeasurements
            , products: products

            , getCarts: getCarts
            , getCategories: getCategories
            , getMeasurements: getMeasurements
            , getProducts: getProducts

            , addCartBegin: addCartBegin
            , addCartCancel: addCartCancel
            , addCartSave: addCartSave

            , viewCartBegin: viewCartBegin

            , addCartItemBegin: addCartItemBegin
            , addCartItemSave: addCartItemSave

            , selectedCart: selectedCart

            , removeCart: removeCart

            , removeCartItem: removeCartItem

            , startBarCodeScanning: startBarCodeScanning

            , navigateToCartsPage: navigateToCartsPage
            , navigateToAddCartPage: navigateToAddCartPage
            , navigateToCartItemsPage: navigateToCartItemsPage
            , navigateToAddCartItemPage: navigateToAddCartItemPage
        };
    };

    var shoppingCartViewModel = new ShoppingCartViewModel();

    alert('about to call getProducts');
    shoppingCartViewModel.getProducts();

    ko.validation.rules.pattern.message = 'Invalid.';

    shoppingCartViewModel.errors = ko.validation.group(shoppingCartViewModel);

    ko.validation.configure({
        registerExtenders: true,
        messagesOnModified: true,
        insertMessages: true,
        parseInputAttributes: true,
        messageTemplate: null
    });

    ko.applyBindings(shoppingCartViewModel);

    $.mobile.defaultPageTransition = "slide";

    function toProductKoObservable(product) {
        return {
            Sku: ko.observable(product.Sku),
            Name: ko.observable(product.Name),
            Description: ko.observable(product.Description),
            IsDeleted: ko.observable(product.IsDeleted)
        };
    }
});

//var viewSaveID;
//function saveThisViewModel() {
//    // check to see if jStorage has items
//    // if not, assign 0 to key otherwise assign count number 
//    // as items are save chronologically and not overwritten
//    if ($.jStorage.index().length === 0) {
//        viewSaveID = 0;
//    }
//    viewSaveID = $.jStorage.index().length;
//    // increment counter for key to localStorage
//    viewSaveID = viewSaveID + 1;
//    // Set data to JS format could also be ko.toJSON for a JSON object
//    var data = ko.toJS(myViewModel);
//    // on the dollar save via jStorage
//    $.jStorage.set(viewSaveID, data);
//    // return true to keep default behavior in app
//    return true;
//}

///* Get Data From Storage and save it to Array */
//function getDataStore() {
//    // assign the keys of the jStorage index to an observable array
//    myViewModel.myDataStoreIndex($.jStorage.index());

//    // check to see if there are items in the data store array
//    // if yes, remove them 
//    if (myViewModel.myDataStore().length > 0) {
//        // This may not scale well, but for localStorage, we don't need it too.
//        // the problem is overwriting and double entries, this little diddy solves both
//        myViewModel.myDataStore.removeAll();
//        console.log("removeAll fired")
//    }
//    //create a temp object to hold objects that are saved in storage
//    var savedData = {};
//    // iterate through the array of keys
//    for (var i = 0; i < myViewModel.myDataStoreIndex().length; i++) {
//        // pull the objects from storage based on the keys stored in the array
//        savedData = $.jStorage.get(myViewModel.myDataStoreIndex()[i]);
//        // push the saved object to the observable array
//        myViewModel.myDataStore.push(savedData);
//        console.log("Data has been pushed to vacDataStore " + i + " times.");
//        // when you iterate on a list view item in jQuery Mobile 
//        // you have refresh the list. Otherwise it displays incorrectly
//        $('#myListView').listview('refresh');
//    }
//}