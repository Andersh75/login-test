import { LitElement, html } from '@polymer/lit-element';


class WhcgChart extends LitElement {

    render() {
        console.log('Chart render: value')
        console.log(this.value)
        let canvas;

        if (this.value) {
            canvas = html`<canvas id="myChart" width="400px" height="400px"></canvas>`;
          } else {
            canvas = html``;
          }

        return html`
        <style>
            .thediv {
                font-size: var(--parmaco-font-size-m);
                border: 1px solid var(--whcg-shade-20pct);
                border-radius: 5px 5px 4px 4px;
                background-color: var(--whcg-shade-10pct);
            }

        </style>
        <div class="thediv">
            ${canvas}
        </div>
        `;
    }
    static get properties() {
        return {
            type: {
                type: String
            },
            value: {
                type: Object
            },
            width: {
                type: String
            },
            height: {
                type: String
            },
            legendposition: {
                type: String 
            },

            legendfontsize: {
                type: Number
            },

            legendfontfamily: {
                type: String
            },

            stacked: {
                type: Boolean
            }
        }
    }


    constructor() {
        super();
        this.width = '400px';
        this.height = '400px';
        this.legendposition = 'right';
        this.legendfontsize = 12;
        this.legendfontfamily = 'Arial';
        this.stacked = false;
    }

    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('value')) {
            console.log('Chart updated: value')
            console.log(this.value)
            this._chartJs(this.value);
            // if(this.value) {
            //     console.log('chart value');
            //     console.log(this.value);
            //     try {
            //         this._chartJs(JSON.parse(this.value));
            //     } catch(error) {
            //         console.log(error);
            //     }
            // }  
        }
    }

    // firstUpdated(changedProps) {
    //     super.firstUpdated(changedProps);
    //     if (changedProps.has('value')) {
    //         console.log('Chart firstupdated: value')
    //         console.log(this.value)
    //         this._chartJs(this.value);
    //         // if(this.value) {
    //         //     console.log('chart value');
    //         //     console.log(this.value);
    //         //     try {
    //         //         this._chartJs(JSON.parse(this.value));
    //         //     } catch(error) {
    //         //         console.log(error);
    //         //     }
    //         // }  
    //     }
    // }


    _chartJs(data) {
        console.log('_chartJS');
        var ctx = this.shadowRoot.querySelector('#myChart');

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
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontFamily: "'Exo 2', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            fontColor: '#FFFFFF',
                            fontSize: 14
                        },
                        gridLines: {
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 15,
                        right: 15,
                        top: 50,
                        bottom: 20
                    }
                }
            }
        });



    }


}

window.customElements.define('whcg-chart', WhcgChart);

export { WhcgChart };
