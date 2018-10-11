# &lt;whcg-chart&gt;

```html
<whcg-chart type="line" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" chartjson="{{chartJsJson}}"></whcg-chart>
```

## Getting started 

&lt;whcg-chart&gt; is a component based on Chartjs.org and displays charts from json data in the following format: 
```html 
data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
    }]
}
```

## Dependencies

&lt;whcg-chart&gt; is a Polymer 3 element with the following dependencies: 
- *npm i @polymer/polymer*
- script tag in the head of index.html:
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.js">
```