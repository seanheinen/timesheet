/********************************************************************************
 * Create Date: 30/01/2016 Company: EOH Mobility Author: Development Team
 ******************************************************************************/
(function(){

  // the 2nd parameter is an array of 'requires'
  angular.module('timesheet', [ 
    'ui.bootstrap',     
    'templateCache',
    'ui.router',
    'ngAnimate',
    'timesheet.services',
    'timesheet.controllers',
    'timesheet.controller.login'        
  ])

  .run(function($state) {
    // do init app thigns    
  })

  /// router options below - all screens for application
  .config(function($stateProvider, $urlRouterProvider) {
    
      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('login');

      // define states - this changes pages
      $stateProvider

        .state('login', {
          url: '/login',      
          templateUrl: 'login.html',
          controller: 'Login'
        });
  });

})();