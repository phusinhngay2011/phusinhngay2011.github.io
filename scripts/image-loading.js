// Wait for the page to load
document.addEventListener('DOMContentLoaded', function () {
    const image = document.getElementById('imageDisplay');
    const spinner = document.getElementById('loader');

    // When the image finishes loading, hide the spinner
    image.addEventListener('load', function () {
        spinner.style.display = 'none';
        image.style.display = 'block'; // Show the image
    });

    // If there's an error loading the image, handle it
    image.addEventListener('error', function () {
        spinner.style.display = 'none';
        // Optionally, display an error message or retry loading
    });

    // Show the spinner initially (optional)
    spinner.style.display = 'block';
});
