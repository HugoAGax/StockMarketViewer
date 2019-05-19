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

    $dom.searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        console.log('VALUE', $dom.searchInput.value);
        getDetailedCompany($dom.searchInput.value);
    });

    let fillCompanyDetails = (data) => {
        $dom.modalCompanySymbol.innerText = data.quote.symbol;
        $dom.modalCompanyName.innerText = data.quote.companyName;
        $dom.modalCompanySector.innerText = data.quote.sector;
        $dom.modalCompanyValue.innerText = data.quote.latestPrice;
    };

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

    let getDataset = (data, property) => {
        let arr = [];
        data.forEach((x) => {
            arr.push(x[property]);
        });
        return arr;
    };
    
    let restartCanvas = () => {
        $dom.modalCompanyGraphContainer.innerHTML = '';
        let cnvs = document.createElement('canvas');
        cnvs.setAttribute('class', 'company-details__graph');

        $dom.modalCompanyGraphContainer.appendChild(cnvs);
    };

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

    let navbarToggle = () => {
      if($dom.navbarLinks.classList.contains('is-shown')){
            $dom.navbarLinks.classList.remove('is-shown')
      }else{
        $dom.navbarLinks.classList.add('is-shown')
      }
    };

    let closeModal = () => {
        $dom.overlay.classList.add('is-hidden');
        $dom.modal.classList.add('is-hidden');
    };

    let openModal = () => {
        $dom.overlay.classList.remove('is-hidden');
        $dom.modal.classList.remove('is-hidden');
    };

    window.addEventListener('DOMContentLoaded', () => {
        $dom.overlay.addEventListener('click', closeModal);
        $dom.modalClose.addEventListener('click', closeModal);
        $dom.navbarToggle.addEventListener('click', navbarToggle);
    });
})();