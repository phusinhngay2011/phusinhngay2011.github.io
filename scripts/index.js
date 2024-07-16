// Path to the JSON file containing image filenames
const imagesJsonPath = "assets/images/Bones/images.json";

// Get references to the HTML elements
const fileListElem = document.getElementById("fileList");
const imageDisplayElem = document.getElementById("imageDisplay");
const numberOfImagesElem = document.getElementById("numberOfImages");

const prevImageBtnElem = document.getElementById("prevImageBtn");
const nextImageBtnElem = document.getElementById("nextImageBtn");

const trueBtnElem = document.getElementById("trueBtn");
const falseBtnElem = document.getElementById("falseBtn");
const downloadBtnElem = document.getElementById("downloadBtn");
const resetBtnElem = document.getElementById("resetBtn");

const trueCountElem = document.getElementById("trueCount");
const falseCountElem = document.getElementById("falseCount");
const unEvaluatedCountElem = document.getElementById("unEvaluatedCount");

var images = [];
var selectedImage = "";
var evaluations = {}; // Object to store evaluations

// Load evaluations from localStorage
function loadEvaluations() {
    const savedEvaluations = localStorage.getItem("evaluations");
    if (savedEvaluations) {
        evaluations = JSON.parse(savedEvaluations);
    }
}

// Save evaluations to localStorage
function saveEvaluations() {
    localStorage.setItem("evaluations", JSON.stringify(evaluations));
}

// Function to handle evaluation buttons
function evaluateImage(evaluation) {
    evaluations[selectedImage] = evaluation;
    // highlightSelectedImage(selectedImage);
    highlightEvaluatedImage(selectedImage, evaluation);
    updateCounts();
    showNextImage();
    saveEvaluations(); // Save evaluations to localStorage
}

// Function to download evaluations as a JSON file
function downloadEvaluations() {
    const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(evaluations));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "evaluations.json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Function to find the index of the current image
function getCurrentImageIndex() {
    return images.indexOf(selectedImage);
}

// Function to show the previous image
function showPrevImage() {
    const currentIndex = getCurrentImageIndex();
    if (currentIndex > 0) {
        displayImage(images[currentIndex - 1]);
    }
}

// Function to show the next image
function showNextImage() {
    const currentIndex = getCurrentImageIndex();
    if (currentIndex < images.length - 1) {
        displayImage(images[currentIndex + 1]);
    }
}

// Function to load the list of filenames
function loadFileList() {
    fetch(imagesJsonPath)
        .then((response) => response.json())
        .then((data) => {
            data.images.forEach((filename) => {
                images.push(filename);
                if (!selectedImage) {
                    selectedImage = filename;
                }
                const listItem = document.createElement("li");
                listItem.textContent = filename;
                listItem.id = `img-${filename}`;
                listItem.addEventListener("click", () => displayImage(filename));
                fileListElem.appendChild(listItem);
            });
            updateNumberOfImages(); // Update number of images after loading
            updateEvaluationsIcons();
            displayImage(selectedImage);
            updateCounts();
        })
        .catch((error) => console.error("Error loading images:", error));
}

// Function to display the selected image
function displayImage(filename) {
    const imagePath = `./assets/images/Bones/visualize-bone/${filename}`;
    imageDisplayElem.src = imagePath;
    selectedImage = filename;
    highlightSelectedImage(filename);
}

// Function to highlight the selected image in the list
function highlightSelectedImage(filename) {
    const listItems = fileListElem.querySelectorAll("li");
    listItems.forEach((item) => {
        if (item.textContent.trim() === filename) {
            item.classList.add("selected");
            item.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            item.classList.remove("selected");
        }
    });
}

// Function to update the number of images displayed
function updateNumberOfImages() {
    numberOfImagesElem.textContent = "(" + String(images.length) + ")";
}

// Function to create and return the True SVG element with the specified color
function createTrueSVG() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.innerHTML = `
        <path d="M20 6L9 17L4 12" stroke="#079455" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
    return svg;
}

// Function to create and return the False SVG element with the specified color
function createFalseSVG() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.innerHTML = `
        <path d="M17 7L7 17M7 7L17 17" stroke="#D92D20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
    return svg;
}

// Function to update the SVG icons based on evaluation
function updateEvaluationsIcons() {
    const listItems = fileListElem.querySelectorAll("li");
    listItems.forEach((item) => {
        const filename = item.textContent.trim();
        item.innerHTML = filename; // Reset innerHTML to remove old icons
        if (evaluations[filename] === "True") {
            item.appendChild(createTrueSVG());
        } else if (evaluations[filename] === "False") {
            item.appendChild(createFalseSVG());
        }
    });
}

// Function to highlight the selected image in the list
function highlightEvaluatedImage(filename, evaluation) {
    const listItems = fileListElem.querySelectorAll("li");
    listItems.forEach((item) => {
        if (item.textContent.trim() === filename) {

            const filename = item.textContent.trim();
            item.innerHTML = filename; // Reset innerHTML to remove old icons
            item.classList.add("selected");
            item.scrollIntoView({ behavior: "smooth", block: "center" });
            if (evaluation === "True") {
                item.appendChild(createTrueSVG());
            }
            else if (evaluation === "False") {
                item.appendChild(createFalseSVG());
            }
        } else {
            item.classList.remove("selected");
        }
    });
}


function updateCounts() {
    const trueCount = Object.values(evaluations).filter(value => value === "True").length;
    const falseCount = Object.values(evaluations).filter(value => value === "False").length;
    const unEvaluatedCount = images.length - trueCount - falseCount;

    trueCountElem.textContent = `Số ảnh đúng: ${trueCount}`;
    falseCountElem.textContent = `Số ảnh sai: ${falseCount}`;
    unEvaluatedCountElem.textContent = `Số ảnh chưa đánh giá: ${unEvaluatedCount}`;
}

// Function to reset all evaluations with confirmation dialog
function resetEvaluations() {
    if (confirm("Bác sĩ có muốn xóa bỏ hết các đánh giá không?")) {
        evaluations = {};
        saveEvaluations();
        updateEvaluationsIcons();
        updateCounts();
        alert("Các đánh giá đã được xóa bỏ.");
    }
}

// Warn the user when they try to close the tab or browser
// window.onbeforeunload = () => {
//     return "Bác sĩ vui lòng tải lại file trước khi tắt trình duyệt";
// };

// Load the file list and evaluations on page load
window.onload = () => {
    loadFileList();
    loadEvaluations();
};

// Add event listeners to the buttons
prevImageBtnElem.addEventListener("click", showPrevImage);
nextImageBtnElem.addEventListener("click", showNextImage);

// Add event listeners to the buttons
trueBtnElem.addEventListener("click", () => evaluateImage("True"));
falseBtnElem.addEventListener("click", () => evaluateImage("False"));
downloadBtnElem.addEventListener("click", downloadEvaluations);
resetBtnElem.addEventListener("click", resetEvaluations);
