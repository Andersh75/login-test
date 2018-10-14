export function whcgJsonMaker(name, newValue, period, datapackage, label, key, fill) {
    function resultElementObjFactory(name, data) {
        // console.log('data');
        // console.log(data);
        // console.log('name');
        // console.log(name);
    
        return {
            object: name,
            data: data
        };
    }
    
    function dataFactory(newValue, period, datapackage, label, key, fill) {

        // console.log('newValue in DF');
        // console.log(newValue);
        let data = {};
        let set = {};
        
        let defaultValue = fill ? newValue : 0;
    
        for (let i = 0; i < period; i++) {
            set[i] = defaultValue;
        }
    
        set[key] = newValue;
    
        data = {...data, [datapackage]: {
            label: label,
            set: set
        }};
    
        return data;
    }
            
    let resultItem = resultElementObjFactory(name, dataFactory(Number(newValue), period, datapackage, label, key, fill));
    
    // console.log('resultItem');
    // console.log(resultItem);

    let result = [];

    result = [...result, resultItem];

    let whcgObj = {};
    return {...whcgObj, result: result };
};






export function whcgObjMerger(whcgObjs) {

    let resultsArr = whcgObjs.map(item => item.result);

    let result = resultsArr.reduce((acc, results) => {
        return acc.concat(results);
    }, []);

    let whcgObj = {result: result};

    return whcgObj;

};







export function whcgPeriodOperator(whcgObjs, mode, name, label, datapackage) {

    let acc = 0;

    if (mode === 'multiply') {
        acc = 1;
    }

    let setKeys = Object.keys(whcgObjs.result[0].data.yearlyamounts.set);

    let setValues = setKeys.map(setKey => {
        return whcgObjs.result.reduce((acc, item, index) => {
            if (isNaN(Number(item.data.yearlyamounts.set[setKey]))) {
                return acc;
            } else {

                if(mode === 'subtract' && index > 0) {
                    return acc = acc - Number(item.data.yearlyamounts.set[setKey]);
                } else if (mode === 'multiply') {
                    return acc = acc * Number(item.data.yearlyamounts.set[setKey]);
                } else {
                    return acc = acc + Number(item.data.yearlyamounts.set[setKey]);
                } 
            }
            
        }, acc);
    });

    let whcgObj = {};
    let result = [];

    whcgObj.result = [];

    let element = resultElementObjMaker(name, dataPackageObjMaker(datapackage, label, keyValueMerger(setKeys, setValues)))
    // console.log(element);
    result = [...result, element];
    console.log(result);
    whcgObj = {...whcgObj, result: result};
    // console.log(whcgObj);
    return whcgObj;
}


function keyValueMerger(keys, values) {
    let tmpObj = {};
    keys.forEach((key, i) => tmpObj[key] = values[i]);
    return tmpObj;
}

function dataPackageObjMaker(datapackage, label, set) {
    return {
        [datapackage]: {
            label: label,
            set: set
        }
    };
}

function resultElementObjMaker(name, data) {
    return {
        object: name,
        data: data
    }
}



export function getRandomColor() {   
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ', 0.2)';    
}


export function whcgChartJsTransformer(data) {


        let result = data.whcgObj.result;

        let columnNames = Object.keys(result[0].data[data.datapackage].set);

        let sets = result.map((item) => {
            let obj = {};

            obj.label = item.object;
            //obj.backgroundColor = getRandomColor();
            obj.backgroundColor = 'hsla(24, 70%, 50%, 1)';
            obj.data = Object.values(item.data[data.datapackage].set);
            obj.borderColor = '#FFFFFF';
            obj.borderWidth = 1;
            return obj;
        });

        let chartJsData = {};
        chartJsData.labels = columnNames;
        chartJsData.datasets = sets;


        // console.log('chartJsData');
        // console.log(chartJsData);

        return chartJsData;
}


export function whcgMultiplier(values) {
    return values.reduce((acc, item) => {
        return acc * Number(item);
    }, 1);
}

export function whcgCompounder(whcgObj, growthRate) {
     return Object.values(whcgObj.result[0].data['yearlyamounts'].set).map((value, index) => {
         return value * Math.pow((1 + Number(growthRate)), (index + 1));
     });
 }
