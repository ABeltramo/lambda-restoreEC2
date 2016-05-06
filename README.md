# lambda-restoreEC2
Simple lambda function for disaster recovery  
You can use this script as a bootstrap to deploy your solution to AWS.  

**script.js**  
Using the AWS API will do the following step:  
1. Start a new instance on Amazon passing the startup script userdata.sh  
2. detach the DATA volume from the old instance (if any is using it)  
3. attach the DATA volume to the new instance  
4. update the ROUTE53 to the server  
  
**userdata.sh**  
Will be executed only on instance creation.  
The first step is to wait till the DATA volume is attached. In my instance the DATA volume is the one that contain persisting data like MYSQL table, configuration file, ...  
In the case the IP is changed (or simple to avoid the expiration) the script will renew the Letsencrypt cert for the domain.  
After that the docker instances will be fired up and the system is ready.

License
-------
	The MIT License (MIT)

	Copyright (c) 2016 Alessandro Beltramo

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
