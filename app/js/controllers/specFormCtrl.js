four51.app.controller('SpecFormCtrl', ['$scope', '$location', '$route', '$routeParams', '$window', 'ProductDisplayService', 'Variant',
    function ($scope, $location, $route, $routeParams, $window, ProductDisplayService, Variant) {
        $scope.variantErrors = [];
        var varID = $routeParams.variantInteropID == 'new' ? null :  $routeParams.variantInteropID;
        $scope.loadingImage = true;
        ProductDisplayService.getProductAndVariant($routeParams.productInteropID, varID, function(data){
            $scope.Product = data.product;
            if(varID)
                $scope.Variant = data.variant;
            else{
                $scope.Variant = {};
                $scope.Variant.ProductInteropID = $scope.Product.InteropID;
                $scope.Variant.Specs = {};
                angular.forEach($scope.Product.Specs, function(item){
                    if(!item.CanSetForLineItem)
                    {
                        $scope.Variant.Specs[item.Name] = item;
                    }
                });
            }
        });
        function validateVariant(){
            if(!$scope.Variant) return;
            var newErrors = [];
            angular.forEach($scope.Variant.Specs, function(s){
                if(s.Required && !s.Value)
                    newErrors.push(s.Label || s.Name + ' is a required field');
            });
            $scope.variantErrors = newErrors;
        }
        $scope.$watch('Variant.Specs', function(o, n){
            validateVariant();
        }, true);
        function saveVariant(variant, saveNew, hideErrorAlert /*for compatibility*/) {
            if($scope.variantErrors.length){
                $scope.showVariantErrors = true;
                if(!hideErrorAlert)
                    $window.alert("please fill in all required fields"); //the default spec form should be made to deal with showing $scope.variantErrors, but it's likely existing spec forms may not deal with $scope.variantErrors
                return;
            }
            if(saveNew) $scope.Variant.InteropID = null;
            Variant.save(variant, function(data){
                $location.path('/product/' + $scope.Product.InteropID + '/'+ data.InteropID);
            });
        }
        $scope.save = function(hideErrorWindowAlert){

            if($scope.Variant.Specs.Phone1) {
                var num1 = $scope.Variant.Specs.Phone1.Value;
                if ($scope.Variant.Specs.Phone1.Value && $scope.Variant.Specs.Phone1.Value.indexOf(".") == -1) {
                    $scope.Variant.Specs.Phone1.Value = num1.substring(0, 3) + "." + num1.substring(3, 6) + "." + num1.substring(6, 10);
                }
            }

            if($scope.Variant.Specs.Phone2) {
                var num2 = $scope.Variant.Specs.Phone2.Value;
                if ($scope.Variant.Specs.Phone2.Value && $scope.Variant.Specs.Phone2.Value.indexOf(".") == -1) {
                    $scope.Variant.Specs.Phone2.Value = num2.substring(0, 3) + "." + num2.substring(3, 6) + "." + num2.substring(6, 10);
                }
            }

            if($scope.Variant.Specs.Phone3.Value){
                var num3 = $scope.Variant.Specs.Phone3.Value;
                if($scope.Variant.Specs.Phone3.Value && $scope.Variant.Specs.Phone3.Value.indexOf(".") == -1){
                    $scope.Variant.Specs.Phone3.Value = num3.substring(0, 3) + "." + num3.substring(3, 6) + "." + num3.substring(6, 10);
                }
            }

            saveVariant($scope.Variant, false, hideErrorWindowAlert);
        }

        $scope.saveasnew = function(hideErrorAlert) {
            saveVariant($scope.Variant, true, hideErrorAlert);
        }

        $scope.$on('event:imageLoaded', function(event, result) {
            $scope.loadingImage = !result;
            $scope.$apply();
        });
    }]);