#!/bin/bash

# WAIT FOR MOUNT EXTERNAL DATA
while [ ! -e /dev/xvdf ]; do 
	echo "waiting for DATA partition"
	sleep 10; 
done

# mount DATA
sudo mkdir /mnt/DATA
sudo mount /dev/xvdf /mnt/DATA/

# Installing Docker
sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get install -y linux-image-extra-$(uname -r) docker-engine
sudo service docker start

# Certs
/mnt/DATA/letsencrypt/letsencrypt-auto renew --quiet --no-self-upgrade
chown -R ubuntu /etc/letsencrypt/
chmod -R ugo+rw /etc/letsencrypt/

# Starting images
sudo /usr/bin/docker run --name CopiaIncollaDB -v /mnt/DATA/mysql/:/var/lib/mysql -d -p 3306:3306 --restart=always mysql/mysql-server:5.5 --lower_case_table_names=1
cd /mnt/DATA/ci-nodedb-api/ && sh runme.sh
sudo /usr/bin/docker run --name openVPNData -v /mnt/DATA/ovpn-data/:/etc/openvpn busybox
sudo /usr/bin/docker run --volumes-from openVPNData -d -p 1194:1194/udp --privileged --name openVPN kylemanna/openvpn

# BACKUP
sudo apt-get install -y python-dateutil
sudo curl https://raw.githubusercontent.com/Copia-Incolla/lambda-restoreEC2/master/backupMYSQL.sh -o /etc/cron.daily/backupMYSQL.sh
sudo chmod +x /etc/cron.daily/backupMYSQL.sh 
