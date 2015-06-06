# Docker micro service, template project

## Install and start

```
git clone https://github.com/data-avail/docker-bee-tmpl.git
npm install
tsc -p src 
```  

+ Define enviroment variables (examp tmpl.env file)
+ Test start `npm start` 

## Docker 

+ Build container `docker build -t baio/docker-bee-tmpl .`
+ Start container `docker run --env-file="xxx" baio/docker-bee-tmpl`