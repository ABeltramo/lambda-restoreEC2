var AWS = require('aws-sdk');
AWS.config.region = 'eu-central-1';

var ec2 = new AWS.EC2();


// 1- Read userData file
var fs = require('fs');
var bitmap = fs.readFileSync('userdata.sh');
var userData = new Buffer(bitmap).toString('base64');

var params = {
  ImageId: 'ami-60d7350f', // Docker + MYSQL
  InstanceType: 't2.micro',
  MinCount: 1, MaxCount: 1,
  SecurityGroups: ["SSH+Mysql"],
  KeyName:"EC2-Server",
	UserData:userData
};

var dataVolumeID = "vol-d178e56b"; // The ID of the DATA EBS volume

// Create the instance
ec2.runInstances(params, function(err, data) {
  if (err) { console.log("Could not create instance", err); return; }

  var instanceId = data.Instances[0].InstanceId;
  console.log("Created instance", instanceId);
	
	ec2.waitFor('instanceRunning', {InstanceIds:[instanceId]}, function(err, data) {
		console.log("Instance is running.");		
		// get EBS state
		ec2.describeVolumes({VolumeIds:[dataVolumeID]},function(err,data){
			var volumeState = data.Volumes[0].State
			console.log("DATA volume is in " + volumeState + " state");
			if (volumeState == "in-use")
				detachVolume(instanceId);
			else
				attachVolume(instanceId);
		});
	}); // End wait for instanceRunning

	//Update ROUTE53 entry to new server
	
}); 

function detachVolume(instanceId){
	ec2.detachVolume({
			VolumeId: dataVolumeID,
			Force: true
		}, function(err, data) {
	if (err) console.log(err, err.stack); // an error occurred
	else // Attach EBS to NEW istance
		attachVolume(instanceId);
	});
}

function attachVolume(instanceId){
	ec2.waitFor("volumeAvailable", {VolumeIds:[dataVolumeID]}, function(err,data) {
			ec2.attachVolume({
					Device: '/dev/xvdf', 
					InstanceId: instanceId, 
					VolumeId: dataVolumeID,
				}, function(err, data) {
				if (err) console.log(err, err.stack); // an error occurred
				else     console.log("DATA volume attached succesfully");
			});
	}); //End wait for volumeAvailable
}
