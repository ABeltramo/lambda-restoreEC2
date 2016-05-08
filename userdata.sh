#!/bin/bash
while [ ! -e /dev/xvdf ]; do 
	echo "waiting for DATA partition"
	sleep 10; 
done
sleep 5; # Wait for mount
# Refresh the letsencrypt cert
/mnt/DATA/letsencrypt/letsencrypt-auto certonly --email beltramo.ale@gmail.com --standalone -d john.copiaincollafranchising.it
chown -R ubuntu /etc/letsencrypt/
chmod -R ugo+rw /etc/letsencrypt/
# Start docker containers
/usr/bin/docker run --name CopiaIncollaDB -v /mnt/DATA/mysql/:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=[*INSERT YOU PASSWORD HERE*] -d -p 3306:3306 --restart=always mysql/mysql-server:5.5 --lower_case_table_names=1
cd /mnt/DATA/ci-nodedb-api/ && sh runme.sh
cd /mnt/DATA/imap/ && /usr/local/bin/docker-compose up -d mail
# OpenVPN
sudo docker run --name openVPNData -v /mnt/DATA/ovpn-data/:/etc/openvpn busybox
sudo docker run --volumes-from openVPNData -d -p 1194:1194/udp --privileged --name openVPN kylemanna/openvpn
# Fix permission for Backup file
sudo chmod +x /etc/cron.daily/backupMYSQL.sh
