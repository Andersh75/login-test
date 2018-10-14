

    summarizer() {

		let test1 = JSON.parse(this.whcgjsoninput);


        
        let result = test1.result.map(result => {
            let yearlyamounts = result.data.yearlyamounts;
            let thekeys = Object.keys(yearlyamounts.dataset);
            let thevalues = Object.values(yearlyamounts.dataset);
            yearlyamounts.datasetkeys = thekeys;
            yearlyamounts.datasetvalues = thevalues;

            result.data.yearlyamounts = yearlyamounts;

            return result;
        });

        let datasetKeys = test1.result[0].data.yearlyamounts.datasetkeys;

        let acc = 0;
        
        if (this.mode === 'multiply') {
            acc = 1;
        }

        let sums = datasetKeys.map(datasetKey => {
            return test1.result.reduce((acc, item, index) => {
                if (isNaN(Number(item.data.yearlyamounts.dataset[datasetKey]))) {
                    return acc;
                } else {

                    if(this.mode === 'subtract' && index > 0) {
                        return acc = acc - Number(item.data.yearlyamounts.dataset[datasetKey]);
                    } else if (this.mode === 'multiply') {
                        return acc = acc * Number(item.data.yearlyamounts.dataset[datasetKey]);
                    } else {
                        return acc = acc + Number(item.data.yearlyamounts.dataset[datasetKey]);
                    }
                    
                }
                
            }, acc);
        });


        let newResult = [];

        newResult.push(test1.result[0]);

        newResult[0].data.yearlyamounts.datasetvalues = sums;


        var result2 = {};
		newResult[0].data.yearlyamounts.datasetkeys.forEach((key, i) => result2[key] = newResult[0].data.yearlyamounts.datasetvalues[i]);
        
        
        newResult[0].data.yearlyamounts.dataset = result2;
        newResult[0].object = "Summakostnader";


        test1.result = newResult;

       
        this.jsonBuilder(sums);
    }

    jsonBuilder(mappedArr) {
        let whcgObj = {};
        whcgObj.result = [];


        function subDataFactory(item) {
            let dataobj = {};
            for (let i = 0; i < item; i++) {
                Object.assign(dataobj, {
                    [String(i)]: mappedArr[i]
                });
            }

            return dataobj;
        }

        function dataFactory(item) {
            let dataobj = {};

            Object.assign(dataobj, {
                'yearlyamounts': {
                    label: 'kr',
                    dataset: subDataFactory(item)
                }
            });

            return dataobj;
        }

        function resultElementObjFactory() {
            return {
                object: this.name,
                data: dataFactory.call(this, mappedArr.length)
            }
        }

        whcgObj.result.push(resultElementObjFactory.call(this));


        this.whcgjsonoutput = JSON.stringify(whcgObj);

    };  
}

window.customElements.define('whcg-period-summarizer', WhcgPeriodSummarizer);

export { WhcgPeriodSummarizer };
