<script>
// @ts-nocheck
import {
    onDestroy,
    onMount
} from 'svelte';
import {
    browser
} from '$app/environment'
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

let treeAreas = [{
    trees: [{
        id: 1,
        dpm: 3,
        date: 0
    }]
}];

async function addTree(skipCoinsCheck = false) {
    if (isAuthed) {
        if (coins >= 20 || skipCoinsCheck) {
            coins -= 20;
            let added = false;
            console.log(skipCoinsCheck);
            if (!skipCoinsCheck) {
                await add_tree_request()
            }
            // Create a new array with the updated tree data
            const updatedTreeAreas = treeAreas.map((area) => {
                if (!added && area.trees.length < 2) {
                    // Add a tree to the current area
                    added = true;
                    let id = area.trees.length
                    return {
                        ...area,
                        trees: [...area.trees, {
                            id,
                            dpm: 3,
                            date: 0
                        }],
                    };
                } else {
                    return area;
                }
            });

            // If all areas have two trees, add a new area and add the tree to it
            if (!added) {
                updatedTreeAreas.push({
                    trees: [{
                        dpm: 3,
                        date: 0
                    }]
                });
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
function sellDates(dates_number) {
    if (dates >= dates_number) {
        coins += dates_number / 2;
        dates -= dates_number;
        hideMarketModal();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        updateData();
    }
}

function harvestDates() {
    for (let i = 0; i < treeAreas.length; i++) {
        treeAreas[i].trees.forEach((tree) => {
            tree.date += tree.dpm;
        });
    }
    treeAreas = treeAreas.slice();
    // this is to trigger Svelte's reactivity
}

function collectDates(areaId, treeId) {
    let tree = treeAreas[areaId].trees[treeId];
    dates += tree.date;
    tree.date = 0;
    updateData()
    treeAreas = treeAreas.slice();
}

let isMarketModalOpen = false;

function showMarketModal() {
    isMarketModalOpen = true;
}

function hideMarketModal() {
    isMarketModalOpen = false;
}

// Event listener for buying extra coins
/**
 * @param {{ preventDefault: () => void; }} event
 */
function buyCoins(event) {
    event.preventDefault(); // Prevent the button from submitting the form
    if (isAuthed) {
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
let isLoading = true;
let isStatsModalOpen = false;
let workerPercent = 0;
let lastDatesNumber = 0;

function closeDialog() {
    isModalOpen = false;
}

function toggleLoginMode() {
    isLoginMode = !isLoginMode;
}

let error = "";

// Function to store the token in localStorage
function storeAuthToken(token) {
    if (!browser) return;
    localStorage.setItem('authToken', token);
    isAuthed = true;
}

function removeAuthToken() {
    if (!browser) return;
    localStorage.removeItem('authToken');
    isAuthed = false;
}
// Function to get the token from localStorage
function getAuthToken() {
    if (!browser) return;
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
            body: JSON.stringify({
                email,
                password
            }),
        });

        const data = await response.json();
        if (response.status === 200) {
            // Assuming the API returns dates, coins, and a token in the response
            const {
                dates: onlineDates,
                coins: onlineCoins,
                token
            } = data.body;
            // Store the token in localStorage
            storeAuthToken(token);
            dates += onlineDates;
            coins += onlineCoins;

            updateData()
            isModalOpen = false;
            await updateDateOverTime();
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
            body: JSON.stringify({
                name: playerName,
                email,
                password,
                dates,
            }),
        });

        const data = await response.json();

        if (response.status === 200) {
            // Assuming the API returns dates, coins, and a token in the response
            const {
                dates: onlineDates,
                coins: onlineCoins,
                token
            } = data.body;
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

async function add_tree_request() {
    try {
        let token = getAuthToken()
        const response = await fetch("/trees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
            },
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

async function updateData() {
    try {
        console.log("dates now :", dates);
        let token = getAuthToken()
        const response = await fetch("/update_data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"

            },
            body: JSON.stringify({
                coins,
                dates,
                token
            }),
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

async function updateDateOverTime() {
    try {
        let token = getAuthToken()
        const response = await fetch("/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token
            }
        });

        const data = await response.json();

        if (response.status === 200) {
            workerPercent = data.body.worker_percentage;
            lastDatesNumber = data.body.dates_before;
            dates = data.body.dates_after;

            if (dates - lastDatesNumber > 20) {
              isStatsModalOpen = true;
            }

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

        if (data.status === 200) {
            const {
                dates: onlineDates,
                coins: onlineCoins
            } = data.body;
            // Store the token in localStorage
            dates += onlineDates;
            coins += onlineCoins;
            let no_trees = data.body.palms.length;
            for (let i = 1; i < no_trees; i++) {
                addTree(true);
            }

        } else {
            // Login failed, handle the error
            console.log("im here");
            await removeAuthToken() 
            isModalOpen = true;
            error = "Login failed. Please check your credentials.";
        }
    } catch (err) {
        // Handle network or other errors
        console.error("An error occurred:", err);
        error = "An error occurred. Please try again later.";
    }
}

function showRegModal() {
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
            await updateDateOverTime();
            isLoading = false;
        } else {
            isModalOpen = true;
            isLoading = false;
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

$: if (dates > 100 && !isAuthed) {
    showRegModal();
}

onDestroy(() => {
    clearInterval(interval);
});
</script>
<body style="background-image: url(img/bg.png)">
  {#if isLoading}
  <p> I'm loading </p>
  {:else}
    <!--header--area--start-->
    <div class="header__area">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="header__wrap">
                        <!-- <div class="header__top">
                            <a href="#" type="button" data-bs-toggle="modal" data-bs-target="#exampleModal"><img
                                    src="img/top.png" alt=""></a>
                        </div> -->
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
    <div id="MarketModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" dir="rtl">
      <div class="bg-[#d9a66c] rounded-lg p-8 max-w-md w-full" style="background-image: url(img/date/date-big-bg.png);">
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
        <h2 class="text-2xl text-white font-bold">حي الله مزارعنا دخل بياناتك عشان نوديك لمزرعتك</h2>

          <div class="flex flex-col mb-6">
            <label class="text-white mb-2">البريد الإلكتروني</label>
            <input type="email" placeholder="بريدك"  bind:value={email} class="flex h-10 w-full border border-input text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-[#a76d4d] px-4 py-2 rounded-lg shadow-md" />
          </div>
          <div class="flex flex-col mb-6">
            <label class="text-white mb-2">كلمة السر</label>
            <input
              class="flex h-10 w-full border border-input text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-[#a76d4d] px-4 py-2 rounded-lg shadow-md"
              type="password"
              bind:value={password}
            />
          </div>
        
          <button on:click={loginUser} class="items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-[#f4b25f] text-white px-8 py-3 rounded-lg shadow-md mx-auto block">
            توجه لمزرعتك
          </button>
          
          <p class="text-white text-center mt-4 text-xs">
            منتب مزارع؟ يمديك تشري مزرعتك من هنا
            <span class="inline text-blue-500 underline " on:click={toggleLoginMode}>
              اشتر مزرعة
            </span>
          </p>
        {:else if !isLoginMode}
        <h2 class="text-2xl text-white font-bold">معروض شراء مزرعة</h2>
        <div class="flex flex-col mb-6">
          <label class="text-white mb-2">أسمك</label>
          <input placeholder="أسمك"  bind:value={playerName} class="flex h-10 w-full border border-input text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-[#a76d4d] px-4 py-2 rounded-lg shadow-md" />
        </div>
            <div class="flex flex-col mb-6">
            <label class="text-white mb-2">البريد الإلكتروني</label>
            <input type="email" placeholder="بريدك"  bind:value={email} class="flex h-10 w-full border border-input text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-[#a76d4d] px-4 py-2 rounded-lg shadow-md" />
          </div>
          <div class="flex flex-col mb-6">
            <label class="text-white mb-2">كلمة السر</label>
            <input
              class="flex h-10 w-full border border-input text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-[#a76d4d] px-4 py-2 rounded-lg shadow-md"
              type="password"
              bind:value={password}
            />
          </div>
          <button on:click={register} class="items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-[#f4b25f] text-white px-8 py-3 rounded-lg shadow-md mx-auto block">
            ارفع طلب
          </button>
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
                                    <TreeArea area={area} collectFn={collectDates} idx={i} />
                                {/each}

                                <div class="boost__wrap">
                                    <div class="boost__fx">
                                        <div class="boost__single__btn"
                                            style="background-image: url(img/t1.png)">
                                            <a href="#">ارفع الانتاج</a>
                                        </div>

                                        <div class="boost__single__btn"
                                            style="background-image: url(img/t1.png)">
                                            <p on:click={() => addTree()}>اشتر نخلة</p>
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
                        <div on:click={showMarketModal} class="trading__bt" style="background-image: url(img/date/trading--bt.png)">
                          <span class="text-white">
                            السوق <br>
                               المركزي
                            </span>
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
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!--- Trade markets modal-->
      {#if isMarketModalOpen}
        <div id="MarketModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div class="bg-[#d9a66c] rounded-lg p-8 max-w-md w-full" style="background-image: url(img/date/date-big-bg.png);">
            <h2 class="text-2xl text-white font-bold">السوق المركزي</h2>


              <div  class="flex justify-between items-center mb-6">
                <button on:click={() => sellDates(50)}
                      class="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-[#f4b25f] text-white py-2 px-4 rounded-lg shadow-md">
                      كرتون صغير (٥٠ تمرة)
                      </button>
                      <button on:click={() => sellDates(100)}
                      class="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-[#f4b25f] text-white py-2 px-4 rounded-lg shadow-md">
                      كرتون وسط (١٠٠ تمرة)

                      </button>
                      <button on:click={() => sellDates(200)} class="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-[#f4b25f] text-white py-2 px-4 rounded-lg shadow-md">
                        كرتون كبير (٢٠٠ تمرة)
                      </button></div>

                  <button on:click={hideMarketModal} id="hideModal" class="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-[#f4b25f] text-white py-2 px-4 rounded-lg shadow-md w-full">
                      المزرعة
                  </button>
                </div>
            </div>
      {/if}

      {#if isStatsModalOpen}
      <div id="MarketModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" dir="rtl">
        <div class="bg-[#d9a66c] rounded-lg p-8 max-w-md w-full" style="background-image: url(img/date/date-big-bg.png);">
          <h2 class="text-2xl text-white font-bold">تحديث المزرعة</h2>
          <p class="text-white"> هلا بمزارعنا في فترة غيابك المزرعة كانت تنتج والعمال جمعوا محصول زيادة وهذا التحديث الحالي:</p>
        
        <div class="flex justify-between items-center mb-6">
          <div class="bg-[#f4b25f] p-6 rounded-lg shadow-md">
            <div class="flex flex-col items-center">
              <span class="text-white font-bold text-3xl animate-pulse">{lastDatesNumber}</span>
              <span class="text-white">محصولك اخر مرة</span>
            </div>
          </div>
          <div class="bg-[#f4b25f] p-6 rounded-lg shadow-md">
            <div class="flex flex-col items-center">
              <span class="text-white font-bold text-3xl animate-pulse">{dates}</span>
              <span class="text-white">محصولك الحالي</span>
            </div>
          </div>
        </div>
        <div class="bg-[#f4b25f] p-6 rounded-lg shadow-md mb-6">
          <div class="flex flex-col items-center">
            <span class="text-white font-bold text-3xl animate-pulse">تمرة {workerPercent} </span>
            <span class="text-white">رسوم العامل</span>
          </div>
        </div>
                <button on:click={() => {isStatsModalOpen = false}} id="hideModal" class="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-[#f4b25f] text-white py-2 px-4 rounded-lg shadow-md w-full">
                    المزرعة
                </button>
        </div>
      </div>
    {/if}
  </div>
    {/if}
</body>
