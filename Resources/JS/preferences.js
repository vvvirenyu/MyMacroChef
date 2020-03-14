var userid;
var apigClient;
var pageNum;
var data_received;
var recom_flag='0';

$('document').ready(function () {
	if (window.localStorage.getItem('access-token')==null || window.localStorage.getItem('access-token')=='null')
		window.location = "signout.html";
    apigClient = apigClientFactory.newClient({
        accessKey: 'accessKey',
        secretKey: 'secretKey',
      });
	userid = window.localStorage.getItem('userid');
	var recomuserid = userid+'_'+recom_flag;
	//console.log(userid);
    var params = {username : recomuserid, user_id:recomuserid};
    var additionalParams = {headers: {
      'Content-Type':"application/json"
    }};
	var body = {
        key : "Hello"
    };
	//populateFields('null');
	apigClient.preferencesGet(params, body)
        .then(function (result) {
          console.log(result);
		  populateFields(result.data);
        }).catch(function (result) {
          alert('Permission Denied')
          console.log(result);
          console.log("Something went wrong!");
        });
  });

function getRecommendation() {
	$('#loading').show();
	userid = window.localStorage.getItem('userid');
	recom_flag='1';
	var recomuserid = userid+'_'+recom_flag;
	//console.log(userid);
    var params = {username : recomuserid, user_id:recomuserid};
    var additionalParams = {headers: {
      'Content-Type':"application/json"
    }};
	var body = {
        key : "Hello"
    };
	apigClient.preferencesGet(params, body)
        .then(function (result) {
          console.log(result);
		  populateFields(result.data);
        }).catch(function (result) {
          alert('Permission Denied')
          console.log(result);
          console.log("Something went wrong!");
        });
}

function setRecommendation() {
	$('#monbfcui').val(data_received.breakfast[Math.floor((Math.random() * 27) + 1)]);
	$('#monlncui').val(data_received.lunch[Math.floor((Math.random() * 27) + 1)]);
	$('#monsncui').val(data_received.snack[Math.floor((Math.random() * 27) + 1)]);
	$('#mondncui').val(data_received.dinner[Math.floor((Math.random() * 27) + 1)]);
	$('#tuebfcui').val(data_received.breakfast[Math.floor((Math.random() * 27) + 1)]);
	$('#tuelncui').val(data_received.lunch[Math.floor((Math.random() * 27) + 1)]);
	$('#tuesncui').val(data_received.snack[Math.floor((Math.random() * 27) + 1)]);
	$('#tuedncui').val(data_received.dinner[Math.floor((Math.random() * 27) + 1)]);
	$('#wedbfcui').val(data_received.breakfast[Math.floor((Math.random() * 27) + 1)]);
	$('#wedlncui').val(data_received.lunch[Math.floor((Math.random() * 27) + 1)]);
	$('#wedsncui').val(data_received.snack[Math.floor((Math.random() * 27) + 1)]);
	$('#weddncui').val(data_received.dinner[Math.floor((Math.random() * 27) + 1)]);
	$('#thrbfcui').val(data_received.breakfast[Math.floor((Math.random() * 27) + 1)]);
	$('#thrlncui').val(data_received.lunch[Math.floor((Math.random() * 27) + 1)]);
	$('#thrsncui').val(data_received.snack[Math.floor((Math.random() * 27) + 1)]);
	$('#thrdncui').val(data_received.dinner[Math.floor((Math.random() * 27) + 1)]);
	$('#fribfcui').val(data_received.breakfast[Math.floor((Math.random() * 27) + 1)]);
	$('#frilncui').val(data_received.lunch[Math.floor((Math.random() * 27) + 1)]);
	$('#frisncui').val(data_received.snack[Math.floor((Math.random() * 27) + 1)]);
	$('#fridncui').val(data_received.dinner[Math.floor((Math.random() * 27) + 1)]);
	$('#satbfcui').val(data_received.breakfast[Math.floor((Math.random() * 27) + 1)]);
	$('#satlncui').val(data_received.lunch[Math.floor((Math.random() * 27) + 1)]);
	$('#satsncui').val(data_received.snack[Math.floor((Math.random() * 27) + 1)]);
	$('#satdncui').val(data_received.dinner[Math.floor((Math.random() * 27) + 1)]);
	$('#sunbfcui').val(data_received.breakfast[Math.floor((Math.random() * 27) + 1)]);
	$('#sunlncui').val(data_received.lunch[Math.floor((Math.random() * 27) + 1)]);
	$('#sunsncui').val(data_received.snack[Math.floor((Math.random() * 27) + 1)]);
	$('#sundncui').val(data_received.dinner[Math.floor((Math.random() * 27) + 1)]);
	$('.selectpicker').selectpicker('refresh');
	$('#loading').hide();
}

function update() {
	$('#loading').show();
	var params = {username : userid, user_id : userid};
	var body = {
		"user_id" : userid,
		"page_num" : pageNum,
		"monday_breakfast" : $('#monbfcui').val(),
		"monday_lunch" : $('#monlncui').val(),
		"monday_snack" : $('#monsncui').val(),
		"monday_dinner" : $('#mondncui').val(),
		"tuesday_breakfast" : $('#tuebfcui').val(),
		"tuesday_lunch" : $('#tuelncui').val(),
		"tuesday_snack" : $('#tuesncui').val(),
		"tuesday_dinner" : $('#tuedncui').val(),
		"wednesday_breakfast" : $('#wedbfcui').val(),
		"wednesday_lunch" : $('#wedlncui').val(),
		"wednesday_snack" : $('#wedsncui').val(),
		"wednesday_dinner" : $('#weddncui').val(),
		"thursday_breakfast" : $('#thrbfcui').val(),
		"thursday_lunch" : $('#thrlncui').val(),
		"thursday_snack" : $('#thrsncui').val(),
		"thursday_dinner" : $('#thrdncui').val(),
		"friday_breakfast" : $('#fribfcui').val(),
		"friday_lunch" : $('#frilncui').val(),
		"friday_snack" : $('#frisncui').val(),
		"friday_dinner" : $('#fridncui').val(),
		"saturday_breakfast" : $('#satbfcui').val(),
		"saturday_lunch" : $('#satlncui').val(),
		"saturday_snack" : $('#satsncui').val(),
		"saturday_dinner" : $('#satdncui').val(),
		"sunday_breakfast" : $('#sunbfcui').val(),
		"sunday_lunch" : $('#sunlncui').val(),
		"sunday_snack" : $('#sunsncui').val(),
		"sunday_dinner" : $('#sundncui').val()
	};
	console.log(body);
	apigClient.preferencesPost(params, body)
	.then(function (result) {
	  $('#submitnote').removeAttr('hidden');
	  if (pageNum<5)
		setTimeout(function(){ window.location.href= 'calendar.html';}, 1500);
	  else
		setTimeout(function(){ window.location.href= 'preferences.html';}, 1500);
	  console.log(result);    
	}).catch(function (result) {
	  alert('Permission Denied')
	  console.log(result);
	  console.log("Something went wrong!");
	});
	return false;
}

function populateFields(getResponse) {
	//const url = 'https://mymacrochefs3.s3.amazonaws.com/Resources/Data/data.json';
	const url = 'https://mymacrochefhj.s3.amazonaws.com/Resources/Data/data.json';

	fetch(url)  
	  .then(  
		function(response) {  
		  if (response.status !== 200) {  
			console.warn('Looks like there was a problem. Status Code: ' + 
			  response.status);  
			return;  
		  }
		  // Examine the text in the response  
		  response.json().then(function(data) {  
			//let dropdowns = document.getElementsByClassName('selectpicker');
			let dropdowns = [];
			let dropdownbf = document.getElementById('monbfcui');
			$('#monbfcui, #monlncui, #monsncui, #mondncui').empty();
			dropdowns.push(dropdownbf);
			let dropdownln = document.getElementById('monlncui');
			dropdowns.push(dropdownln);
			let dropdownsn = document.getElementById('monsncui');
			dropdowns.push(dropdownsn);
			let dropdowndn = document.getElementById('mondncui');
			dropdowns.push(dropdowndn);
			
			let option;
			for (let i = 0; i < data.length; i++) {
				for (let j = 0; j < data[i].length; j++) {
				  option = document.createElement('option');
				  option.text = data[i][j][0]+' Cal:'+data[i][j][1];
				  option.setAttribute('data-tokens', data[i][j][0]);
				  //option.setAttribute('KCal', data[i][j][1]);
				  option.setAttribute('value', data[i][j][0]);
				  dropdowns[i].add(option);
				}
			}
			var $options;
			$options = $("#monbfcui > option").clone();
			$('#tuebfcui,#wedbfcui,#thrbfcui,#fribfcui,#satbfcui,#sunbfcui').append($options);
			$options = $("#monlncui > option").clone();
			$('#tuelncui,#wedlncui,#thrlncui,#frilncui,#satlncui,#sunlncui').append($options);
			$options = $("#monsncui > option").clone();
			$('#tuesncui,#wedsncui,#thrsncui,#frisncui,#satsncui,#sunsncui').append($options);
			$options = $("#mondncui > option").clone();
			$('#tuedncui,#weddncui,#thrdncui,#fridncui,#satdncui,#sundncui').append($options);
			data_received = getResponse;
			data = getResponse;
			userid = userid;
			pageNum = parseInt(data.page_num);
			if (pageNum<5)
				$('#redirect-bar').remove();
			if ("selection" in data && Object.keys(data.selection).length>0) {
				$('#monbfcui').val(data.selection.monday_breakfast);
				$('#monlncui').val(data.selection.monday_lunch);
				$('#monsncui').val(data.selection.monday_snack);
				$('#mondncui').val(data.selection.monday_dinner);
				$('#tuebfcui').val(data.selection.tuesday_breakfast);
				$('#tuelncui').val(data.selection.tuesday_lunch);
				$('#tuesncui').val(data.selection.tuesday_snack);
				$('#tuedncui').val(data.selection.tuesday_dinner);
				$('#wedbfcui').val(data.selection.wednesday_breakfast);
				$('#wedlncui').val(data.selection.wednesday_lunch);
				$('#wedsncui').val(data.selection.wednesday_snack);
				$('#weddncui').val(data.selection.wednesday_dinner);
				$('#thrbfcui').val(data.selection.thursday_breakfast);
				$('#thrlncui').val(data.selection.thursday_lunch);
				$('#thrsncui').val(data.selection.thursday_snack);
				$('#thrdncui').val(data.selection.thursday_dinner);
				$('#fribfcui').val(data.selection.friday_breakfast);
				$('#frilncui').val(data.selection.friday_lunch);
				$('#frisncui').val(data.selection.friday_snack);
				$('#fridncui').val(data.selection.friday_dinner);
				$('#satbfcui').val(data.selection.saturday_breakfast);
				$('#satlncui').val(data.selection.saturday_lunch);
				$('#satsncui').val(data.selection.saturday_snack);
				$('#satdncui').val(data.selection.saturday_dinner);
				$('#sunbfcui').val(data.selection.sunday_breakfast);
				$('#sunlncui').val(data.selection.sunday_lunch);
				$('#sunsncui').val(data.selection.sunday_snack);
				$('#sundncui').val(data.selection.sunday_dinner);
				$('.selectpicker').selectpicker('refresh');
				$('#loading').hide();
			} else {
				setRecommendation();
			}
		  });  
		}  
	  )  
	  .catch(function(err) {  
		console.error('Fetch Error -', err);  
	  });
}