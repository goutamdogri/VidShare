# notes folder [VidShare(github) - bigProject(local)]

1. image - image ko pahle server mai hi store karke rakhe taki agar connection lost ho jaye to image safe rahe uske baad cloud mai upload karke "cloudnary"/ "aws" pe store karke, url database pe save karne ke baad server se delete kar dena.
2. .gitkeep - yeh ak empty file hai. iss file ko empty folder ke andar banaya jata hai taki empty folder bhi git mai push ho pay. by default empty folder push nahi hota.
3. [gitignore genarator](https://mrkandreev.name/snippets/gitignore-generator/) - website hai jo environment, framework, library ke base pe yeh file genarate karte hai, jo jo file ideally rahna chahiye
4. IP adress 0.0.0.0/0 - matlab sara ip address allowed hai to get response from our server. it is dengerous for production don't do it.
5. must remove last '/' from mongodb url
6. monodb ka password mai special character problem karta hai issiliye only alphabet and number ka combination banana
7. \*\* Database se jab bhi bat karo to error ane ka possibility rahta hai isiliye "try-catch" mai nahi to "promises" ke sath use karna compulsory hai
8. \*\* database se baat karne mai time lagta hai. isiliye "async" and "await" lagana compulsory hai
9. dotenv - iss ko as early as possible import and configure ho jana chahiye humara application mai. taki jaldi se iska acces sab files ko mil jaye. isiliye isko main or first executed file mahi import and configure karwa diya jata hai.
10. dotenv ko as "import" import karneke liye "-r dotenv/config --experimental-json-modules" command line mai run karne time likhna padega. yeh bata raha hai experimental basis pe hum run kar rahe hai
11. ERROR - jabhi error handle kar rahe ho to log pe aisa custom message do taki jaldi se problem area pe pounch pao.
12. middleware - "kam karne se pahle mujhse milke jana". requst milna aur uss request ke basis pe response send karne ke liye operation / code execution start karne ke middle mai jo code or package use kara jata usko middleware bolte hai.
13. utility -
14. jsonwebtoken / jwt - yeh ak bearer token hai. jo bhi token bhejega usko hum daata bhej denge or access de denge
15. refresh token ka expiry time access token ka expiry time se jada hota hai generally
16. access token ko database mai store nahi karenge but refresh token ko karenge
17. token -
18. [cloudinary](https://cloudinary.com/) - we use this for file uploading in cloud
19. multer - file handeling - first get file from user and save in server temporarily. and then in next step upload this file in cloud.

## Steps

1. npm init
2. push in repository
3. .gitignore making
4. nodemon install as development dependecy- "npm i -D nodemon". dev dependency only development mai kaam ata hai production mai nahi jata
5. change in scripts - "dev": "nodemon src/index.js" - sothat nodemon can run index.js continuously whenever file change
6. code formatting (prettier) - production mai agar sabka formatting same nahi hoga to github me itna cinflicts hoga jiska koi had nahi hai. isiliye project develop start karne se pahle sabka code formatting configuration same hona chahiye. har project mai prettier ko configure karna jaroori hai. use prettier as dev dependency.
7. install prettier as dev dependency - "npm i -D prettier". ".prettierrc" - make this file in root. this is a configuration file for prettier. Configure formatting as per your choice. ".prettierignore" - make this file in root. file that prettier must ignore for formatting.
8. Configure mongodb atlas
9. port and mongodb url add in .env and .env.sample file
10. mongoose express dotenv install
11. connect with mongodb database in "src/db/index.js"
12. "dotenv" import and configure.
13. set server at src/app.js and listen code at src/index.js
14. cookie-parser cors - npm install
15. configuration - in src/app.js cors, cookie-parser, json, url data handeling configuration, static folder config.
16. utilities making - for apierror, apiresponse, asyncHandler
17. model making - for user and video
18. mongoose-aggregate-paginate-v2 - package to unleash real power of mongodb aggregation pipeline
19. bcrypt / bcrypt.js - package to help hash password
20. jsonwebtoken - based on cryptography algorithm package to protect secret data
21. token making code written in model.
22. clodinary, multer config and file upload setup
23. registering user - register route and its controller making.
