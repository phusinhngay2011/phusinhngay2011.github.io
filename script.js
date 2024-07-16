// Path to the JSON file containing image filenames
const imagesJsonPath = "assets/images/Bones/images.json";

// Get references to the HTML elements
const fileListElem = document.getElementById("fileList");
const imageDisplayElem = document.getElementById("imageDisplay");
const numberOfImagesElem = document.getElementById("numberOfImages");

var images = [];
var selectedImage = "";

// Function to load the list of filenames
function loadFileList() {
    fetch(imagesJsonPath)
        .then((response) => response.json())
        .then((data) => {
            data.images.forEach((filename) => {
                images.push(filename);
                const listItem = document.createElement("li");
                listItem.textContent = filename;
                listItem.addEventListener("click", () => displayImage(filename));
                fileListElem.appendChild(listItem);
            });
            updateNumberOfImages(); // Update number of images after loading
        })
        .catch((error) => console.error("Error loading images:", error));
}

// Function to display the selected image
function displayImage(filename) {
    const imagePath = `assets/images/bones/visualize-bone/${filename}`;
    imageDisplayElem.src = imagePath;
}
// Function to update the number of images displayed
function updateNumberOfImages() {
    numberOfImagesElem.textContent = "(" + String(images.length) + ")";
}
// Load the file list on page load
window.onload = loadFileList;

console.log("Images length: ", images.length);
console.log("Images: ", images);
