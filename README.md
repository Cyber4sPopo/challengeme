## Challengeme


- fork this repo and clone
- cd server && npm i
- cd ../client && npm i
- create new db for development - default name is `challenge` (can change by .env file)
- run migration: `npm run migrate` (in server folder)
- run seeds `npx sequelize db:seed:all`
- change ENV_NAME in .env file

Only once - init
- enable Github actions in your forked repo - go to https://github.com/{owner}/{repoName}/actions and press "I understand my workflows, go ahead and enable them"
- Github have a lot of issues when it comes to actions and forked repo so you need to add any change for all the files under `.github/workflows` add enter in the end of the file will be good enough or change the name for all the folder commit it and then change it back - in this step we just need Github to be aware for those actions 🥵
- create .env file from example and fill the params (repo name / access token)
- you should [create access token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token) from github user who have admin permission on the forked repo - probably be the team leader




