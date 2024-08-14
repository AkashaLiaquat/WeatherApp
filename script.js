
//ALL CONTAINER ELEMENTS TO CONTROL THEIR VISIBILITY
const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');
const userContainer=document.querySelector('.weather-container');

const grantAccessContainer=document.querySelector('.grant-location-container');
const searchForm=document.querySelector('[data-searchForm]');
const loadingScreen=document.querySelector('.loading-container');
const userInfoContainer=document.querySelector('.user-info-container');
const errorContainer=document.querySelector(".errorContainer");
const errorMsg=document.querySelector("[data-errorMsg]");
const goBackBtn=document.querySelector("[data-goBack]");

//Initially
let currentTab=userTab;
const API_key='fc52fd0736f8fb6edf65306908de1e1f';
currentTab.classList.add("current-tab");//faded button properties to show clicked
getFromSessionStorage();//get coordinates

////////////////////////////////////////////////

function switchTab(clickedTab){
  if(clickedTab != currentTab){
    currentTab.classList.remove("current-tab");//clicked properties removed
    currentTab=clickedTab;//changed tab
    currentTab.classList.add("current-tab");//clicked properties reapplied


/* agar switch hua hai aur search tab visible nahi hai iska matlab
    hai humara previous tab userTab tha aur new clicked tab searchTab hai is lye hum searchForm ko visible
    kerva dengy */
  if(!searchForm.classList.contains("active")){
   userInfoContainer.classList.remove("active");
   grantAccessContainer.classList.remove("active");
   searchForm.classList.add("active");
   /* We Applied it here and not in fetch function because during searching the error was still showing
   and after searching when fetch function started then error was removed so it is preferred*/
   errorContainer.classList.remove("active");
   errorMsg.innerText="";
   goBackBtn.classList.remove("active");
  }
  else{
    /*ager searchForm active hai matlab humara previous tab searchTab tha
    ab hum userTab par switch krengy */
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    searchForm.classList.remove("active");
    getFromSessionStorage();/*for coordinates to check if we saved them in session storage*/
   /* Error Container If Any..We could have used it in fetch
   function to write these lines only once but if permission not granted and there
   was error during search and clicked back on  YourWeather so fetch function willnot
   be executed bcz of location not accessed so we applied it here so that it must execute
   wether fetch function worked or not */
   errorContainer.classList.remove("active");
   errorMsg.innerText="";
   goBackBtn.classList.remove("active");
  }
}
}



userTab.addEventListener("click",()=>{
  switchTab(userTab);//called switch function
});
searchTab.addEventListener("click",()=>{
  switchTab(searchTab);
});

///////////////////////////////////////////////////////////

function getFromSessionStorage(){
  //check if coorinates are present in session storage
  /* session storage main user-coordinates name ki koi item hai? to wo localCoordinates main store hojayega. */
  const localCoordinates=sessionStorage.getItem("user-coordinates");
  if(!localCoordinates){
    /* if localCoordinates not saved in sessionStorage matlab grantAccess window show kerni hai...bcz sab sy pehly
    wohi show hoti hai aur permission lay kay coordinates store kervati hai. */
    grantAccessContainer.classList.add("active");
  }
  else{
    const coordinates =JSON.parse(localCoordinates);/* JSON.parse() is used to convert a JSON string
     into a JavaScript object. This is necessary because data stored in sessionStorage (or localStorage)
      is always saved as a string, even if you store something that looks like an object. */ 
    fetchUserWeatherInfo(coordinates);//function call
  }
}



async function fetchUserWeatherInfo(coordss){
  const {lat , lon} = coordss;/*lat and lon properties from the coordss object 
  are compared to variable names and values are assigned to the variables lat and lon, respectively. */

  //make grantContainer visible in order to show loader
  grantAccessContainer.classList.remove("active");


  //show loader
  loadingScreen.classList.add("active");

  //API call
  try{
  const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);
  const data= await response.json();/* aa weather data will be in this data object */
   //now hide loader
   loadingScreen.classList.remove("active");
   userInfoContainer.classList.add("active");

   //Render new info
   renderWeatherInfo(data);
  }
  catch(eror){

    /* If a particular Location is not supported then show error */
    loadingScreen.classList.remove("active");
    errorContainer.classList.add("active");
    errorMsg.innerText="Geolocation is Not supported!!";
  }
}


/* renderWeatherInfo cntainer will be filled with right info in this function */
function renderWeatherInfo(weatherData){

//elements
const cityName=document.querySelector('[data-cityName]');
const countryIcon=document.querySelector('[data-countryIcon]');
const desc=document.querySelector('[data-weatherDesc]');
const weatherIcon=document.querySelector('[data-weatherIcon]');
const temp=document.querySelector('[data-temp]');
const windSpeed=document.querySelector('[data-windSpeed]');
const humidity=document.querySelector('[data-humidity]');
const clouds=document.querySelector('[data-cloudiness]');
//fetch values from weatherInfo object and put in these UI elements
cityName.innerText=weatherData?.name;/*optional chaining for accessing deep 
nested object items & returns undefined if not found & doesn't throw any error*/
countryIcon.src=`https://flagcdn.com/144x108/${weatherData?.sys?.country.toLowerCase()}.png`;//PK to lowercase pk
desc.innerText=weatherData?.weather?.[0]?.description;/* bcz weather object had an array of objects it can contain
multiple objects to represent multiple weather conditons eg. fog + liht rain here we are accessing 0 index */
weatherIcon.src=`https://openweathermap.org/img/w/${weatherData?.weather?.[0]?.icon}.png`;
temp.innerText = `${weatherData?.main?.temp} °C`;
windSpeed.innerText=`${weatherData?.wind?.speed} ms⁻¹`;
humidity.innerText=`${weatherData?.main?.humidity}%`;
clouds.innerText=`${weatherData?.clouds?.all}%`;
}

////////////////////////////////////////////

function getLocation(){
  if(navigator.geolocation)
    {
      navigator.geolocation.getCurrentPosition(showPosition);//callBack Funct
    }
  else{
    alert("No GeoLocation Support Available!");
  }
}


function showPosition(position){
const userCoordinates={
  lat : position.coords.latitude,
  lon : position.coords.longitude,
}
sessionStorage.setItem("user-coordinates" , JSON.stringify(userCoordinates));/*sessionStorage main hmesha string ki form */
fetchUserWeatherInfo(userCoordinates);
}

//////////* Event Listener on GRANT ACCESS BUTTON *//////////

const grantAccessButton=document.querySelector('[data-grantAccess]');
grantAccessButton.addEventListener("click",getLocation);

////////////////////////////////////////////

let searchInput=document.querySelector('[data-searchInput]');
//apply event listener on form if it submits
searchForm.addEventListener("submit",e=>{
  e.preventDefault();
  const cityName=searchInput.value;
  if(cityName==="")//city name
    return;
  //else or simple donot write anything
  fetchSearchWeatherInfo(cityName);
});



async function fetchSearchWeatherInfo(city){
  grantAccessContainer.classList.remove("active");
loadingScreen.classList.add("active");

userInfoContainer.classList.remove("active");//old weather removed
grantAccessContainer.classList.remove("active");

try{
const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);

if (!response.ok) {
  loadingScreen.classList.remove("active");
  errorContainer.classList.add("active");
  errorMsg.innerText="City Not Found!!";
  goBackBtn.classList.add("active");
  return;
  /* TO STOP FURTHER EXECUTION */
}

const data= await response.json();
loadingScreen.classList.remove("active");
userInfoContainer.classList.add("active");
renderWeatherInfo(data);
}

catch(err){
 /* If a particular Location is not supported then show error */
 loadingScreen.classList.remove("active");
 errorContainer.classList.add("active");
 errorMsg.innerText="Geolocation is Not supported!!";
}
}

goBackBtn.addEventListener("click" , ()=>{
  errorContainer.classList.remove("active");
  errorMsg.innerText="";
  goBackBtn.classList.remove("active");
  getFromSessionStorage();
});
