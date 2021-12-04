// commented out when debugging
// (function () {
"use strict";

// to do:

// validation:
// if manifest failes to load -> previw a msg "site not avalible at the moment" V

// the mission you have selected requires a date after {x} V
// the mission you have selected requires a date before {x} V
// input is required here V

// error msg if u try to save a saved image (pop-up) V

// no images found! V

// clear button: removes search and results. V

// gif when fetch loading

// full size button + info on slide show


const APIKEY = "dj1uwfwhwqZX3By9FdFIgxlopnNlzmGDD4U3uYeY";

let photos = null;
const nasaMinMax = {};
const savedMap = new Map();
let websiteInitialized = true;

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

function searchImage(e) {

    e.preventDefault();

    if (!websiteInitialized){
        showErrorModal("search not avalible at the moment. please reload the page");
        return
    }

    if (validateForm()){
        const mission = document.getElementById("missionid").value;
        const date = document.getElementById('dateid').value;
        const camera = document.getElementById('cameraid').value;
        // start gif
        toggleLoadingGif();
        fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${mission}/photos?earth_date=${date}&camera=${camera}&api_key=${APIKEY}`)
            .then(status)
            .then(json)
            .then(function (response) {
                photos = response.photos;
                // stop gif
                toggleLoadingGif();
                showSearchResults();

            })
            .catch(function (error) {
                // stop gif
                toggleLoadingGif();
                console.log('Request failed', error);
            });
    }
}

function toggleLoadingGif(){
    document.getElementById("loading").classList.toggle("d-none");
}

// a module for all string validation functions
const validatorModule = (function () {
    const isNotEmpty = function (str) {
        return {
            isValid: (str.length !== 0),
            message: 'please enter a non empty text'
        };
    }

    const hasLetterAndDigit = function (str) {
        return {
            isValid: /^[a-zA-Z0-9]+$/.test(str),
            message: 'text must contain letter and/or digits only'
        }
    }
    const isNumber = function (str) {
        return {
            isValid: /^\+?(0|[1-9]\d*)$/.test(str),
            message: 'input is not a sol number or valid date'
        }
    }

    /**
     *
     * @param str
     * @returns {{isValid: boolean, message: string}|{isValid: boolean, message: string}}
     */
    const isDate = function (str) {
        // Validates that the input string is a valid date formatted as "mm/dd/yyyy"
        // First check for the pattern
        if (! /^\d{4}-\d{2}-\d{2}$/.test(str))
            return {
                isValid: false,
                message: 'Invalid date'
            }
        // Parse the date parts to integers
        let parts = str.split("-");
        let day = parseInt(parts[2], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[0], 10);

        // Check the ranges of month and year
        if (year < 1000 || year > 3000 || month == 0 || month > 12)
            return {
                isValid: false,
                message: 'Invalid date'
            }
        let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // Adjust for leap years
        if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
            monthLength[1] = 29;

        return {
            isValid: day > 0 && day <= monthLength[month - 1],
            message: 'Invalid date'
        }
    }

    return {
        isNotEmpty: isNotEmpty,
        hasLetterAndDigit: hasLetterAndDigit,
        isDate: isDate,
        isNumber: isNumber
    }
})();

function toHtmlSavedList(myMap) {
    let htmlList = "";
    for (const [key, image] of myMap) {
        htmlList += `<li>
            <a href="${image.img_src}" target="_blank">image id: ${image.id}</a> <br/>
            Earth Date: ${image.earth_date},Sol: ${image.sol}, Camera: ${image.camera.namge}
            </li>`
    }
    return htmlList;
}

/**
 * display error msg bellow some element
 * @param element - the element
 * @param msg - the message
 */
function showValidationError(element,msg) {
    element.nextElementSibling.innerHTML = msg;
    element.classList.add("is-invalid")
}

function clearValidationErrors() {
    document.querySelectorAll(".inputentry").forEach(
        (elem)=>{elem.classList.remove("is-invalid")}
    )
    document.querySelectorAll(".errormessage").forEach(
        (elem)=>{elem.innerHTML = ""}
    )
}
function validateForm() {
    clearValidationErrors();
    let formValidation = true;

    let mission = document.getElementById("missionid").value;
    let inputdate = document.getElementById("dateid").value;

    let testDate = validatorModule.isDate(inputdate);
    let testNumber = validatorModule.isNumber(inputdate);
    if (!testDate.isValid) {
        if (!testNumber.isValid) {
            showValidationError(document.getElementById("dateid"),testNumber.message);
            formValidation = false;
        } else {
            //check range of sol
            if (inputdate > nasaMinMax[mission].max_sol) {
                showValidationError(document.getElementById("dateid"),
                    `max sol date is ${nasaMinMax[mission].max_sol}`)
                formValidation = false;
            }
        }
    } else {
        // check range of date
        if ((Date.parse(inputdate) > Date.parse(nasaMinMax[mission].max_date))) {
            showValidationError(document.getElementById("dateid"),
                `the mission you have selected requires a date before ${nasaMinMax[mission].max_date}`);
                formValidation = false;
        }
        else if (Date.parse(inputdate) < Date.parse(nasaMinMax[mission].landing_date)) {
            showValidationError(document.getElementById("dateid"),
                `the mission you have selected requires a date after ${nasaMinMax[mission].landing_date}`);
                formValidation = false;
        }
    }
    return formValidation;

}

function showSearchResults() {
    let allcards = "";
    if (photos.length === 0) {
        document.getElementById("cardsid").innerHTML = `<div class="alert alert-danger">no images found</div>`;
        return;
    }
    for (const image of photos) {
        allcards += toHtmlCard(image);
    }
    document.getElementById("cardsid").innerHTML = allcards;

    for (const image of photos) {
        document.getElementById(image.id).addEventListener("click", (e) => {
            let found = photos.find(em => em.id == e.target.id);

            if (savedMap.get(e.target.id) != null) {
                // pop up msg
                showErrorModal("image already saved");
            }
            else {
                savedMap.set(e.target.id, found);
                document.getElementById("savedlist").innerHTML = toHtmlSavedList(savedMap);
            }
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

function createCarousel() {
    let retHtml = "";
    let isFirst = true;
    for (const [key, img] of savedMap) {
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

function hideCarousel() {
    let myCarousel = document.getElementById("carousel")
    let carousel = new bootstrap.Carousel(myCarousel)
    carousel.pause();
    myCarousel.classList.toggle("d-none");
}

function initMars() {
    getData("Curiosity");
    getData("Spirit");
    getData("Opportunity");
}

function showErrorModal(msg){
    let myModal = new bootstrap.Modal(document.getElementById("errormodal"))
    document.getElementById("errormodalmsg").innerHTML = msg;
    myModal.show();
}

// the function that triggers an Ajax call
function getData(mission) {
    fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${mission}?api_key=${APIKEY}`)
        .then(status)
        .then(json)
        .then(function (response) {
            nasaMinMax[mission] = {
                max_date: response.photo_manifest.max_date,
                landing_date: response.photo_manifest.landing_date,
                max_sol: response.photo_manifest.max_sol
            }
        })
        .catch(function (error) {
            if (websiteInitialized)
                showErrorModal("there was some problem initializing the website.");
            websiteInitialized = false;
        });
}

document.addEventListener('DOMContentLoaded', function () {
    initMars();
    //document.getElementById("searchbtn").addEventListener("click", searchImage);
    document.getElementById("searchform").addEventListener("submit", searchImage);

    document.getElementById("startslide").addEventListener("click", createCarousel);
    document.getElementById("stopslide").addEventListener("click", hideCarousel);

    document.getElementById("clearbtn").addEventListener("click", ()=>{
        document.getElementById("searchform").reset();
        clearValidationErrors();
        document.getElementById("cardsid").innerHTML = "";
    })

}, false);

// })();

