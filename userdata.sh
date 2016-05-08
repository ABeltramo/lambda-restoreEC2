#!/bin/bash
while [ ! -e /dev/xvdf ]; do 
	echo "waiting for DATA partition"
	sleep 10; 
done
sleep 5; # Wait for mount
echo "Refresh the letsencrypt cert"
sudo rm -r /etc/letsencrypt/archive/*
sudo rm -r /etc/letsencrypt/live/*
sudo rm /etc/letsencrypt/renewal/*
/mnt/DATA/letsencrypt/letsencrypt-auto certonly --email beltramo.ale@gmail.com --standalone -d john.copiaincollafranchising.it
chown -R ubuntu /etc/letsencrypt/
chmod -R ugo+rw /etc/letsencrypt/
echo "Start MYSQL"
/usr/bin/docker run --name CopiaIncollaDB -v /mnt/DATA/mysql/:/var/lib/mysql -d -p 3306:3306 --restart=always mysql/mysql-server:5.5 --lower_case_table_names=1
echo "Start CI-NODEDB-API"
cd /mnt/DATA/ci-nodedb-api/ && sh runme.sh
echo "Start OpenVPN"
sudo docker run --name openVPNData -v /mnt/DATA/ovpn-data/:/etc/openvpn busybox
sudo docker run --volumes-from openVPNData -d -p 1194:1194/udp --privileged --name openVPN kylemanna/openvpn
