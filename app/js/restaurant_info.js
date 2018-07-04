let restaurant;
let reviews;
let map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name + ' Restaurant';

  const favUnfav = document.getElementById('favUnfav');
  if (restaurant.is_favorite === 'true' || restaurant.is_favorite === true) {
    favUnfav.innerHTML = 'Favorite';
  } else if (restaurant.is_favorite === 'false' || restaurant.is_favorite === false) {
      favUnfav.innerHTML = 'Add to Favorite';
  }

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill reviews
  checkReviews();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {
  const ul = document.getElementById('reviews-list');
  const container = document.getElementById('reviews-container');
  container.innerHTML ='';

  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';

  container.appendChild(title);

  DBHelper.fetchRestaurantReviews(self.restaurant.id).then((response) => {
    reviews = response;

    if (reviews.length < 1) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }

    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });

    container.appendChild(ul);

  });

}

/*
 * Check for the reviews before creating their HTML
 */
checkReviews = () => {
  if (navigator.onLine) {
    fillReviewsHTML(self.restaurant.reviews);
  } else {
      DBHelper.getCachedData((error, reviews) => {
        if (error) {
          callback(error, null);
        } else {
            if (reviews) {
              fillReviewsHTML(reviews);
            } else {
                fillReviewsHTML(self.restaurant.reviews);
            }
        }

      }, 'reviews', self.restaurant.id);
    }
}

/**
 * Create review HTML and add it to the webpage.
 */
  createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = new Date(review.createdAt).toGMTString().slice(0,16);
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;

  }

/**
 * Add a new review
 */
addReview = () => {
  const reviewForm = document.getElementById('add-review-form');
  const reviewName = document.getElementById('review-name');
  const reviewRating = document.getElementById('rating');
  const reviewText = document.getElementById('review-text');

  const review = {
    "restaurant_id":self.restaurant.id ,
    "name": reviewName.value,
    "rating": reviewRating.value,
    "comments": reviewText.value,
    "createdAt" : Date.now()
  };

  if (navigator.onLine) {
    DBHelper.postReview(JSON.stringify(review)).then((result) => {
        fillReviewsHTML(review);
        reviewForm.reset();
    }).catch((error) => console.log("error sending new review"));

  } else {
      DBHelper.createIDB(JSON.stringify(review), 'pending_reviews', 0);

      const ul = document.getElementById('reviews-list');
      ul.appendChild(createReviewHTML(review));

      reviewForm.reset();

      localStorage.setItem('pendingReview', true);
      alert('The message will be sent once your device is online!');
    }
}

/**
 * Favorite  / Unfavorite  a restaurant
 */
favUnfav = (element) => {
  let favUnfav = document.getElementById('favUnfav');

  if (self.restaurant.is_favorite === 'true'
        || self.restaurant.is_favorite === true) {
    DBHelper.addFavorite(self.restaurant.id, false);
    favUnfav.innerHTML = 'Add to Favorite';
  } else if (self.restaurant.is_favorite === 'false'
              || self.restaurant.is_favorite === false) {
    DBHelper.addFavorite(self.restaurant.id, true);
    favUnfav.innerHTML = 'Favorite';
  }

}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

window.onload = () => {
  const mapFrame = document.querySelector('iframe');
  if (mapFrame !== null) {
    mapFrame.title = 'Google Map';
  }

  document.addEventListener('keydown', (event) => {
    const homeButton = document.querySelector('#breadcrumb li a');
    const restaurantName = document.querySelector('#restaurant-name');

  	if (event.key === 'Tab' && event.getModifierState('Shift') === false) {
  		if (document.activeElement === homeButton) {
  			event.preventDefault();
  			restaurantName.focus();
  		}
    }
  	if (event.key === 'Tab' && event.getModifierState('Shift') === true) {
      if (document.activeElement === restaurantName) {
        event.preventDefault();
  			homeButton.focus();
  	  }
    }
  });

  sendPendingReview = (event) => {
    if (navigator.onLine && localStorage.getItem('pendingReview')) {
      DBHelper.getCachedData((error, reviews) => {
        if (error) {
          callback(error, null);
        } else {
            if (reviews) {
              reviews.forEach(review => {
                const pendingData = JSON.parse(review.reviews);

                let pendingReview = {
                  "restaurant_id":pendingData.restaurant_id,
                  "name": pendingData.name,
                  "rating": pendingData.rating,
                  "comments": pendingData.comments,
                  "createdAt" : pendingData.createdAt
                };

                DBHelper.postReview(JSON.stringify(pendingReview)).then((result) => {
                    console.log("[sendPendingReview] data sent");
                }).catch((error) => console.log("[sendPendingReview] error sending data"));

              });

              localStorage.setItem('pendingReview', false);
            }
        }
      }, 'pending_reviews', 0);
    }
  }

  window.addEventListener('online',  sendPendingReview);

};
