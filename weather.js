const userTab = document.querySelector('.user-weather');
const searchTab = document.querySelector('.search-weather');

const grantAccessContainer = document.querySelector('.grant-location-container');
const searchForm = document.querySelector(".form-container");
const loadingScreen = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector(".user-info-container");
const errorImg= document.querySelector('.error');

// Global variables
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
let currentTab = userTab;
currentTab.classList.add("current-tab");
getFromSessionStorage();

async function fetchWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;

    // Make grant access container invisible
    grantAccessContainer.classList.remove('active');

    // Make loader visible
    loadingScreen.classList.add('active');

    // API Call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    } 
    catch (err) {
        loadingScreen.classList.remove('active');
        alert("Failed to load weather data.");
    }
}

// check whether the coordiantes of user are already stored is session storage of browser or not
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        searchForm.classList.remove('active');
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchWeatherInfo(coordinates);
    }
}

function renderWeatherInfo(data) {
    const cityName = document.querySelector('.city-name');
    const countryIcon = document.querySelector('.country-icon');
    const desc = document.querySelector('.weather-description');
    const weatherIcon = document.querySelector('.weather-icon');
    const temp = document.querySelector('.temperature');
    const humidity = document.querySelector('.value-humidity');
    const windSpeed = document.querySelector('.speed-wind');
    const clouds = document.querySelector('.clouds-data');

    cityName.textContent = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.textContent = data?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.textContent = `${data?.main?.temp.toFixed(2)}°C`;
    humidity.textContent = `${data?.main?.humidity}%`;
    windSpeed.textContent = `${data?.wind?.speed}m/s`;
    clouds.textContent = `${data?.clouds?.all}%`;
}

function switchTab(clickedTab) {
    if (currentTab !== clickedTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        
        // searchform is already invisible so make it visible
        if ( !searchForm.classList.contains('active') ) {
            userInfoContainer.classList.remove('active');
            grantAccessContainer.classList.remove('active');
            searchForm.classList.add('active');
        } 
        // searchform is visible so make it invisible
        else {
            grantAccessContainer.classList.remove('active');
            searchForm.classList.remove('active');
            userInfoContainer.classList.remove('active');
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener('click', () => {
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    switchTab(searchTab);
});

const grantAccessButton = document.querySelector('.access');
grantAccessButton.addEventListener('click', getLocation);

// store the coordinates user position in browser session storage
function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const userCoordinates = { lat, lon };

    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates));
    fetchWeatherInfo(userCoordinates);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, (error) => {
            alert("Unable to retrieve your location. Please grant access.");
        });
    } 
    else {
        alert("OOPS! Geolocation is not supported by your browser.");
    }
}

let searchInput = document.querySelector('input[type="text"]');
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (searchInput.value === "") return;
    fetchSearchWeatherInfo(searchInput.value);
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantAccessContainer.classList.remove('active');

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove('active');

        if( !response.ok ) {
            userInfoContainer.classList.add('active');
            throw new Error("Error");
            return ;
        }
        else {
            errorImg.classList.remove('active');
            userInfoContainer.classList.add('active');
            renderWeatherInfo(data);
        }

    } 
    catch (e) {
        errorImg.classList.add('active') ;
    }

}