# Restaurants Reviews App

##### _Three Stage Course Material Project - Restaurant Reviews_
#### Project Overview:
For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application.

---
#### Stage 1
1. Convert the site provided from the [starter repository](https://github.com/udacity/mws-restaurant-stage-1) to use a responsive design .
2. Implement accessibility features.
3. Add a ServiceWorker script to cache requests to all of the site’s assets so that any page that has been visited by a user will be accessible when the user is offline.

#### Stage 2
1. **Use server data instead of local memory**
 In the first version of the application, all of the data for the restaurants was stored in the local application. You will need to change this behavior so that you are pulling all of your data from the server instead, and using the response data to generate the restaurant information on the main page and the detail page.
2. **Use IndexedDB to cache JSON responses**
 In order to maintain offline use with the development server you will need to update the service worker to store the JSON received by your requests using the IndexedDB API. As with Stage One, any page that has been visited by the user should be available offline, with data pulled from the shell database.
3. Meet the minimum performance requirements Once you have your app working with the server and working in offline mode, you’ll need to measure your site performance using Lighthouse:
  * [x] Progressive Web App score should be at 90 or better.
  * [x] Performance score should be at 70 or better.
  * [x] Accessibility score should be at 90 or better.

#### Stage 3
1. Add a form to allow users to submit their own reviews.
2. Add functionality to defer submission of the form until connection is re-established.
3. Follow the recommendations provided by `Lighthouse` to achieve the required performance targets.
---



## Installation

1. Clone or download this repository.
2. In the `/app` folder, start up a simple HTTP server to serve up the site files on your local computer.
  *Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.
  In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.*
3. With your server running, visit the site: `http://localhost:8000`
4. Development local API Server. Follow the instructions from [here](Development local API Server.) or from the next step.
5. Development local API Server: `cd` to the location of server = `/server`
    * Server depends on [node.js LTS Version: v6.11.2](https://nodejs.org/en/download/) , [npm](https://www.npmjs.com/get-npm), and [sails.js](https://sailsjs.com/). Please make sure you have these installed before proceeding forward.
    * Install project dependancies
    ```
    npm i
    ```
    Install Sails.js globally
    ```
    npm i sails -g
    ```
    Start the server
    ```
    node server
    ```
6. Enjoy the app!
#### You should now have access to your API server environment.
