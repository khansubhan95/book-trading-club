#Book Trading Club

A web application for users to help borrow books. When a user posts a book, other users can send a request to borrow that book. The owner of the book can then decide whether to accept or reject the borrow request. Libraries and APIs used include PassportJS (for user authentication), Google Books API (for getting book details).

##Getting Started

###Prerequisites

1. [node](https://nodejs.org/en/)
2. [npm](https://www.npmjs.com)
3. [mongodb](https://www.mongodb.com/)

###Installation
Clone the project

```git
git clone https://github.com/khansubhan95/chart-stock.git
```

run

```
npm install
```

to install the dependencies

###Development
Rename .env.template to .env

Sign up on Google Books API and insert into .env the generated API key

The project uses MongoDB to store data so make sure you have it installed. Use the MONGO_URI to access a DB from the app.

##Deployment
This application was deployed on gomix. To deploy, create a GitHub repository, push the project to the repo. Create a new gomix application, and import the repo into it by going to project_name > Advanced Options > Import from GitHub . Do this process everytime, you change your repo. Copy contents of .env to env.

**MONGO_URI**
Use a third party service like [mLab](https://mlab.com/) to make a MongoDB database and note down the access point. Insert this URI into the mongo variable in .env


##Builtwith
1. [PassportJS](http://passportjs.org/)      
2. [Google Books API](https://developers.google.com/books/)

View other dependencies in package.json

##Contributing
1. Fork it
2. Create your branch
3. Commit your changes
4. Push to branch
5. Submit a pull request