// Ionic EpicMobile Global services
angular.module('epicmobile.services', ['ionic', 'ngCordova'])

  /*************************************************************************************************************************************************
   * Database Handler:
   * This handler handles all CRUD operations to the DB
   * insert - Does a single insert to table
   * insertMultiple - Insert multiple rows with one query
   * clear - Clears all records in table
   * 
   * 
  *************************************************************************************************************************************************/
  .factory("db", function($cordovaSQLite, $ionicHistory, $state){
    var database = {};

    var db = null;

    // create all tables if they dont exist
    database.init = function(){
      if (window.cordova) {
        db = $cordovaSQLite.openDB("epicmobile.db"); // device
      }else{
        db = window.openDatabase("epicmobile.db", "1.0", "EPIC Mobile CoCT", 200000); // browser
      }

      $cordovaSQLite.execute(db, "DROP TABLE Department", []);
      $cordovaSQLite.execute(db, "DROP TABLE Section", []);
      $cordovaSQLite.execute(db, "DROP TABLE Subsection", []);
      $cordovaSQLite.execute(db, "DROP TABLE District", []);
      $cordovaSQLite.execute(db, "DROP TABLE Base", []);
      $cordovaSQLite.execute(db, "DROP TABLE Vehicle", []);
      $cordovaSQLite.execute(db, "DROP TABLE Employee", []);
      $cordovaSQLite.execute(db, "DROP TABLE Unit", []);
      $cordovaSQLite.execute(db, "DROP TABLE UnitEmployee", []);
      $cordovaSQLite.execute(db, "DROP TABLE UnitVehicle", []);

      createDepartment();      
      function createDepartment(){        
        // organization structure        
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS Department (" +
            "Id STRING PRIMARY KEY, " +
            "Description TEXT" +
          ")")
        .then(createSection, error);
      }
      function createSection(){             
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS Section (" +
            "Id STRING PRIMARY KEY, " +
            "DepartmentId STRING, " +
            "Description TEXT" +
          ")")
        .then(createSubsection, error);
      }        
      function createSubsection(){
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS Subsection (" +
            "Id STRING PRIMARY KEY, " +
            "DepartmentId STRING, " +
            "SectionId STRING, " +
            "Description TEXT" +
          ")")
        .then(createDistrict, error)        
      }
      function createDistrict(){
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS District (" +
            "Id STRING PRIMARY KEY, " +
            "DepartmentId STRING, " +
            "SectionId STRING, " +
            "SubsectionId STRING, " +
            "Description TEXT" +
          ")")
        .then(createBase, error);
      }        
      function createBase(){
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS Base (" +
            "Id STRING PRIMARY KEY, " +
            "DepartmentId STRING, " +
            "SectionId STRING, " +
            "SubsectionId STRING, " +
            "DistrictId STRING, " +
            "Description TEXT" +
          ")")
        .then(createEmployee, error);
      }
      // employees
      function createEmployee(){
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS Employee (" +
            "Partner STRING PRIMARY KEY, " +  
            "PersalNr STRING, " +
            "EmployeeType TEXT, " +
            "LastName TEXT, " +                  
            "FirstName TEXT, " +
            "IDNR TEXT, " +
            "DepartmentId STRING, " +
            "SectionId STRING, " +
            "SubsectionId STRING, " +
            "DistrictId STRING," +
            "BaseId STRING" +
          ")")
        .then(createVehicle, error);
      }      
      // vehicles
      function createVehicle(){
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS Vehicle (" +
            "VehicleId STRING PRIMARY KEY, " +
            "VehicleType TEXT, " +
            "RegNum TEXT, " +
            "CallSign TEXT, " +          
            "DepartmentId STRING, " +
            "SectionId STRING, " +
            "SubsectionId STRING, " +
            "DistrictId STRING, " +
            "BaseId STRING" + 
          ")")
        .then(createStatus, error);
      }

      // unit status'
      function createStatus(){
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS Status (" +
            "Status STRING PRIMARY KEY, " +
            "ShortText STRING, " +
            "Description TEXT " +            
          ")")
        .then(createUnit, error);
      }

      // unit data
      function createUnit(){
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS Unit (" +
            "UnitId STRING PRIMARY KEY, " +
            "UnitName STRING, " +
            "Description TEXT, " + 
            "UnitType STRING, " +
            "Status TEXT, " + 
            "DepartmentId STRING, " +
            "SectionId STRING, " +
            "SubsectionId STRING, " +
            "DistrictId STRING, " +
            "BaseId STRING" + 
          ")")
        .then(createUnitEmployee, error);
      }      
      // unit employees
      function createUnitEmployee(){
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS UnitEmployee (" +
            "UnitId STRING PRIMARY KEY, " +
            "Partner STRING" +            
          ")")
        .then(createUnitVehicle, error);
      }
      // unit vehicles
      function createUnitVehicle(){
        $cordovaSQLite.execute(db, 
          "CREATE TABLE IF NOT EXISTS UnitVehicle (" +
            "UnitId STRING PRIMARY KEY, " +
            "VehicleId STRING" +            
          ")")
        .then(leaveSplash, error);
      }                  
      // go to login screen        
      function leaveSplash(){
        return;
        $ionicHistory.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });          
        $state.go("login");          
        /*setTimeout(function() {      
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });          
          $state.go("login");          
        }, 4000)        */
      }

      function error (err) {        
        console.log(err);        
        alert("Error: " + JSON.stringify(err));
      }
    };

    database.read = function(query, cb){
      $cordovaSQLite.execute(db, query, [])
        .then(function(result) {
          // if no result         
          if( result.rows.length < 1){
            cb(null);
            return;
          }              
          // if callback defined    
          if(cb){
            // check device or browser
            if (window.cordova) {
              cb(result.rows.item(0));
            } else {
              cb(result.rows[0]);
            }                        
          }          
        }, function (err) {          
          console.log("Unable to read [" + query + "] - " + err.message);        
        });
    }    

    database.select = function(query, cb){
      $cordovaSQLite.execute(db, query, [])
        .then(function(result) {           
          if( result.rows.length < 1){
            cb([]);
            return;
          }         
          var resultList = [];
          // check device or browser
          if (window.cordova) {
            for (var i = 0; i < result.rows.length; i++) {
              resultList.push(result.rows.item(i));
            }          
          } else {
            angular.forEach(result.rows, function(item){
              resultList.push(item);
            })
          }          
          if(cb){
            cb(resultList);
          }          
        }, function (err) {          
          console.log("Unable to select [" + query + "] - " + err.message);        
        });
    }

    database.insert = function(table, columns, values, cb){   
      // build query
      var query = 'INSERT INTO ' + table + ' (';
      var valPlaceholder = '';  
      angular.forEach(columns, function(col){
        query += col + ','
        valPlaceholder += '?,';  
      });
      // remove end commas
      query = query.slice(0, -1)  + ')';
      valPlaceholder = valPlaceholder.slice(0, -1);      
      query += ' VALUES ('+valPlaceholder+')';
      
      $cordovaSQLite.execute(db, query, values)
        .then(function(res) {          
          if(cb)
            cb(res);
        }, function (err) {          
          console.log("Unable to insert [" + query + "] - " + err.message);        
        });
    }

    database.insertMany = function(table, columns, values, cb){   
      // build query
      var query  = 'INSERT INTO '+table+' ('
      angular.forEach(columns, function(col){
        query += col + ','        
      });
      query = query.slice(0, -1)  + ') SELECT ';

      // do first row      
      angular.forEach(values[0], function(value, index){
        query += '"' + value + '" AS '+ columns[index] + ',';
      });
      query = query.slice(0, -1);

      // do other rows
      values.splice(0, 1);
      angular.forEach(values, function(row, index){
        query += ' UNION ALL SELECT '
        angular.forEach(row, function(value){
           query += '"' + value + '",';
        });
        query = query.slice(0, -1);
      });

      // write rows 
      $cordovaSQLite.execute(db, query, [])
        .then(function(res) {          
          if(cb)
            cb(res);
        }, function (err) {          
          console.log("Unable to insert many [" + query + "] - " + err.message);        
        });
    } 

    database.update = function(table, key, keyValue, columns, values, cb){   
      // build query   
      var query = 'UPDATE ' + table + ' SET '
      angular.forEach(columns, function(col, index){
        query += col + ' = "' + values[index] + '", ';
      });
      query = query.slice(0, -2);
      query += ' WHERE ' + key + ' = "' + keyValue + '"';

      $cordovaSQLite.execute(db, query)
        .then(function(res) {          
          if(cb)
            cb(res);
        }, function (err) {          
          console.log("Unable to insert [" + query + "] - " + err.message);        
        });
    }   

    database.clear = function(table, cb){   
      $cordovaSQLite.execute(db, "DELETE FROM " + table, [])
        .then(function(res) {          
          if(cb)
            cb(res);
        }, function (err) { 
          console.log("Unable to clear " + table + " - " + err.message);        
        }); 
    }
    
    return database;    
  })

  /*************************************************************************************************************************************************
  * For the brave souls who get this far: You are the chosen ones, 
  * the valiant knights of programming who toil away, without rest, 
  * fixing my most awful code. To you, true saviors, kings of men,
  * I say this: never gonna give you up, never gonna let you down, 
  * never gonna run around and desert you. Never gonna make you cry,
  * never gonna say goodbye. Never gonna tell a lie and hurt you. 
  *************************************************************************************************************************************************/
  /*************************************************************************************************************************************************
   * OData Request Handler:
   * This handler handles all requests to the backend (format JSON)
   * GET - Does a normal GET
   * POST - Automatically gets the CSRF token and POST's
   * PUT - Automatically gets the CSRF token and the row and updates only the changed properties
   * DELETE - Automatically gets the CSRF token and DELETEs the record
   * Usage: SapRequest.request({ request data here }, success callback, error callback );
  *************************************************************************************************************************************************/
  .factory("SapRequest", function(){

    var request = {};

    request.request = function(request, success, error){

      // this is offline demo mode

      if(false){
        setTimeout(function(){

          if(request.method === "GET"){               
            if(request.requestUri.indexOf("DepartmentSet") > -1){
              success(mockRelationalData.d);
            }
            if(request.requestUri === "VehicleSet"){
              success(mockVehicleData.d);
            }
            if(request.requestUri.indexOf("EmployeeSet") > -1){
              success(mockEmployeeData.d);
            }        
            if(request.requestUri.indexOf("StatusForUnitSet") > -1){
              success(mockUnitStatus.d);
            }                    
            if(request.requestUri.indexOf("UserSet") > -1){
              success(mockUnitData.d);
            }            
            if(request.requestUri.indexOf("IncidentSet") > -1){
              success(mockIncidentData.d);
            }
          }
          if(request.method === "PUT"){                               
            success();                
          }
          if(request.method === "POST"){               
            success();
          }
        }, 500);
        return;
      }
    
      // CHECK THIS STUFF OUT LATER
      // get application context info to get URL
      var applicationContext = JSON.parse(localStorage.getItem("ApplicationContext"));      
      if (!applicationContext) 
      {   
        //error({ Error : "Error: No Application Context." });
        alert("Fatal Error: #1");
        return;
      }

      // build url    
      //request.requestUri = "http://ibmhana.eohcorp.net:8001/sap/opu/odata/sap/Z_MOBILE_EPIC_SRV/" + request.requestUri;
      //request.requestUri = "http://10.3.1.115:8001/sap/opu/odata/sap/Z_MOBILE_EPIC_SRV/" + request.requestUri;
      request.requestUri = applicationContext.applicationEndpointURL + "/" + request.requestUri;      
      
      // build headers obj
      var credentials = localStorage.getItem("Credentials");      
      request.headers = { 
        "Authorization" : credentials
      };      
      
      // check request method     
      switch(request.method){     
        case "GET":         
          // insert json formatter
          if((request.requestUri).indexOf("?") < 1)
            request.requestUri += "?$format=json";
          else{
            request.requestUri += "&$format=json";
          }

          // insert cache busting header
          request.headers["If-Modified-Since"] = "Monday, 26 Jul 1969 00:00:00 GMT";
          OData.request(request,
          function(data){ 
            success(data);         
          },
          function(err){          
            error(getMsg(err));
          });
          break;  
        
        case "POST":
          tokenRequest(function(token){
            request.headers["X-CSRF-Token"] = token;
            OData.request(request,
              function(data){     
                success(data);         
              },
              function(err){          
                error(getMsg(err));
              }); 
            });                 
          break;
            
        case "PUT":  
          tokenRequest(function(token){
            request.headers["X-CSRF-Token"] = token;            
            OData.request(request,
              function(data){     
                success(data);         
              },
              function(err){          
                error(getMsg(err));
              }); 
            }); 
          break;
          var putRequest = request;
          
          // Deep copy PUT request
          var getRequest = $.extend(true, {}, request);                   
          getRequest.method = "GET";
          delete getRequest.data;
          getRequest.headers["X-CSRF-Token"] = "Fetch";
          
          // get row for PUT
          OData.request(getRequest,
            function(data, response){
                          
              // get token
              putRequest.headers["X-CSRF-Token"] = response.headers["x-csrf-token"];                      
              
              //put changed data in row
              for(var attrname in putRequest.data){
                data[attrname] = putRequest.data[attrname];                                                     
              }
              putRequest.data = data;
                                      
              // do put
              OData.request(putRequest,
                function(data){                                     
                  success(data);         
                },
                function(err){          
                  error(getMsg(err));
                });                 
            },
            function(err){
              error(getMsg(err))
            });                 
          break;
      
        case "DELETE":
          tokenRequest(function(token){
            request.headers["X-CSRF-Token"] = token;
            OData.request(request,
              function(data){     
                success(data);         
              },
              function(err){          
                error(getMsg(err));
              }); 
          });                 
          break;          
            
        default:
          //error({ Error: "Error: Incorrect method" });                                                    
          break;
      }   
    } // end sapRequest method

    /*************************************************************************************************************************************************
     * Get CSRF Token service request
    *************************************************************************************************************************************************/
    function tokenRequest(success){        
      if(!success)
          return;
      
      // get credentials
      var credentials = localStorage.getItem("Credentials");
              
      // get application context info to get URL
      var applicationContext = JSON.parse(localStorage.getItem("ApplicationContext"));          
      if (!applicationContext) 
      {   
          //error({ Error : "Error: No Application Context." });
          alert("Fatal Error: #1");
          return;
      }

      // build url            
      var requestUri = applicationContext.applicationEndpointURL;
      OData.request({
        headers : { 
          "Authorization" :   credentials,
          "X-CSRF-Token"  : "Fetch"
        },
        method: "GET",
        requestUri: requestURI
      },
      function(data, response){       
        success(response.headers["x-csrf-token"]);         
      },
      function(err){        
        //requestError(err);
        alert("Unable to fetch token");
      });
    }

    function getMsg(err){      

      return err.response.statusCode + ": " + JSON.stringify(err);

      // init message
      var msg = '';   
      // output appropriate error message
      switch(err.response.statusCode){
        case 0:
          msg = '<b>Error: No Connection</b><br />The request timed out. Please ensure that you have a data connection';
          break;  
        case 400:
          msg = '<b>Error 400: Bad request</b><br/><br/>Invalid request.';         
          break;          
        case 401:
          msg = '<b>Error 401: Authentication</b><br/><br/>Invalid username/password credentials.';         
          break;
        case 403:
          msg = '<b>Error 403: Authentication</b><br/><br/>Connection already exists.';
          break;
        case 404:
          msg = '<b>Error 404: No Connection</b><br/><br/>The request timed out. Please ensure that you have a data connection';
          break;  
        case 500:
          msg = '<br>Error 500: Server Down</b><br/><br/>Please contact your administrator.';
          break;
        case 502:
          msg = '<br>Error 502: Server Down</b><br/><br/>Please contact your administrator.';
          break;                      
        default:
          msg = "<br>Unexpected error " + err.response.statusCode + ": </b><br/><br/>Please contact your administrator.<br/><br/>" + err.response.statusText;                                                 
          break;
      }             
      return msg;
    }
    return request;
  })

  .factory("EpicService",function($cordovaVibration){
    
    var factory = {}; 
 
    factory.vibrate = function(){
      if (window.cordova)
        $cordovaVibration.vibrate(100);
    }

    // employee photo logic
    factory.getUnitEmployeePhoto = function(person){
      if(person.hasOwnProperty("Photo")){
        if(person.Photo.length)
          return person.Photo;
      }

      // get gender
      if(person.IDNR.charAt(5) > 4){
        return 'img/search-user-icon-male.svg'
      } else {
        return 'img/search-user-icon-female.svg'
      }
    }



    
    return factory;    
  })

  // side menu functions
  .factory("sideMenu", function($ionicPopup, $state, db, $timeout, SMP){
    
    var sideMenu = {};

    var retClass;
    sideMenu.getStatusClass = function(status){            
      switch(status){
        case 'E0001':
          retClass = 'status-inactive';
          break;
        case 'E0002':
          retClass = 'status-available';
          break;
        case 'E0003':
          retClass = 'status-available-at-base';
          break;
      }
      return retClass;
    }


    sideMenu.goHelp = function(){
      $state.go("help");  
    }
    
    // view person - profile pages
    sideMenu.goProfile = function(item){            
      item.Partner = "7000125031";// temp hardcode

      var query = 'SELECT * FROM Employee WHERE Partner = "' + item.Partner + '"'
      db.read(query, function(employeeInfo){
        if(!employeeInfo)
          return;

        $state.go("person", {
          person: employeeInfo
        });
      });
    }

    sideMenu.goStatus = function(){
      $state.go("status");  
    }

    // side menu navigation
    sideMenu.goTaskList = function(){
      $state.go("tasklist"); 
    }

    sideMenu.goUnit = function(){
      $state.go("checkin.overview");  
    }

    sideMenu.Logout = function(){
      $ionicPopup.confirm({
        title: 'Confirmation',
        template: 'Are you sure you would like to log off?'
      }).then(function(res) {
        if (res) {
          // do logout
          SMP.logout();

          //$state.go('login');
        }
      })
    }

    sideMenu.SelfStart = function(){
      $state.go("selfstart");  
    }

    return sideMenu;
  })

  /*******************************************************************************
   * Logout/Unregister
   ******************************************************************************/
  .factory("SMP", function($state, $ionicLoading){

    var SMP = {};

    SMP.login = function(){
      $ionicLoading.show({ template: 'Logging in' });
      // get connection settings and call SMP register
      var connectionSettings = JSON.parse(localStorage.getItem("ConnectionSettings"));

      //*******************************************************************************
      // override SAP login screen methods
      function customShowScreen(screenId, screenEvents, currentContext) {
        if (screenId =="SCR_SSOPIN_SET") {
          screenEvents.onskip();
          return true;
        } else if (screenId =="SCR_UNLOCK") {
          var context = {
              unlockPasscode: "Password1@"
              }
          screenEvents.onsubmit(context);
          return true;
        } else if (screenId =="SCR_REGISTRATION") {
          screenEvents.onsubmit(currentContext.registrationContext);
          return true;
        } else if (screenId =="SCR_SET_PASSCODE_MANDATORY") {
          var context = {
            passcode: "Password1@",
            passcode_CONFIRM: "Password1@"
          }
          screenEvents.onsubmit(context);
          return true;
        } else if (screenId =="SCR_SET_PASSCODE_OPT_ON") {
          screenEvents.ondisable();
          return true;
        } else if (screenId =="SCR_SET_PASSCODE_OPT_OFF") {
          var context = {};
          screenEvents.onsubmit(context);
          return true;
        }
        return false;  //skip the default value
      }
      function customShowNotification(screenId, notificationKey, notificationMessage) {
        if (screenId == "SCR_SSOPIN_SET" || screenId == "SCR_UNLOCK" || screenId == "SCR_REGISTRATION" || screenId == "SCR_SET_PASSCODE_MANDATORY" || screenId == "SCR_SET_PASSCODE_OPT_ON" || screenId == "SCR_SET_PASSCODE_OPT_OFF" ) {                     
          return true;
        }
        return false;
      }
      var logonView = sap.logon.IabUi;
      logonView.onShowScreen = customShowScreen;
      logonView.onShowNotification = customShowNotification;
      //*******************************************************************************
      
      // init call backs
      function cbsuccess(result) 
      { 
        $ionicLoading.hide();                         
        
        localStorage.setItem("ApplicationContext",JSON.stringify(result));

        // prepare application      
        $state.go('prepare');        
      }    
      function cberror(error)  { 
        $ionicLoading.hide();
        alert("stuff: " + JSON.stringify(error));
      } // only occurs when user cancels - which is impossible                      
      sap.Logon.init(cbsuccess, cberror, localStorage.getItem("ApplicationID"), connectionSettings, logonView);
    
    }

    SMP.logout = function(){

      alert($state.current.name);

      $ionicLoading.show({ template: 'Logging out' });
      
      // get application context to log out
      var applicationContext = JSON.parse(localStorage.getItem("ApplicationContext"));
      if (applicationContext == null)
      {
          //alert("Not Logged in/Registered");
          //showError("Not Logged in");   
          //return;
      }

      // check if browser or cordova
      /*
      if (!window.cordova) {
        //$state.go("Login");

        // clear credentials and application context
        localStorage.removeItem("ApplicationContext");
        localStorage.removeItem("Credentials");
        return;
      }
      */
      
      
      // init call backs
      var cbsuccess = function (result) 
      {                
        $ionicLoading.hide();
        $state.go("Login");

        // clear credentials and application context
        localStorage.removeItem("ApplicationContext");
        localStorage.removeItem("Credentials");
      }
      var cberror = function (error) 
      {              
          alert("succes");
          $ionicLoading.hide();
          alert("An error occurred:  " + JSON.stringify(error));     
      }    
      // log off/ unregister - gets context from SMP login    
      sap.logon.Core.deleteRegistration(cbsuccess, cberror);  
    }

    return SMP;

  });