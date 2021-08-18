// var docx2html=require('docx2html')

document.querySelector('#docWord').addEventListener('change', (event) => {

    // docx2html.docx2html(this.files[0], { container: document.getElementById('a') }).then(function (html) {
    //     html.toString()
    //     console.log(html.toString());
    // })

    var file = event.target.files[0];
    var urlFile = URL.createObjectURL(file);



    readFileInputEventAsArrayBuffer(event, function (arrayBuffer) {
        // var src = 'https://docs.google.com/gview?url=' + arrayBuffer + '&embedded=true';
        // document.querySelector('#word').setAttribute('src', src);

        mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
            .then(displayResult)
            .done();
    });
});


function readFileInputEventAsArrayBuffer(event, callback) {
    var file = event.target.files[0];

    var reader = new FileReader();

    reader.onload = function (loadEvent) {
        var arrayBuffer = loadEvent.target.result;
        callback(arrayBuffer);
    };

    reader.readAsArrayBuffer(file);
}

function displayResult(result) {
    document.getElementById("output").innerHTML = result.value;

    // var messageHtml = result.messages.map(function(message) {
    //     return '<li class="' + message.type + '">' + escapeHtml(message.message) + "</li>";
    // }).join("");

    // document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";

    console.log(result.messages);
}

