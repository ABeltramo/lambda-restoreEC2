#!/bin/sh
# MysqlDump
DUMP=/tmp/mysqldump.sql
/usr/bin/docker exec -i CopiaIncollaDB mysqldump --all-databases -ubackup > $DUMP
DUMPTAR=/tmp/mysqldump.tgz
/bin/tar -zcf $DUMPTAR $DUMP > /dev/null
/mnt/DATA/s3cmd/s3cmd-1.6.1/s3cmd --config /mnt/DATA/s3cmd/s3cfg put $DUMPTAR s3://bkp-srv-ec2/mysql/
# Stop docker istance
# /usr/bin/docker kill CopiaIncollaDB
# Backup mysql folder
BACKUPFILE=/tmp/mysqlFolder.tgz
/bin/tar -zcvf $BACKUPFILE /mnt/DATA/mysql > /dev/null
/mnt/DATA/s3cmd/s3cmd-1.6.1/s3cmd --config /mnt/DATA/s3cmd/s3cfg put $BACKUPFILE s3://bkp-srv-ec2/mysql/
# Clean
rm $BACKUPFILE
rm $DUMPTAR
rm $DUMP
# Restart docker istance
# /usr/bin/docker restart CopiaIncollaDB
