1. Install the library:

npm install react-pdftotext 2. Import the library:

import pdfToText from 'react-pdftotext' 3. Create an input field:

<input type="file" accept="application/pdf" onChange={extractText}/>
4. Prepare a function:

    function extractText(event) {
        const file = event.target.files[0]
        pdfToText(file)
            .then(text => console.log(text))
            .catch(error => console.error("Failed to extract text from pdf"))
    }

Finally, bringing it all together:

import pdfToText from 'react-pdftotext'

function extractText(event) {
const file = event.target.files[0]
pdfToText(file)
.then(text => console.log(text))
.catch(error => console.error("Failed to extract text from pdf"))
}

function PDFParserReact() {

    return (
        <div className="App">
            <header className="App-header">
                <input type="file" accept="application/pdf" onChange={extractText}/>
            </header>
        </div>
    );

}
export default PDFParserReact;
