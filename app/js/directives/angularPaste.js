four51.app.directive('angularPaste', ['$parse', '$rootScope', '$document', 'Address', 'Resources',
    function ($parse, $rootScope, $document, Address, Resources) {
        return {
            restrict:'E',
            templateUrl:'partials/controls/angularPaste.html',
            link:function ($scope, element, attrs) {

                //We do not want to eat up chars if some text box is focussed
                //this variable will be set to true if focus is currently on
                //a textbox
                var inFocus = false;

                function parseTabular(text) {
                    //The array we will return
                    var toReturn = [];

                    try {
                        //Pasted data split into rows
                        var rows = text.split(/[\n\f\r]/);
                        rows.forEach(function (thisRow) {
                            //var row = thisRow.trim();
                            var row = thisRow;
                            if (row != '') {
                                var cols = row.split("\t");
                                if (cols.length < 10) { cols.unshift('');}
                                toReturn.push(cols);
                            }
                        });

                    }
                    catch (err) {
                        console.log('error parsing as tabular data');
                        console.log(err);
                        return null;
                    }
                    return toReturn;
                }

                function uploadList() {
                    var text = $('#myPasteBox').val();
                    var stateList = Resources.states;
                    if (text != '') {
                        //We need to change the scope values
                        $scope.$apply(function () {
                            if (attrs.ngModel != undefined && attrs.ngModel != '') {
                                $parse(attrs.ngModel).assign($scope, text);
                            }
                            if (attrs.ngArray != undefined && attrs.ngArray != '') {
                                var asArray = parseTabular(text);
                                if (asArray != null) {
                                    $parse(attrs.ngArray).assign($scope, asArray);
                                    var addressPasteList = [];
                                    for (var i = 0; i < $scope.parsedPaste.length; i++) {
                                        var a = {};
                                        a.AddressName = $scope.parsedPaste[i][0];
                                        a.FirstName = $scope.parsedPaste[i][1];
                                        a.LastName = $scope.parsedPaste[i][2];
                                        a.CompanyName = $scope.parsedPaste[i][3];
                                        a.Street1 = $scope.parsedPaste[i][4];
                                        a.Street2 = $scope.parsedPaste[i][5];
                                        a.City = $scope.parsedPaste[i][6];
                                        a.State = $scope.parsedPaste[i][7];
                                        a.Zip = $scope.parsedPaste[i][8];
                                        a.Phone = $scope.parsedPaste[i][9];
                                        a.Invalid = false;

                                        var stateValid = false;
                                        angular.forEach(stateList, function(state) {
                                            if (state.value == a.State) {
                                                stateValid = true;
                                            }
                                        });
                                        if (!stateValid) {
                                            a.State = "";
                                            a.Country = "";
                                        }
                                        else {
                                            for (var s = 0; s < stateList.length; s++) {
                                                if (a.State == stateList[s].value) {
                                                    a.Country = stateList[s].country;
                                                }
                                            }
                                        }

                                        if (a.FirstName == "" ||
                                            a.LastName == "" ||
                                            a.Street1 == "" ||
                                            a.City == "" ||
                                            a.State == "" ||
                                            !stateValid ||
                                            a.Zip == "")
                                        {
                                            a.AddressInvalid = true;
                                            a.Invalid = true;
                                        }
                                        else {
                                            a.AddressInvalid = false;
                                            a.Invalid = false;
                                        }
                                        a.ErrorMessage = null;
                                        a.Selected = false;
                                        a.AwardCount = 0;

                                        addressPasteList.push(a);
                                    }

                                    $scope.tempPasteError = false;
                                    $scope.addressPasteList =  addressPasteList;
                                }
                            }
                        });
                    }
                }

                $('#myPasteBox').on('paste', function() {
                    setTimeout(function() {
                        textChanged();
                    },5);
                });

                //Directive was not firing on first attempt after login, or after clearing cache
                $rootScope.$on('event:addressespasted', textChanged);

                $rootScope.$on('event:generateaddresses', uploadList);

                function textChanged() {
                    $scope.tempRecipientPasteList = [];
                    $scope.tempPasteError = false;
                    var stateList = Resources.states;
                    var text = $('#myPasteBox').val();
                    if (text != '') {
                        //We need to change the scope values
                        $scope.$apply(function () {
                            if (attrs.ngModel != undefined && attrs.ngModel != '') {
                                $parse(attrs.ngModel).assign($scope, text);
                            }
                            if (attrs.ngArray != undefined && attrs.ngArray != '') {
                                var asArray = parseTabular(text);
                                if (asArray != null) {
                                    $parse(attrs.ngArray).assign($scope, asArray);
                                    var addressPasteList = [];
                                    for (var i = 0; i < $scope.parsedPaste.length; i++) {
                                        var a = {};
                                        a.AddressName = $scope.parsedPaste[i][0];
                                        a.FirstName = $scope.parsedPaste[i][1];
                                        a.LastName = $scope.parsedPaste[i][2];
                                        a.CompanyName = $scope.parsedPaste[i][3];
                                        a.Street1 = $scope.parsedPaste[i][4];
                                        a.Street2 = $scope.parsedPaste[i][5];
                                        a.City = $scope.parsedPaste[i][6];
                                        a.State = $scope.parsedPaste[i][7];
                                        a.Zip = $scope.parsedPaste[i][8];
                                        a.Phone = $scope.parsedPaste[i][9];
                                        a.Invalid = false;

                                        var stateValid = false;
                                        angular.forEach(stateList, function(state) {
                                            if (state.value == a.State) {
                                                stateValid = true;
                                            }
                                        });
                                        if (!stateValid) {
                                            a.State = "";
                                            a.Country = "";
                                        }
                                        else {
                                            for (var s = 0; s < stateList.length; s++) {
                                                if (a.State == stateList[s].value) {
                                                    a.Country = stateList[s].country;
                                                }
                                            }
                                        }

                                        var errorCnt = 0;
                                        var errors = [];
                                        if (a.AddressName == "") {
                                            errorCnt++;
                                            errors.push("Address Name");
                                        }
                                        if (a.FirstName == "") {
                                            errorCnt++;
                                            errors.push("First Name");
                                        }
                                        if (a.LastName == "") {
                                            errorCnt++;
                                            errors.push("Last Name");
                                        }
                                        if (a.Street1 == "") {
                                            errorCnt++;
                                            errors.push("Address Line 1");
                                        }
                                        if (a.City == "") {
                                            errorCnt++;
                                            errors.push("City");
                                        }
                                        if (a.State == "") {
                                            errorCnt++;
                                            errors.push("State");
                                        }
                                        if (!stateValid) {
                                            errorCnt++;
                                            errors.push("State value is invalid");
                                        }
                                        if (a.Zip == "") {
                                            errorCnt++;
                                            errors.push("Zip Code");
                                        }

                                        if (errorCnt > 0) {
                                            $scope.tempPasteError = true;
                                            a.Invalid = true;
                                            var addressIdentifier = (a.FirstName != "" && a.LastName != "")
                                                ? a.FirstName + " " + a.LastName
                                                : "Address " + (i + 1);
                                            a.ErrorMessage = addressIdentifier + " is missing the following fields: ";
                                            for (var e = 0; e < errors.length; e++) {
                                                if (e < errors.length - 1) {
                                                    a.ErrorMessage += " " + errors[e] + ",";
                                                }
                                                else {
                                                    a.ErrorMessage += " " + errors[e];
                                                }
                                            }
                                        }

                                        addressPasteList.push(a);
                                    }

                                    $scope.tempAddressPasteList =  addressPasteList;
                                }
                            }
                        });
                    }
                }


                $document.ready(function () {
                    //Handles the Ctrl + V keys for pasting
                    function handleKeyDown(e, args) {
                        if (!inFocus && e.which == keyCodes.V && (e.ctrlKey || e.metaKey)) {    // CTRL + V
                            //reset value of our box
                            //$('#myPasteBox').val('');
                            //set it in focus so that pasted text goes inside the box
                            $('#myPasteBox').focus();
                        }
                    }

                    $("#uploadAddresses").bind('click', uploadList);
                    $("#clearPaste").bind('click', function(){
                        $('#myPasteBox').val('');
                    });
                });
            }
        }
    }]);