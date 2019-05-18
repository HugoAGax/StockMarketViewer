(function() {
    let $ = document.querySelector.bind(document);
    let $$ = document.querySelectorAll.bind(document);

    let $dom = {};

    $dom.stockElms = $$('[js-stock-element]');
    $dom.overlay = $('[js-overlay]');
    $dom.modal = $('[js-modal]');
    $dom.modalCompanySymbol = $('[js-company-symbol]');
    $dom.modalCompanyName = $('[js-company-name]');
    $dom.modalCompanySector = $('[js-company-sector]');
    $dom.modalCompanyValue = $('[js-company-value]');
    $dom.modalCompanyGraphContainer = $('[js-company-graph-container]');
    $dom.modalCompanyTable = $('[js-company-table]');

    let getTopStocks = () => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                setTopGainers(JSON.parse(this.responseText));
            }
        };
        xhttp.open("GET", "https://api.iextrading.com/1.0/stock/market/list/gainers", true);
        xhttp.send();
    };

    let setTopGainers = (topGainers) => {
        console.log('TOPGAINERS', topGainers);
        $dom.stockElms.forEach((el, i) => {
            el.addEventListener('click', singleCompany);
            el.setAttribute('companycode', (topGainers[i].symbol).toLowerCase());
            el.querySelector('h2').innerText = topGainers[i].symbol;
            el.querySelector('h5').innerText = topGainers[i].companyName;
            if(topGainers[i].change > 0){
                el.querySelector('span').innerHTML = '&#9650;' + topGainers[i].change;
            }else{
                el.querySelector('span').innerHTML = '&#9660;' + Math.abs(topGainers[i].change);
                el.querySelector('span').classList.add('negative-change');
            }
        });
    };

    let fillCompanyDetails = (data) => {
        console.log('FILL THIS DATA', data);
        $dom.modalCompanySymbol.innerText = data.quote.symbol;
        $dom.modalCompanyName.innerText = data.quote.companyName;
        $dom.modalCompanySector.innerText = data.quote.sector;
        $dom.modalCompanyValue.innerText = data.quote.latestPrice;
    }

    let singleCompany = (e) => {
        e.preventDefault();
        getDetailedCompany(e.target.getAttribute('companycode'));
    };

    let closeModal = () => {
        $dom.overlay.classList.add('is-hidden');
        $dom.modal.classList.add('is-hidden');
    };

    let openModal = () => {
        $dom.overlay.classList.remove('is-hidden');
        $dom.modal.classList.remove('is-hidden');
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
    }

    let getDataset = (data, property) => {
        let arr = [];
        data.forEach((x) => {
            arr.push(x[property]);
        });
        return arr;
    }
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
        data.forEach((x) => {
            console.log('X', x);
            newRow = table.insertRow(-1);
            if(x.change > 0){
                newRow.setAttribute('class', 'change-gain');   
            }else{
                newRow.setAttribute('class', 'change-loss');   
            }
            changeCell = newRow.insertCell(0);
            dateCell = newRow.insertCell(0);
            changeCell.innerText = x.change;
            dateCell.innerText = x.date;
        });
    };
    let deployGraph = (data) => {
        restartCanvas();
        deployChangeTable(data.chart);

        var ctx = $dom.modalCompanyGraphContainer.querySelector('canvas').getContext('2d');
        var myChart = new Chart(ctx, {
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
    }

    window.addEventListener('DOMContentLoaded', (event) => {
        getTopStocks();
        $dom.overlay.addEventListener('click', closeModal);
    });
})();