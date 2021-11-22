/* your JS code here */

// this is the correct way to write an Ajax request

// commented out when debugging
// (function () {

//  check the HTTP response status, returns a promise

const APIKEY = "dj1uwfwhwqZX3By9FdFIgxlopnNlzmGDD4U3uYeY";

function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
}

// returns a promise!
function json(response) {
    return response.json()
}

function searchImage(date,mission,camera){

    fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${mission}/photos?earth_date=${date}&camera=${camera}&api_key=${APIKEY}`)
        .then(status)
        .then(json)
        .then(function (response) {
            console.log(JSON.stringify(response))
        })
        .catch(function (error) {
            console.log('Request failed', error);
        });

}

const myarray = {};

function initMars(){
    getData("Curiosity");
    getData("Spirit");
    getData("Opportunity");
}

// the function that triggers an Ajax call
function getData(mission) {
    fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${mission}?api_key=${APIKEY}`)
        .then(status)
        .then(json)
        .then(function (response) {
            myarray[mission] = {max_date: response.photo_manifest.max_date,
                                landing_date: response.photo_manifest.landing_date,
                                max_sol: response.photo_manifest.max_sol}

            let landingDate = response.photo_manifest.landing_date;
            console.log(landingDate);
            //console.log('Request succeeded with JSON response', response);

        })
        .catch(function (error) {
            console.log('Request failed', error);
        });

}

document.addEventListener('DOMContentLoaded', function () {
    initMars();
    document.querySelector("#getdata").addEventListener("click", getData);
}, false);

// })();

