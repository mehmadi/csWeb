﻿module LayerEdit {
    /**
      * Config
      */
    var moduleName = 'csComp';

    /**
      * Module
      */
    export var myModule;
    try {
         myModule = angular.module(moduleName);
    } catch (err) {
        // named module does not exist, so create one
        myModule = angular.module(moduleName, []);
    }

    /**
      * Directive to display a feature's properties in a panel.
      *
      * @seealso          : http://www.youtube.com/watch?v=gjJ5vLRK8R8&list=UUGD_0i6L48hucTiiyhb5QzQ
      * @seealso          : http://plnkr.co/edit/HyBP9d?p=preview
      */
    myModule.directive('layeredit', [ '$compile',
        function($compile): ng.IDirective {
            return {
                terminal  : true,       // do not compile any other internal directives
                restrict  : 'E',        // E = elements, other options are A=attributes and C=classes
                scope     : {},         // isolated scope, separated from parent. Is however empty, as this directive is self contained by using the messagebus.
                templateUrl: 'directives/Editors/LayerEditor/LayerEdit.tpl.html',
                compile   : el => {     // I need to explicitly compile it in order to use interpolation like {{xxx}}
                    var fn = $compile(el);
                    return scope => {
                        fn(scope);
                    };
                },
                replace   : true,   // Remove the directive from the DOM
                transclude: true,   // Add elements and attributes to the template
                controller: LayerEditCtrl
            }
        }
    ]);
}
