function executeJSONPCall(url, callback) {
    // create a unique id
    var id = "_" + (new Date()).getTime();

    // create a global callback handler
    window[id] = function (result) {
        // forward the call to specified handler                                       
        if (callback)
            callback(result);

        // clean up: remove script and id
        var sc = document.getElementById(id);
        sc.parentNode.removeChild(sc);
        window[id] = null;
    }

    url = url.replace("callback=?", "callback=" + id);

    // create script tag that loads the 'JSONP script' 
    // and executes it calling window[id] function                
    var script = document.createElement("script");
    script.setAttribute("id", id);
    script.setAttribute("src", url);
    script.setAttribute("type", "text/javascript");
    document.body.appendChild(script);
}



//OTHER NOTE USED FUNCTIONS...

//// Makes a textbox lose focus if you press "enter"
//ko.bindingHandlers.blurOnEnter = {
//    init: function (elem, valueAccessor) {
//        $(elem).keypress(function (evt) {
//            if (evt.keyCode === 13 /* enter */) {
//                evt.preventDefault();
//                $(elem).triggerHandler("change");
//                $(elem).blur();
//            }
//        });
//    }
//};

//// Simulates HTML5-style placeholders on older browsers
//ko.bindingHandlers.placeholder = {
//    init: function (elem, valueAccessor) {
//        var placeholderText = ko.utils.unwrapObservable(valueAccessor()),
//            input = $(elem);

//        input.attr('placeholder', placeholderText);

//        // For older browsers, manually implement placeholder behaviors
//        if (!Modernizr.input.placeholder) {
//            input.focus(function () {
//                if (input.val() === placeholderText) {
//                    input.val('');
//                    input.removeClass('placeholder');
//                }
//            }).blur(function () {
//                setTimeout(function () {
//                    if (input.val() === '' || input.val() === placeholderText) {
//                        input.addClass('placeholder');
//                        input.val(placeholderText);
//                    }
//                }, 0);
//            }).blur();

//            input.parents('form').submit(function () {
//                if (input.val() === placeholderText) {
//                    input.val('');
//                }
//            });
//        }
//    }
//};

//// Hooks up a form to jQuery Validation
//ko.bindingHandlers.validate = {
//    init: function (elem, valueAccessor) {
//        $(elem).validate();
//    }
//};

//// Controls whether or not the text in a textbox is selected based on a model property
//ko.bindingHandlers.selected = {
//    init: function (elem, valueAccessor) {
//        $(elem).blur(function () {
//            var boundProperty = valueAccessor();
//            if (ko.isWriteableObservable(boundProperty)) {
//                boundProperty(false);
//            }
//        });
//    },
//    update: function (elem, valueAccessor) {
//        var shouldBeSelected = ko.utils.unwrapObservable(valueAccessor());
//        if (shouldBeSelected) {
//            $(elem).select();
//        }
//    }
//};

//(function () {
//    function firstWhere(array, condition) {
//        for (var i = 0; i < array.length; i++)
//            if (condition(array[i]))
//                return array[i];
//    }

//    ko.observableArray.fn.groupBy = function (keySelector) {
//        if (typeof keySelector === "string") {
//            var key = keySelector;
//            keySelector = function (x) { return ko.utils.unwrapObservable(x[key]) };
//        }
//        var observableArray = this;

//        return ko.computed(function () {
//            var groups = [], array = observableArray();
//            for (var i = 0; i < array.length; i++) {
//                var item = array[i],
//                existingGroup = firstWhere(groups, function (g) { return g.key === keySelector(item) });
//                if (existingGroup)
//                    existingGroup.values.push(item);
//                else
//                    groups.push({ key: keySelector(item), values: [item] });
//            }
//            return groups;
//        })
//    }
//})();