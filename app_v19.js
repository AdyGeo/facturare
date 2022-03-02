"use strict";

const clientType = document.getElementById("tip-client");
const dateClient = document.getElementById("date-client");
const myForm = document.getElementById('myForm');
const productPreview = document.getElementById('product-preview');
const denumireProdus = document.getElementById('denumire-produs');
const umProdus = document.getElementById('um');
const cantitateProdus = document.getElementById('cantitate');
const pretUnitarProdus = document.getElementById('pret-unitar');
const tableFooter = document.getElementById('table-footer');
const btnAdaugaProdus = document.getElementById('adauga-produs');
const btnGenereazaFactura = document.getElementById('genereaza-factura');
const btnChitanta = document.getElementById('chitanta');
const btnGenereazaChitanta = document.getElementById('genereaza-chitanta');
const clientSelector = document.getElementById('client-selector');
const tblch = document.getElementById('tbl-chitanta');
document.getElementById("data").value = new Date().toJSON().slice(0, 10);
document.getElementById("datach").value = new Date().toJSON().slice(0, 10);

let productId = 1;
let productsDb = {};
let storeClient = {};

if(localStorage.getItem('storedClients')){
    
    storeClient = JSON.parse(localStorage.getItem('storedClients'));
    
    for(let [key, value] of Object.entries(storeClient)){
        clientSelector.innerHTML += `<option value='${key}'>${key}</option>`;
    
    }
    
}



if(localStorage.getItem('storeSupplier')){
    
    let loadSupplier = JSON.parse(localStorage.getItem('storeSupplier'));
    
    document.getElementById('nume-furnizor').value = loadSupplier['nume-furnizor'];
    document.getElementById('cif-furnizor').value = loadSupplier['cif-furnizor'];
    document.getElementById('reg-com-furnizor').value = loadSupplier['reg-com-furnizor'];
    document.getElementById('iban-furnizor').value = loadSupplier['iban-furnizor'];
    document.getElementById('banca-furnizor').value = loadSupplier['banca-furnizor'];
    document.getElementById('adresa-furnizor').value = loadSupplier['adresa-furnizor'];
}

btnGenereazaFactura.addEventListener("click", function(event){

    event.preventDefault();
    myForm.checkValidity();
    let checkFields = myForm.reportValidity();
    if(!checkFields) return;

    let invoiceDate = document.getElementById("data").value;

    let invoiceSeriesAndNum = `${document.getElementById('serie').value}\xA0${document.getElementById('nr').value}`;
    let invoiceSeries = document.getElementById('serie').value;
    let invoiceNum = document.getElementById('nr').value;
    
    
    let storeSupplier = {'nume-furnizor':document.getElementById('nume-furnizor').value,
                        'cif-furnizor': document.getElementById('cif-furnizor').value,
                        'reg-com-furnizor': document.getElementById('reg-com-furnizor').value,
                        'iban-furnizor': document.getElementById('iban-furnizor').value,
                        'banca-furnizor': document.getElementById('banca-furnizor').value,
                        'adresa-furnizor': document.getElementById('adresa-furnizor').value
    };
    
    
    localStorage.setItem('storeSupplier', JSON.stringify(storeSupplier));
    
    const clientType2 = document.querySelector('input[name="optiune-client"]:checked').id;
    
    let newClientName = '';
    let newClient = {};
    
    if(clientType2 === 'client-pf'){
        newClientName = document.getElementById('nume-client').value;
        newClient = {
            'optiune-client': 'client-pf',
            'nume-client': document.getElementById('nume-client').value,
            'adresa-client': document.getElementById('adresa-client').value
        }
        
    } else{
        newClientName = document.getElementById('nume-client').value;
        newClient = {
            'optiune-client': 'client-pj',
            'nume-client': document.getElementById('nume-client').value,
            'cif-client': document.getElementById('cif-client').value,
            'reg-com-client': document.getElementById('reg-com-client').value,
            'iban-client': document.getElementById('iban-client').value,
            'banca-client': document.getElementById('banca-client').value,
            'adresa-client': document.getElementById('adresa-client').value
        }
    }
    
    storeClient[newClientName] = newClient;
    
    localStorage.setItem('storedClients', JSON.stringify(storeClient));

    let invoiceSupplier = `${document.getElementById('nume-furnizor').value}
                        CIF: ${document.getElementById('cif-furnizor').value}
                        Reg. Com.: ${document.getElementById('reg-com-furnizor').value}
                        IBAN: ${document.getElementById('iban-furnizor').value}
                        Banca: ${document.getElementById('banca-furnizor').value}
                        Adresa: ${document.getElementById('adresa-furnizor').value}`;
    
    let invoiceClient;
    

    if(clientType2 === "client-pf"){
        
        invoiceClient = `${document.getElementById('nume-client').value}
                        Adresa: ${document.getElementById('adresa-client').value}`;
    }
    else{
        invoiceClient = `${document.getElementById('nume-client').value}
                        CIF: ${document.getElementById('cif-client').value}
                        Reg. Com.: ${document.getElementById('reg-com-client').value}
                        IBAN: ${document.getElementById('iban-client').value}
                        Banca: ${document.getElementById('banca-client').value}
                        Adresa: ${document.getElementById('adresa-client').value}`;
    }


    let invoiceHeader = [[{text: 'Nr.\ncrt.', style: 'tableHeader'}, 
                    {text: 'Denumire\nprodus sau serviciu', style: 'tableHeader'}, 
                    {text: 'U.M.', style: 'tableHeader'},
                    {text: 'Cantitate', style: 'tableHeader'},
                    {text: 'Pret\xA0unitar\n(fara\xA0TVA)\n-\xA0lei\xA0-', style: 'tableHeader'},
                    {text: 'Valoare\n\n-\xA0lei\xA0-', style: 'tableHeader'},
                    {text: 'Valoare\nTVA\n-\xA0lei\xA0-', style: 'tableHeader'}]];

    let totalVal = 0;
    let totalTva = 0;
    let productCount = 1;
    let invoiceProducts = [];

    Object.entries(productsDb).forEach(([key,value]) => {

        totalVal += Number(value[4]);
        totalTva += Number(value[5]);

        invoiceProducts.push([productCount,...value]);

        productCount++;
    });


    let invoiceTotal = [[{text:'', colSpan:7}],
                        [{text:'', colSpan:4},'','','',{text:'TOTAL',bold: true},totalVal.toFixed(2),totalTva.toFixed(2)],
                        [{text:'', colSpan:4},'','','',{text:'TOTAL\nGENERAL',bold: true},{text:(totalVal+totalTva).toFixed(2), fontSize:16, bold: true, colSpan:2},'']];
    let docDefinition = 
    {
        content:
        [
            {text: 'Factura', style: 'header'},
            {text: 'Seria: '+ invoiceSeries + '  Nr.: '+ invoiceNum, style: 'header2'},
            {text: 'Data: ' + invoiceDate  + '\n\n\n', style: 'header2'},
            {
                columns: 
                [
                    {
                    // auto-sized columns have their widths based on their content
                    text:`Furnizor:
                    `,
                    style: 'subheader'
                    },
                    {
                    // star-sized columns fill the remaining space
                    // if there's more than one star-column, available width is divided equally
                    text:`Client:
                    `,
                    style: 'subheader'
                    }
                ], columnGap: 100
            },
            {
                columns: 
                [
                    {
                    text: invoiceSupplier, style:'furnizorSiClient'
                    },
                    {
                    text: invoiceClient, style:'furnizorSiClient'
                    }
                ], columnGap: 100
            },
            '\n\n',`cota TVA: ${document.querySelector('input[name="cotaTva"]:checked').value*100}%`,
            {
                alignment: 'center',
                table: 
                {
                    headerRows: 1,
                    widths: [ 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto' ],
                    // dontBreakRows: true,
                    // keepWithHeaderRows: 1,
                    body: [...invoiceHeader,...invoiceProducts,...invoiceTotal]
               }   
            },
            [`\nFactura circula fara stampila si semnatura conform Legii 227/2015 privind Codul fiscal, art. 319, alin. 29.`]
        ],
        styles: 
        {
            header:
            {
                fontSize: 20,
                bold: true,
                alignment: 'center'
            },
            header2:
            {
                fontSize: 12,
                alignment: 'center'
            },
            subheader: 
            {
                fontSize: 12,
                bold: true
            },
            furnizorSiClient: 
            {
                fontSize: 10,
            },
            tableHeader: 
            {
                bold: true,
                fontSize: 13,
                color: 'black',
                alignment: 'center'
            },
            quote: 
            {
                italics: true
            },
            small: 
            {
                fontSize: 8
            }
        }

    };
    pdfMake.createPdf(docDefinition).download(`${invoiceSeriesAndNum} ${invoiceDate}.pdf`);


});

btnChitanta.addEventListener("click", function(event){
    event.preventDefault();

    
    const clientType3 = document.querySelector('input[name="optiune-client"]:checked').id;
    
    if(clientType3 === 'client-pf'){
        alert('Nu se pot emite chitante pentru persoane fizice!');    
    } else{

        if(tblch.classList.contains("d-none")){
            tblch.classList.remove("d-none");
            btnChitanta.innerHTML = '<span class="sppp">[&#8210]</span> Chitanta';
            btnChitanta.classList.remove("btn-warning");
            btnChitanta.classList.add("btn-danger");
            document.getElementById("seriech").required = true;
            document.getElementById("nrch").required = true;
            document.getElementById("sumach").required = true;
            document.getElementById("sumacuvintech").required = true;
            tblch.scrollIntoView()
        }
        else{
            tblch.classList.add("d-none");
            btnChitanta.classList.remove("btn-danger");
            btnChitanta.classList.add("btn-warning");
            btnChitanta.innerHTML = '<span class="sppp">[+]</span> Chitanta'
            document.getElementById("seriech").required = false;
            document.getElementById("nrch").required = false;
            document.getElementById("sumach").required = false;
            document.getElementById("sumacuvintech").required = false;
        }    
    }
});


btnGenereazaChitanta.addEventListener("click", function(event){

    event.preventDefault();
    myForm.checkValidity();
    let checkFields = myForm.reportValidity();
    if(!checkFields) return;

    let chDate = document.getElementById("datach").value;

    let invoiceSeriesNumDate = `${document.getElementById('serie').value}\xA0${document.getElementById('nr').value}\xA0din\xA0${document.getElementById('data').value}`;
    let chSeriesAndNum = `${document.getElementById('seriech').value}\xA0${document.getElementById('nrch').value}`;
    let chSeries = document.getElementById('seriech').value;
    let chNum = document.getElementById('nrch').value;
    let chSum = document.getElementById('sumach').value;
    let chSumCuv = document.getElementById('sumacuvintech').value;
    let storeSupplier = {'nume-furnizor':document.getElementById('nume-furnizor').value,
                        'cif-furnizor': document.getElementById('cif-furnizor').value,
                        'reg-com-furnizor': document.getElementById('reg-com-furnizor').value,
                        'iban-furnizor': document.getElementById('iban-furnizor').value,
                        'banca-furnizor': document.getElementById('banca-furnizor').value,
                        'adresa-furnizor': document.getElementById('adresa-furnizor').value
    };
    
    
    localStorage.setItem('storeSupplier', JSON.stringify(storeSupplier));
    
    const clientType2 = document.querySelector('input[name="optiune-client"]:checked').id;
    
    let newClientName = '';
    let newClient = {};
    
    if(clientType2 === 'client-pf'){
        newClientName = document.getElementById('nume-client').value;
        newClient = {
            'optiune-client': 'client-pf',
            'nume-client': document.getElementById('nume-client').value,
            'adresa-client': document.getElementById('adresa-client').value
        }
        
    } else{
        newClientName = document.getElementById('nume-client').value;
        newClient = {
            'optiune-client': 'client-pj',
            'nume-client': document.getElementById('nume-client').value,
            'cif-client': document.getElementById('cif-client').value,
            'reg-com-client': document.getElementById('reg-com-client').value,
            'iban-client': document.getElementById('iban-client').value,
            'banca-client': document.getElementById('banca-client').value,
            'adresa-client': document.getElementById('adresa-client').value
        }
    }

    let chText = `Am primit de la: ${newClient['nume-client']}, cod fiscal: ${newClient['cif-client']}, nr. reg. com.: ${newClient['reg-com-client']}, cu adresa: ${newClient['adresa-client']}, suma de:  ${chSum} RON(${chSumCuv}), reprezentand: Cortravaloarea facturii: ${invoiceSeriesNumDate}.`
    
    storeClient[newClientName] = newClient;
    
    localStorage.setItem('storedClients', JSON.stringify(storeClient));

    let invoiceSupplier = `${document.getElementById('nume-furnizor').value}
                        CIF: ${document.getElementById('cif-furnizor').value}
                        Reg. Com.: ${document.getElementById('reg-com-furnizor').value}
                        IBAN: ${document.getElementById('iban-furnizor').value}
                        Banca: ${document.getElementById('banca-furnizor').value}
                        Adresa: ${document.getElementById('adresa-furnizor').value}`;
    
    let invoiceClient;
    

    if(clientType2 === "client-pf"){
        
        invoiceClient = `${document.getElementById('nume-client').value}
                        Adresa: ${document.getElementById('adresa-client').value}`;
    }
    else{
        invoiceClient = `${document.getElementById('nume-client').value}
                        CIF: ${document.getElementById('cif-client').value}
                        Reg. Com.: ${document.getElementById('reg-com-client').value}
                        IBAN: ${document.getElementById('iban-client').value}
                        Banca: ${document.getElementById('banca-client').value}
                        Adresa: ${document.getElementById('adresa-client').value}`;
    }

    let docDefinition = 
    {
        pageSize: 'A5',
        pageOrientation: 'landscape',
        content:
        [
            {
                columns: 
                [
                    {
                    text: invoiceSupplier, style:'furnizorSiClient'
                    },
                ]
            },
            {text: 'Chitanta', style: 'header'},
            {text: 'Seria: '+ chSeries + '  Nr.: '+ chNum, style: 'header2'},
            {text: 'Data: '+ chDate + '\n\n\n', style: 'header2'},
            {text: chText + '\n\n\n', style: 'paragraphLeft'},
            {text: 'Stampila si semnatura', style: 'paragraphRight'}
        ],

        styles: 
        {
            header:
            {
                fontSize: 20,
                bold: true,
                alignment: 'center'
            },
            header2:
            {
                fontSize: 12,
                alignment: 'center'
            },
            subheader: 
            {
                fontSize: 12,
                bold: true
            },
            paragraphLeft: 
            {
                fontSize: 12,
                alignment: 'left'
            },
            paragraphRight: 
            {
                fontSize: 12,
                alignment: 'right'
            },
            furnizorSiClient: 
            {
                fontSize: 10,
            },
            tableHeader: 
            {
                bold: true,
                fontSize: 13,
                color: 'black',
                alignment: 'center'
            },
            quote: 
            {
                italics: true
            },
            small: 
            {
                fontSize: 8
            }
        }

    };
    pdfMake.createPdf(docDefinition).download(`${chSeriesAndNum} ${chDate}.pdf`);


});

productPreview.addEventListener("click", function (event){
    if(event.target.name === 'sterge'){
        event.stopPropagation();
        let elRow = event.target.parentElement.parentElement;
        delete productsDb[elRow.id];
        elRow.remove();

        calculateTotals();        
    }
});
btnAdaugaProdus.addEventListener("click", function (event){
    event.preventDefault();
    const cotaTVA = document.querySelector('input[name="cotaTva"]:checked').value;

    productPreview.parentElement.classList.remove("d-none");
    btnGenereazaFactura.classList.remove("d-none");
    btnChitanta.classList.remove("d-none");
    productPreview.innerHTML += `<tr id=${productId}>
                                <td><button class="btn btn-sm btn-danger" name="sterge">Sterge</button></td>
                                <td>${denumireProdus.value}</td>
                                <td>${umProdus.value}</td>
                                <td>${cantitateProdus.value}</td>
                                <td>${pretUnitarProdus.value}</td>
                                <td>${(cantitateProdus.value * pretUnitarProdus.value).toFixed(2)}</td>
                                <td>${((cantitateProdus.value * pretUnitarProdus.value)*cotaTVA).toFixed(2)}</td>
                                </tr>`;
    productsDb[productId] = [[{text: denumireProdus.value, alignment: "left"}], umProdus.value, cantitateProdus.value, pretUnitarProdus.value,
                            (cantitateProdus.value * pretUnitarProdus.value).toFixed(2),
                            ((cantitateProdus.value * pretUnitarProdus.value)*cotaTVA).toFixed(2)];
    productId++;
    denumireProdus.value = '';
    umProdus.value = '';
    cantitateProdus.value = '';
    pretUnitarProdus.value = '';

    calculateTotals();
})

function calculateTotals(){

    let totalVal = 0;
    let totalTva = 0;

    Object.entries(productsDb).forEach(([key,value]) => {
        totalVal += Number(value[4]);
        totalTva += Number(value[5]);
    });

    tableFooter.innerHTML = `<tr>
                                <td colspan='4'></td>
                                <td class='bg-dark text-light font-weight-bold'>TOTAL:</td>
                                <td class='bg-dark text-light'>${totalVal.toFixed(2)}</td>
                                <td class='bg-dark text-light'>${totalTva.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan='4'></td>
                                <td class='bg-dark text-light font-weight-bold lead'>TOTAL GENERAL:</td>
                                <td colspan='2' class='bg-dark text-light font-weight-bold lead'>${(totalVal+totalTva).toFixed(2)}</td>
                            </tr>`;
}

const pfFunction = (nume_client = '', adresa_client = '') => {
    
    dateClient.innerHTML = `
    <table style="width: 80%">
        <tr>
            <td style="width: 10%" align="right"><label for="nume-client">Nume:</label></td>
            <td style="width: 95%"><input required class='form-control my-2' style="width: 100%" type="text" id="nume-client" value='${nume_client}'></td>
        </tr>
        <tr>
            <td style="width: 10%" align="right"><label for="adresa-client">Adresa:</label></td>
            <td style="width: 95%"><input required class='form-control my-2' style="width: 100%" type="text" id="adresa-client" value='${adresa_client}'></td>
        </tr>
    </table>`

}

const pjFunction = (nume_client = '', cif_client = '', reg_com_client = '', iban_client = '', banca_client = '', adresa_client = '') => {
    dateClient.innerHTML = `       
        <table style="width: 80%">
            <tr>
                <td style="width: 10%" align="right"><label for="nume-client">Denumire:</label></td>
                <td style="width: 95%"><input required class='form-control my-2' style="width: 100%" type="text" id="nume-client" value='${nume_client}'></td>
            </tr>
            <tr>
                <td style="width: 10%" align="right"><label for="cif-client">CIF:</label></td>
                <td style="width: 95%"><input required class='form-control my-2' style="width: 100%" type="text" id="cif-client" value='${cif_client}'></td>
            </tr>
            <tr>
                <td style="width: 10%" align="right"><label for="reg-com-client">Reg. Com.:</label></td>
                <td style="width: 95%"><input class='form-control my-2' style="width: 100%" type="text" id="reg-com-client" value='${reg_com_client}'></td>
            </tr>
            <tr>
                <td style="width: 10%" align="right"><label for="iban-client">IBAN:</label></td>
                <td style="width: 95%"><input class='form-control my-2' style="width: 100%" type="text" id="iban-client" value='${iban_client}'></td>
            </tr>
            <tr>
                <td style="width: 10%" align="right"><label for="banca-client">Banca:</label></td>
                <td style="width: 95%"><input class='form-control my-2' style="width: 100%" type="text" id="banca-client" value='${banca_client}'></td>
            </tr>
            <tr>
                <td style="width: 10%" align="right"><label for="adresa-client">Adresa:</label></td>
                <td style="width: 95%"><input required class='form-control my-2' style="width: 100%" type="text" id="adresa-client" value='${adresa_client}'></td>
            </tr>
        </table>`
}

clientSelector.addEventListener("change", function (event){
    
    
    
    if(event.srcElement.value !== ''){
        
        let optiuneC = document.getElementById(storeClient[event.srcElement.value]['optiune-client']);
        
        optiuneC.checked = true
        
        let nume_client = storeClient[event.srcElement.value]['nume-client'];
        let cif_client = storeClient[event.srcElement.value]['cif-client'];
        let reg_com_client = storeClient[event.srcElement.value]['reg-com-client'];
        let iban_client = storeClient[event.srcElement.value]['iban-client'];
        let banca_client = storeClient[event.srcElement.value]['banca-client'];
        let adresa_client = storeClient[event.srcElement.value]['adresa-client'];
        
        if(storeClient[event.srcElement.value]['optiune-client'] === 'client-pf'){
            pfFunction( nume_client, adresa_client )
        }else{
            pjFunction( nume_client, cif_client, reg_com_client, iban_client, banca_client, adresa_client );
        }
        
    }else{
        
        document.getElementById('nume-client').value = '';
        document.getElementById('adresa-client').value = '';
        if(document.getElementById('cif-client')){document.getElementById('cif-client').value = '';}
        if(document.getElementById('reg-com-client')){document.getElementById('reg-com-client').value = '';}
        if(document.getElementById('iban-client')){document.getElementById('iban-client').value = '';}
        if(document.getElementById('banca-client')){document.getElementById('banca-client').value = '';}

    }
    
});


clientType.addEventListener("click", function(event){
    
    if(event.target.id === "client-pf"){
        pfFunction() 
        
    }else{ pjFunction() }

});