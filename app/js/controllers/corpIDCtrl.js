four51.app.controller('CorpIDCtrl', ['$scope', '$location', '$filter', '$rootScope', '$451', '$window', 'User', 'CorporateID',
    function ($scope, $location, $filter, $rootScope, $451, $window, User, CorporateID) {

        var productArray = ($window.location.href.indexOf('AB') > -1) ? ['18-421-A','18-421-B'] : ['18-421-C','18-421-D'];

        $scope.loadingProductsIndicator = true;
        CorporateID.getProducts(productArray, function(data) {
            $scope.products = data;
            angular.forEach($scope.products, function(p) {
                if (p.ExternalID.indexOf('A') > -1) {
                    $scope.ABSpecs = p.Specs;
                }
                if (p.ExternalID.indexOf('C') > -1) {
                    $scope.CDSpecs = p.Specs;
                }
            });
            $scope.loadingProductsIndicator = false;
        });

        $scope.selectedProducts = [];

        $scope.selectProduct = function(product) {
            $scope.ABProductSelected = false;
            $scope.CDProductSelected = false;
            $scope.errorMessages = [];

            product.Selected = !product.Selected;
            if (product.Selected) {
                $scope.selectedProducts.push(product);
            }
            else {
                for (var i = 0; i < $scope.selectedProducts.length; i++) {
                    if ($scope.selectedProducts[i].ExternalID == product.ExternalID) {
                        $scope.selectedProducts.splice(i, 1);
                    }
                }
            }
            angular.forEach($scope.selectedProducts, function(p) {
                $scope.ABProductSelected = (p.ExternalID.indexOf('A') > -1 || p.ExternalID.indexOf('B') > -1) ? true : $scope.ABProductSelected;
                $scope.CDProductSelected = (p.ExternalID.indexOf('C') > -1 || p.ExternalID.indexOf('D') > -1) ? true : $scope.CDProductSelected;
            });
        };

        $scope.errorMessages = [];
        $scope.Variants = [];

        $scope.createVariants = function() {
            $scope.errorMessages = [];
            $scope.createVariantsIndicator = true;
            $scope.Variants = [];
            CorporateID.validateCreate($scope.selectedProducts, $scope.ABProductSelected, $scope.ABSpecs, $scope.CDProductSelected, $scope.CDSpecs, function(data) {
                $scope.errorMessages = data;
            });
            if ($scope.errorMessages.length == 0) {
                CorporateID.createVariants($scope.selectedProducts, $scope.ABSpecs, $scope.CDSpecs, function(variants) {
                    $scope.Variants = variants;
                    $scope.createVariantsIndicator = false;
                });
            }
            else {
                $scope.createVariantsIndicator = false;
            }
        }

        $scope.previewIndex = 0;
        $scope.changePreview = function(i) {
            if ($scope.previewIndex == i) return;
            $scope.loadingImage = true;
            $scope.previewIndex = i;
        };

        $scope.loadingImage = true;
        $scope.$on('event:imageLoaded', function(event, result) {
            $scope.loadingImage = !result;
            $scope.$apply();
        });

        $scope.editVariants = function() {
            $scope.Variants = [];
        }

        $scope.addToOrder = function() {
            $scope.addToOrderIndicator = true;
            $scope.errorMessages = [];
            CorporateID.validateAdd($scope.Variants, function(msg) {
                $scope.errorMessages = msg;
            });
            if ($scope.errorMessages.length == 0) {
                CorporateID.addToOrder($scope.Variants, $scope.currentOrder, function(o) {
                    if (o) {
                        $scope.user.CurrentOrderID = o.ID;
                        User.save($scope.user, function(){
                            $scope.addToOrderIndicator = false;
                            $location.path('/cart');
                        });
                    }
                    else {
                        $scope.errorMessages.push("There was an error saving the order");
                        $scope.addToOrderIndicator = false;
                    }
                });
            }
            else {
                $scope.addToOrderIndicator = false;
            }
        }

    }]);