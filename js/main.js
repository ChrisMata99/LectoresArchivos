var pdfDoc = null,
    pageRendering = false,
    scale = 1,
    ctxActual;

var nombrePdf;

var cambiarImg = false,
    urlImagen,
    imagen;

// Segundo libreria
var pdfDocumento, pagesDocumento, pdfBytes;


document.querySelector('#pdfFile').addEventListener('change', () => {

    let pdfFile = document.querySelector('#pdfFile').files[0];

    if (pdfFile == undefined || pdfFile.type != 'application/pdf') {

        console.log("Error");
        document.querySelector('.carga').style.display = "flex";
        document.querySelector('.pdf').style.display = "none";

    } else {

        let pdfFileURL = URL.createObjectURL(pdfFile);
        nombrePdf = pdfFile.name;

        pdfjsLib.getDocument(pdfFileURL).promise.then(function (pdfDoc_) {

            pdfDoc = pdfDoc_;
            // Initial/first page rendering            
            for (var i = 1; i <= pdfDoc.numPages; i++) {
                renderPage(i);
            }
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

        var canvasId = 'canvas' + num;

        var mDiv = document.getElementById('main-canvas');
        var loadFile;
        loadFile = document.createElement('canvas');
        loadFile.id = canvasId;
        loadFile.className = "canvas-child";
        mDiv.appendChild(loadFile);

        var canvas = document.getElementById(canvasId);

        var ctx = canvas.getContext('2d');

        canvas.addEventListener("click", function () { relMouseCoords(event, ctx, num) }, false);

        var viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        page.render(renderContext);
    });
}

async function IniciarPdf(url) {

    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

    pdfDocumento = await PDFLib.PDFDocument.load(existingPdfBytes)
    pagesDocumento = pdfDocumento.getPages()

}


document.querySelector('#imagen').addEventListener('change', () => {

    imagen = document.querySelector('#imagen').files[0];

    if (imagen != undefined) {

        cambiarImg = true;
        urlImagen = URL.createObjectURL(imagen);
        console.log(urlImagen);
        document.body.style.cursor = `url(${urlImagen}), crosshair`;

    } else {
        cambiarImg = false;
        document.body.style.cursor = 'default';
    }

});


function relMouseCoords(event, ctx, pageNum) {
    var x = event.offsetX;
    var y = event.offsetY;

    ctxActual = ctx;

    console.log(x, y);

    if (cambiarImg) {

        var img = new Image();
        img.src = urlImagen;

        img.onload = function () {
            ctx.drawImage(img, x, y);
            ModificarPdf(urlImagen, pageNum, x, y, this.height);
        }

    }
}

async function ModificarPdf(urlImg, numeroPage, positionX, positionY, imgHeight) {

    let imageBytes = await fetch(urlImg).then((res) => res.arrayBuffer());
    let pageToModifi = pagesDocumento[numeroPage - 1];
    let typeImage;
    // const { width, height } = pageToModifi.getSize();
    // console.log(width, height);
    // console.log(canvas.width, canvas.height);

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

document.querySelector('#descarga').addEventListener("click", async function () {
    // only jpeg is supported by jsPDF
    // var canvas;
    // var id = "canvas";

    // var HTML_Width = $("#canvas1").width();
    // var HTML_Height = $("#canvas1").height();
    // var top_left_margin = 15;
    // var PDF_Width = HTML_Width + (top_left_margin * 2);
    // var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
    // var canvas_image_width = HTML_Width;
    // var canvas_image_height = HTML_Height;

    // var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);

    // for (var i = 1; i <= pdfDoc.numPages; i++) {

    //     console.log(id + i);
    //     canvas = document.getElementById(id + i);
    //     canvas.getContext('2d');

    //     if (i != 1) {
    //         pdf.addPage();
    //     }
    //     pdf.addImage(canvas, 'PNG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);

    // }
    // pdf.save(`${nombrePdf}.pdf`);
    pdfBytes = await pdfDocumento.save();

    download(pdfBytes, nombrePdf, "application/pdf");
});

