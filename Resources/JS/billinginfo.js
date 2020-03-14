var userid;
var apigClient;
var pageNum;
var start_date;
var changeFlag = 0;
$('document').ready(function () {
	if (window.localStorage.getItem('access-token')==null || window.localStorage.getItem('access-token')=='null')
		window.location = "signout.html";
    apigClient = apigClientFactory.newClient({
        accessKey: 'accessKey',
        secretKey: 'secretKey',
      });
    var body = {
        key : "Hello"
    };
    userid = window.localStorage.getItem('userid');
    var params = {username : userid, user_id : userid};
    var additionalParams = {headers: {
      'Content-Type':"application/json"
    }};
    apigClient.paymentGet(params, body)
        .then(function (result) {
          console.log(result);
		  populateFields(result.data);
        }).catch(function (result) {
          alert('Permission Denied')
          console.log(result);
          console.log("Something went wrong!");
        });  
	//Plan
	var value = $( '#planselect').val();
	var bill="";
	var msg="";
	var price="";
	if(value=="monthly_plan") {
		msg = "Saving $250 a month";
		price = "$800"+"/month + tax".sub();
		bill = "$"+(800+(800*10/100));
	} else if(value=="weekly_plan") {
		msg = "Saving $45 a week";
		price = "$200"+"/week + tax".sub();
		bill = "$"+(200+(200*10/100));
	} else {
		msg = "Must try, you won't regret it!";
		price = "$35"+"/day + tax".sub();
		bill = "$"+(35+(35*10/100));
	}
	if (document.getElementById("plan-msg")) {
		document.getElementById("plan-msg").innerHTML = msg;
		document.getElementById("plan-price").innerHTML = price;
		document.getElementById("total-bill").innerHTML = bill;
	}
	$('#planselect').on('change', function() {
		var msg = "";
		var price="";
		var bill="";
		if(this.value=="monthly_plan") {
			msg = "Saving $250 a month";
			price = "$800"+"/month + tax".sub();
			bill = "$"+(800+(800*10/100));
		} else if(this.value=="weekly_plan") {
			msg = "Saving $45 a week";
			price = "$200"+"/week + tax".sub();
			bill = "$"+(200+(200*10/100));
		} else {
			msg = "Must try, you won't regret it!";
			price = "$35"+"/day + tax".sub();
			bill = "$"+(35+(35*10/100));
		}
		document.getElementById("plan-msg").innerHTML = msg;
		document.getElementById("plan-price").innerHTML = price;
		document.getElementById("total-bill").innerHTML = bill;
		setEndDate();
	});
  });

function setEndDate() {
	var selectedDate = $("#startdate").val();
	if (selectedDate != '') {
		var startdate = new Date(selectedDate);
		var enddate = new Date(); 
		var plan = $( '#planselect').val();
		if(plan=="monthly_plan") {
			enddate.setDate(startdate.getDate() + 29);
		} else if(plan=="weekly_plan") {
			enddate.setDate(startdate.getDate() + 6);
		} else {
			enddate.setDate(startdate.getDate());
		}
		var dd = enddate.getDate();
		var mm = enddate.getMonth() + 1; //January is 0!

		var yyyy = enddate.getFullYear();
		if (dd < 10) {
		  dd = '0' + dd;
		} 
		if (mm < 10) {
		  mm = '0' + mm;
		} 
		var enddate = mm + '/' + dd + '/' + yyyy;
		$("#enddate").val(enddate);
	}
}

$('creditCardEntry1').on('change', function() {
	changeFlag = 1;
});

function populateFields(data) {
	userid = userid;
	pageNum = parseInt(data.page_num);
	if (pageNum<5)
		$('#redirect-bar').remove();
	var temp = new Date(data.start_date_calendar);
	start_date = (temp.getMonth()+1) + '/' + (temp.getDate()+1) + '/' + temp.getFullYear();
	//data = {};
	if (Object.keys(data).length>2) {
		start_date = new Date(data.start_date);
		$('#planselect').val(data.plan);
		$("#planselect").prop("disabled", true);
		$("#startdate").val(data.start_date);
		$("#enddate").val(data.end_date);
		$("#name-card").val(data.name);
		$("#creditCardEntry1").val(data.card_entry_1);
		$("#creditCardEntry2").val(data.card_entry_2);
		$("#creditCardEntry3").val(data.card_entry_3);
		$("#creditCardEntry4").val(data.card_entry_4);
		$('#exp_mon').val(data.expiry_date_month);
		$('#exp_year').val(data.expiry_date_year);
		$('#cvv').val(data.cvv);
		$('#country').val(data.country);
		$('.selectpicker').selectpicker('refresh');
		$('#zip').val(data.zipcode);
		$('#total-bill').val(data.bill);
		$('.submit-button').val('Update!');
	} else {
		/*$('#startdate, #enddate').datepicker({
			format: 'mm/dd/yyyy',
			startDate: start_date,
			todayHighlight: true,
			autoclose: true
		});*/
		changeFlag = 1;
		$("#startdate").val(start_date);
		setEndDate();
	}
	$('#loading').hide();
}

function update() {
	$('#loading').show();
	var params = {username : userid, user_id : userid};
	var body = {
		"user_id" : userid,
		"page_num" : pageNum,
		"change_flag" : changeFlag,
		"plan" : $('#planselect').val(),
		"start_date" : $("#startdate").val(),
		"end_date" : $("#enddate").val(),
		"name" : $("#name-card").val(),
		"card_number" : $("#creditCardEntry1").val()+$("#creditCardEntry2").val()+$("#creditCardEntry3").val()+$("#creditCardEntry4").val(),
		"expiry_date_month" : $('#exp_mon').val(),
		"expiry_date_year" : $('#exp_year').val(),
		"cvv" : $('#cvv').val(),
		"country" : $('#country').val(),
		"zipcode" : $('#zip').val(),
		"bill" : $('#total-bill').text().split('$')[1]
	};
	console.log(body);
	apigClient.paymentPost(params, body)
	.then(function (result) {
	  $('#submitnote').removeAttr('hidden');
	  setTimeout(function(){ window.location.href= 'profile.html';}, 1500);
	  console.log(result);    
	}).catch(function (result) {
	  alert('Permission Denied')
	  console.log(result);
	  console.log("Something went wrong!");
	});
	return false;
}