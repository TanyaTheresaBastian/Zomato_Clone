function hidePhone() {
    document.getElementById("phone-id").style.visibility = "hidden";
    document.getElementById("email-id").style.visibility = "visible";
}
function hideEmail() {
    document.getElementById("email-id").style.visibility = "hidden";
    document.getElementById("phone-id").style.visibility = "visible";
}

async function getCityLocation() {
    let cityName = document.getElementById("city-input").value;
    return await fetch("https://developers.zomato.com/api/v2.1/locations?query=" + cityName, {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset = UTF-8",
            "user-key": "afeca0e1f524e2efce1a767b12b83517"
        },
    })
        .then(response => response.json())
        .then(data => {
            for (let location of data.location_suggestions) {
                if (location.entity_id !== undefined) {
                    document.getElementById("city-input").value = location.city_name;
                    createCuisineOptions(location.entity_id);
                    let chosenCuisine = document.getElementById("cuisines").value;
                    document.getElementById("collectionsDiv").setAttribute("style", "display:inline");
                    getCollectionByCityName(location.entity_id);
                    getRestaurantsFromCityName(location.entity_id, chosenCuisine);

                }
            }

        })
        .catch((error) => {
            console.error(error);
        });
}
/**
 * Get list of all cuisines of restaurants. 
 * @param {*} cityId 
 */
 
async function createCuisineOptions(cityId) {
    return await fetch("https://developers.zomato.com/api/v2.1/cuisines?city_id=" + cityId, {
        method: "GET",
        headers: {
            "Content-type" : "application/json; charset = UTF-8",
            "user-key": "afeca0e1f524e2efce1a767b12b83517"
        },
    })
    .then(response => response.json())
    .then(data => {
        let cuisinesSelect = document.getElementById("cuisines");
        cuisinesSelect.remove();
        
        cuisinesSelect = document.createElement("select");
        cuisinesSelect.id = "cuisines";
        cuisinesSelect.setAttribute("class", "custom-select");

        document.getElementById('cuisineSelectDiv').appendChild(cuisinesSelect);

        for(let cuisine_item of data.cuisines) {
            let option = document.createElement("option");
            option.value = cuisine_item.cuisine.cuisine_id;
            option.innerText = cuisine_item.cuisine.cuisine_name;

            cuisinesSelect.appendChild(option);
        }
    })
    .catch((error) => {
        console.error(error);
    });
}
/**
 * Function to fetch restaurant collections for a given cityId
 * @param {*} cityId 
 */

function getCollectionCityName(cityId) {
    let cityName = document.getElementById("city-input").value;

    let collectionDiv = document.getElementById("collectionsDiv");
    collectionDiv.remove();

    collectionDiv = document.createElement("div");
    collectionDiv.classList.add("p-5");
    collectionDiv.id = "collectionsDiv";
    document.body.append(collectionDiv);

    let collectionHeading = document.createElement("h2");
    collectionHeading.innerText = "Collections in" + cityName;

    let collectionDescription = document.createElement("p");
    collectionDescription.classList.add("card-text");
    collectionDescription.setAttribute("style", "font-size:1.1rem");
    collectionDescription.innerText = "Explore curated lists of top restaurants, cafes, pubs and bars in" + cityName + "based on trends";

    let allCollectiosLinkSpan = document.createElement("span");
    allCollectiosLinkSpan.id = "allCollectiosLinkSpan";
    allCollectiosLinkSpan.classList.add("restaurantCard");
    allCollectiosLinkSpan.setAttribute("style", "float:right;font-size:1.1rem");

    let allCollectiosLink = document.createElement("a");
    allCollectiosLink.innerText = "All Collections in" + cityName;
    allCollectiosLink.setAttribute("style", "color:red");

    allCollectiosLinkSpan.append(allCollectiosLink);

    enrichCollectionsForCityId(cityId);


    collectionDiv.append(collectionHeading, allCollectiosLinkSpan, collectionDescription);

}

/**
 * Async function  to enrich restaurant colletions for a given city
 * @param {} cityId 
 */

async function enrichCollectionsForCityId(cityId) {
    return await fetch("https://developers.zomato.com/api/v2.1/collections?city_id=" + cityId, {
        method: 'GET',
        headers: {
            "Content-type": "application/json; charset = UTF-8",
            "user-key": "afeca0e1f524e2efce1a767b12b83517"
        },
    })
        .then(response => response.json())
        .then(data => {
            let collectionsDiv = document.getElementById("collectionsDiv");
            let responseRestaurantCollections = data.collections;
            let collectionCardDeckDiv = document.createElement("div");
            collectionCardDeckDiv.classList.add("card-deck", "pt-3");
            collectionsDiv.appendChild(collectionCardDeckDiv);

            for (let i = 0; i < 4; i++) {
                let collectionCard = formCollectionCardFromData(responseRestaurantCollections[i]);
                collectionCardDeckDiv.append(collectionCard);
            }

            document.getElementById("allCollectiosLinkSpan").addEventListener("click", function (event) {
                let collectionsURL = data.collections[0].collection.share_url.split('/');
                let allCollectionsURL = collectionsURL.slice(0, collectionsURL.length - 1).join('/');
                location.href = allCollectionsURL;
            })
        })
        .catch((error) => {
            console.error(error);
        });
}
/**
 * Function to form collection card using collectionData
 * @param {} collectionData 
 */
function formCollectionCardFromData(collectionData) {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "restaurantCard");

    cardDiv.append(formCollectionImage(collectionData));
    cardDiv.append(formCardImageOverlayText(collectionData));

    cardDiv.addEventListener("click", function(event) {
        location.href = collectionData.collection.share_url;
    });

    return cardDiv;
}
//
getCityLocation();

let search_button = document.getElementById("searchBtn");
search_button.addEventListener("click",function(event){
    document.getElementById("collectionsDiv").setAttribute("style", "display:hidden");
    getCityLocation();
});

/**
 * Search for restaurants using cityName and Cuisine name in input
 * @param {*} cityId 
 * @param {*} selectedCuisine 
 */

async function getRestaurantsFromCityName(cityId,chosenCuisine ) {
    let url = "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityId + "&entity_type=city";
    if(chosenCuisine!== "Select Cuisine") {
        url += "&cuisines=" + chosenCuisine;
    }
    console.log("calling url:" + url);
    return await fetch(url, {
        method: "GET",
        headers: {
            "Content-type" : "application/json; charset = UTF-8",
            "user-key": "afeca0e1f524e2efce1a767b12b83517"
        },
    })
    .then(response => response.json())
    .then(data => {
        let cityName = document.getElementById('city-input').value;
        document.getElementById("restaurantsDiv").remove();
        let restaurantsDiv = document.createElement("div");
        restaurantsDiv.id = "restaurantsDiv";
        restaurantsDiv.classList.add("p-5");

        let restaurantsDivHeading = document.createElement('h2');
        restaurantsDivHeading.innerText = "Restaurants in " + cityName;

        let restaurantsDivDescription = document.createElement("p");
        restaurantsDivDescription.classList.add("card-text");
        restaurantsDivDescription.setAttribute("style", "font-size:1.1rem");
        restaurantsDivDescription.innerText = "Discover the best food & drinks in" + cityName + "based on trends";

        restaurantsDiv.append(restaurantsDivHeading, restaurantsDivDescription);
        
        document.body.append(restaurantsDiv);

        let restaurantsArray = data.restaurants;

        let cardCount = 0;
        let restaurantCardDiv;
        for(let res of restaurantsArray) {
            if(cardCount%4===0) {
                restaurantCardDiv  = document.createElement('div');
                restaurantCardDiv.classList.add('card-deck', 'pt-3');
                restaurantsDiv.appendChild(restaurantCardDiv);
            }
            let restaurantCard = createRestaurantCard(res);
            restaurantCardDiv.append(restaurantCard);
            cardCount++;
        }

    })
    .catch((error) => {
        console.error(error);
    });
}
