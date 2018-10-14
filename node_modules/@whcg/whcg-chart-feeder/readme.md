# &lt;whcg-chart-feeder&gt;

```html
<whcg-chart-feeder whcgjsoninput="[[whcgElectricityJson]]" datapackage="yearlyamounts" chartjs="{{chartJsJson2}}"></whcg-chart-feeder>
```

## Getting started 

&lt;whcg-chart-feeder&gt; is a component that converts WHCG formated json data into Chartjs.org fortmat. 
Example of WHCG format:
```html 
{
    "result": [{
        "object": "Elkostnad",
        "data": {
            "yearlyamounts": {
                "label": "öre/kWh",
                "dataset": {
                    "2018": 40,
                    "2014": 60,
                    "2010": 100
                } 
            },
            "suppliers": {
                "label": "Leverantör",
                "dataset": {
                    "2018": 56,
                    "2014": 234,
                    "2010": 45
                }  
            }
        }
    }, {
        "object": "Vattenkostnad",
        "data": {
            "yearlyamounts": {
                "label": "kr/m3",
                "dataset": {
                    "2018": 400,
                    "2014": 607,
                    "2010": 100
                } 
            },
            "suppliers": {
                "label": "Leverantör",
                "dataset": {
                    "2018": 76,
                    "2014": 37,
                    "2010": 77
                }  
            }
        }
    }, {
        "object": "Hyresintäkter",
        "data": {
            "yearlyamounts": {
                "label": "kr",
                "dataset": {
                    "2018": 140,
                    "2014": 260,
                    "2010": 10
                } 
            },
            "suppliers": {
                "label": "Hyresgäst",
                "dataset": {
                    "2018": "Olle",
                    "2014": "Adam",
                    "2010": "Stina"
                }  
            }
        }
    }]
}
```

## Dependencies

&lt;whcg-chart-feeder&gt; is a Polymer 3 element with the following dependencies: 
- *npm i @polymer/polymer*
