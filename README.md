# journal
This application serves as a journal to the user. Like the name suggests this application allows the user to write about their daily activities or any other thing on their mind. The user first registers, and they can then start adding content. They can also edit and delete content. After the user is registered, they then have to login to keep using the app. 

The technologies used to create the app are the following:
    -html
    -css
    -nodejs
    -ejs
    -express
    -javascript
    -jQuery
    -SQL/postgres
Anyone can clone or fork this project to have it run on their pc. To do this, you first have to create two tables in a postgres database using pgadmin. Name the first table users and the second blogs. You can name the tables diffently depending on what you find convenient. However, remember to edit the code accordingly. In the users table you need the following columns: id(primary key and data type "SERIAL"), email(add the constraint "UNIQUE" and data type "TEXT") and password(data type "TEXT"). In the blogs table, you need the following columns: id(primary key), title(data type "Text"), blog(data type "Text"), date(data type "VARCHAR(20)"), user_id(data type "INTEGER", and make it refer to the user(id) column). These tables have a one-to-many relationship to allow a user to access all their content, and to allow multiple users to use the application.

After setting up your database, go ahead and open two terminal windows, one for your server and the other for your API. 

In one terminal run the command:
`npm start`
to start the server

In the second run the command:
`npm run dev` 
to start the API

You can the run the application on your localhost.

