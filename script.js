var AWS = require('aws-sdk');
AWS.config.region = 'eu-central-1';

var ec2 = new AWS.EC2();

var params = {
  ImageId: 'ami-60d7350f', // Ubuntu 14.04 + Docker + MYSQL
  InstanceType: 't2.micro',
  MinCount: 1, MaxCount: 1,
  SecurityGroups: ["SSH+Mysql"],
  KeyName:"EC2-Server"
};

// Create the instance
ec2.runInstances(params, function(err, data) {
  if (err) { console.log("Could not create instance", err); return; }

  var instanceId = data.Instances[0].InstanceId;
  console.log("Created instance", instanceId);
	
	//Detach EBS from OLD istance
	ec2.detachVolume({VolumeId: 'vol-d178e56b'}, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else{ // Attach EBS to NEW istance
			var params = {
				Device: '/dev/xvdf', 
				InstanceId: instanceId, 
				VolumeId: 'vol-d178e56b',
			};
			ec2.attachVolume(params, function(err, data) {
				if (err) console.log(err, err.stack); // an error occurred
				else     console.log("Success attach EBS DATA");
			});
		}
	});
});
