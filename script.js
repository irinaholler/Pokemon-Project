// script.js

// Wait for the DOM to load before running the script
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const warningDiv = document.getElementById("warning");
  const pokemonCard = document.getElementById("pokemon-card");
  const suggestionsDiv = document.getElementById("suggestions");
  const loadingDiv = document.getElementById("loading");

  let pokemonList = [];

  // Fetch all Pokémon names on page load for suggestions
  fetch("https://pokeapi.co/api/v2/pokemon?limit=1000")
    .then((response) => response.json())
    .then((data) => {
      pokemonList = data.results.map((pokemon) => pokemon.name);
      console.log("Pokémon list loaded:", pokemonList.length, "entries");
    })
    .catch((error) => {
      console.error("Error fetching Pokémon list:", error);
      warningDiv.textContent =
        "Failed to load Pokémon list. Please try again later.";
    });

  // Event listener for search button
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    console.log("Search query:", query);
    if (query === "") {
      warningDiv.textContent = "Please enter a Pokémon name.";
      pokemonCard.innerHTML = "";
      pokemonCard.style.display = "none"; // Hide the card if input is empty
    } else {
      warningDiv.textContent = "";
      fetchPokemon(query);
      suggestionsDiv.innerHTML = "";
    }
    // Clear the input field after finding the match
    searchInput.value = "";
  });

  // Function to fetch Pokémon data
  function fetchPokemon(name) {
    console.log("Fetching Pokémon:", name);
    // Show the loading spinner
    loadingDiv.style.display = "block";
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Pokémon not found");
        }
        return response.json();
      })
      .then((data) => {
        loadingDiv.style.display = "none"; // Hide spinner
        displayPokemon(data);
      })
      .catch((error) => {
        loadingDiv.style.display = "none"; // Hide spinner
        warningDiv.textContent = "Pokémon not found. Please try another name.";
        pokemonCard.innerHTML = "";
        pokemonCard.style.display = "none"; // Hide the card if Pokémon not found
        console.error("Error fetching Pokémon:", error);
      });
  }

  // Function to display Pokémon data
  function displayPokemon(pokemon) {
    console.log("Displaying Pokémon:", pokemon.name);
    const { name, sprites, stats, abilities } = pokemon;
    const image = sprites.front_default || "https://via.placeholder.com/150";

    // Create HTML structure for the card with a close button
    pokemonCard.innerHTML = `
        <div class="card-header">
          <h2>${capitalize(name)}</h2>
          <span class="close-button">&times;</span>
        </div>
        <img src="${image}" alt="${name}">
        <div class="stats">
          <h3>Stats</h3>
          <ul>
            ${stats
              .map(
                (stat) =>
                  `<li>${capitalize(stat.stat.name)}: ${stat.base_stat}</li>`
              )
              .join("")}
          </ul>
        </div>
        <div class="abilities">
          <h3>Abilities</h3>
          <ul>
            ${abilities
              .map((ability) => `<li>${capitalize(ability.ability.name)}</li>`)
              .join("")}
          </ul>
        </div>
      `;

    // Display the card
    pokemonCard.style.display = "block";

    // Add event listener to the close button
    const closeButton = pokemonCard.querySelector(".close-button");
    closeButton.addEventListener("click", () => {
      pokemonCard.style.display = "none";
      pokemonCard.innerHTML = "";
    });
  }

  // Event listener for input field to show suggestions
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length === 0) {
      suggestionsDiv.innerHTML = "";
      return;
    }

    const filtered = pokemonList
      .filter((name) => name.startsWith(query))
      .slice(0, 10);
    suggestionsDiv.innerHTML = filtered
      .map((name) => `<div>${capitalize(name)}</div>`)
      .join("");

    // Add click event to suggestions
    const suggestionItems = suggestionsDiv.querySelectorAll("div");
    suggestionItems.forEach((item) => {
      item.addEventListener("click", () => {
        searchInput.value = item.textContent.toLowerCase(); // Set to lowercase for API consistency
        suggestionsDiv.innerHTML = "";
        searchButton.click();
      });
    });
  });

  // Utility function to capitalize first letter
  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
});
