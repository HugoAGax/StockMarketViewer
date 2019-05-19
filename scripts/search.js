(function() {

    let $ = document.querySelector.bind(document);

    const $dom = {};

    $dom.overlay = $('[js-overlay]');
    $dom.modal = $('[js-modal]');
    $dom.modalCompanySymbol = $('[js-company-symbol]');
    $dom.modalCompanyName = $('[js-company-name]');
    $dom.modalCompanySector = $('[js-company-sector]');
    $dom.modalCompanyValue = $('[js-company-value]');
    $dom.modalCompanyGraphContainer = $('[js-company-graph-container]');
    $dom.modalCompanyTable = $('[js-company-table]');
    $dom.modalClose = $('[js-modal-close]');
    $dom.searchForm = $('[js-search-form]');
    $dom.searchInput = $('[js-search-input]');
    $dom.navbarLinks = $('[js-navbar-links]');
    $dom.navbarToggle = $('[js-navbar-toggle]');
    $dom.searchMessage = $('[js-search-message]');

    $dom.searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        getDetailedCompany($dom.searchInput.value);
    });

    // Fetches the stock data of a particular company
    let getDetailedCompany = (company) => {
        setSearchMessage('Searching...');
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200){
                    let received = JSON.parse(this.responseText);
                    console.log('>>>COMPANY DATA ' + company.toUpperCase(), received);
                    openModal();
                    clearSearchMessage();
                    clearSearchInput();
                    fillCompanyDetails(received);
                    deployGraph(received);
                }else if(this.status == 404){
                    console.log('>>>UNKNOWN SYMBOL');
                    setSearchMessage('The symbol you searched for is not available');
                }
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

    // After a successful fetch it clears the search input
    let clearSearchInput = () => {
        $dom.searchInput.value = '';
    };

    // Lets the user know the status of his search
    let setSearchMessage = (str) => {
        $dom.searchMessage.innerText = str;
        $dom.searchMessage.classList.remove('is-hidden');  
    };

    // Hides the message container if it's not needed
    let clearSearchMessage = () => {
        $dom.searchMessage.innerText = '';
        $dom.searchMessage.classList.add('is-hidden');  
    };

    // Takes an array of object and returns an array one particular proerty
    let getDataset = (data, property) => {
        let arr = [];
        data.forEach((x) => {
            arr.push(x[property]);
        });
        return arr;
    };
    
    // Deletes and creates a new canvas for GraphJS
    let restartCanvas = () => {
        $dom.modalCompanyGraphContainer.innerHTML = '';
        let cnvs = document.createElement('canvas');
        cnvs.setAttribute('class', 'company-details__graph');

        $dom.modalCompanyGraphContainer.appendChild(cnvs);
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


    window.addEventListener('DOMContentLoaded', () => {
        $dom.overlay.addEventListener('click', closeModal);
        $dom.modalClose.addEventListener('click', closeModal);
        $dom.navbarToggle.addEventListener('click', navbarToggle);
    });
})();