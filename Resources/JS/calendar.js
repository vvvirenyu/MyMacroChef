var userid;
var apigClient;
var pageNum;
var final_dict={};

Date.prototype.toIsoString = function() {
    var tzo = -this.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}

document.addEventListener('DOMContentLoaded', function() {
	if (window.localStorage.getItem('access-token')==null || window.localStorage.getItem('access-token')=='null')
		window.location = "signout.html";
	apigClient = apigClientFactory.newClient({
        accessKey: 'accessKey',
        secretKey: 'secretKey',
      });
    var body = {
        username : userid
    };
	userid = window.localStorage.getItem('userid');
	console.log('printing user id');
	console.log(userid);
     var params = {username : userid, user_id: userid};
      var additionalParams = {headers: {
      'Content-Type':"application/json"
    }};
	var event_arr;
	apigClient.calendarGet(params, body)
        .then(function (result) {
			console.log(result);
			//data = {user_id:'f14db0e21dd06e32f8ce24ff67a8b7a4',page_num:2};
			var data = result.data;
			userid = userid;
			final_dict['user_id']=userid;
			pageNum = parseInt(data.page_num);
			if (pageNum<5)
				$('#redirect-bar').remove();
			final_dict['page_num']=pageNum;
			console.log(pageNum);
			delete data.page_num;
			var event_arr = [];
			var days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
			if (Object.keys(data).length>0) {
				var first = true;
				Object.keys(data).forEach(function(key) {
					if (first) {
						event_arr.push(data.first_date);
						final_dict['first_date']=data.first_date;
						event_arr.push(data.last_date);
						final_dict['last_date']=data.last_date;
						first = false;
					}
					var date = new Date(data[key]);
					final_dict[key]=data[key];
					end1 = new Date(date);
					var start1 = new Date(date);
					if (key.split("_")[1]=='breakfast') {
						end1.setHours(date.getHours()+1);
						event_arr.push({title:'Breakfast',id:key,start:data[key],end:end1.toIsoString(),constraint:'breakfasttime'});
						start1.setHours(7);
						end1.setHours(10);
						event_arr.push({groupId:'breakfasttime',start:start1.toIsoString(),end:end1.toIsoString(),rendering:'background'});
					} else if (key.split("_")[1]=='lunch') {
						end1.setHours(date.getHours()+1);
						event_arr.push({title:'Lunch',id:key,start:data[key],end:end1.toIsoString(),constraint:'lunchtime'});
						start1.setHours(12);
						end1.setHours(15);
						event_arr.push({groupId:'lunchtime',start:start1.toIsoString(),end:end1.toIsoString(),rendering:'background'});
					} else if (key.split("_")[1]=='snack') {
						end1.setHours(date.getHours()+1);
						event_arr.push({title:'Snack',id:key,start:data[key],end:end1.toIsoString(),constraint:'snacktime'});
						start1.setHours(16);
						end1.setHours(18);
						event_arr.push({groupId:'snacktime',start:start1.toIsoString(),end:end1.toIsoString(),rendering:'background'});
					} else if (key.split("_")[1]=='dinner') {
						end1.setHours(date.getHours()+1);
						event_arr.push({title:'Dinner',id:key,start:data[key],end:end1.toIsoString(),constraint:'dinnertime'});
						start1.setHours(19);
						end1.setHours(22);
						event_arr.push({groupId:'dinnertime',start:start1.toIsoString(),end:end1.toIsoString(),rendering:'background'});
					}
				});
			} else {
				var date = new Date();
				var first_date = new Date();
				first_date.setDate(date.getDate()+1);
				var first = first_date.getDay(); 
				var count = 0;
				var done = 0;
				while (done<7) {
					date.setDate(date.getDate()+1);
					count = first % 7;
					if (done==0) {
						event_arr.push(date.toIsoString().split('T')[0]);
						final_dict['first_date']=date.toIsoString().split('T')[0];
						var temp = new Date();
						temp.setDate(date.getDate()+7);
						event_arr.push(temp.toIsoString().split('T')[0]);
						final_dict['last_date']=temp.toIsoString().split('T')[0];
					}
					date.setHours(7);
					date.setMinutes(0);
					date.setSeconds(0);
					end1 = new Date(date);
					end1.setHours(8);
					final_dict[days[count]+'_breakfast']=date.toIsoString();
					event_arr.push({title:'Breakfast',id:days[count]+'_breakfast',start:date.toIsoString(),end:end1.toIsoString(),constraint:'breakfasttime'});
					end1.setHours(10);
					event_arr.push({groupId:'breakfasttime',start:date.toIsoString(),end:end1.toIsoString(),rendering:'background'});
					date.setHours(12);
					end1.setHours(13);
					final_dict[days[count]+'_lunch']=date.toIsoString();
					event_arr.push({title:'Lunch',id:days[count]+'_lunch',start:date.toIsoString(),end:end1.toIsoString(),constraint:'lunchtime'});
					end1.setHours(15);
					event_arr.push({groupId:'lunchtime',start:date.toIsoString(),end:end1.toIsoString(),rendering:'background'});
					date.setHours(16);
					end1.setHours(17);
					final_dict[days[count]+'_snack']=date.toIsoString();
					event_arr.push({title:'Snack',id:days[count]+'_snack',start:date.toIsoString(),end:end1.toIsoString(),constraint:'snacktime'});
					end1.setHours(18);
					event_arr.push({groupId:'snacktime',start:date.toIsoString(),end:end1.toIsoString(),rendering:'background'});
					date.setHours(19);
					end1.setHours(20);
					final_dict[days[count]+'_dinner']=date.toIsoString();
					event_arr.push({title:'Dinner',id:days[count]+'_dinner',start:date.toIsoString(),end:end1.toIsoString(),constraint:'dinnertime'});
					end1.setHours(22);
					event_arr.push({groupId:'dinnertime',start:date.toIsoString(),end:end1.toIsoString(),rendering:'background'});
					first+=1;
					done+=1;
				}
			}
			console.log(event_arr);
			var calendarEl = document.getElementById('calendar');
			var calendar = new FullCalendar.Calendar(calendarEl, {
				plugins: [ 'interaction', 'dayGrid', 'timeGrid' ],
				editable: true,
				defaultView: 'timeGridWeek',
				validRange: {
					start: event_arr.shift(),
					end: event_arr.shift()
				},
				header: {
				  left: 'prev,next today',
				  center: 'title',
				  right: 'dayGridMonth,timeGridWeek,timeGridDay'
				},
				events: event_arr,
				eventDrop: function( event ) { 
					if((event.event.start.getDate() != event.oldEvent.start.getDate()) || (event.event.start.getMonth() != event.oldEvent.start.getMonth())) {
						event.revert();             
					} else {
						console.log(event.event.id+","+event.event.start.toIsoString());
						final_dict[event.event.id]=event.event.start.toIsoString();
					}      
				}
			  });
			calendar.render();
			$('#loading').hide();

        }).catch(function (result) {
          alert('Permission Denied')
          console.log(result);
          console.log("Something went wrong!");
		});
  });

function update() {
	$('#loading').show();
	var params = {username : userid};
	var body = final_dict;
	console.log(body);
	apigClient.calendarPost(params, body)
	.then(function (result) {
	  $('#submitnote').removeAttr('hidden');
	  if (pageNum<5)
		setTimeout(function(){ window.location.href= 'addressbook.html';}, 1500);
	  else
		setTimeout(function(){ window.location.href= 'calendar.html';}, 1500);
	  console.log(result);    
	}).catch(function (result) {
	  alert('Permission Denied')
	  console.log(result);
	  console.log("Something went wrong!");
	});
	return false;
}