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

function toHtmlSavedList(myMap){
    let htmlList = "";
    for (const [key,image] of myMap) {
        htmlList += `<li>
            <a href="${image.img_src}" target="_blank">image id: ${image.id}</a> <br/>
            Earth Date: ${image.earth_date},Sol: ${image.sol}, Camera: ${image.camera.namge}
            </li>`
    }
    return htmlList;
}
function showSearchResults(){
    let allcards = "";
    for (const image of photos) {
        allcards += toHtmlCard(image);
    }
    document.getElementById("cardsid").innerHTML = allcards;

    for (const image of photos) {
        document.getElementById(image.id).addEventListener("click", (e)=> {
            let found = photos.find(em => em.id == e.target.id);

            savedMap.set(e.target.id, found);

            document.getElementById("savedlist").innerHTML = toHtmlSavedList(savedMap);
    })
    }
}

function toHtmlCard(photo) {
    return `<div class="col mb-3">
            <div class="card" style="width: 18rem;">
                <img src="${photo.img_src}" class="card-img-top" alt="...">
                <div class="card-body">
                    <p class="card-text"> 
                    ${photo.earth_date} <br/>
                    ${photo.sol} <br/>  
                    ${photo.camera.name} <br/>
                    ${photo.rover.name}</p>  
                    <a href="#" class="btn btn-primary" id=${photo.id}>Save</a>
                    <a href="${photo.img_src}" class="btn btn-primary" target="_blank">Full Size</a>
                </div>
            </div>
            </div>`
}

const myarray = {};

function createCarousel(){
    let retHtml = "";
    let isFirst = true;
    for (const [key,img] of savedMap){
        let isactive = isFirst ? "active " : "";
        retHtml += `
            <div class="carousel-item ${isactive}">
                <img src="${img.img_src}" class="d-block w-100" alt="...">
            </div>
            `
        isFirst = false;
    }
    document.getElementById("innercarousel").innerHTML = retHtml;
    document.getElementById("carousel").classList.toggle("d-none");
}

function hideCarousel(){
    var myCarousel = document.getElementById("carousel")
    var carousel = new bootstrap.Carousel(myCarousel)
    carousel.pause();
    myCarousel.classList.toggle("d-none");
}

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

const savedMap = new Map();


document.addEventListener('DOMContentLoaded', function () {
    initMars();
     //document.querySelector("#getdata").addEventListener("click", getData);

    document.getElementById("searchbtn").addEventListener("click", searchImage);
    document.getElementById("startslide").addEventListener("click",createCarousel);
    document.getElementById("stopslide").addEventListener("click",hideCarousel);


}, false);

// })();

