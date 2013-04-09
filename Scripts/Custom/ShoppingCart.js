/// <reference path="_references.js" />

//#region CONSTANTS
(function () {
    GB_BASE_DATA_LOCATION = 'http://grocerybuddydata.azurewebsites.net';
    //var GB_BASE_DATA_LOCATION = 'http://localhost:54328';

    //application stores all carts to localStorage (if available)... this is the storage key
    GB_STORAGEKEY_CARTS = 'MyCarts';

    //each page has a "constant"
    GB_PAGE_CARTS_LIST = '#cartsPage';
    GB_PAGE_ADD_CART = '#addCartPage';
    GB_PAGE_CART_ITEMS = '#cartItemsPage';
    GB_PAGE_ADD_CART_ITEM = '#addCartItemPage';
})();
//#endregion CONSTANTS


function toProductKoObservable(product) {
    return {
        Id: ko.observable(product.Id),
        Sku: ko.observable(product.Sku),
        Name: ko.observable(product.Name),
        Description: ko.observable(product.Description),
        IsDeleted: ko.observable(product.IsDeleted)
    };
}


$(function () {
    log('****Beginning GroceryBuddy application...');

    if ('localStorage' in window && window['localStorage'] !== null) {
        log('localStorage found!');
        var GB_foundStorage = window.localStorage;
    } else {
        alert('Sorry, local storage not supported. Any changes made will be lost once application closed');
    }

//#region FOCUS METHODS
    //NOTE: The below 2 "focus" functions could have been put in the applicable "navigate" methods... done below
    //just to show an alternative method

    /// When the add cart page shows, set focus to the name field
    $(GB_PAGE_ADD_CART).on("pageshow", function (e) {
        $('#currentCartName').focus();
    });

    // When the add item page shows, set focus on the name field
    $(GB_PAGE_ADD_CART_ITEM).on("pageshow", function (e) {
        $('#sku').focus();
    });
//#endregion FOCUS METHODS

    // TODO: find better event perhaps?
    $('#sku').on('change', function (e) {
        log('sku change started');
        var skuToLookup = $(this).val();
        shoppingCartViewModel.lookupProduct(skuToLookup);
        log('sku change done.');
    });

    //// $("#one").bind("paste cut keydown",function(e) {
    //$("#sku").bind("paste cut keydown",function(e) {
    //});

    $("#sku").on("input", null, null, function (e) {
        log('sku input event fired... looking up sku');
        var skuToLookup = $(this).val();
        shoppingCartViewModel.lookupProduct(skuToLookup);
        log('sku input done.');
    });

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
    var Product = function (id, sku, name, description, isNew) {
        var self = this;

// #region Properties
        Id: ko.observable(id); //TODO... no reason for any of these to be observable I don't think...
        Sku: ko.observable(sku);
        Name: ko.observable(name);
        Description: ko.observable(description);
        IsNew: ko.observable(isNew); //TODO: remove this later... not applicable
// #endregion Properties

        return self;
    };

    /// Class to represent a grocery cart
    var GroceryCart = function (name) {
        var self = this;

// #region Properties
        /// Cart has a name...
        self.name = ko.observable(name);
        /// Cart has items...
        self.cartItems = ko.observableArray([]);
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
        });
// #endregion Computed properties

// #region Operations
        self.addItem = function (item) {
            self.cartItems.push(item);
        };

        self.removeItem = function (item) {
            self.cartItems.remove(item);
        };
// #endregion Operations

        return self;
    };

    /// Class to represent an item in a cart
    var CartItem = function (sku, name, category, numberOfPieces, size, measurement, manualPrice) {
        var self = this;

// #region Properties
        self.sku = ko.observable(sku);
        self.name = ko.observable(name);
        self.category = ko.observable(category);
        self.numberOfPieces = ko.observable(numberOfPieces);
        self.size = ko.observable(size);
        self.measurement = ko.observable(measurement);
        self.manualPrice = ko.observable(manualPrice);
// #endregion Properties

// #region Computed properties
        self.displayValue = ko.computed(function () {
            return self.name() + ' (' + self.category() + ') ' + self.numberOfPieces() + ' x ' + self.size() + ' @ ' + self.measurement();
        });
// #endregion Computed properties

        return self;
    };

    /// Overall view model for the application
    var ShoppingCartViewModel = function () {
        var self = this;

        var lookupProduct = function (sku) {
            log('lookupProduct started. sku to lookup is ' + sku);
            var match = ko.utils.arrayFirst(products(), function (item) {
                log('analyzing ' + item.Sku());
                return item.Sku() == sku;
            });
            if (match != null) {
                log('match found!');
                $('#itemName').val(match.Name());
            } else {
                log('match NOT found');
            }
            log('lookupProduct done.');
        };

        var localSave = function (data, key) {
            if (GB_foundStorage != undefined && GB_foundStorage != null) {
                log('localSave started...');
                try {
                    var d = ko.toJSON(data);
                    GB_foundStorage.setItem(key, d);
                    log('localSave done.');
                } catch (ex) {
                    alert('error while storing data to localStorage');
                }
            }
        };

        var localGet = function (key) {
            if (GB_foundStorage != undefined && GB_foundStorage != null) {
                log('localGet started...');
                var d = localStorage.getItem(key);
                if (d == null || d == "undefined" || d == undefined) {
                    log('localGet is done. Data not found');
                    return null;
                } else {
                    log('found data, now parsing...');
                    data = JSON.parse(d);
                    log('localGet done. Data found and parsed');
                    return data;
                }
            } else {
                return null;
            }
        };

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
            /// Determines if there are any shopping carts stored locally and if so loads them into our collection
            , getCarts = function () {
                log('getCarts started...');
                var foundCartData = localGet(GB_STORAGEKEY_CARTS);
                if (foundCartData != null) {
                    $.each(foundCartData, function (index) {
                        var g = new GroceryCart(foundCartData[index].name);
                        $.each(foundCartData[index].cartItems, function (innerIndex) {
                            g.addItem(foundCartData[index].cartItems[innerIndex]);
                        });
                        carts.push(g);
                    });
                } else {
                    carts.push(new GroceryCart("Demo cart 1"));
                    carts.push(new GroceryCart("Demo cart 2"));
                }
                log('getCarts done.');
            }
            /// Loads up availableCategories collection with a few category types
            , getCategories = function () {
                log('getCategories started...');
                availableCategories = ko.observableArray([]);
                availableCategories.push(new Category("Produce", "Produce", "TODO"));
                availableCategories.push(new Category("Dairy", "Dairy", "TODO"));
                availableCategories.push(new Category("Junk Food", "Junk Food", "TODO"));
                log('getCategories done.');
            }
            /// Loads up availableMeasurements collection with a few measurement types
            , getMeasurements = function () {
                log('getMeasurements started...');
                availableMeasurements = ko.observableArray([]);
                availableMeasurements.push(new Measurement("Grams", "Grams", "TODO"));
                availableMeasurements.push(new Measurement("KG", "KG", "TODO"));
                availableMeasurements.push(new Measurement("ML", "ML", "TODO"));
                availableMeasurements.push(new Measurement("L", "L", "TODO"));
                log('getMeasurements done.');
            }
            /// Called when want to start adding a new cart
            , addCartBegin = function () {
                log('addCartBegin started...');
                $('#currentCartName').val('');
                navigateToAddCartPage();
                log('addCartBegin done.');
            }
            /// Cancels the save cart operation and navigates back to the main carts page
            , addCartCancel = function () {
                log('addCartCancel started...');
                $('#currentCartName').val('');
                navigateToCartsPage();
                log('addCartCancel done.');
            }
            /// Saves a cart to the carts collection and then navigates back to the main carts page
            , addCartSave = function () {
                log('addCartSave started...');
                var gc = new GroceryCart($('#currentCartName').val());
                carts.push(gc);
                saveAllCarts();
                $('#currentCartName').val('');
                navigateToCartsPage();
                log('addCartSave done.');
            }

            /// Called when want to start adding a new item into a cart
            , addCartItemBegin = function () {
                log('addCartItemBegin started...');
                $('#itemName').val('');
                $('#itemCategory').val('');
                $('#itemNumberOfPieces').val('');
                $('#itemSize').val('');
                $('#itemMeasurement').val('');
                navigateToAddCartItemPage();
                log('addCartItemBegin done.');
            }
            /// Saves a cart items to the currently selected cart
            , addCartItemSave = function () {
                log('addCartItemSave started...');
                //TODO: better way to do this is to have an observable item on this page... for now using standard jQuery to get values
                var ci = new CartItem(
                    $('#sku').val()
                    , $('#itemName').val()
                    , $('#itemCategory').val()
                    , $('#itemNumberOfPieces').val()
                    , $('#itemSize').val()
                    , $('#itemMeasurement').val()
                    , 10
                    );
                if (selectedCart() != null) {
                    selectedCart().addItem(ci);
                    saveAllCarts();
                }
                navigateToCartItemsPage();
                log('addCartItemSave done.');
            }
            /// Removes the currently selected cart from the collection after confirming that want to delete it 
            , removeCartItem = function (cartItem) {
                log('removeCartItem started...');
                //TODO... better confirm needed!... look at split listview
                if (confirm('Are you sure you want to remove this item?')) {
                    selectedCart().removeItem(cartItem);
                    $('#cartItemsListView').listview('refresh');
                    saveAllCarts();
                }
                log('removeCartItem done.');
            }

            /// Removes the currently selected cart from the collection after confirming that want to delete it
            , removeCart = function (cart) {
                log('removeCart started...');
                //TODO... better confirm needed!... look at split listview
                if (confirm('Are you sure you want to remove the following cart: ' + cart.name() + ' that currently has ' + cart.numberOfItems() + ' number of items?')) {
                    //carts.destroy(cart); //This is probably the better way, but causes complication with count
                    carts.remove(cart);
                    $('#theCartList').listview("refresh");
                    saveAllCarts();
                }
                log('removeCart done.');
            }
            /// Shows the contents of the cart
            , viewCartBegin = function (cart) {
                log('viewCartBegin started...');
                selectedCart(cart);
                navigateToCartItemsPage();
                log('viewCartBegin done.');
            }

// #region NAVIGATION operations
            ///Navigates to the "cartsPage". Wrapped to ensure jQuery mobile "redraws" screen correctly
            , navigateToCartsPage = function () {
                $.mobile.changePage(GB_PAGE_CARTS_LIST);
                $(GB_PAGE_CARTS_LIST).trigger('pagecreate');
                $('#theCartList').listview('refresh');
            }

            ///Navigates to the "addCartPage". Wrapped to ensure jQuery mobile "redraws" screen correctly
            , navigateToAddCartPage = function () {
                $.mobile.changePage(GB_PAGE_ADD_CART);
                $(GB_PAGE_ADD_CART).trigger('pagecreate');
            }

            ///Navigates to the "cartItemsPage". Wrapped to ensure jQuery mobile "redraws" screen correctly
            , navigateToCartItemsPage = function () {
                $.mobile.changePage(GB_PAGE_CART_ITEMS);
                //clear out previous values...

                $(GB_PAGE_CART_ITEMS).trigger('pagecreate');
                $('#cartItemsListView').listview('refresh');
            }

            ///Navigates to the "addCartItemPage". Wrapped to ensure jQuery mobile "redraws" screen correctly
            , navigateToAddCartItemPage = function () {
                $.mobile.changePage(GB_PAGE_ADD_CART_ITEM);
                $(GB_PAGE_ADD_CART_ITEM).trigger('pagecreate');
            }
// #endregion NAVIGATION operations
            , startBarCodeScanning = function () {
                alert('start scanner here...');
                //scanner.scan();
            }

// #region Product stuff
            , selectedProduct = ko.observable(null)
            , numberOfProductsCached = function () {
                return this.products().length;
            }
            , newProduct = function () {
                this.products.push({
                    Id: ko.observable(this.products().length + 1),
                    Sku: ko.observable(this.products().length + 1),
                    Name: ko.observable("New " + this.products().length),
                    Description: ko.observable("Description " + this.products().length),
                    IsNew: ko.observable(true)
                });
            }
            , getProducts = function () {
                log('getProducts started... async call began');
                executeJSONPCall((GB_BASE_DATA_LOCATION + "/api/Products?callback=?"),
                       function (data) {
                           log('getProducts async completed, now mapping products...');
                           //viewModel.items([]);
                           shoppingCartViewModel.products([]);
                           //shoppingCartViewModel.products.removeAll();
                           $.each(data, function (index) {
                               shoppingCartViewModel.products.push(toProductKoObservable(data[index]));
                           });
                           log('getProducts asynch mapping done.');
                       });
            }
            , saveAllCarts = function () {
                 localSave(carts, GB_STORAGEKEY_CARTS);
            }
//#endregion Product stuff

// #endregion Operations
        ;

        /// Make the call to initialize the cart s
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
            , numberOfProductsCached: numberOfProductsCached

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

            , lookupProduct: lookupProduct
        };
    };

    var shoppingCartViewModel = new ShoppingCartViewModel();

    shoppingCartViewModel.getProducts();

    //ko.validation.rules.pattern.message = 'Invalid.';

    ko.applyBindings(shoppingCartViewModel);

    $.mobile.defaultPageTransition = "slide";
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