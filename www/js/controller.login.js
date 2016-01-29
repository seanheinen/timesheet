angular.module('epicmobile.controller.login', ['ngCordova', 'base64'])

  .controller("Login", function($scope, $state, $ionicPopup, $base64, $ionicLoading, EpicService, db, $cordovaVibration, SMP){

    $scope.credenitals = {
         username: 'SHEINEN',
         password: 'January2016'
    };

  	$scope.doLogin = function(){
      EpicService.vibrate();
          
	 		// get user details      
	    var username = $scope.credenitals.username.toUpperCase();
	    var password = $scope.credenitals.password;          
      var pwdBase64 = $base64.encode(username+':'+password); 
      var authBase64 = 'Basic ' + pwdBase64;  
      localStorage.setItem("Credentials", authBase64);      
      localStorage.setItem("User", JSON.stringify({ username: username }));      

	    // validate	    
	    if(!username.length || !password.length){	    	
	    	$ionicPopup.alert({
	        title: 'Validation',
	        template: 'A username and password must be entered.'
	      });
	    	return;
	    }
	    
      if(false){
  			// fake login here
        applicationContext = {};
        applicationContext.registrationContext = {};
        applicationContext.registrationContext.user = username;
        localStorage.setItem("ApplicationContext",JSON.stringify(applicationContext));
        
        // prepare application      
        $state.go('prepare');
        return;
      } else {
        // real login
        // add username credentials to connection settings
        var connectionSettings = JSON.parse(localStorage.getItem("ConnectionSettings"));    
        connectionSettings.user = username;
        connectionSettings.password = password;  
        localStorage.setItem("ConnectionSettings",JSON.stringify(connectionSettings));      
        SMP.login(); 
      }
		};
  })

  .controller("Prepare", function($scope, $state, $timeout, $ionicPopup, SapRequest, db){

		// code to run each time view is entered
  	$scope.$on('$ionicView.enter', function() {    			  				  
  		getRelationalData();
		});

		// get relational data  	  	  	
  	function getRelationalData(){
      // update status
      $timeout(function(){
        $scope.loadingStatus = "Getting department information";  
      });      

      SapRequest.request({
        method: "GET",
        requestUri: "DepartmentSet?$expand=DepartmentToSection/SectionToSubSection/SubSectionToDistrict/DistrictToBase",
      }, 
      function(data){  
        // clear DB's if request is success
        db.clear("Department");
        db.clear("Section");
        db.clear("Subsection");
        db.clear("District");
        db.clear("Base");    

        // create lists
        var departmentList = [];  
        var sectionList = [];
        var subsectionList = [];
        var districtList = [];
        var baseList = [];
        angular.forEach(data.results, function(department){
          departmentList.push(department);
          angular.forEach(department.DepartmentToSection.results, function(section){
            sectionList.push(section);
            angular.forEach(section.SectionToSubSection.results, function(subsection){
              subsectionList.push(subsection);
              angular.forEach(subsection.SubSectionToDistrict.results, function(district){
                districtList.push(district);
                angular.forEach(district.DistrictToBase.results, function(base){
                  baseList.push(base);
                }); // end base iteration
              }); // end district iteration
            }); // end subsection iteration
          }); // end section iteration
        }); // end department iteration

        // write departments to db
        insertDepartments();
        function insertDepartments(){
          var columns = [
            'Id', 
            'Description'          
          ];
          var values = [];
          angular.forEach(departmentList, function(department){
            values.push([
              department.DepartmentID, 
              department.DepartmentName            
            ]);
          });
          db.insertMany("Department", columns, values, function(result){
            insertSections();
          });
        }        
        function insertSections(){
          // write sections to db
          var columns = [
            'Id', 
            'DepartmentId',
            'Description'          
          ];
          var values = [];
          angular.forEach(sectionList, function(section){
            values.push([
              section.SectionID,
              section.DepartmentID,
              section.SectionName            
            ]);
          });
          db.insertMany("Section", columns, values, function(result){
            insertSubSections();
          });
        }
        function insertSubSections(){
          // write sections to db
          var columns = [
            'Id', 
            'DepartmentId',
            'SectionId',
            'Description'          
          ];
          var values = [];
          angular.forEach(subsectionList, function(subsection){
            values.push([
              subsection.SubSectionID,
              subsection.DepartmentID,
              subsection.SectionID,
              subsection.SubSectionName            
            ]);
          });
          db.insertMany("Subsection", columns, values, function(result){
            insertDistricts();
          });
        }
        function insertDistricts(){
          // write sections to db
          var columns = [
            'Id', 
            'DepartmentId',
            'SectionId',
            'SubsectionId',
            'Description'          
          ];
          var values = [];
          angular.forEach(districtList, function(district){
            values.push([
              district.DistrictID,
              district.DepartmentID,
              district.SectionID,
              district.SubSectionID,
              district.DistrictName            
            ]);
          });
          db.insertMany("District", columns, values, function(result){
            insertBases();
          });
        }

        function insertBases(){
          // write sections to db
          var columns = [
            'Id', 
            'DepartmentId',
            'SectionId',
            'SubsectionId',
            'DistrictId',
            'Description'          
          ];
          var values = [];
          angular.forEach(baseList, function(base){
            values.push([
              base.BaseID,
              base.DepartmentID,
              base.SectionID,
              base.SubSectionID,
              base.DistrictID,
              base.BaseName            
            ]);
          });
          db.insertMany("Base", columns, values, function(result){
            getVehicles();
          });
        }        
      },
      function(err){  
        window.history.back();         
        $ionicPopup.alert({
          title: 'Error',
          template: err
        });
      }); 

    }

  	// get vehicles  	  	
  	function getVehicles(){  			  	
      // update status
      $timeout(function(){
        $scope.loadingStatus = "Getting Vehicles";
      });

      // do vehicle request
      SapRequest.request({
          method: "GET",
          requestUri: "VehicleSet",
      }, 
      function(data){  

        // clear vehicles
        db.clear("Vehicle");

        // build vehicle rows
        var columns = [
          'VehicleId', 
          'VehicleType', 
          'RegNum', 
          'CallSign', 
          'DepartmentId', 
          'SectionId', 
          'SubsectionId', 
          'DistrictId', 
          'BaseId'
        ];
        var values = [];
        angular.forEach(data.results, function(vehicle){
          values.push([
            vehicle.VehicleID, 
            vehicle.VehicleType, 
            vehicle.RegNum, 
            vehicle.CallSign, 
            vehicle.DepartmentID, 
            vehicle.SectionID, 
            vehicle.SubSectionID, 
            vehicle.DistrictID, 
            vehicle.BaseID
          ]);
        });

        db.insertMany("Vehicle", columns, values, function(result){
          getEmployees();
        });
      }, function(err){           
        window.history.back();         
        $ionicPopup.alert({
          title: 'Error',
          template: err
        });          
      }); 
	  }

    // DEPRECATED
  	// get employees  	
  	function getEmployees(){
      
      // update status
      $timeout(function(){
        $scope.loadingStatus = "Getting Employees";
      });

      // do employees request
      SapRequest.request({
          method: "GET",
          requestUri: "EmployeeSet",
      }, 
      function(data){  

        // clear vehicles
        db.clear("Employee");

        // build vehicle rows
        var columns = [
          'PersalNr', 
          'EmployeeType', 
          'LastName', 
          'Partner', 
          'FirstName',
          'IDNR',          
          'DepartmentId', 
          'SectionId', 
          'SubsectionId', 
          'DistrictId', 
          'BaseId'
        ];
        var values = [];
        angular.forEach(data.results, function(employee){
          values.push([
            employee.PersalNr, 
            employee.EmployeeType, 
            employee.LastName, 
            employee.Partner, 
            employee.FirstName,
            employee.IDNR,          
            employee.DepartmentID, 
            employee.SectionID, 
            employee.SubSectionID, 
            employee.DistrictID, 
            employee.BaseID
          ]);
        });

        // do 500 item splices if employee list large
        var chunks = [];
        if(values.length > 500){          
          while(values.length) {
            chunks.push(values.splice(0,500));            
          }          
        } else {
          chunks.push(values.splice(0,500));            
        }
        
        var chunkCnt = 0;
        insertEmployeeChunk(chunks[chunkCnt]);
        function insertEmployeeChunk(chunk){

          if(!chunk){            
            getStatus();
            return;
          }

          db.insertMany("Employee", columns, chunk, function(result){
            chunkCnt++;
            insertEmployeeChunk(chunks[chunkCnt]);
          });
        }

      }, function(err){  
        window.history.back();                  
        $ionicPopup.alert({
          title: 'Error',
          template: err
        });          
      }); 
	  }

    // get status    
    function getStatus(){           
      // update status
      $timeout(function(){
        $scope.loadingStatus = "Getting Statuses";
      });

      // do vehicle request
      SapRequest.request({
          method: "GET",
          requestUri: "StatusForUnitSet",
      }, 
      function(data){  

        // clear vehicles
        db.clear("Status");

        // build vehicle rows
        var columns = [
          'Status', 
          'ShortText', 
          'Description'
        ];
        var values = [];
        angular.forEach(data.results, function(status){
          values.push([
            status.Status, 
            status.ShortText, 
            status.Description
          ]);
        });

        db.insertMany("Status", columns, values, function(result){
          getUnitData();
        });
      }, function(err){           
        window.history.back();         
        $ionicPopup.alert({
          title: 'Error',
          template: err
        });          
      }); 
    }    

		// get unit data  			
  	function getUnitData(){
      $timeout(function(){
        $scope.loadingStatus = "Getting Unit Data";
      });
      
      var userDetails = JSON.parse(localStorage.getItem("User"));     

      userDetails.username = "AENGELBRECHT"; // hardcoded
      SapRequest.request({
          method: "GET",
          requestUri: "UserSet('" + userDetails.username + "')?$expand=UserToUserUnit/UserUnitToUnit/UnitToUnitEmployee/UnitEmployeeToEmployee,UserToUserUnit/UserUnitToUnit/UnitToUnitVehicle/UnitVehicleToVehicle",
      }, 
      function(data){  
        // set logged in user details
        var userDetails = {
          UserID: data.UserID,
          UserName: data.UserName,
          UserFirstName: data.FirstName,
          UserLastName: data.LastName,
          UnitID: data.UserToUserUnit.UnitID,
          Role: data.UserToUserUnit.Role
        }        
        localStorage.setItem("User", JSON.stringify(userDetails));
            
        // clear unit tables
        db.clear("Unit");
        db.clear("UnitEmployee");
        db.clear("UnitVehicle");

        var unitDetails = data.UserToUserUnit.UserUnitToUnit;
        var unitEmployeeDetails = unitDetails.UnitToUnitEmployee.results;
        var unitVehicleDetails = unitDetails.UnitToUnitVehicle.results;

        // write unit details to DB 
        insertUnit(unitDetails);
        function insertUnit(unitData){
          var columns = [
            'UnitId', 
            'UnitName', 
            'Description', 
            'UnitType', 
            'Status', 
            'DepartmentId', 
            'SectionId', 
            'SubsectionId', 
            'DistrictId', 
            'BaseId'
          ];
          var values = [
            unitData.UnitID, 
            unitData.UnitName, 
            unitData.Description, 
            unitData.UnitType, 
            unitData.Status,
            unitData.DepartmentID, 
            unitData.SectionID, 
            unitData.SubSectionID, 
            unitData.DistrictID, 
            unitData.BaseID
          ];
          db.insert("Unit", columns, values, function(result){
            insertUnitEmployees(unitEmployeeDetails);
          });

        }
        function insertUnitEmployees(unitEmployeeData){

          if(unitEmployeeData.length < 1){
            insertUnitVehicles(unitVehicleDetails);
            return;
          }

          // build unit employee rows
          var columns = [
            'UnitId', 
            'Partner'             
          ];
          var values = [];
          angular.forEach(unitEmployeeData, function(employee){
            values.push([
              employee.UnitID, 
              employee.Partner              
            ]);
          });

          db.insertMany("UnitEmployee", columns, values, function(result){
            insertUnitVehicles(unitVehicleDetails);
          });
        }
        function insertUnitVehicles(unitVehicleData){

          if(unitVehicleData.length < 1){
            $state.go('checkin.overview');
            return;
          }

          // build unit employee rows
          var columns = [
            'UnitId', 
            'VehicleId'             
          ];
          var values = [];
          angular.forEach(unitVehicleData, function(vehicle){
            values.push([
              vehicle.UnitID, 
              vehicle.VehicleID
            ]);
          });
          db.insertMany("UnitVehicle", columns, values, function(result){
            // go checkin screen
            $state.go('checkin.overview');
          });
        }
      }, function(err){    
        window.history.back();                
        $ionicPopup.alert({
          title: 'Error',
          template: err
        });          
      });           
	  }
  });  