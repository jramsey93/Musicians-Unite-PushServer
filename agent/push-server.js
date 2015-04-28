var  agent = require('./_header')
    , Firebase = require('firebase');

var JACKS_PHONE = "2ccc6a7d433a4efe637224ea8683abb788c3b52bf8d0a78221b8d093cc16dfa4"

var ref = new Firebase("https://blazing-heat-4549.firebaseio.com");
var usersRef = ref.child('users');
var groupsRef = ref.child('groups');
var messagesRef = ref.child('messages');
var threadsRef = ref.child('message_threads');
var recordingsRef = ref.child('recordings');
var tasksRef = ref.child('tasks');
var devicesRef = ref.child('devices');

var msgCount = 0;
var senderCount = 0;


messagesRef.on("child_added", newMessage);
tasksRef.on("child_added", newTask);
recordingsRef.on("child_added", newRecording);


function newRecording(recording) {
	if (recording.child('group').val() != null) {
		var groupRef = groupsRef.child(recording.child('group').val());
		groupRef.once('value', function(group) {
			var groupName = group.child('name').val();
			var recordingName = recording.child('name').val();
			var msgBody = 'New Recording for ' + groupName + ': ' + recordingName;
			group.child('members').forEach( function(recipient) {
				sendPushNotification(msgBody, recipient.key());
			});
		})
	}
}

function newTask(task) {
	if (task.child('group').val() != null) {
		var groupRef = groupsRef.child(task.child('group').val());
		groupRef.once('value', function(group) {
			var groupName = group.child('name').val();
			var taskTitle = task.child('title').val();
			var msgBody = "New Task for " + groupName + ": " + taskTitle;
			group.child('members').forEach( function(recipient) {
				sendPushNotification(msgBody, recipient.key());
			});
		});
	}
}

function newMessage(message) {
	var senderRef = usersRef.child(message.child('sender').val());
	var threadRef = threadsRef.child(message.child('thread').val() + '/members');
	senderRef.once('value', function(sender) {
		var senderName = sender.child('first_name').val() + " " + sender.child('last_name').val();
		var text = message.child('text').val();
		var msgBody = senderName + ': ' + text;
		threadRef.on('child_added', function(recipient) {
			if (recipient.key() != message.child('sender').val()) sendPushNotification(msgBody, recipient.key());
		});
	});
}


//The function that actually sends the push notification to a user.
function sendPushNotification(body, recipientKey) {
	usersRef.child(recipientKey + '/devices').once('value', function(recipientDevices) {
		if (recipientDevices.val() != null) {
			recipientDevices.forEach( function(recipientDevice) {
				deviceRef = devicesRef.child(recipientDevice.key());
				deviceRef.once("value", function(device) {
					var deviceToken = device.child('device_token').val();
					var deviceType = device.child('device_type').val();
					if (deviceType == 'iOS') {
						//console.log("Message: " + body + "\nRecipient: " + deviceType + " " + deviceToken + "\n");
						agent.createMessage()
							.device(deviceToken)
							.alert(body)
							.sound('alert-sound.wav')
							.send();
					} else if (deviceType == 'Android') {

					}
				});
			});
		}
	});
}