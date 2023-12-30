<script>
// @ts-nocheck
import { onDestroy, onMount } from 'svelte';
import { browser } from '$app/environment'
import TreeArea from "./TreeArea.svelte";
    // Dummy function for calling the payment gateway

function callPaymentGateway() {
  // Simulating a successful payment
  return Promise.resolve('success');
}

// Get current time in 12-hour format
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'مساء' : 'صباح';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Global variables
let coins = 0;
let dates = 0;
let interval; // Declare the interval variable here
let palmCount = 1;
let time = getCurrentTime();
let isOpeningModal = true;
let isAuthed = false

let treeAreas = [{ trees: [{ id:1, dpm: 3, date: 0 }] }];

function addTree() {
  if (isAuthed){
    if (coins >= 20) {
    coins -= 20;
    let added = false;

    // Create a new array with the updated tree data
    const updatedTreeAreas = treeAreas.map((area) => {
      if (!added && area.trees.length < 2) {
        // Add a tree to the current area
        added = true;
        let id = area.trees.length
        return {
          ...area,
          trees: [...area.trees, { id, dpm: 3, date: 0 }],
        };
      } else {
        return area;
      }
    });

    // If all areas have two trees, add a new area and add the tree to it
    if (!added) {
      updatedTreeAreas.push({ trees: [{ dpm: 3, date: 0 }] });
    }

    // Update the treeAreas data with the new array
    treeAreas = updatedTreeAreas;
  } else {
    alert("ليس لديك نقود كافية");
  }
 } else {
  isOpeningModal = false; 
  isModalOpen = true
  isLoginMode = true;
}
}



// Update the UI with the current time
function updateCurrentTime() {
  time = getCurrentTime();
}




// Handle selling 40 dates
function sellDates() {
  if (dates >= 40) {
    coins += 20;
    dates -= 40;
  }
}



function harvestDates() {
    for(let i = 0; i < treeAreas.length; i++){
        treeAreas[i].trees.forEach((tree) => {
            tree.date += tree.dpm;
            dates += tree.dpm
        });
    }
    updateData()
    treeAreas = treeAreas.slice(); 
    // this is to trigger Svelte's reactivity
  }






function selldatesButton () {
  if(dates >= 40){
    sellDates();
  } else {
    alert("You don't have enouph dates to sell ");
  }
};


// Event listener for buying extra coins
/**
     * @param {{ preventDefault: () => void; }} event
     */
function buyCoins (event) {
  event.preventDefault(); // Prevent the button from submitting the form
if (isAuthed){
  callPaymentGateway()
    .then(() => {
      // Add coins to the player's balance
      coins += 100;
      alert('Coins purchased successfully!');
    })
    .catch(() => {
      alert('Payment failed. Please try again.');
    });
} else {
  isOpeningModal = false; 
  isModalOpen = true
  isLoginMode = true;
}
};

    let isModalOpen = false;
    let isLoginMode = true;
    let playerName = "";
    let email = "";
    let password = "";
  
    function closeDialog() {
      isModalOpen = false;
    }
  
    function toggleLoginMode() {
      isLoginMode = !isLoginMode;
    }
  
    let error = "";

// Function to store the token in localStorage
function storeAuthToken(token) {
  if(!browser)return;
  localStorage.setItem('authToken', token);
  isAuthed = true;
}

// Function to get the token from localStorage
function getAuthToken() {
  if(!browser)return;
  console.log(localStorage.getItem('authToken'));
  return localStorage.getItem('authToken');
}

async function loginUser() {
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        // Assuming the API returns dates, coins, and a token in the response
        const { dates: onlineDates, coins: onlineCoins, token } = data.body;
        // Store the token in localStorage
        storeAuthToken(token);
        dates += onlineDates;
        coins += onlineCoins;

        updateData()
        isModalOpen = false;
      } else {
        // Login failed, handle the error
        error = "Login failed. Please check your credentials.";
      }
    } catch (err) {
      // Handle network or other errors
      console.error("An error occurred:", err);
      error = "An error occurred. Please try again later.";
    }
  }

  async function register() {
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: playerName, email, password, dates, }),
      });

      const data = await response.json();

      if (response.status === 200) {
        // Assuming the API returns dates, coins, and a token in the response
        const { dates: onlineDates, coins: onlineCoins, token } = data.body;
        // Store the token in localStorage
        storeAuthToken(token);
        dates += onlineDates;
        coins += onlineCoins;

        updateData()
        isModalOpen = false;
      } else {
        // Login failed, handle the error
        error = "Login failed. Please check your credentials.";
      }
    } catch (err) {
      // Handle network or other errors
      console.error("An error occurred:", err);
      error = "An error occurred. Please try again later.";
    }
  }

  async function updateData() {
    try {
      console.log("dates now :", dates);
      let token = getAuthToken()
      const response = await fetch("/update_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"

        },
        body: JSON.stringify({ coins,dates,token }),
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log('updated')

      } else {
        // Login failed, handle the error
        error = "Login failed. Please check your credentials.";
      }
    } catch (err) {
      // Handle network or other errors
      console.error("An error occurred:", err);
      error = "An error occurred. Please try again later.";
    }
  }

  async function retrieveUser() {
    try {
      let token = getAuthToken()
      const response = await fetch("/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        }
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log("Are you getting called a lot ?")
        const { dates: onlineDates, coins: onlineCoins} = data.body;
        // Store the token in localStorage
        dates += onlineDates;
        coins += onlineCoins;        
      } else {
        // Login failed, handle the error
        error = "Login failed. Please check your credentials.";
      }
    } catch (err) {
      // Handle network or other errors
      console.error("An error occurred:", err);
      error = "An error occurred. Please try again later.";
    }
  }

// Check if the user is already logged in (token exists in localStorage)
const authToken = getAuthToken();
if (authToken) {
  // You can use the token to make authenticated requests here
  console.log("Logged in with token:", authToken);
  // Perform actions for logged-in users
}

    function showRegModal(){
      getAuthToken();
    isOpeningModal = false
    isModalOpen = true;
    isLoginMode = false;
}

// function hideStartModal(){
//     startToggle = ! startToggle;
// }
  // Set up the interval when the component is mounted

  // Clean up the interval when the component is unmounted


  onMount(() => {
    async function fetchData() {
        if (getAuthToken()) {
          isModalOpen = false;
          isAuthed = true

            await retrieveUser();
        } else {
          isModalOpen = true;
        }
    }

    fetchData(); // Call the async function

    const interval = setInterval(harvestDates, 10000);
    const timeInterval = setInterval(updateCurrentTime, 60000);

    // Optional: Cleanup function to clear the interval when the component is destroyed
    return () => {
        clearInterval(interval);
        clearInterval(timeInterval);
    };
  });

  $: if (dates > 100 && ! isAuthed) {
    showRegModal();
  }

  onDestroy(() => {
    clearInterval(interval);
  });
  </script>
<body style="background-image: url(img/bg.png)">
    
    <!--header--area--start-->
    <div class="header__area">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="header__wrap">
                        <div class="header__top">
                            <a href="#" type="button" data-bs-toggle="modal" data-bs-target="#exampleModal"><img
                                    src="img/top.png" alt=""></a>
                        </div>
                        <div class="hedaer__box" style="background-image: url(img/top-bg.png)">
                            <div class="profile">
                                <img src="img/profile.png" alt="">
                            </div>
                            <div class="header__box__fx">
                                <div class="box__bt bt1" style="background-image: url(img/top-bt-bg.png)">
                                    <h6>دراهم</h6>
                                    <p>{coins}</p>
                                </div>
                                <div class="box__bt bt1" style="background-image: url(img/top-bt-bg.png)">
                                    <h6>نخل</h6>
                                    <p>{palmCount}</p>
                                </div>
                                <div class="box__bt bt1" style="background-image: url(img/top-bt-bg.png)">
                                    <h6>الساعة</h6>
                                    <p style="font-size: 14px;">{time}</p>
                                </div>
                                <div class="box__bt bt1" style="background-image: url(img/top-bt-bg.png)">
                                    <h6>التمر</h6>
                                    <p>{dates}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!--header--area--end-->
    {#if isModalOpen}
    <div class="fixed inset-0 bg-black opacity-50 z-40"></div>
    <div class="fixed top-0 left-0 w-full h-full flex justify-center items-center modalx ">
        <div class="bg-bc6321 p-8 rounded-lg shadow-xl w-3/4 max-w-xl modal-box ">
          {#if isOpeningModal }
                <p class="text-white text-lg mb-4 ">
                    شايب القرية: شكلك مب غريب علي انت من المزارعين ولا بس جاي تشوف المكان
                </p>
                <div class="flex flex-col space-y-4 ">
                    <button class="bg-white text-bc6321 py-2 px-4 rounded hover:bg-opacity-80 transition " on:click={closeDialog}>
                        جاي اشوف المكان
                    </button>
                    <button class="bg-white text-bc6321 py-2 px-4 rounded hover:bg-opacity-80 transition " on:click={() => { isOpeningModal = false; isLoginMode = true; }}>
                        انا مزارع حالي ماعرفتني 
                    </button>
                </div>
        {:else if isLoginMode }
          <h1 class="text-2xl font-bold mb-4">حي الله مزارعنا دخل بياناتك عشان نوديك لمزرعتك</h1>
          <input type="email" placeholder="بريدك" bind:value={email} class="mb-2 w-full p-2 border rounded">
          <input type="password" placeholder="كلمة السر" bind:value={password} class="mb-4 w-full p-2 border rounded">
          <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" on:click={loginUser}>تفضل</button>
          
          <p class="mt-2 text-custom-text">منتب مزارع؟ يمديك تشري مزرعتك من هنا <button class="text-blue-500 underline" on:click={toggleLoginMode}>اشتر مزرعة</button></p>
        {:else if !isLoginMode}
        <h1 class="text-2xl font-bold mb-4">معروض شراء مزرعة</h1>
        <input type="text" placeholder="اسمك" bind:value={playerName} class="mb-2 w-full p-2 border rounded">
        <input type="email" placeholder="ايميلك" bind:value={email} class="mb-2 w-full p-2 border rounded">
        <input type="password" placeholder="كلمة السر" bind:value={password} class="mb-4 w-full p-2 border rounded">
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" on:click={register}>ارفع طلب</button>
        {/if}
      </div>
    </div>
  {/if}
  
  <style>
    .bg-custom-bg {
      background-color: #bc6321;
    }
  
    .text-custom-text {
      color: #5a7b2b;
    }
  </style>
  
    <!--date--area--start-->
    <div class="date__area">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="date__wrap">
                        <div class="date__innr">

                            <div class="date__box" style="background-image: url(img/date/date-big-bg.png)">
                                
                                {#each treeAreas as area, i (i)}
                                    <TreeArea area={area} />
                                {/each}
                     
                                <div class="boost__wrap">
                                    <div class="boost__fx">
                                        <div class="boost__single__btn"
                                            style="background-image: url(img/t1.png)">
                                            <a href="#">ارفع الانتاج</a>
                                        </div>
                
                                        <div class="boost__single__btn"
                                            style="background-image: url(img/t1.png)">
                                            <p on:click={addTree}>اشتر نخلة</p>
                                        </div>
                                        <div class="boost__single__btn"
                                            style="background-image: url(img/t1.png)">
                                            <p on:click={buyCoins}>اشتر دراهم</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="scroll__line">
                                <div class="scrll__big">
                                    <img src="img/scrl-big.png" alt="">
                                </div>
                                <img class="scrl-smll" src="img/scroll-small.png" alt="">
                            </div>
                        </div>
                        <div class="trading__bt" style="background-image: url(img/date/trading--bt.png)">
                            <a href="Trading Page.html">السوق <br>
                                <span>المركزي</span></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <!--date--area--end-->



    <!-- Button trigger modal -->
    <div class="over__popup">
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="over__box">
                        <div class="over__top">
                            <div class="over__single">
                                <a href="#"><img src="img/setting-page/a1.png" alt=""></a>
                            </div>
                            <div class="over__single">
                                <a href="#"><img src="img/setting-page/a2.png" alt=""></a>
                            </div>
                            <div class="over__single">
                                <a href="#"><img src="img/setting-page/a3.png" alt=""></a>
                            </div>
                        </div>
                        <!-- <div class="over__inner" style="background-image: url(img/setting-page/over-bg.png)">
                            <div class="john_single__box">
                                <div class="john__nmbr">
                                    <span><img src="img/setting-page/1.png" alt=""></span>
                                </div>
                                <div class="john__box" style="background-image: url(img/setting-page/s-bg.png)">
                                    <div class="john__lf">
                                        <h6>JOHN</h6>
                                        <p>PLAYER LEVEL NAME</p>
                                    </div>
                                    <div class="john__ri">
                                        <h5>85000</h5>
                                        <div class="star">
                                            <span><img src="img/setting-page/s1.png" alt=""></span>
                                            <span><img src="img/setting-page/s1.png" alt=""></span>
                                            <span><img src="img/setting-page/s1.png" alt=""></span>
                                            <span><img src="img/setting-page/s1.png" alt=""></span>
                                            <span><img src="img/setting-page/s1.png" alt=""></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="john_single__box">
                                <div class="john__nmbr">
                                    <span><img src="img/setting-page/2.png" alt=""></span>
                                </div>
                                <div class="john__box" style="background-image: url(img/setting-page/s-bg.png)">
                                    <div class="john__lf">
                                        <h6>Anne</h6>
                                        <p>PLAYER LEVEL NAME</p>
                                    </div>
                                    <div class="john__ri">
                                        <h5>60000</h5>
                                        <div class="star">
                                            <span><img src="img/setting-page/s1.png" alt=""></span>
                                            <span><img src="img/setting-page/s1.png" alt=""></span>
                                            <span><img src="img/setting-page/s2.png" alt=""></span>
                                            <span><img src="img/setting-page/s2.png" alt=""></span>
                                            <span><img src="img/setting-page/s2.png" alt=""></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>


  