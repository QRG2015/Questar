four51.app.factory('CorporateID', ['$resource', '$451', 'Product', 'Variant', 'Order', function($resource, $451, Product, Variant, Order) {
    function _then(fn, data, count) {
        if (angular.isFunction(fn))
            fn(data, count);
    }

    function compare(a,b) {
        if (a.ExternalID < b.ExternalID)
            return -1;
        if (a.ExternalID > b.ExternalID)
            return 1;
        return 0;
    }

    var _getProducts = function(productArray, success) {
        var products = [];
        angular.forEach(productArray, function(p) {
            Product.get(p, function(data) {
                data.PriceSchedule = data.StandardPriceSchedule;
                data.Product = {"QuantityMultiplier":data.QuantityMultiplier};
                products.push(data);
                if (products.length == productArray.length) {
                    products.sort(compare);
                    _then(success, products);
                }
            });
        });
    }

    var _validateCreate = function(products, ABSelected, ABSpecs, CDSelected, CDSpecs, success) {
        var errorMsg = [];

        function validateSpecs(specs, side) {
            angular.forEach(specs, function(spec) {
                if (spec.Required && !spec.Value && !spec.CanSetForLineItem) {
                    var name = spec.Label ? spec.Label : spec.Name;
                    errorMsg.push("Please provide a value for " + name + " on the " + side + " side form");
                }
            });
        }

        if (ABSelected) {
            validateSpecs(ABSpecs, "left");
        }
        if (CDSelected) {
            validateSpecs(CDSpecs, "right");
        }

        _then(success, errorMsg);
    }

    var _createVariants = function(products, ABSpecs, CDSpecs, success) {
        var variants = [];

        angular.forEach(products, function(product) {
            var productType = (product.ExternalID.indexOf('A') > -1 || product.ExternalID.indexOf('B') > -1) ? "AB" : "CD";
            var variant = {};
            variant.Specs = (productType == 'AB') ? ABSpecs : CDSpecs;
            if (variant.Specs['Address']) {
                variant.Specs['Address1'] = {};
                variant.Specs['Address1'].Value = variant.Specs['Address'].Value;
            }
            else {
                variant.Specs['Address'] = {};
                variant.Specs['Address'].Value = variant.Specs['Address1'].Value;
            }
            variant.ProductInteropID = product.InteropID;

            saveVariant(variant, product);
        });

        function fixUrls(v) {
            v.PreviewUrl = v.PreviewUrl.replace('web.four51','.four51');
            v.ProductionURL = v.ProductionURL.replace('web.four51','.four51');
            v.ProofUrl = v.ProofUrl.replace('web.four51','.four51');
        }

        function saveVariant(variant, product) {
            Variant.save(variant, function(data) {
                data.Variant = {};
                data.Variant.QuantityAvailable = data.QuantityAvailable;
                data.PriceSchedule = product.StandardPriceSchedule;
                data.Product = {};
                data.Product.ExternalID = product.ExternalID;
                data.Product.InteropID = product.ExternalID;
                data.Product.Name = product.Name;
                data.Product.IsVariantLevelInventory = product.IsVariantLevelInventory;
                data.Product.QuantityAvailable = product.QuantityAvailable;
                data.Product.QuantityMultiplier = product.QuantityMultiplier;
                data.Specs['Tracker Number'] = product.Specs['Tracker Number'];
                fixUrls(data);
                variants.push(data);

                if (variants.length == products.length) {
                    _then(success, variants);
                }
            });
        }
    }

    var _validateAdd = function(variants, success) {
        var errorMessages = [];
        var qtySelected = false;
        angular.forEach(variants, function(variant) {
            if (variant.Quantity && variant.Quantity > 0) {
                qtySelected = true;

                if (!variant.Specs['Tracker Number'].Value) {
                    errorMessages.push('Please enter a value for Tracker Number for ' + variant.Product.ExternalID);
                }
            }
        });
        if (!qtySelected) {
            errorMessages.push("Please select a quantity for at least one product");
        }

        _then(success, errorMessages);
    }

    var _addToOrder = function(variants, order, success) {
        if(!order){
            order = {};
            order.LineItems = [];
        }
        angular.forEach(variants, function(variant) {
            if (variant.Quantity && variant.Quantity > 0) {
                var li = {
                    "Product": variant.Product,
                    "Quantity": variant.Quantity,
                    "Specs": {"Tracker Number" :variant.Specs['Tracker Number']},
                    "Variant": variant
                }
                order.LineItems.push(li);
            }
        });
        Order.save(order, function(o) {
            _then(success, o);
        },
        function(ex) {
            _then(success, null);
        });
    }

    return {
        getProducts: _getProducts,
        validateCreate: _validateCreate,
        createVariants: _createVariants,
        validateAdd: _validateAdd,
        addToOrder: _addToOrder
    }
}]);
