# notes folder [VidShare(github) - bigProject(local)]

1. image - image ko pahle server mai hi store karke rakhe taki agar connection lost ho jaye to image safe rahe uske baad cloud mai upload karke "cloudnary"/ "aws" pe store karke, url database pe save karne ke baad server se delete kar dena.
2. .gitkeep - yeh ak empty file hai. iss file ko empty folder ke andar banaya jata hai taki empty folder bhi git mai push ho pay. by default empty folder push nahi hota.
3. [gitignore genarator](https://mrkandreev.name/snippets/gitignore-generator/) - website hai jo environment, framework, library ke base pe yeh file genarate karte hai, jo jo file ideally rahna chahiye

## Steps

1. npm init
2. push in repository
3. .gitignore making
4. nodemon install as development dependecy- "npm i -D nodemon". dev dependency only development mai kaam ata hai production mai nahi jata
5. change in scripts - "dev": "nodemon src/index.js" - sothat nodemon can run index.js continuously whenever file change
6. code formatting (prettier) - production mai agar sabka formatting same nahi hoga to github me itna cinflicts hoga jiska koi had nahi hai. isiliye project develop start karne se pahle sabka code formatting configuration same hona chahiye. har project mai prettier ko configure karna jaroori hai. use prettier as dev dependency.
7. install prettier as dev dependency - "npm i -D prettier". ".prettierrc" - make this file in root. this is a configuration file for prettier. Configure formatting as per your choice. ".prettierignore" - make this file in root. file that prettier must ignore for formatting.
