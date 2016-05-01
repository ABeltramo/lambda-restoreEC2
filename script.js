var AWS = require('aws-sdk');
AWS.config.region = 'eu-central-1';

var ec2 = new AWS.EC2();
var route53 = new AWS.Route53();


// 1- Read userData file
var fs = require('fs');
var bitmap = fs.readFileSync('userdata.sh');
var userData = new Buffer(bitmap).toString('base64');

var params = {
  ImageId: 'ami-b8de3cd7', // Docker + MYSQL
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
  console.log("Created instance " + instanceId);
	
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

		//Update ROUTE53 entry to new server
		//1- Get public DNS
		ec2.describeInstances({InstanceIds:[instanceId]},function(err,data){
			var instanceDNS = data.Reservations[0].Instances[0].PublicDnsName
			//2- Update
			var params = {
				ChangeBatch: {
					Changes: [{
						  Action: 'UPSERT', // IF not present insert else update
						  ResourceRecordSet: {
						    Name: 'server.abeltra.me.', 
						    Type: 'CNAME',
						    ResourceRecords: [{
						        Value: instanceDNS //The new ip of the instance
						    }],
						    TTL: 60,
						  }
						}]
				},
				HostedZoneId: 'Z79DT7EWNW7FT'
			};
			route53.changeResourceRecordSets(params, function(err, data) {
				if (err) console.log(err, err.stack); // an error occurred
				else     console.log("Updated ROUTE53 server.abeltra.me with ",instanceDNS);           
			});
		});
	}); // End wait for instanceRunning
}); 


/*
 * HELPER FUNCTIONS 
 */
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
