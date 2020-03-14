var userid;
var apigClient;
var pageNum;
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
    apigClient.addressGet(params, body)
        .then(function (result) {
          console.log(result);
		  populateFields(result.data);
        }).catch(function (result) {
          alert('Permission Denied')
          console.log(result);
          console.log("Something went wrong!");
        });  
	$( '#bfaddress-line1').change(function() {
		document.getElementById("lnaddress-line1").value = document.getElementById("bfaddress-line1").value;
		document.getElementById("snaddress-line1").value = document.getElementById("bfaddress-line1").value;
		document.getElementById("dnaddress-line1").value = document.getElementById("bfaddress-line1").value;
	});
	$( '#bfaddress-line2').change(function() {
		document.getElementById("lnaddress-line2").value = document.getElementById("bfaddress-line2").value;
		document.getElementById("snaddress-line2").value = document.getElementById("bfaddress-line2").value;
		document.getElementById("dnaddress-line2").value = document.getElementById("bfaddress-line2").value;
	});
	$( '#bfcity').change(function() {
		document.getElementById("lncity").value = document.getElementById("bfcity").value;
		document.getElementById("sncity").value = document.getElementById("bfcity").value;
		document.getElementById("dncity").value = document.getElementById("bfcity").value;
	});
	$( '#bfregion').change(function() {
		document.getElementById("lnregion").value = document.getElementById("bfregion").value;
		document.getElementById("snregion").value = document.getElementById("bfregion").value;
		document.getElementById("dnregion").value = document.getElementById("bfregion").value;
	});
	$( '#bfpostal-code').change(function() {
		document.getElementById("lnpostal-code").value = document.getElementById("bfpostal-code").value;
		document.getElementById("snpostal-code").value = document.getElementById("bfpostal-code").value;
		document.getElementById("dnpostal-code").value = document.getElementById("bfpostal-code").value;
	});
	$( '#bfcountry').change(function() {
		$("#lncountry,#sncountry,#dncountry").val(this.value);
		$('.selectpicker').selectpicker('refresh');
	});
  });

function populateFields(data) {
	userid = userid;
	pageNum = parseInt(data.page_num);
	if (pageNum<5)
		$('#redirect-bar').remove();
	if (Object.keys(data).length>2) {
		$('#bfaddress-line1').val(data.breakfast_address1);
		$('#bfaddress-line2').val(data.breakfast_address2);
		$('#bfcity').val(data.breakfast_city);
		$('#bfcountry').val(data.breakfast_country);
		$('#bfregion').val(data.breakfast_state);
		$('#bfpostal-code').val(data.breakfast_zip);
		$('#dnaddress-line1').val(data.dinner_address1);
		$('#dnaddress-line2').val(data.dinner_address2);
		$('#dncity').val(data.dinner_city);
		$('#dncountry').val(data.dinner_country);
		$('#dnregion').val(data.dinner_state);
		$('#dnpostal-code').val(data.dinner_zip);
		$('#lnaddress-line1').val(data.lunch_address1);
		$('#lnaddress-line2').val(data.lunch_address2);
		$('#lncity').val(data.lunch_city);
		$('#lncountry').val(data.lunch_country);
		$('#lnregion').val(data.lunch_state);
		$('#lnpostal-code').val(data.lunch_zip);
		$('#snaddress-line1').val(data.snack_address1);
		$('#snaddress-line2').val(data.snack_address2);
		$('#sncity').val(data.snack_city);
		$('#sncountry').val(data.snack_country);
		$('#snregion').val(data.snack_state);
		$('#snpostal-code').val(data.snack_zip);
		$('.selectpicker').selectpicker('refresh');
	}
	$('#loading').hide();
}

function update() {
	$('#loading').show();
	var params = {username : userid, user_id : userid};
	var body = {
		"user_id" : userid,
		"page_num" : pageNum,
		"breakfast_address1" : $('#bfaddress-line1').val(),
		"breakfast_address2" : $('#bfaddress-line2').val(),
		"breakfast_city" : $('#bfcity').val(),
		"breakfast_country" : $('#bfcountry').val(),
		"breakfast_state" : $('#bfregion').val(),
		"breakfast_zip" : $('#bfpostal-code').val(),
		"dinner_address1" : $('#dnaddress-line1').val(),
		"dinner_address2" : $('#dnaddress-line2').val(),
		"dinner_city" : $('#dncity').val(),
		"dinner_country" : $('#dncountry').val(),
		"dinner_state" : $('#dnregion').val(),
		"dinner_zip" : $('#dnpostal-code').val(),
		"lunch_address1" : $('#lnaddress-line1').val(),
		"lunch_address2" : $('#lnaddress-line2').val(),
		"lunch_city" : $('#lncity').val(),
		"lunch_country" : $('#lncountry').val(),
		"lunch_state" : $('#lnregion').val(),
		"lunch_zip" : $('#lnpostal-code').val(),
		"snack_address1" : $('#snaddress-line1').val(),
		"snack_address2" : $('#snaddress-line2').val(),
		"snack_city" : $('#sncity').val(),
		"snack_country" : $('#sncountry').val(),
		"snack_state" : $('#snregion').val(),
		"snack_zip" : $('#snpostal-code').val()
	};
	console.log(body);
	apigClient.addressPost(params, body)
	.then(function (result) {
	  $('#submitnote').removeAttr('hidden');
	  if (pageNum<5)
		setTimeout(function(){ window.location.href= 'billinginfo.html';}, 1500);
	  else
		setTimeout(function(){ window.location.href= 'addressbook.html';}, 1500);
	  console.log(result);    
	}).catch(function (result) {
	  alert('Permission Denied')
	  console.log(result);
	  console.log("Something went wrong!");
	});
	return false;
}