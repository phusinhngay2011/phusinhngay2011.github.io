
// Path to the JSON file containing image filenames
const imagesJsonPath = "assets/images/Bones/images.json";

// Get references to the HTML elements
const fileListElem = document.getElementById("fileList");
const imageDisplayElem = document.getElementById("imageDisplay");
const numberOfImagesElem = document.getElementById("numberOfImages");

const prevImageBtnElem = document.getElementById("prevImageBtn");
const nextImageBtnElem = document.getElementById("nextImageBtn");
const firstImageBtnElem = document.getElementById("goToFirstImage");
const lastImageBtnElem = document.getElementById("goToLastImage");

const trueBtnElem = document.getElementById("trueBtn");
const falseBtnElem = document.getElementById("falseBtn");
const downloadBtnElem = document.getElementById("downloadBtn");
const resetBtnElem = document.getElementById("resetBtn");

const trueCountElem = document.getElementById("trueCount");
const falseCountElem = document.getElementById("falseCount");
const unEvaluatedCountElem = document.getElementById("unEvaluatedCount");

const editBtnElem = document.getElementById("editButton");
const eraseBtnElem = document.getElementById("eraseButton");

var images = [];
var imagesWithInfo = [];
var selectedImage = "";
var evaluations = {}; // Object to store evaluations
var isEditing = false;
var svgContainer = document.getElementById("canvas");
var temporaryPolygon = { all_vertex_x: [], all_vertex_y: [] };

// Load evaluations from localStorage
function loadEvaluations() {
    const savedEvaluations = localStorage.getItem("evaluations-updated");
    if (savedEvaluations) {
        evaluations = JSON.parse(savedEvaluations);
    }
}

// Save evaluations to localStorage
function saveEvaluations() {
    localStorage.setItem("evaluations-updated", JSON.stringify(evaluations));
}

// Function to handle evaluation buttons
function evaluateImage(evaluation) {
    evaluations[selectedImage] = {
        ...evaluations[selectedImage],
        good: evaluation
    };
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

// Function to show the previous image
function showFirstImage() {
    console.log('Go to first image', images[0]);
    displayImage(images[0]);
}

// Function to show the next image
function showLastImage() {
    console.log('Go to first image', images[images.length - 1]);
    displayImage(images[images.length - 1]);
}

// Function to handle keydown events
function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
        showPrevImage();
    } else if (event.key === "ArrowRight") {
        showNextImage();
    }
}

// Function to load the list of filenames and real sizes
function loadFileList() {
    fetch(imagesJsonPath)
        .then((response) => response.json())
        .then((data) => {
            data.images.forEach((imageData, idx) => {
                const { filename, width, height } = imageData;
                imagesWithInfo.push({ filename, width, height }); // Store filename, width, and height
                images.push(filename);

                if (!selectedImage) {
                    selectedImage = filename;
                }
                console.log(selectedImage);
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
        if (evaluations[filename] && evaluations[filename].good) {
            if (evaluations[filename].good === "True") {
                item.appendChild(createTrueSVG());
            } else if (evaluations[filename].good === "False") {
                item.appendChild(createFalseSVG());
            }
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
    const trueCount = Object.values(evaluations).filter(value => value.good === "True").length;
    const falseCount = Object.values(evaluations).filter(value => value.good === "False").length;
    const unEvaluatedCount = images.length - trueCount - falseCount;

    trueCountElem.textContent = `Số ảnh đúng: ${trueCount}`;
    falseCountElem.textContent = `Số ảnh sai: ${falseCount}`;
    unEvaluatedCountElem.textContent = `Số ảnh chưa đánh giá: ${unEvaluatedCount}`;
}

// Function to reset all evaluations with confirmation dialog
function resetEvaluations() {
    if (confirm("Bác sĩ có muốn xóa bỏ hết các đánh giá không?")) {
        evaluations = {};
        clearPolygons();
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

function imageZoom(imgID, resultID) {
    var img, lens, result, cx, cy;

    result = document.getElementById(resultID);
    /*create lens:*/
    lens = document.createElement("div");
    lens.setAttribute("class", "img-zoom-lens");
    /*insert lens:*/
    imageDisplayElem.parentElement.insertBefore(lens, imageDisplayElem);
    /*calculate the ratio between result DIV and lens:*/
    cx = result.offsetWidth / lens.offsetWidth;
    cy = result.offsetHeight / lens.offsetHeight;

    /*set background properties for the result DIV:*/
    /*execute a function when someone moves the cursor over the image, or the lens:*/
    lens.addEventListener("mousemove", moveLens);
    imageDisplayElem.addEventListener("mousemove", moveLens);
    /*and also for touch screens:*/
    lens.addEventListener("touchmove", moveLens);
    imageDisplayElem.addEventListener("touchmove", moveLens);

    imageDisplayElem.addEventListener("mouseenter", () => {
        document.getElementById('myresult').style.display = 'block';
        document.getElementById('myresult').style.zIndex = '100000';
        document.getElementById('myresult').style.opacity = '1';
    });
    imageDisplayElem.addEventListener("mouseleave", () => {
        document.getElementById('myresult').style.display = 'none';
        document.getElementById('myresult').style.zIndex = '-10';
        document.getElementById('myresult').style.opacity = '0';
    });

    function moveLens(e) {
        var pos, x, y;
        result.style.backgroundImage = "url('" + `./assets/images/Bones/visualize-bone/${selectedImage}` + "')";
        result.style.backgroundSize = (imageDisplayElem.width * cx) + "px " + (imageDisplayElem.height * cy) + "px";
        /*prevent any other actions that may occur when moving over the image:*/
        e.preventDefault();
        /*get the cursor's x and y positions:*/
        pos = getCursorPos(e);
        /*calculate the position of the lens:*/
        x = pos.x - (lens.offsetWidth / 2);
        y = pos.y - (lens.offsetHeight / 2);
        /*prevent the lens from being positioned outside the image:*/
        if (x > imageDisplayElem.width - lens.offsetWidth) { x = imageDisplayElem.width - lens.offsetWidth; }
        if (x < 0) { x = 0; }
        if (y > imageDisplayElem.height - lens.offsetHeight) { y = imageDisplayElem.height - lens.offsetHeight; }
        if (y < 0) { y = 0; }
        /*set the position of the lens:*/
        lens.style.left = x + "px";
        lens.style.top = y + "px";
        /*display what the lens "sees":*/
        result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }

    function getCursorPos(e) {
        var a, x = 0, y = 0;
        e = e || window.event;
        /*get the x and y positions of the image:*/
        a = imageDisplayElem.getBoundingClientRect();
        /*calculate the cursor's x and y coordinates, relative to the image:*/
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /*consider any page scrolling:*/
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x: x, y: y };
    }
}


// Add event listeners
document.getElementById('editButton').addEventListener('click', function () {
    toggleEditing();
});

document.getElementById('eraseButton').addEventListener('click', function () {
    clearPolygons();
    exitEditingMode();
});

svgContainer.addEventListener('click', function (event) {
    if (isEditing) {
        addPoint(event);
    }
});

document.addEventListener('keydown', function (event) {
    if (isEditing) {
        if (event.key === 'Enter') {
            savePolygon();
            saveEvaluations();
            toggleEditing();
        } else if (event.key === 'Escape') {
            cancelEditing();
            toggleEditing();
        }
    }
});

function toggleEditing() {
    isEditing = !isEditing;
    const editButton = document.getElementById('editButton');
    if (isEditing) {
        editButton.classList.add('editing');
        temporaryPolygon = evaluations[selectedImage]?.polygon
            ? { ...evaluations[selectedImage].polygon }
            : { all_vertex_x: [], all_vertex_y: [] }; // Load existing polygon or create new
        enableDrawing();
    } else {
        editButton.classList.remove('editing');
        disableDrawing();
    }
}

function enableDrawing() {
    svgContainer.classList.remove('hidden');
    drawPolygon();
}

function disableDrawing() {
    svgContainer.classList.add('hidden');
    drawPolygon();
}

function clearPolygons() {
    while (svgContainer.firstChild) {
        svgContainer.removeChild(svgContainer.firstChild);
    }
    if (evaluations[selectedImage]) {
        evaluations[selectedImage].polygon = { all_vertex_x: [], all_vertex_y: [] };
    }
    temporaryPolygon = { all_vertex_x: [], all_vertex_y: [] }; // Clear temporary polygon
    drawPolygon();
}

function exitEditingMode() {
    isEditing = false;
    const editButton = document.getElementById('editButton');
    editButton.classList.remove('editing');
}

function exitEditingMode() {
    isEditing = false;
    const editButton = document.getElementById('editButton');
    editButton.classList.remove('editing');
    svgContainer.classList.add('hidden'); // Hide SVG container

    // Clear SVG container if no polygon exists for the selected image
    if (!evaluations[selectedImage]?.polygon || evaluations[selectedImage]?.polygon.all_vertex_x.length === 0) {
        clearPolygons();
    }
}


function addPoint(event) {
    const rect = imageDisplayElem.getBoundingClientRect();
    const imageWidth = imageDisplayElem.naturalWidth;
    const imageHeight = imageDisplayElem.naturalHeight;

    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    temporaryPolygon.all_vertex_x.push(x);
    temporaryPolygon.all_vertex_y.push(y);

    drawPolygon();
}

function savePolygon() {
    if (!evaluations[selectedImage]) {
        evaluations[selectedImage] = {};
    }
    evaluations[selectedImage].polygon = { ...temporaryPolygon };
    saveEvaluations(); // Save evaluations to localStorage
    drawPolygon();
}

function cancelEditing() {
    temporaryPolygon = { all_vertex_x: [], all_vertex_y: [] };
    drawPolygon();
}

function drawPolygon() {
    while (svgContainer.firstChild) {
        svgContainer.removeChild(svgContainer.firstChild);
    }

    const polygonData = isEditing ? temporaryPolygon : evaluations[selectedImage]?.polygon;
    if (!polygonData || polygonData.all_vertex_x.length < 1) return;

    const rect = imageDisplayElem.getBoundingClientRect();
    const imageWidth = imageDisplayElem.naturalWidth;
    const imageHeight = imageDisplayElem.naturalHeight;

    const scaleX = rect.width / imageWidth;
    const scaleY = rect.height / imageHeight;

    const scaledPoints = polygonData.all_vertex_x.map((x, i) => ({
        x: x * scaleX,
        y: polygonData.all_vertex_y[i] * scaleY
    }));

    const pointsString = scaledPoints.map(point => `${point.x},${point.y}`).join(" ");

    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", pointsString);
    polygon.setAttribute("stroke", "red");
    polygon.setAttribute("stroke-width", "2");
    polygon.setAttribute("fill", "none");
    svgContainer.appendChild(polygon);

    scaledPoints.forEach(point => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        circle.setAttribute("r", "4");
        circle.setAttribute("fill", "blue");
        svgContainer.appendChild(circle);
    });
}


// Function to display the selected image
function displayImage(filename) {
    console.log("filename: " + filename);
    selectedImage = filename;
    const imagePath = `./assets/images/Bones/visualize-bone/${filename}`;
    const imageDisplayElem = document.getElementById('imageDisplay');
    imageDisplayElem.src = imagePath;
    imageDisplayElem.style.display = 'block';
    if (evaluations[selectedImage] && evaluations[selectedImage].polygon) {
        temporaryPolygon = { ...evaluations[selectedImage].polygon };
    } else {
        temporaryPolygon = { all_vertex_x: [], all_vertex_y: [] };
    }

    drawPolygon();
    highlightSelectedImage(filename);
}

// Function to synchronize canvas width with imageDisplay width
function synchronizeCanvasWidth() {
    // Get the computed width of imageDisplay
    const imageWidth = document.getElementById('imageDisplay').clientWidth;

    // Set canvas width to match imageDisplay width
    document.getElementById('canvas').setAttribute('width', imageWidth);
}

// Function to start redrawing the polygon at regular intervals
function startRedrawing() {
    // Redraw the polygon initially
    drawPolygon();

    // Set interval to redraw every 100 milliseconds
    setInterval(drawPolygon, 100);
}

updateCounts()
// Call startRedrawing when you want to start the redrawing process
startRedrawing();

// Load the file list and evaluations on page load
window.onload = () => {
    loadFileList();
    loadEvaluations();
    synchronizeCanvasWidth();
};

// Add event listeners to the buttons
prevImageBtnElem.addEventListener("click", showPrevImage);
nextImageBtnElem.addEventListener("click", showNextImage);
firstImageBtnElem.addEventListener("click", showFirstImage);
lastImageBtnElem.addEventListener("click", showLastImage);

// Add event listeners to the buttons
trueBtnElem.addEventListener("click", () => evaluateImage("True"));
falseBtnElem.addEventListener("click", () => evaluateImage("False"));
downloadBtnElem.addEventListener("click", downloadEvaluations);
resetBtnElem.addEventListener("click", resetEvaluations);

// Adding event listeners to the document for keydown events
document.addEventListener("keydown", handleKeyDown);

window.addEventListener('resize', synchronizeCanvasWidth);
imageZoom("imageDisplay", "myresult");
