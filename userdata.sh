#!/bin/bash

# WAIT FOR MOUNT EXTERNAL DATA
while [ ! -e /dev/xvdf ]; do 
	echo "waiting for DATA partition"
	sleep 10; 
done

# mount DATA
sudo mkdir /mnt/DATA
sudo mount /dev/xvdf /mnt/DATA/

# Start actual recovery
( exec "/mnt/DATA/scripts/recoveryInstall.sh" )
