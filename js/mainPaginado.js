var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

var cambiarImg = false,
    nombrePdf,
    urlImagen,
    imagen;

// Segundo libreria
var pdfDocumento,
    pagesDocumento,
    pdfBytes;


document.querySelector('#pdfFile').addEventListener('change', () => {

    let pdfFile = document.querySelector('#pdfFile').files[0];


    if (pdfFile == undefined || pdfFile.type != 'application/pdf') {

        console.log("Error");
        document.querySelector('.carga').style.display = "flex";
        document.querySelector('.pdf').style.display = "none";

    } else {

        let pdfFileURL = URL.createObjectURL(pdfFile);
        // document.getElementById('visaPrevia').setAttribute('data', pdfFileURL);

        nombrePdf = pdfFile.name;

        pdfjsLib.getDocument(pdfFileURL).promise.then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('page_count').textContent = pdfDoc.numPages;

            // Initial/first page rendering            
            renderPage(pageNum);
        });

        IniciarPdf(pdfFileURL);

        document.querySelector('.carga').style.display = "none";
        document.querySelector('.pdf').style.display = "flex";
    }
});


/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    // Update page counters
    document.getElementById('page_num').textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

document.getElementById('next').addEventListener('click', onNextPage);



document.getElementById('first').addEventListener('click', function () {

    pageNum = 1;
    queueRenderPage(pageNum);

});

document.getElementById('last').addEventListener('click', function () {

    let lastPage = pdfDoc.numPages;
    queueRenderPage(lastPage);
    pageNum = lastPage;
});


document.querySelector('#imagen').addEventListener('change', () => {

    imagen = document.querySelector('#imagen').files[0];

    if (imagen != undefined) {

        cambiarImg = true;
        urlImagen = URL.createObjectURL(imagen);
        document.body.style.cursor = `url(${urlImagen}), crosshair`;
    } else {
        cambiarImg = false;
        document.body.style.cursor = 'default';
    }

});


function relMouseCoords(event) {

    var x = event.offsetX;
    var y = event.offsetY;

    console.log(x, y);

    if (cambiarImg) {

        // let imagen = document.querySelector('#imagen').files[0];
        // let urlImagen = URL.createObjectURL(imagen);
        var img = new Image();
        img.src = urlImagen;

        img.onload = function () {
            ctx.drawImage(img, x, y);
            ctx.save();
            ModificarPdf(urlImagen, pageNum, x, y, this.height);
        }

    }
}

document.querySelector('#descarga').addEventListener("click", async function () {
    // only jpeg is supported by jsPDF
    // if (canvas.width > canvas.height) {
    //     pdf = new jsPDF('l', 'mm', [canvas.width, canvas.height]);
    // }
    // else {
    //     pdf = new jsPDF('p', 'mm', [canvas.height, canvas.width]);
    // }
    // var pdf = new jsPDF();

    // pdf.addImage(canvas, 'JPEG', 0, 0);
    // pdf.save("download.pdf");

    // Trigger the browser to download the PDF document
    pdfBytes = await pdfDocumento.save();

    download(pdfBytes, nombrePdf, "application/pdf");
    // window.location.reload();

});



async function IniciarPdf(url) {

    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

    pdfDocumento = await PDFLib.PDFDocument.load(existingPdfBytes)
    pagesDocumento = pdfDocumento.getPages()
}

async function ModificarPdf(urlImg, numeroPage, positionX, positionY, imgHeight) {

    let imageBytes = await fetch(urlImg).then((res) => res.arrayBuffer());
    let pageToModifi = pagesDocumento[numeroPage - 1];
    let typeImage;

    if (imagen.type == 'image/png') {
        typeImage = await pdfDocumento.embedPng(imageBytes);
    } else if (imagen.type == 'image/jpeg') {
        typeImage = await pdfDocumento.embedJpg(imageBytes);
    } else {
        return;
    }

    let imageDims = typeImage.scale(1);

    pageToModifi.drawImage(typeImage, {
        x: positionX,
        y: (pageToModifi.getHeight() - positionY) - imgHeight,
        width: imageDims.width,
        height: imageDims.height,
    })


}
