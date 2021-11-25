// commented out when debugging
// (function () {
"use strict";

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
let photos = null;

function searchImage(){

    const mission = document.getElementById("missionid").value;
    const date = document.getElementById('dateid').value;
    const camera = document.getElementById('cameraid').value;

    fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${mission}/photos?earth_date=${date}&camera=${camera}&api_key=${APIKEY}`)
        .then(status)
        .then(json)
        .then(function (response) {
            console.log(JSON.stringify(response));
            photos = response.photos;
            showSearchResults();

        })
        .catch(function (error) {
            console.log('Request failed', error);
        });
}


function showSearchResults(){
    let allcards = "";
    for (const image of photos) {
        allcards += toHtmlCard(image);
    }
    document.getElementById("cardsid").innerHTML = allcards;
}

function toHtmlCard(photo) {
    return `
            <div class="card" style="width: 18rem;">
                <img src="${photo.img_src}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title">Title</h5>
                    <p class="card-text"> 
                    ${photo.earth_date} <br/>
                    ${photo.sol} <br/>  
                    ${photo.camera.name} <br/>
                    ${photo.rover.name}</p>  
                    <a href="#" class="btn btn-primary">Save</a>
                    <a href="#" class="btn btn-primary">Full Size</a>
                </div>
            </div>`
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
     //document.querySelector("#getdata").addEventListener("click", getData);

    document.getElementById("searchbtn").addEventListener("click", searchImage)


}, false);

// })();

