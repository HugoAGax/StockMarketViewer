(function() {
    let $ = document.querySelector.bind(document);
    let $$ = document.querySelectorAll.bind(document);

    const $dom = {};

    $dom.stockElms = $$('[js-stock-element]');
    $dom.overlay = $('[js-overlay]');
    $dom.modal = $('[js-modal]');
    $dom.modalCompanySymbol = $('[js-company-symbol]');
    $dom.modalCompanyName = $('[js-company-name]');
    $dom.modalCompanySector = $('[js-company-sector]');
    $dom.modalCompanyValue = $('[js-company-value]');
    $dom.modalCompanyGraphContainer = $('[js-company-graph-container]');
    $dom.modalCompanyTable = $('[js-company-table]');
    $dom.modalClose = $('[js-modal-close]');
    $dom.body = $('body'); 
    $dom.stockListing = $('[js-stock-listing]');
    $dom.stockMessaging = $('[js-stock-message]');
    $dom.stockAnnouncement = $('[js-stock-alert]');
    $dom.stockLoader = $('[js-stock-loader]');
    $dom.navbarLinks = $('[js-navbar-links]');
    $dom.navbarToggle = $('[js-navbar-toggle]');

    // Retrieves a listing of stocks i.e. Most Active
    let getTopStocks = (filter) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200 ) {
                retrieved = JSON.parse(this.responseText);
                if (Object.keys(retrieved).length){
                    console.log('>>LISTING FOR ' + filter.toUpperCase(), retrieved );
                    setTopList(retrieved);
                }else{
                    setMessage('Data is not available for this listing');
                }
            }
        };
        xhttp.open('GET', 'https://api.iextrading.com/1.0/stock/market/list/' + filter, true);
        xhttp.send();
    };

    // Lets the user know if the the listing data couldn't be fetched
    let setMessage = (message) => {
        $dom.stockLoader.classList.add('is-hidden');
        $dom.stockAnnouncement.innerText = message;
    };

    // Fills the necessary tags to show the data
    let setTopList = (topListing) => {
        $dom.stockElms.forEach((el, i) => {
            el.addEventListener('click', singleCompany);
            el.setAttribute('companycode', (topListing[i].symbol).toLowerCase());
            el.querySelector('h2').innerText = topListing[i].symbol;
            el.querySelector('h5').innerText = topListing[i].companyName;
            if(topListing[i].change > 0){
                el.querySelector('span').innerHTML = '&#9650;' + topListing[i].change;
            }else{
                el.querySelector('span').innerHTML = '&#9660;' + Math.abs(topListing[i].change);
                el.querySelector('span').classList.add('negative-change');
            }
        });
        showListing();
    };

    // Shows the data of the retrieved listing and hides the loader
    let showListing = () => {
        $dom.stockListing.classList.remove('is-hidden');
        $dom.stockMessaging.classList.add('is-hidden');
    };

    // Handles the functions after clicking on a partiular company
    let singleCompany = (e) => {
        e.preventDefault();
        getDetailedCompany(e.target.getAttribute('companycode'));
    };

    // Fetches the stock data of a particular company
    let getDetailedCompany = (company) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                openModal();
                fillCompanyDetails(JSON.parse(this.responseText));
                deployGraph(JSON.parse(this.responseText));
            }
        };
        xhttp.open("GET", "https://api.iextrading.com/1.0/stock/" + company + "/batch?types=quote,news,chart&range=1m&last=10", true);
        xhttp.send();
    };

    // Fills the modal with the necessary company data
    let fillCompanyDetails = (data) => {
        $dom.modalCompanySymbol.innerText = data.quote.symbol;
        $dom.modalCompanyName.innerText = data.quote.companyName;
        $dom.modalCompanySector.innerText = data.quote.sector;
        $dom.modalCompanyValue.innerText = data.quote.latestPrice;
    };

    // Takes an array of object and returns an array one particular proerty
    let getDataset = (data, property) => {
        let arr = [];
        data.forEach((x) => {
            arr.push(x[property]);
        });
        return arr;
    };

    // Receives and displays a table of the stock change of the last 10 days
    let deployChangeTable = (data) => {
        let table = $dom.modalCompanyTable;
        table.innerHTML = '';
        let newRow, dateCell, changeCell;
        for(let i = 0; i < 10; i++){
            newRow = table.insertRow(-1);
            if(data[i].change > 0){
                newRow.setAttribute('class', 'change-gain');   
            }else{
                newRow.setAttribute('class', 'change-loss');   
            }
            changeCell = newRow.insertCell(0);
            dateCell = newRow.insertCell(0);
            changeCell.innerText = data[i].change;
            dateCell.innerText = data[i].date;
        }
    };

    // Receives and displays a graph of relevant data of a particular stock
    let deployGraph = (data) => {
        restartCanvas();
        deployChangeTable(data.chart);

        let ctx = $dom.modalCompanyGraphContainer.querySelector('canvas').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: getDataset(data.chart, 'label'),
                datasets: [
                    {
                        label: 'Opened at',
                        data: getDataset(data.chart, 'open'),
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: '#0181FF',
                        borderWidth: 1
                    },
                    {
                        label: 'Closed At',
                        data: getDataset(data.chart, 'close'),
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: '#FFC145',
                        borderWidth: 1
                    },
                    {
                        label: 'Highest',
                        data: getDataset(data.chart, 'high'),
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: '#08C938',
                        borderWidth: 1
                    },
                    {
                        label: 'Lowest',
                        data: getDataset(data.chart, 'low'),
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: '#E00D30',
                        borderWidth: 1
                    },
                ]
            },
            options: {
                responsive: true,
                aspectRatio: 1.1,
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: false
						}
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Price ($)USD'
						}
					}]
				}
			}
        });
    };
    
    // Deletes and creates a new canvas for GraphJS
    let restartCanvas = () => {
        $dom.modalCompanyGraphContainer.innerHTML = '';
        let cnvs = document.createElement('canvas');
        cnvs.setAttribute('class', 'company-details__graph');

        $dom.modalCompanyGraphContainer.appendChild(cnvs);
    };

    // Hides the modal and the overlay
    let closeModal = () => {
        $dom.overlay.classList.add('is-hidden');
        $dom.modal.classList.add('is-hidden');

        $dom.body.classList.remove('scroll-lock');
    };

    // Shows the modal and the overlay
    let openModal = () => {
        $dom.overlay.classList.remove('is-hidden');
        $dom.modal.classList.remove('is-hidden');
        
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        $dom.body.classList.add('scroll-lock');
        
    };

    // Toggles the state of the mobile navbar
    let navbarToggle = () => {
      if($dom.navbarLinks.classList.contains('is-shown')){
            $dom.navbarLinks.classList.remove('is-shown')
      }else{
        $dom.navbarLinks.classList.add('is-shown')
      }
    };

    window.addEventListener('DOMContentLoaded', (event) => {
        getTopStocks($dom.body.getAttribute('data-list-type'));
        $dom.overlay.addEventListener('click', closeModal);
        $dom.modalClose.addEventListener('click', closeModal);
        $dom.navbarToggle.addEventListener('click', navbarToggle);
    });
})();