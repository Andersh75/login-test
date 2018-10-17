import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-text-field';
import { action } from './actions.js';
import '@whcg/whcg-section-text-input';
import './whcg-select';
import './whcg-number-field-box.js';
import '@whcg/whcg-section-textlong-input-chart';
import '@whcg/whcg-section-chart-text-inputlong';
import '@whcg/whcg-section-textlong-chart-input'
import './whcg-box-container.js';
// import './whcg-chart';
import './whcg-number-field';
import { grid } from './grid.css.js';
import { whcgJsonMaker, whcgObjMerger, whcgPeriodOperator, getRandomColor, whcgChartJsTransformer, singleMultiplier, whcgCompounder, setFactory, setsPeriodOperator, setCompounder, whcgObjMaker } from './whcg-functions.js';
import * as rxjs from 'rxjs';


export class XFour extends LitElement {

    firstUpdated(changedProps) {
        this.constructor.props().forEach(prop => this[`${prop.propKey}$`] = new rxjs.BehaviorSubject(0));

        // rxjs.combineLatest(this.initialPriceHeatRent$, this.initialAmountHeatRent$).subscribe(([initialPriceHeatRent, initialAmountHeatRent]) => this.initialCostHeatRent = singleMultiplier([initialPriceHeatRent, initialAmountHeatRent]));
        // rxjs.combineLatest(this.initialCostHeatRent$, this.numberofyears$, this.inflationrate$).subscribe(([initialCostHeatRent, numberofyears, inflationrate]) => this.costHeatRentSet = this.setCostHeatRentSet(initialCostHeatRent, numberofyears, inflationrate));
        // rxjs.combineLatest(this.initialAmountAreaRent$, this.numberofyears$).subscribe(([initialAmountAreaRent, numberofyears]) => this.initialAmountAreaRentSet = this.setInitialAmountAreaRentSet(initialAmountAreaRent, numberofyears));
        // rxjs.combineLatest(this.costHeatRentSet$, this.initialAmountAreaRentSet$).subscribe(([costHeatRentSet, initialAmountAreaRentSet]) => this.compondedCostHeatRentSet = this.setCompondedCostHeatRentSet(initialAmountAreaRentSet, costHeatRentSet));
        // rxjs.combineLatest(this.compondedCostHeatRentSet$).subscribe(([compondedCostHeatRentSet]) => this.chartJsCompondedCostHeatRentObj = this.setChartJsCompondedCostHeatRentObj(compondedCostHeatRentSet));   
        // rxjs.combineLatest(this.initialPriceAreaRent$, this.initialAmountAreaRent$).subscribe(([initialPriceAreaRent, initialAmountAreaRent]) => this.initialCostAreaRent = singleMultiplier([initialPriceAreaRent, initialAmountAreaRent]));
        // rxjs.combineLatest(this.initialCostAreaRent$, this.numberofyears$, this.compoundrateAreaRent$).subscribe(([initialCostAreaRent, numberofyears, compoundrateAreaRent]) => this.costAreaRentSet = this.setCostAreaRentSet(initialCostAreaRent, numberofyears, compoundrateAreaRent));
        // rxjs.combineLatest(this.costAreaRentSet$, this.initialAmountAreaRentSet$).subscribe(([costAreaRentSet, initialAmountAreaRentSet]) => this.compondedCostAreaRentSet = this.setCompondedCostAreaRentSet(initialAmountAreaRentSet, costAreaRentSet));
        // rxjs.combineLatest(this.compondedCostAreaRentSet$).subscribe(([compondedCostAreaRentSet]) => this.chartJsCompondedCostAreaRentObj = this.setChartJsCompondedCostAreaRentObj(compondedCostAreaRentSet));  
        // rxjs.combineLatest(this.exp1area$, this.exp1year$, this.numberofyears$).subscribe(([exp1area, exp1year, numberofyears]) => this.exp1RentSet = this.setExp1RentSet(exp1area, exp1year, numberofyears));
        // rxjs.combineLatest(this.exp2area$, this.exp2year$, this.numberofyears$).subscribe(([exp2area, exp2year, numberofyears]) => this.exp2RentSet = this.setExp2RentSet(exp2area, exp2year, numberofyears));
        // rxjs.combineLatest(this.exp3area$, this.exp3year$, this.numberofyears$).subscribe(([exp3area, exp3year, numberofyears]) => this.exp3RentSet = this.setExp3RentSet(exp3area, exp3year, numberofyears));
        // rxjs.combineLatest(this.exp4area$, this.exp4year$, this.numberofyears$).subscribe(([exp4area, exp4year, numberofyears]) => this.exp4RentSet = this.setExp4RentSet(exp4area, exp4year, numberofyears));
        // rxjs.combineLatest(this.exp1RentSet$, this.exp2RentSet$, this.exp3RentSet$, this.exp4RentSet$).subscribe(([exp1RentSet, exp2RentSet, exp3RentSet, exp4RentSet]) => this.expAllRentSet = this.setExpAllRentSet(exp1RentSet, exp2RentSet, exp3RentSet, exp4RentSet));
        // rxjs.combineLatest(this.dec1area$, this.dec1year$, this.numberofyears$).subscribe(([dec1area, dec1year, numberofyears]) => this.dec1RentSet = this.setDec1RentSet(dec1area, dec1year, numberofyears));
        // rxjs.combineLatest(this.dec2area$, this.dec2year$, this.numberofyears$).subscribe(([dec2area, dec2year, numberofyears]) => this.dec2RentSet = this.setDec2RentSet(dec2area, dec2year, numberofyears));
        // rxjs.combineLatest(this.dec3area$, this.dec3year$, this.numberofyears$).subscribe(([dec3area, dec3year, numberofyears]) => this.dec3RentSet = this.setDec3RentSet(dec3area, dec3year, numberofyears));
        // rxjs.combineLatest(this.dec4area$, this.dec4year$, this.numberofyears$).subscribe(([dec4area, dec4year, numberofyears]) => this.dec4RentSet = this.setDec4RentSet(dec4area, dec4year, numberofyears));
        // rxjs.combineLatest(this.dec1RentSet$, this.dec2RentSet$, this.dec3RentSet$, this.dec4RentSet$).subscribe(([dec1RentSet, dec2RentSet, dec3RentSet, dec4RentSet]) => this.decAllRentSet = this.setDecAllRentSet(dec1RentSet, dec2RentSet, dec3RentSet, dec4RentSet));
        // rxjs.combineLatest(this.expAllRentSet$).subscribe(([expAllRentSet]) => this.chartJsExpAllRentObj = this.setChartJsExpAllRentObj(expAllRentSet));
        // rxjs.combineLatest(this.decAllRentSet$).subscribe(([decAllRentSet]) => this.chartJsDecAllRentObj = this.setChartJsDecAllRentObj(decAllRentSet));
        // rxjs.combineLatest(this.initialAmountAreaRentSet$, this.expAllRentSet$).subscribe(([initialAmountAreaRentSet, expAllRentSet]) => this.bruttoAllRentSet = this.setBruttoAllRentSet(initialAmountAreaRentSet, expAllRentSet));
        // rxjs.combineLatest(this.bruttoAllRentSet$, this.decAllRentSet$).subscribe(([bruttoAllRentSet, decAllRentSet]) => this.nettoAllRentSet = this.setNettoAllRentSet(bruttoAllRentSet, decAllRentSet));
        // rxjs.combineLatest(this.nettoAllRentSet$).subscribe(([nettoAllRentSet]) => this.chartJsNettoAllRentObj = this.setChartJsNettoAllRentObj(nettoAllRentSet));
    }

    updated(changedProps) {
        super.updated(changedProps);
        changedProps.forEach((value, key) => {
            this.constructor.props().forEach(prop => {
                if(prop.propKey === key) {
                    this[`${prop.propKey}$`].next(this[prop.propKey]);
                }
             });
        });
    }

    static get properties() {
        return this.props().reduce((acc, prop) => {
            return {...acc, [prop.propKey]: prop.propValue}
        }, {})
    }

    static props() {
        return [
        // { propKey: 'initialAmountAreaRent', propValue: {type: String} },
        // { propKey: 'initialAmountHeatRent', propValue: {type: String} },
        // { propKey: 'initialPriceHeatRent', propValue: {type: String} },
        // { propKey: 'initialCostHeatRent', propValue: {type: String} },
        // { propKey: 'costHeatRentSet', propValue: {type: Object} },
        // { propKey: 'initialAmountAreaRentSet', propValue: {type: Object} },
        // { propKey: 'compondedCostHeatRentSet', propValue: {type: Object} },
        // { propKey: 'chartJsCompondedCostHeatRentObj', propValue: {type: Object} },
        // { propKey: 'numberofyears', propValue: {type: String} },
        // { propKey: 'inflationrate', propValue: {type: String} },
        // { propKey: 'initialPriceAreaRent', propValue: {type: String} },
        // { propKey: 'compoundrateAreaRent', propValue: {type: String} },
        // { propKey: 'chartJsCompondedCostAreaRentObj', propValue: {type: Object} },
        // { propKey: 'compondedCostAreaRentSet', propValue: {type: Object} },
        // { propKey: 'costAreaRentSet', propValue: {type: Object} },
        // { propKey: 'initialCostAreaRent', propValue: {type: String} },
        // { propKey: 'exp1year', propValue: {type: String} },
        // { propKey: 'exp2year', propValue: {type: String} },
        // { propKey: 'exp3year', propValue: {type: String} },
        // { propKey: 'exp4year', propValue: {type: String} },
        // { propKey: 'exp1area', propValue: {type: String} },
        // { propKey: 'exp2area', propValue: {type: String} },
        // { propKey: 'exp3area', propValue: {type: String} },
        // { propKey: 'exp4area', propValue: {type: String} },
        // { propKey: 'dec1year', propValue: {type: String} },
        // { propKey: 'dec2year', propValue: {type: String} },
        // { propKey: 'dec3year', propValue: {type: String} },
        // { propKey: 'dec4year', propValue: {type: String} },
        // { propKey: 'dec1area', propValue: {type: String} },
        // { propKey: 'dec2area', propValue: {type: String} },
        // { propKey: 'dec3area', propValue: {type: String} },
        // { propKey: 'dec4area', propValue: {type: String} },
        // { propKey: 'exp1RentSet', propValue: {type: Object} },
        // { propKey: 'exp2RentSet', propValue: {type: Object} },
        // { propKey: 'exp3RentSet', propValue: {type: Object} },
        // { propKey: 'exp4RentSet', propValue: {type: Object} },
        // { propKey: 'decAllRentSet', propValue: {type: Object} },
        // { propKey: 'dec1RentSet', propValue: {type: Object} },
        // { propKey: 'dec2RentSet', propValue: {type: Object} },
        // { propKey: 'dec3RentSet', propValue: {type: Object} },
        // { propKey: 'dec4RentSet', propValue: {type: Object} },
        // { propKey: 'expAllRentSet', propValue: {type: Object} },
        // { propKey: 'chartJsExpAllRentObj', propValue: {type: Object} },
        // { propKey: 'chartJsDecAllRentObj', propValue: {type: Object} },
        // { propKey: 'nettoAllRentSet', propValue: {type: Object} },
        // { propKey: 'bruttoAllRentSet', propValue: {type: Object} },
        // { propKey: 'chartJsNettoAllRentObj', propValue: {type: Object} },
        ]
    };


    constructor() {
        super();
    }

    setChartJsNettoAllRentObj(nettoAllRentSet) {

        let whcgObjMakerData = {
            set: nettoAllRentSet,
            name: 'Nettolokalyta',
            label: 'kvm',
            datapackage: 'yearlyamounts'
        }

        let whcgChartJsTransformerData = {
            whcgObj: whcgObjMaker(whcgObjMakerData), 
            datapackage: 'yearlyamounts'
        }
        
        return whcgChartJsTransformer(whcgChartJsTransformerData)
    }

    setChartJsExpAllRentObj(expAllRentSet) {

        let whcgObjMakerData = {
            set: expAllRentSet,
            name: 'Expanderad lokalyta',
            label: 'kvm',
            datapackage: 'yearlyamounts'
        }

        let whcgChartJsTransformerData = {
            whcgObj: whcgObjMaker(whcgObjMakerData), 
            datapackage: 'yearlyamounts'
        }
        
        return whcgChartJsTransformer(whcgChartJsTransformerData)
    }

    setChartJsDecAllRentObj(decAllRentSet) {

        let whcgObjMakerData = {
            set: decAllRentSet,
            name: 'Avvecklad lokalyta',
            label: 'kvm',
            datapackage: 'yearlyamounts'
        }

        let whcgChartJsTransformerData = {
            whcgObj: whcgObjMaker(whcgObjMakerData), 
            datapackage: 'yearlyamounts'
        }
        
        return whcgChartJsTransformer(whcgChartJsTransformerData)
    }



    setExp1RentSet(exp1costRent, exp1yearRent, numberofyears) {
        let setFactoryData = {
            value: exp1costRent,
            period: numberofyears,
            key: exp1yearRent
        }
        return setFactory(setFactoryData)
    }

    setExp2RentSet(exp2costRent, exp2yearRent, numberofyears) {
        let setFactoryData = {
            value: exp2costRent,
            period: numberofyears,
            key: exp2yearRent
        }
        return setFactory(setFactoryData)
    }

    setExp3RentSet(exp3costRent, exp3yearRent, numberofyears) {
        let setFactoryData = {
            value: exp3costRent,
            period: numberofyears,
            key: exp3yearRent
        }
        return setFactory(setFactoryData)
    }

    setExp4RentSet(exp4costRent, exp4yearRent, numberofyears) {
        let setFactoryData = {
            value: exp4costRent,
            period: numberofyears,
            key: exp4yearRent
        }
        return setFactory(setFactoryData)
    }


    setDec1RentSet(dec1costRent, dec1yearRent, numberofyears) {
        let setFactoryData = {
            value: dec1costRent,
            period: numberofyears,
            key: dec1yearRent
        }
        return setFactory(setFactoryData)
    }

    setDec2RentSet(dec2costRent, dec2yearRent, numberofyears) {
        let setFactoryData = {
            value: dec2costRent,
            period: numberofyears,
            key: dec2yearRent
        }
        return setFactory(setFactoryData)
    }

    setDec3RentSet(dec3costRent, dec3yearRent, numberofyears) {
        let setFactoryData = {
            value: dec3costRent,
            period: numberofyears,
            key: dec3yearRent
        }
        return setFactory(setFactoryData)
    }

    setDec4RentSet(dec4costRent, dec4yearRent, numberofyears) {
        let setFactoryData = {
            value: dec4costRent,
            period: numberofyears,
            key: dec4yearRent
        }
        return setFactory(setFactoryData)
    }


    setExpAllRentSet(setExp1RentSet, setExp2RentSet, setExp3RentSet, setExp4RentSet) {
        let setsPeriodOperatorData = {
            sets: [setExp1RentSet, setExp2RentSet, setExp3RentSet, setExp4RentSet],
            mode: 'add'
        }
    
        return setsPeriodOperator(setsPeriodOperatorData);
    }


    setDecAllRentSet(setDec1RentSet, setDec2RentSet, setDec3RentSet, setDec4RentSet) {
        let setsPeriodOperatorData = {
            sets: [setDec1RentSet, setDec2RentSet, setDec3RentSet, setDec4RentSet],
            mode: 'add'
        }
    
        return setsPeriodOperator(setsPeriodOperatorData);
    }


    setBruttoAllRentSet(initialAmountAreaRentSet, expAllRentSet) {
        let setsPeriodOperatorData = {
            sets: [initialAmountAreaRentSet, expAllRentSet],
            mode: 'add'
        }
    
        return setsPeriodOperator(setsPeriodOperatorData);
    }

    setNettoAllRentSet(bruttoAllRentSet, decAllRentSet) {
        let setsPeriodOperatorData = {
            sets: [bruttoAllRentSet, decAllRentSet],
            mode: 'subtract'
        }
    
        return setsPeriodOperator(setsPeriodOperatorData);
    }




    setCostHeatRentSet(initialCostHeatRent, numberofyears, inflationrate) {
        let setFactoryData = {
            value: initialCostHeatRent,
            period: numberofyears,
            key: 'fill'
        }

        let setCompounderdata = {
            set: setFactory(setFactoryData),
            growthRate: inflationrate
        }
        return setCompounder(setCompounderdata)
    }

    setInitialAmountAreaRentSet(initialAmountAreaRent, numberofyears) {
        let setFactoryData = {
            value: initialAmountAreaRent,
            period: numberofyears,
            key: 'fill'
        }
        return setFactory(setFactoryData)
    }

    setCompondedCostHeatRentSet(initialAmountAreaRentSet, costHeatRentSet) {
        let setsPeriodOperatorData = {
            sets: [costHeatRentSet, initialAmountAreaRentSet],
            mode: 'multiply'
        }
    
        return setsPeriodOperator(setsPeriodOperatorData);
    }

    setChartJsCompondedCostHeatRentObj(compondedCostHeatRentSet) {

        let whcgObjMakerData = {
            set: compondedCostHeatRentSet,
            name: 'Värmekostnader',
            label: 'kr',
            datapackage: 'yearlyamounts'
        }

        let whcgChartJsTransformerData = {
            whcgObj: whcgObjMaker(whcgObjMakerData), 
            datapackage: 'yearlyamounts'
        }
        
        return whcgChartJsTransformer(whcgChartJsTransformerData)
    }





    setCostAreaRentSet(initialCostAreaRent, numberofyears, inflationrate) {
        let setFactoryData = {
            value: initialCostAreaRent,
            period: numberofyears,
            key: 'fill'
        }

        let setCompounderdata = {
            set: setFactory(setFactoryData),
            growthRate: inflationrate
        }
        return setCompounder(setCompounderdata)
    }

    setCompondedCostAreaRentSet(initialAmountAreaRentSet, costAreaRentSet) {
        let setsPeriodOperatorData = {
            sets: [costAreaRentSet, initialAmountAreaRentSet],
            mode: 'multiply'
        }
    
        return setsPeriodOperator(setsPeriodOperatorData);
    }

    setChartJsCompondedCostAreaRentObj(compondedCostAreaRentSet) {

        let whcgObjMakerData = {
            set: compondedCostAreaRentSet,
            name: 'Hyreskostnader',
            label: 'kr',
            datapackage: 'yearlyamounts'
        }

        let whcgChartJsTransformerData = {
            whcgObj: whcgObjMaker(whcgObjMakerData), 
            datapackage: 'yearlyamounts'
        }
        
        return whcgChartJsTransformer(whcgChartJsTransformerData)
    }


    valueChanged(e) {
        this.storeHolder.store.dispatch(action[`${e.path[0].id}Value`](e.detail.value));
    }


    _stateChanged(state) {
        this.constructor.props().forEach(prop => {
            if (this[prop.propKey] !== state[prop.propKey] && state[prop.propKey] != undefined) {
                this[prop.propKey] = state[prop.propKey];
            }
        })
    }

    render() {
        return html`
        ${grid}
        <style>
        </style>
        <div class="grid-12">

            <whcg-section-textlong-chartlong class="col1span12">
                <span slot="title">SAMLADE KOSTNADER</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                    chartjson="{{chartJsMergedCompoundedCostsJson}}">
                </whcg-chart>
            </whcg-section-textlong-chartlong>

        </div>  `
    }
}

customElements.define('x-four', XFour);