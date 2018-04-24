# Header Recorder

## What it does ##

* It is used to record the header information of specific http request for subsequent functions, eg: crawl some information which you can see only after login from websites. 

## What it includes ##

The extension includes:

* a browser action with a popup including HTML, CSS, and JS
* a background.js

## What it shows ##

* It contains two sections
* The Extension Section:
* Its function is collecting header information based on the config from server and sent the header information to server.
 


* The Server Section:
* It can control the extension to tell it should grab the header information from which url and record the header information from specific url. Now it contains two interfaces:


* config interface (GET) 
* return information like this
{
  	"admin": {
  		"name": "Tom",
  		"mobile": "17887698460"
  	},
  	"urls": ["https://www.toutiao.com/", "http://www.wechat.com/"]
}


* authInfo interface (POST) 
* accept the header information
