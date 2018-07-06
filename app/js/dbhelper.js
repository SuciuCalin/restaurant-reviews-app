/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(restaurantsTable, callback, ID) {
      if (navigator.onLine) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', DBHelper.DATABASE_URL + restaurantsTable);

        xhr.onload = () => {
          if (xhr.status === 200) { // Got a success response from server!
            const restaurants = JSON.parse(xhr.responseText);
            DBHelper.createIDB(restaurants, restaurantsTable, ID);
            callback(null, restaurants);
          } else { // Oops!. Got an error from server.
            const error = (`Request failed. Returned status of ${xhr.status}`);
            DBHelper.getCachedData(callback, restaurantsTable, ID);
          }
        }
        xhr.send();
      } else {
          console.log('Failed to fetch from the server');
          DBHelper.getCachedData(callback, restaurantsTable, ID);
          console.log('Offline using Cached data');
      }
    }

  /**
   * Fetch reviews by restaurant
   */
  static fetchRestaurantReviews(restaurantID) {
    return fetch(`http://localhost:1337/reviews/?restaurant_id=${restaurantID}`)
      .then(function (response) {
        if(response.ok) {
          return response.json();
        }
      });
  }

  /**
   * Post review for restaurant
   */
  static postReview(review) {
    return fetch('http://localhost:1337/reviews/',{method:'post', body: review})
      .then(function (response) {
        if(response.ok) {
        return response.json();
        }
      });
  }

  /**
   * Favorite / Unfavorite  a restaurant
   */
  static addFavorite(restaurantID, isFav) {
    return fetch(`http://localhost:1337/restaurants/${restaurantID}/?is_favorite=${isFav}`,{method:'put', body: isFav})
        .then(function (response) {
          if(response.ok) {
            return response.json();
          }
        });
    }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants('restaurants', (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    }, 1);
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants('restaurants', (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    }, 1);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants('restaurants', (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    }, 1);
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants('restaurants', (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    }, 1);
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants('restaurants', (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    }, 1);
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants('restaurants', (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    }, 1);
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.photograph) {
      return (`/img/${restaurant.photograph}.jpg`);
    } else {
        return ('/img/no-image.jpg');
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

/*
 * IDB
 */
  static createIDB(dbData, dbName, ID) {
    let objectStore, db;
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    const dbOpenRequest = indexedDB.open(`${dbName}-db`, 1);

    dbOpenRequest.onerror = error => {
      console.error('dbOpenRequest ', error.target);
    };

    dbOpenRequest.onsuccess = event => {
      db = event.target.result;
      if (db.transaction) {
        const transaction = db.transaction(dbName, 'readwrite');
        objectStore = transaction.objectStore(dbName);

        if (dbName == 'restaurants') {
          objectStore.put({
            id: ID,
            restaurants: dbData
          });
        } else if (dbName == 'reviews') {
            objectStore.put({
               id: ID,
               reviews: dbData
             });
          } else if (dbName == 'pending_reviews') {
              objectStore.put({
                id: Math.floor((Math.random() * 99)),
                reviews: dbData
              });
            }

        return;
      }
    };

    dbOpenRequest.onupgradeneeded = event => {
      db = event.target.result;

      objectStore = db.createObjectStore(dbName, {
        keyPath: 'id',
        autoIncrement:false
      });

      objectStore.createIndex(dbName, dbName, {
        unique: true
      });

      objectStore.transaction.oncomplete = event => {
        objectStore = db.transaction([ dbName ], 'readwrite').objectStore(dbName);
      };
    };
  };

  static getCachedData(callback, dbName, ID){
    const indexedDB =  window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let objectStore, db, data;
    const request = indexedDB.open(`${dbName}-db`, 1);

    request.onsuccess = event => {
      db = request.result;

      if (db.objectStoreNames.length == 0) {
        return;
      }

      if (dbName == 'pending_reviews') {
        const transaction = db.transaction(dbName, 'readwrite');
        objectStore = transaction.objectStore(dbName);

        objectStore.getAll().onsuccess = event => {
          data = event.target.result;

          if (!data) {
            console.error('[getCachedData] Error fetching reviews: ', error);
            callback(error, null);
            return;
          }

          callback(null, data);
          data.forEach(review => {
            objectStore.delete(review.id).onsuccess = event => {
              console.log('[getCachedData] Entry deleted')
            }
          });

        }

      } else {
        const transaction = db.transaction(dbName, 'readonly');
        objectStore = transaction.objectStore(dbName);

        objectStore.get(ID).onsuccess = event => {
          data = event.target.result;

          if (!data) {
            console.error('[getCachedData] Error fetching data: ', error);
            callback(error, null);
            return;
          }

          if (dbName == 'restaurants') {
            callback(null, data.restaurants);
            } else if (dbName == 'reviews') {
                callback(null, data.reviews);
              }
        }
      }
    }
  }

}
