import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

/**
 * `WhcgChart`
 * 
 * @customElement
 * @polymer
 */

class WhcgChart extends PolymerElement {
    static get template() {
        return html`
        <style>
        .thediv {
            /* --_lumo-grid-border-color: var(--whcg-shade-20pct);
            --_lumo-grid-secondary-border-color: var(--whcg-shade-10pct);
            --_lumo-grid-border-width: 1px;
            --_lumo-grid-selected-row-color: var(--parmaco-primary-color-10pct); */
            font-size: var(--parmaco-font-size-m);
            border: 1px solid var(--whcg-shade-20pct);
            border-radius: 5px 5px 4px 4px;
            background-color: var(--whcg-shade-10pct);
        }

        </style>
    <div class="thediv">
        <canvas id="myChart" width$="{{width}}" height$="{{height}}"></canvas>
    </div>
        `;
    }
    static get properties() {
        return {
            type: {
                type: String,
                notify: false,
                readOnly: false,
            },
    
            chartjson: {
                type: String,
                notify: false,
                readOnly: false,
                observer: '_chartjsonChanged'
            },
            width: {
                type: String,
                notify: false,
                readOnly: false,
                value: '400px' 
            },
            height: {
                type: String,
                notify: false,
                readOnly: false,
                value: '400px' 
            },
            legendposition: {
                type: String,
                notify: false,
                readOnly: false,  
                value: 'right'
            },

            legendfontsize: {
                type: Number,
                notify: false,
                readOnly: false,
                value: 12  
            },

            legendfontfamily: {
                type: String,
                notify: false,
                readOnly: false,
                value: 'Arial' 
            },

            stacked: {
                type: Boolean,
                notify: false,
                readOnly: false,
                value: false 
            },
        }
    }

    _chartjsonChanged() {
        // console.log("chartJsonChanged");
        
        this._chartJs(JSON.parse(this.chartjson));
        // setInterval(function() {
        //     console.log(this.thechart);
        // }, 5000);
    }

    _chartJs(data) {
        // console.log('data');
        // console.log(data);
        var ctx = this.$.myChart;
        // console.log("ctx");
        // console.log(ctx);
        
        //Chart.defaults.global.defaultFontColor = 'white';
        //Chart.defaults.global.elements.rectangle.backgroundColor = 'hsla(24, 70%, 50%, 1)';
        //Chart.defaults.global.elements.rectangle.borderColor = '#FFFFFF';
        //Chart.defaults.global.elements.rectangle.borderWidth = 1;


        //ctx.style.backgroundColor = "hsla(214, 50%, 22%, 0.1)";

        // console.log('this');
        // console.log(this);

        if (this.thechart != null) {
            this.thechart.destroy();
        }

        this.thechart = new Chart(ctx, {
            type: this.type,
            data: data,

            options: {
                legend: {
                    position: this.legendposition,
                    labels: {
                        fontFamily: "'Exo 2', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                        fontColor: '#FFFFFF',
                        fontSize: 14,
                        boxWidth: 14
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontFamily: "'Exo 2', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            fontColor: '#FFFFFF',
                            fontSize: 14
                        },
                        gridLines: {
                            // display: true,
                            // color: '#FFFFFF'
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontFamily: "'Exo 2', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            fontColor: '#FFFFFF',
                            fontSize: 14
                        },
                        gridLines: {
                            // display: true,
                            // color: '#FFFFFF'
                        }
                        // scaleLabel: { fontColor: '#6E6E6E', fontSize:16 }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                // title: {
                //     display: true,
                //     text: 'Title',
                //     fontFamily: "'Exo 2', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                //     fontColor: '#FFFFFF',
                //     fontSize: 14
                // },
                layout: {
                    padding: {
                        left: 15,
                        right: 15,
                        top: 50,
                        bottom: 20
                    }
                }
                //  label: { fontSize:18 }
                
                // scales: {
                //     xAxes: [{
                //         stacked: this.stacked
                //     }],
                //     yAxes: [{
                //         stacked: this.stacked
                //     }
                //     // {
                //     //     ticks: {
                //     //         beginAtZero: true
                //     //     }
                //     // }
                // ]
                // }
            }
        });

        // console.log("myChart");
        // console.log(this.thechart);
        // console.log('this');
        // console.log(this);

        // var that = this;

        
        // // 
        // // this.thechart.update();

        // setTimeout(function () {
        //     // console.log('that');
        //     // console.log(that);
        //     // console.log(that.thechart);
        //     that.thechart = new Chart(ctx, {
        //         type: that.type,
        //         data: data,

        //         options: {
        //             legend: {
        //                 position: that.legendposition,
        //                 labels: {
        //                     fontFamily: "'Exo 2', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        //                     fontColor: '#FFFFFF',
        //                     fontSize: 14,
        //                     boxWidth: 14
        //                 }
        //             },
        //             scales: {
        //                 yAxes: [{
        //                     ticks: {
        //                         beginAtZero: true
        //                     }
        //                 }],
        //                 yAxes: [{
        //                     ticks: {
        //                         fontFamily: "'Exo 2', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        //                         fontColor: '#FFFFFF',
        //                         fontSize: 14
        //                     },
        //                     gridLines: {
        //                         // display: true,
        //                         // color: '#FFFFFF'
        //                     }
        //                 }],
        //                 xAxes: [{
        //                     ticks: {
        //                         fontFamily: "'Exo 2', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        //                         fontColor: '#FFFFFF',
        //                         fontSize: 14
        //                     },
        //                     gridLines: {
        //                         // display: true,
        //                         // color: '#FFFFFF'
        //                     }
        //                     // scaleLabel: { fontColor: '#6E6E6E', fontSize:16 }
        //                 }]
        //             },
        //             // responsive: true,
        //             // maintainAspectRatio: false,
        //             // title: {
        //             //     display: true,
        //             //     text: 'Title',
        //             //     fontFamily: "'Exo 2', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        //             //     fontColor: '#FFFFFF',
        //             //     fontSize: 14
        //             // },
        //             layout: {
        //                 padding: {
        //                     left: 15,
        //                     right: 15,
        //                     top: 50,
        //                     bottom: 20
        //                 }
        //             }
        //             //  label: { fontSize:18 }

        //             // scales: {
        //             //     xAxes: [{
        //             //         stacked: this.stacked
        //             //     }],
        //             //     yAxes: [{
        //             //         stacked: this.stacked
        //             //     }
        //             //     // {
        //             //     //     ticks: {
        //             //     //         beginAtZero: true
        //             //     //     }
        //             //     // }
        //             // ]
        //             // }
        //         }
        //     });
        // }, 1000);



    }

    // constructor() {
    //     super();

    // }

    // connectedCallback() {
    //     super.connectedCallback();
    //    // this._chartJs(JSON.parse(this.chartjson));

       
    // }
}

window.customElements.define('whcg-chart', WhcgChart);

export { WhcgChart };
