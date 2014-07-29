
four51.app.controller('AddressListCtrl', ['$scope', '$location', '$451', 'AddressList', 'Address',
    function ($scope, $location, $451, AddressList, Address) {
        $scope.settings = {
            currentPage: 1,
            pageSize: 10
        };
        function Query() {
            $scope.pagedIndicator = true;
            AddressList.query(function (list, count) {
                $scope.addresses = list;
                $scope.settings.listCount = count;
                $scope.pagedIndicator = false;
            }, $scope.settings.currentPage, $scope.settings.pageSize);
        }

        $scope.deleteSelected = function() {
            $scope.displayLoadingIndicator = true;
            AddressList.delete($scope.addresses, function() {
                $scope.displayLoadingIndicator = false;
                Query();
            });
        };

        $scope.$watch('settings.currentPage', function(n,o) {
            Query();
        });
        $scope.newAddress = function() {
            $location.path('address');
        };
        $scope.checkAll = function(event) {
            angular.forEach($scope.addresses, function(add) {
                add.Selected = event.currentTarget.checked;
            });
        }

        $scope.generateAddresses = function(list) {
            $scope.savingAddressesLoadingIndicator = true;
            this.addressPasteList = [];
            var addresses = [];

            for (var i = 0; i < list.length; i++) {
                var address = list[i];
                address.IsShipping = true;
                address.IsCustEditable = true;

                if (!address.Invalid) {
                    addresses.push(address);
                }
            }

            var savedAddressesCnt = 0;

            for (var a = 0; a < addresses.length; a++) {
                addresses[a].Phone = addresses[a].Phone == "" ? " " : addresses[a].Phone;
                Address.save(addresses[a], function(add) {
                    savedAddressesCnt++;
                    $scope.addresses.push(add);
                    if (savedAddressesCnt == addresses.length) {
                        $("#myPasteBox").val('');
                        $scope.savingAddressesLoadingIndicator = false;
                    }
                });
            }
        };

        $('#myPasteBox').on('paste', function() {
            setTimeout(function() {
                $rootScope.$broadcast('event:addressespasted');
            },5);
        });

        $("#uploadRecipients").bind('click', function() {
            $rootScope.$broadcast('event:generateaddresses');
        });
    }]);