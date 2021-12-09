// written by David Aflalo 09/12/2021

"use strict";
/**
 * modoule to handle all the functions that are made for this exercise
 */
const ex3Module = (function () {

    // my private API Key
    const APIKEY = "dj1uwfwhwqZX3By9FdFIgxlopnNlzmGDD4U3uYeY";

    let publicData = {}

    // variables
    let photos = null;
    const nasaMinMax = {};
    const savedMap = new Map();
    let websiteInitialized = true;

    // const messages
    const SEARCH_NOT_AVAILABLE = "search not avalible at the moment. please reload the page";
    const REQUEST_FAILED = "Request failed";
    const IMAGE_ALREADY_SAVED = "image already saved";
    const INIT_ERROR = "there was some problem initializing the website. refresh this page";
    const NO_IMAGES_FOUND = `<div class ="col-12"><div class="alert alert-danger">no images found</div></div>`;

    /**
     * part of the fetch function
     * @param response
     * @returns {Promise<never>|Promise<unknown>}
     */
    function status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    /**
     * part of the fetch function
     * @param response
     * @returns json
     */
    function json(response) {
        return response.json()
    }

    /**
     * uses nasa servers using fetch and private api key to search the photos.
     * also showing modals if needed and toggles loading gif
     * @param mission: the mission
     * @param date: given date, sol or earth date
     * @param camera: the camera
     * @param responsePhotos: we return the photos using this param
     *
     */
    function nasaSearch(mission, date, camera, responsePhotos) {
        const newdate = date.match('-') ? `earth_date=${date}` : `sol=${date}`;
        toggleLoadingGif();
        fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${mission}/photos?${newdate}&camera=${camera}&api_key=${APIKEY}`)
            .then(status)
            .then(json)
            .then(function (response) {
                responsePhotos = response.photos;
                // stop loading gif
                toggleLoadingGif();
                showSearchResults(responsePhotos);

            })
            .catch(function (error) {
                // stop loading gif
                toggleLoadingGif();
                console.log(REQUEST_FAILED, error);
                showErrorModal("nasa servers are unvalible right now, try again later");
                //
            });
    }

    publicData.searchImage = (e) => {

        e.preventDefault();

        if (!websiteInitialized){
            showErrorModal(SEARCH_NOT_AVAILABLE);
            return
        }

        if (validateForm()){
            const mission = document.getElementById("missionid").value;
            const date = document.getElementById('dateid').value;
            const camera = document.getElementById('cameraid').value;
            // start loading gif
            nasaSearch(mission, date, camera, photos);
        }
    }
    const toggleLoadingGif = () => {
        document.getElementById("loading").classList.toggle("d-none");
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

    /**
     * clear validation errors
     */
    const clearValidationErrors = () => {
        document.querySelectorAll(".inputentry").forEach(
            (elem)=>{elem.classList.remove("is-invalid")}
        )
        document.querySelectorAll(".errormessage").forEach(
            (elem)=>{elem.innerHTML = ""}
        )
    }

    /**
     * validates the form. cheking all fields and showing errors if needed.
     * exepet empty field error (this one is taken care of using html)
     * @returns {boolean}
     * returns true if form is valid, else false
     */
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

    /**
     * creates the results html cards using toHtmlCards in a loop,
     * and inserts the html to the index
     * @param photoslist: the search result list of photos
     */
    function showSearchResults(photoslist) {
        let allcards = "";
        if (photoslist.length === 0) {
            document.getElementById("cardsid").innerHTML = NO_IMAGES_FOUND;
            return;
        }
        for (const image of photoslist) {
            allcards += htmlGenerator.toHtmlCard(image);
        }
        document.getElementById("cardsid").innerHTML = allcards;

        for (const image of photoslist) {
            document.getElementById(image.id).addEventListener("click", (e) => {
                let found = photoslist.find(em => em.id == e.target.id);

                if (savedMap.get(e.target.id) != null) {
                    // pop up msg
                    showErrorModal(IMAGE_ALREADY_SAVED);
                }
                else {
                    savedMap.set(e.target.id, found);
                    document.getElementById("savedlist").innerHTML = htmlGenerator.toHtmlSavedList(savedMap);
                }
            })
        }
    }

    /**
     * shows the caroussel
     */
    publicData.createCarousel = () =>{
        if (savedMap.size > 0) {
            document.getElementById("innercarousel").innerHTML = htmlGenerator.toHtmlCaroussel(savedMap);
            document.getElementById("carousel").classList.remove("d-none");
        }
        else {
            showErrorModal("no saved images found.")
        }

    }
    /**
     * hides the carrousel
     */
    publicData.hideCarousel = () => {
        if (savedMap.size > 0) {
            let myCarousel = document.getElementById("carousel")
            let carousel = new bootstrap.Carousel(myCarousel)
            carousel.pause();
            myCarousel.classList.add("d-none");
        }
        else {
            showErrorModal("no saved images found.")
        }
    }
    /**
     * initializind the 3 missions manifests
     */
    publicData.initMars = () => {
        getData("Curiosity");
        getData("Spirit");
        getData("Opportunity");
    }

    /**
     * pops an Error modal
     * @param msg: the message we want to display in the modal
     */
    function showErrorModal(msg){
        let myModal = new bootstrap.Modal(document.getElementById("errormodal"))
        document.getElementById("errormodalmsg").innerHTML = msg;
        myModal.show();
    }

// the function that triggers an Ajax call
    /**
     * first fetch to get manifest information for the validation.
     * if this fetch is unsuccessful the site wont work.
     * @param mission: the mission
     */
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
            .catch(function () {
                if (websiteInitialized)
                    showErrorModal(INIT_ERROR);
                websiteInitialized = false;
            });
    }
    publicData.clearButtonHandler = () => {
        document.getElementById("searchform").reset();
        clearValidationErrors();
        document.getElementById("cardsid").innerHTML = "";
    }
    return publicData;
})();

/**
 * modoule to handle all validation functions
 */
const validatorModule = (function () {

    const EMPTY_TXT_MSG = "please enter a non empty text";
    const LETTER_OR_NUMBERS = "text must contain letter and/or digits only";
    const SOL_OR_DATE = "input is not a sol number or valid date";
    const INVALID_DATE = "Invalid date";

    /**
     * check if string is non empty
     * @param str: the string (non null or undefined)
     * @returns {{isValid: boolean, message: string}}
     * isValid: return true if str is not empty
     * message: the error message
     */
    const isNotEmpty = function (str) {
        return {
            isValid: (str.length !== 0),
            message: EMPTY_TXT_MSG
        };
    }

    /**
     * check if string contains only letter A-Z or a-z or digits
     * @param str: the string (non null or undefined)
     * @returns {{isValid: boolean, message: string}}
     * isValid: return true if str is not empty
     * message: the error message
     */
    const hasLetterAndDigit = function (str) {
        return {
            isValid: /^[a-zA-Z0-9]+$/.test(str),
            message: LETTER_OR_NUMBERS
        }
    }

    /**
     *
     * @param str: the string (non null or undefined)
     * @returns {{isValid: boolean, message: string}}
     * isValid: return true if str is not empty
     * message: the error message
     */
    const isNumber = function (str) {
        return {
            isValid: /^\+?(0|[1-9]\d*)$/.test(str),
            message: SOL_OR_DATE
        }
    }

    /**
     *
     * @param str: the string (non null or undefined)
     * @returns {{isValid: boolean, message: string}|{isValid: boolean, message: string}}
     * isValid: return true if str is not empty
     * message: the error message
     */
    const isDate = function (str) {
        // Validates that the input string is a valid date formatted as "mm/dd/yyyy"
        // First check for the pattern
        if (! /^\d{4}-\d{2}-\d{2}$/.test(str))
            return {
                isValid: false,
                message: INVALID_DATE
            }
        // Parse the date parts to integers
        let parts = str.split("-");
        let day = parseInt(parts[2], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[0], 10);

        // Check the ranges of month and year
        if (year < 1000 || year > 3000 || month === 0 || month > 12)
            return {
                isValid: false,
                message: INVALID_DATE
            }
        let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // Adjust for leap years
        if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
            monthLength[1] = 29;

        return {
            isValid: day > 0 && day <= monthLength[month - 1],
            message: INVALID_DATE
        }
    }

    return {
        isNotEmpty: isNotEmpty,
        hasLetterAndDigit: hasLetterAndDigit,
        isDate: isDate,
        isNumber: isNumber
    }
})();

/**
 * this module handels all html generated in the program
 */
const htmlGenerator = (function() {
    let publicData = {}

    /**
     * creates html of the saved list
     * @param myMap: a map of photos according to the format of nasa api
     * @returns {string}
     * string: the html to insert in the index
     */
    const toHtmlSavedList = function (myMap) {
        let htmlList = "";
        for (const [key, image] of myMap) {
            htmlList += `<li>
            <a href="${image.img_src}" target="_blank">image id: ${image.id}</a> <br/>
            Earth Date: ${image.earth_date},Sol: ${image.sol}, Camera: ${image.camera.name}
            </li>`
        }
        return htmlList;
    }

    /**
     * @param photo: creates a single card for of a photo for the search results
     * @returns the card html to insert in the index
     */
    const toHtmlCard = function (photo) {
        return `<div class="col mb-3">
            <div class="card" style="width: 18rem;">
                <img src="${photo.img_src}" class="card-img-top" alt="image">
                <div class="card-body">
                    <p class="card-text"> 
                    ${photo.earth_date} <br/>
                    ${photo.sol} <br/>  
                    ${photo.camera.name} <br/>
                    ${photo.rover.name}</p>  
                    <button type="button" class="btn btn-primary" id="${photo.id}">Save</button> 
                    <a href="${photo.img_src}" class="btn btn-primary" target="_blank">Full Size</a>
                </div>
            </div>
            </div>`
    }


    /**
     *
     * @param theMap
     * @returns {string}
     * string: the html to the carrousel
     */
    const toHtmlCaroussel = function(theMap) {
        let retHtml = "";
        let isFirst = true;
        for (const [key, img] of theMap) {
            let isactive = isFirst ? "active " : "";
            retHtml += `
            <div class="carousel-item ${isactive}">
                <img src="${img.img_src}" class="d-block w-100" alt="...">
                <div class="carousel-caption d-none d-md-block">
                    <h5>${img.camera.name}</h5>
                    <p>${img.earth_date}</p>
                    <a href="${img.img_src}" class="btn btn-primary" target="_blank">Full Size</a>

                </div>
            </div>
            `
            isFirst = false;
        }
        return retHtml;
    }

    publicData.toHtmlCard = toHtmlCard;
    publicData.toHtmlSavedList = toHtmlSavedList;
    publicData.toHtmlCaroussel = toHtmlCaroussel;

    return publicData;
})();

/**
 * Dom listeners
 */
document.addEventListener('DOMContentLoaded', function () {
    ex3Module.initMars();
    document.getElementById("searchform").addEventListener("submit", ex3Module.searchImage);
    document.getElementById("startslide").addEventListener("click", ex3Module.createCarousel);
    document.getElementById("stopslide").addEventListener("click", ex3Module.hideCarousel);
    document.getElementById("clearbtn").addEventListener("click", ex3Module.clearButtonHandler);
}, false);


