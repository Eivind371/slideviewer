// PDF.js setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Sample slides data
let slides = [
    {
        title: "Slide 1",
        content: "Welcome to the Slide Viewer"
    },
    {
        title: "Slide 2",
        content: "Upload your PowerPoint presentation to get started"
    },
    {
        title: "Slide 3",
        content: "Use the navigation buttons to move between slides"
    }
];

let currentSlideIndex = 0;
let currentPDF = null;

// DOM Elements
const slideElement = document.getElementById('slide');
const currentSlideSpan = document.getElementById('currentSlide');
const totalSlidesSpan = document.getElementById('totalSlides');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const fileInput = document.getElementById('fileInput');
const pdfCanvas = document.getElementById('pdfCanvas');
const fileInfo = document.getElementById('fileInfo');

// Initialize
function init() {
    totalSlidesSpan.textContent = slides.length;
    displaySlide();
    updateButtons();
}

// Display current slide
function displaySlide() {
    const slide = slides[currentSlideIndex];
    currentSlideSpan.textContent = currentSlideIndex + 1;
    
    if (currentPDF) {
        // Display PDF page
        renderPDFPage(currentSlideIndex + 1);
    } else {
        // Display text slide
        slideElement.style.display = 'flex';
        slideElement.innerHTML = `
            <h1>${slide.title}</h1>
            <p>${slide.content}</p>
        `;
    }
}

// Render PDF page
async function renderPDFPage(pageNum) {
    try {
        slideElement.style.display = 'none';
        const page = await currentPDF.getPage(pageNum);
        const scale = 2;
        const viewport = page.getViewport({ scale: scale });
        const context = pdfCanvas.getContext('2d');
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;
        pdfCanvas.style.display = 'block';

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
    } catch (error) {
        console.error('Error rendering PDF page:', error);
    }
}

// Update button states
function updateButtons() {
    prevBtn.disabled = currentSlideIndex === 0;
    nextBtn.disabled = currentSlideIndex === (currentPDF ? currentPDF.numPages : slides.length) - 1;
}

// Navigation functions
function nextSlide() {
    const totalPages = currentPDF ? currentPDF.numPages : slides.length;
    if (currentSlideIndex < totalPages - 1) {
        currentSlideIndex++;
        displaySlide();
        updateButtons();
    }
}

function prevSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        displaySlide();
        updateButtons();
    }
}

// Event listeners
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});

// File upload handler
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
        // Handle PDF files
        try {
            const fileReader = new FileReader();
            fileReader.onload = async (event) => {
                const typedarray = new Uint8Array(event.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                currentPDF = pdf;
                currentSlideIndex = 0;
                totalSlidesSpan.textContent = pdf.numPages;
                fileInfo.textContent = `PDF loaded: ${pdf.numPages} pages`;
                displaySlide();
                updateButtons();
            };
            fileReader.readAsArrayBuffer(file);
        } catch (error) {
            alert('Error loading PDF: ' + error.message);
            fileInfo.textContent = '';
        }
    } else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
        alert('PowerPoint support requires a server-side conversion or the pptxjs library.\n\nTip: Convert to PDF for full support!');
        fileInfo.textContent = 'Please convert PowerPoint to PDF';
    } else if (fileName.endsWith('.odp')) {
        alert('ODP files require a specialized library.\n\nTip: Export as PDF for easier viewing!');
        fileInfo.textContent = 'Please export ODP as PDF';
    } else {
        alert('Please upload a PDF file (.pdf)');
        fileInfo.textContent = '';
    }
});

// Initialize on page load
init();
