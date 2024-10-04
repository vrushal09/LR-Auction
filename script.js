// Firebase setup
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "lr-auction.firebaseapp.com",
    databaseURL: "https://lr-auction-default-rtdb.firebaseio.com",
    projectId: "lr-auction",
    storageBucket: "lr-auction.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Hardcoded Admin Login
const adminUsername = "admin";
const adminPassword = "admin";

// Admin Login Handler
const adminLoginForm = document.getElementById("admin-login-form");
const dashboard = document.getElementById("admin-dashboard");
const errorMessage = document.getElementById("error-message");
const addPlayerForm = document.getElementById("add-player-form");
const playerListTable = document.querySelector("#player-list tbody");
const goToPlayersButton = document.getElementById("go-to-players");

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function (event) {
        event.preventDefault();  // Prevent form submission

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Check credentials
        if (username === adminUsername && password === adminPassword) {
            document.querySelector(".container").classList.add("hidden");  // Hide login
            dashboard.classList.remove("hidden");  // Show dashboard
            renderAdminPlayers();  // Load admin player management section
        } else {
            errorMessage.textContent = "Invalid username or password!";
        }
    });
}

// Load players from Firebase or sample data
const playersRef = database.ref('players');

playersRef.on('value', (snapshot) => {
    const players = snapshot.val() || [];
    renderAdminPlayers(players);
});

// Redirect to players.html
if (goToPlayersButton) {
    goToPlayersButton.addEventListener("click", function () {
        window.location.href = "player.html";
    });
}

// Add Player Handler
if (addPlayerForm) {
    addPlayerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const playerName = document.getElementById("player-name").value;
        const playerRole = document.getElementById("player-role").value;
        const basePrice = parseFloat(document.getElementById("base-price").value);

        const player = {
            id: Date.now(),
            name: playerName,
            role: playerRole,
            basePrice: basePrice,
            highestBid: basePrice,
            highestBidder: "-"
        };

        playersRef.push(player); // Add player to Firebase
        addPlayerForm.reset(); // Reset form fields
    });
}

// Render players in admin dashboard
function renderAdminPlayers(players) {
    playerListTable.innerHTML = "";
    Object.keys(players).forEach((key) => {
        const player = players[key];
        const row = `
            <tr>
                <td>${player.name}</td>
                <td>${player.role}</td>
                <td>${player.basePrice}</td>
                <td><button onclick="removePlayer('${key}')">Delete</button></td>
            </tr>
        `;
        playerListTable.innerHTML += row;
    });
}

// Remove Player
function removePlayer(playerId) {
    const playerRef = database.ref(`players/${playerId}`);
    playerRef.remove(); // Remove player from Firebase
}

// Logout Admin
function logout() {
    document.querySelector(".container").classList.remove("hidden");
    dashboard.classList.add("hidden");
}

// Public Auction Rendering
const auctionListTable = document.querySelector("#auction-list tbody");

function renderAuctionPlayers(players) {
    auctionListTable.innerHTML = "";
    Object.keys(players).forEach((key) => {
        const player = players[key];
        const row = `
            <tr>
                <td>${player.name}</td>
                <td>${player.role}</td>
                <td>${player.basePrice}</td>
                <td id="highestBid-${key}">${player.highestBid}</td>
                <td id="highestBidder-${key}">${player.highestBidder}</td>
                <td>
                    <button class="bid-btn" onclick="updateBid('${key}', -50)">-50</button>
                    <button class="bid-btn" onclick="updateBid('${key}', 50)">+50</button>
                </td>
            </tr>
        `;
        auctionListTable.innerHTML += row;
    });
}

// Update bid for public auction
function updateBid(playerId, change) {
    const playerRef = database.ref(`players/${playerId}`);
    playerRef.once('value').then((snapshot) => {
        let player = snapshot.val();
        let newBid = player.highestBid + change;

        // Ensure the bid stays within the allowed range
        if (newBid >= player.basePrice && newBid <= 10000) {
            playerRef.update({
                highestBid: newBid,
                highestBidder: "Current User" // Modify to reflect actual bidder
            });
        } else {
            alert("Bid must be between the base price and 10000 points.");
        }
    });
}

// Render auction players on page load
if (auctionListTable) {
    playersRef.on('value', (snapshot) => {
        const players = snapshot.val() || {};
        renderAuctionPlayers(players);
    });
}

// Player List on player.html
const playerListPageTable = document.querySelector("#player-list-page tbody");

function renderPlayerListPage(players) {
    playerListPageTable.innerHTML = "";
    Object.keys(players).forEach((key) => {
        const player = players[key];
        const row = `
            <tr>
                <td>${player.name}</td>
                <td>${player.role}</td>
                <td>${player.basePrice}</td>
                <td id="highestBid-${key}">${player.highestBid}</td>
                <td id="highestBidder-${key}">${player.highestBidder}</td>
                <td>
                    <button class="bid-btn" onclick="updateBid('${key}', -50)">-50</button>
                    <button class="bid-btn" onclick="updateBid('${key}', 50)">+50</button>
                </td>
            </tr>
        `;
        playerListPageTable.innerHTML += row;
    });
}

// Render player list on player.html page load
if (playerListPageTable) {
    playersRef.on('value', (snapshot) => {
        const players = snapshot.val() || {};
        renderPlayerListPage(players);
    });
}

// Bids Overview on bid.html
const bidListTable = document.querySelector("#bid-list tbody");

function renderBidList(players) {
    if (bidListTable) {
        bidListTable.innerHTML = ""; // Clear existing content
        Object.keys(players).forEach((key) => {
            const player = players[key];
            const row = `
                <tr>
                    <td>${player.name}</td>
                    <td>${player.role}</td>
                    <td>${player.highestBid > 0 ? player.highestBid : "No bids yet"}</td>
                    <td>${player.highestBidder || "None"}</td>
                </tr>
            `;
            bidListTable.innerHTML += row;
        });
    }
}

// Render bid list on bid.html page load
if (bidListTable) {
    playersRef.on('value', (snapshot) => {
        const players = snapshot.val() || {};
        renderBidList(players);
    });
}
