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


export class XThree extends LitElement {

    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('initialAmountAreaRent')) {
            this.initialAmountAreaRent$.next(this.initialAmountAreaRent);
        }

        if (changedProps.has('initialPriceHeatRent')) {
            this.initialPriceHeatRent$.next(this.initialPriceHeatRent);
        }

        if (changedProps.has('initialAmountHeatRent')) {
            this.initialAmountHeatRent$.next(this.initialAmountHeatRent);
        }

        if (changedProps.has('initialCostHeatRent')) {
            this.initialCostHeatRent$.next(this.initialCostHeatRent);
        }

        if (changedProps.has('costHeatRentSet')) {
            this.costHeatRentSet$.next(this.costHeatRentSet);
        }

        if (changedProps.has('initialAmountAreaRentSet')) {
            this.initialAmountAreaRentSet$.next(this.initialAmountAreaRentSet);
        }

        if (changedProps.has('compondedCostHeatRentSet')) {
            this.compondedCostHeatRentSet$.next(this.compondedCostHeatRentSet);
        }

        if (changedProps.has('numberofyears')) {
            this.numberofyears$.next(this.numberofyears);
        }

        if (changedProps.has('inflationrate')) {
            this.inflationrate$.next(this.inflationrate);
        }

        if (changedProps.has('initialPriceAreaRent')) {
            this.initialPriceAreaRent$.next(this.initialPriceAreaRent);
        }

        if (changedProps.has('compoundrateAreaRent')) {
            this.compoundrateAreaRent$.next(this.compoundrateAreaRent);
        }

        if (changedProps.has('costAreaRentSet')) {
            this.costAreaRentSet$.next(this.costAreaRentSet);
        }

        if (changedProps.has('compondedCostAreaRentSet')) {
            this.compondedCostAreaRentSet$.next(this.compondedCostAreaRentSet);
        }

        if (changedProps.has('initialCostAreaRent')) {
            this.initialCostAreaRent$.next(this.initialCostAreaRent);
        }



        if (changedProps.has('exp1year')) {
            this.exp1year$.next(this.exp1year);
        }

        if (changedProps.has('exp2year')) {
            this.exp2year$.next(this.exp2year);
        }

        if (changedProps.has('exp3year')) {
            this.exp3year$.next(this.exp3year);
        }

        if (changedProps.has('exp4year')) {
            this.exp4year$.next(this.exp4year);
        }

        if (changedProps.has('dec1year')) {
            this.dec1year$.next(this.dec1year);
        }

        if (changedProps.has('dec2year')) {
            this.dec2year$.next(this.dec2year);
        }

        if (changedProps.has('dec3year')) {
            this.dec3year$.next(this.dec3year);
        }

        if (changedProps.has('dec4year')) {
            this.dec4year$.next(this.dec4year);
        }

        if (changedProps.has('exp1area')) {
            this.exp1area$.next(this.exp1area);
        }

        if (changedProps.has('exp2area')) {
            this.exp2area$.next(this.exp2area);
        }

        if (changedProps.has('exp3area')) {
            this.exp3area$.next(this.exp3area);
        }

        if (changedProps.has('exp4area')) {
            this.exp4area$.next(this.exp4area);
        }

        if (changedProps.has('dec1area')) {
            this.dec1area$.next(this.dec1area);
        }

        if (changedProps.has('dec2area')) {
            this.dec2area$.next(this.dec2area);
        }

        if (changedProps.has('dec3area')) {
            this.dec3area$.next(this.dec3area);
        }

        if (changedProps.has('dec4area')) {
            this.dec4area$.next(this.dec4area);
        }




        if (changedProps.has('exp1RentSet')) {
            this.exp1RentSet$.next(this.exp1RentSet);
        }

        if (changedProps.has('exp2RentSet')) {
            this.exp2RentSet$.next(this.exp2RentSet);
        }

        if (changedProps.has('exp3RentSet')) {
            this.exp3RentSet$.next(this.exp3RentSet);
        }

        if (changedProps.has('exp4RentSet')) {
            this.exp4RentSet$.next(this.exp4RentSet);
        }

        if (changedProps.has('dec1RentSet')) {
            this.dec1RentSet$.next(this.dec1RentSet);
        }

        if (changedProps.has('dec2RentSet')) {
            this.dec2RentSet$.next(this.dec2RentSet);
        }

        if (changedProps.has('dec3RentSet')) {
            this.dec3RentSet$.next(this.dec3RentSet);
        }

        if (changedProps.has('dec4RentSet')) {
            this.dec4RentSet$.next(this.dec4RentSet);
        }

        if (changedProps.has('decAllRentSet')) {
            this.decAllRentSet$.next(this.decAllRentSet);
        }

        if (changedProps.has('expAllRentSet')) {
            this.expAllRentSet$.next(this.expAllRentSet);
        }


        if (changedProps.has('bruttoAllRentSet')) {
            this.bruttoAllRentSet$.next(this.bruttoAllRentSet);
        }

        if (changedProps.has('nettoAllRentSet')) {
            this.nettoAllRentSet$.next(this.nettoAllRentSet);
        }



        



    }

    constructor() {
        super();
        this.initialAmountAreaRent$ = new rxjs.BehaviorSubject(0);
        this.initialPriceHeatRent$ = new rxjs.BehaviorSubject(0);
        this.initialAmountHeatRent$ = new rxjs.BehaviorSubject(0);
        this.initialCostHeatRent$ = new rxjs.BehaviorSubject(0);
        this.costHeatRentSet$ = new rxjs.BehaviorSubject(0);
        this.initialAmountAreaRentSet$ = new rxjs.BehaviorSubject(0);
        this.compondedCostHeatRentSet$ = new rxjs.BehaviorSubject(0);
        this.numberofyears$ = new rxjs.BehaviorSubject(0);
        this.inflationrate$ = new rxjs.BehaviorSubject(0);
        this.compoundrateAreaRent$ = new rxjs.BehaviorSubject(0);
        this.initialPriceAreaRent$ = new rxjs.BehaviorSubject(0);
        this.costAreaRentSet$ = new rxjs.BehaviorSubject(0);
        this.compondedCostAreaRentSet$ = new rxjs.BehaviorSubject(0);
        this.initialCostAreaRent$ = new rxjs.BehaviorSubject(0);
        this.exp1year$ = new rxjs.BehaviorSubject(0);
        this.exp2year$ = new rxjs.BehaviorSubject(0);
        this.exp3year$ = new rxjs.BehaviorSubject(0);
        this.exp4year$ = new rxjs.BehaviorSubject(0);
        this.exp1area$ = new rxjs.BehaviorSubject(0);
        this.exp2area$ = new rxjs.BehaviorSubject(0);
        this.exp3area$ = new rxjs.BehaviorSubject(0);
        this.exp4area$ = new rxjs.BehaviorSubject(0);
        this.dec1year$ = new rxjs.BehaviorSubject(0);
        this.dec2year$ = new rxjs.BehaviorSubject(0);
        this.dec3year$ = new rxjs.BehaviorSubject(0);
        this.dec4year$ = new rxjs.BehaviorSubject(0);
        this.dec1area$ = new rxjs.BehaviorSubject(0);
        this.dec2area$ = new rxjs.BehaviorSubject(0);
        this.dec3area$ = new rxjs.BehaviorSubject(0);
        this.dec4area$ = new rxjs.BehaviorSubject(0);
        this.exp1RentSet$ = new rxjs.BehaviorSubject(0);
        this.exp2RentSet$ = new rxjs.BehaviorSubject(0);
        this.exp3RentSet$ = new rxjs.BehaviorSubject(0);
        this.exp4RentSet$ = new rxjs.BehaviorSubject(0);
        this.dec1RentSet$ = new rxjs.BehaviorSubject(0);
        this.dec2RentSet$ = new rxjs.BehaviorSubject(0);
        this.dec3RentSet$ = new rxjs.BehaviorSubject(0);
        this.dec4RentSet$ = new rxjs.BehaviorSubject(0);

        this.expAllRentSet$ = new rxjs.BehaviorSubject(0);
        this.decAllRentSet$ = new rxjs.BehaviorSubject(0);

        this.bruttoAllRentSet$ = new rxjs.BehaviorSubject(0);
        this.nettoAllRentSet$ = new rxjs.BehaviorSubject(0);

        

        rxjs.combineLatest(this.initialPriceHeatRent$, this.initialAmountHeatRent$).subscribe(([initialPriceHeatRent, initialAmountHeatRent]) => this.initialCostHeatRent = singleMultiplier([initialPriceHeatRent, initialAmountHeatRent]));
        rxjs.combineLatest(this.initialCostHeatRent$, this.numberofyears$, this.inflationrate$).subscribe(([initialCostHeatRent, numberofyears, inflationrate]) => this.costHeatRentSet = this.setCostHeatRentSet(initialCostHeatRent, numberofyears, inflationrate));
        rxjs.combineLatest(this.initialAmountAreaRent$, this.numberofyears$).subscribe(([initialAmountAreaRent, numberofyears]) => this.initialAmountAreaRentSet = this.setInitialAmountAreaRentSet(initialAmountAreaRent, numberofyears));
        rxjs.combineLatest(this.costHeatRentSet$, this.initialAmountAreaRentSet$).subscribe(([costHeatRentSet, initialAmountAreaRentSet]) => this.compondedCostHeatRentSet = this.setCompondedCostHeatRentSet(initialAmountAreaRentSet, costHeatRentSet));
        rxjs.combineLatest(this.compondedCostHeatRentSet$).subscribe(([compondedCostHeatRentSet]) => this.chartJsCompondedCostHeatRentObj = this.setChartJsCompondedCostHeatRentObj(compondedCostHeatRentSet));   
    
        rxjs.combineLatest(this.initialPriceAreaRent$, this.initialAmountAreaRent$).subscribe(([initialPriceAreaRent, initialAmountAreaRent]) => this.initialCostAreaRent = singleMultiplier([initialPriceAreaRent, initialAmountAreaRent]));
        rxjs.combineLatest(this.initialCostAreaRent$, this.numberofyears$, this.compoundrateAreaRent$).subscribe(([initialCostAreaRent, numberofyears, compoundrateAreaRent]) => this.costAreaRentSet = this.setCostAreaRentSet(initialCostAreaRent, numberofyears, compoundrateAreaRent));
        rxjs.combineLatest(this.costAreaRentSet$, this.initialAmountAreaRentSet$).subscribe(([costAreaRentSet, initialAmountAreaRentSet]) => this.compondedCostAreaRentSet = this.setCompondedCostAreaRentSet(initialAmountAreaRentSet, costAreaRentSet));
        rxjs.combineLatest(this.compondedCostAreaRentSet$).subscribe(([compondedCostAreaRentSet]) => this.chartJsCompondedCostAreaRentObj = this.setChartJsCompondedCostAreaRentObj(compondedCostAreaRentSet));  
    


        rxjs.combineLatest(this.exp1area$, this.exp1year$, this.numberofyears$).subscribe(([exp1area, exp1year, numberofyears]) => this.exp1RentSet = this.setExp1RentSet(exp1area, exp1year, numberofyears));
        rxjs.combineLatest(this.exp2area$, this.exp2year$, this.numberofyears$).subscribe(([exp2area, exp2year, numberofyears]) => this.exp2RentSet = this.setExp2RentSet(exp2area, exp2year, numberofyears));
        rxjs.combineLatest(this.exp3area$, this.exp3year$, this.numberofyears$).subscribe(([exp3area, exp3year, numberofyears]) => this.exp3RentSet = this.setExp3RentSet(exp3area, exp3year, numberofyears));
        rxjs.combineLatest(this.exp4area$, this.exp4year$, this.numberofyears$).subscribe(([exp4area, exp4year, numberofyears]) => this.exp4RentSet = this.setExp4RentSet(exp4area, exp4year, numberofyears));

        rxjs.combineLatest(this.exp1RentSet$, this.exp2RentSet$, this.exp3RentSet$, this.exp4RentSet$).subscribe(([exp1RentSet, exp2RentSet, exp3RentSet, exp4RentSet]) => this.expAllRentSet = this.setExpAllRentSet(exp1RentSet, exp2RentSet, exp3RentSet, exp4RentSet));

        rxjs.combineLatest(this.dec1area$, this.dec1year$, this.numberofyears$).subscribe(([dec1area, dec1year, numberofyears]) => this.dec1RentSet = this.setDec1RentSet(dec1area, dec1year, numberofyears));
        rxjs.combineLatest(this.dec2area$, this.dec2year$, this.numberofyears$).subscribe(([dec2area, dec2year, numberofyears]) => this.dec2RentSet = this.setDec2RentSet(dec2area, dec2year, numberofyears));
        rxjs.combineLatest(this.dec3area$, this.dec3year$, this.numberofyears$).subscribe(([dec3area, dec3year, numberofyears]) => this.dec3RentSet = this.setDec3RentSet(dec3area, dec3year, numberofyears));
        rxjs.combineLatest(this.dec4area$, this.dec4year$, this.numberofyears$).subscribe(([dec4area, dec4year, numberofyears]) => this.dec4RentSet = this.setDec4RentSet(dec4area, dec4year, numberofyears));

        rxjs.combineLatest(this.dec1RentSet$, this.dec2RentSet$, this.dec3RentSet$, this.dec4RentSet$).subscribe(([dec1RentSet, dec2RentSet, dec3RentSet, dec4RentSet]) => this.decAllRentSet = this.setDecAllRentSet(dec1RentSet, dec2RentSet, dec3RentSet, dec4RentSet));




        rxjs.combineLatest(this.expAllRentSet$).subscribe(([expAllRentSet]) => this.chartJsExpAllRentObj = this.setChartJsExpAllRentObj(expAllRentSet));
        rxjs.combineLatest(this.decAllRentSet$).subscribe(([decAllRentSet]) => this.chartJsDecAllRentObj = this.setChartJsDecAllRentObj(decAllRentSet));



        rxjs.combineLatest(this.initialAmountAreaRentSet$, this.expAllRentSet$).subscribe(([initialAmountAreaRentSet, expAllRentSet]) => this.bruttoAllRentSet = this.setBruttoAllRentSet(initialAmountAreaRentSet, expAllRentSet));

        rxjs.combineLatest(this.bruttoAllRentSet$, this.decAllRentSet$).subscribe(([bruttoAllRentSet, decAllRentSet]) => this.nettoAllRentSet = this.setNettoAllRentSet(bruttoAllRentSet, decAllRentSet));
        rxjs.combineLatest(this.nettoAllRentSet$).subscribe(([nettoAllRentSet]) => this.chartJsNettoAllRentObj = this.setChartJsNettoAllRentObj(nettoAllRentSet));
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

    static get properties() {
        return {
            storeHolder: {type: Object},
            initialAmountAreaRent: {type: String},
            initialAmountHeatRent: {type: String},
            initialPriceHeatRent: {type: String},
            initialCostHeatRent: {type: String},
            costHeatRentSet: {type: Object},
            initialAmountAreaRentSet: {type: Object},
            compondedCostHeatRentSet: {type: Object},
            chartJsCompondedCostHeatRentObj: {type: Object},
            numberofyears: {type: String},
            inflationrate: {type: String},
            initialPriceAreaRent: {type: String},
            compoundrateAreaRent: {type: String},
            chartJsCompondedCostAreaRentObj: {type: Object},
            compondedCostAreaRentSet: {type: Object},
            costAreaRentSet: {type: Object},
            initialCostAreaRent: {type: String},
            exp1year: {type: String},
            exp2year: {type: String},
            exp3year: {type: String},
            exp4year: {type: String},
            exp1area: {type: String},
            exp2area: {type: String},
            exp3area: {type: String},
            exp4area: {type: String},
            dec1year: {type: String},
            dec2year: {type: String},
            dec3year: {type: String},
            dec4year: {type: String},
            dec1area: {type: String},
            dec2area: {type: String},
            dec3area: {type: String},
            dec4area: {type: String},
            exp1RentSet: {type: Object},
            exp2RentSet: {type: Object},
            exp3RentSet: {type: Object},
            exp4RentSet: {type: Object},
            decAllRentSet: {type: Object},
            dec1RentSet: {type: Object},
            dec2RentSet: {type: Object},
            dec3RentSet: {type: Object},
            dec4RentSet: {type: Object},
            expAllRentSet: {type: Object},
            chartJsExpAllRentObj: {type: Object},
            chartJsDecAllRentObj: {type: Object},
            nettoAllRentSet: {type: Object},
            bruttoAllRentSet: {type: Object},
            chartJsNettoAllRentObj: {type: Object},
            // rentincrease: {type: String},
            // initialRentCostPerSqm: {type: String},
            // krperkwh: {type: String},
            // kwh: {type: String} 
        };
    }

    render() {
        return html`
        ${grid}
        <style>
        </style>
        <div class="grid-12">

            <whcg-section-chart-text-inputlong class="col1span12">
                <span slot="title">EXPANSION</span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsExpAllRentObj}>
                </whcg-chart>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-box-container slot="input" name="Expansionsfaser">
                    <whcg-number-field-box column name="Expansionsfas 1" mode="none">
                        <whcg-number-field label="År" @valueChanged=${this.exp1yearChanged.bind(this)} value=${this.exp1year} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Tillfört antal kvm" @valueChanged=${this.exp1areaChanged.bind(this)} value=${this.exp1area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Expansionsfas 2" mode="none">
                        <whcg-number-field label="År" @valueChanged=${this.exp2yearChanged.bind(this)} value=${this.exp2year} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Tillfört antal kvm" @valueChanged=${this.exp2areaChanged.bind(this)} value=${this.exp2area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Expansionsfas 3" mode="none">
                        <whcg-number-field label="År" @valueChanged=${this.exp3yearChanged.bind(this)} value=${this.exp3year} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Tillfört antal kvm" @valueChanged=${this.exp3areaChanged.bind(this)} value=${this.exp3area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Expansionsfas 4" mode="none">
                        <whcg-number-field label="År" @valueChanged=${this.exp4yearChanged.bind(this)} value=${this.exp4year} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Tillfört antal kvm" @valueChanged=${this.exp4areaChanged.bind(this)} value=${this.exp4area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                </whcg-box-container>
            </whcg-section-chart-text-inputlong>



            <whcg-section-chart-text-inputlong class="col1span12">
            <span slot="title">AVVECKLING</span>
            <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
            </span>
            <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsDecAllRentObj}>
            </whcg-chart>
            <whcg-box-container slot="input" name="Avvecklingsfaser">
                <whcg-number-field-box column name="Avvecklingsfas 1" mode="none">
                    <whcg-number-field label="År" @valueChanged=${this.dec1yearChanged.bind(this)} value=${this.dec1year} placeholder="...antal"></whcg-number-field>
                    <whcg-number-field label="Avvecklat antal kvm" @valueChanged=${this.dec1areaChanged.bind(this)} value=${this.dec1area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-number-field-box column name="Avvecklingsfas 2" mode="none">
                    <whcg-number-field label="År" @valueChanged=${this.dec2yearChanged.bind(this)} value=${this.dec2year} placeholder="...antal"></whcg-number-field>
                    <whcg-number-field label="Avvecklat antal kvm" @valueChanged=${this.dec2areaChanged.bind(this)} value=${this.dec2area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-number-field-box column name="Avvecklingsfas 3" mode="none">
                    <whcg-number-field label="År" @valueChanged=${this.dec3yearChanged.bind(this)} value=${this.dec3year} placeholder="...antal"></whcg-number-field>
                    <whcg-number-field label="Avvecklat antal kvm" @valueChanged=${this.dec3areaChanged.bind(this)} value=${this.dec3area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-number-field-box column name="Avvecklingsfas 4" mode="none">
                    <whcg-number-field label="År" @valueChanged=${this.dec4yearChanged.bind(this)} value=${this.dec4year} placeholder="...antal"></whcg-number-field>
                    <whcg-number-field label="Avvecklat antal kvm" @valueChanged=${this.dec4areaChanged.bind(this)} value=${this.dec4area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-box-container>
            </whcg-section-chart-text-inputlong>
            <whcg-section-text-input class="col1span12">
                <span slot="title">INITIAL YTSTORLEK</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="" mode="none">
                    <whcg-number-field label="Antal kvm" @valueChanged=${this.initialAmountAreaRentChanged.bind(this)} value=${this.initialAmountAreaRent} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-text-input>

            <whcg-section-textlong-chart-input class="col1span12">
                <span slot="title">TOTAL FÖRHYRD YTA</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                .value=${this.chartJsNettoAllRentObj}>
                </whcg-chart>
            </whcg-section-textlong-chart-input>

            <whcg-section-textlong-chart-input class="col1span12">
                <span slot="title">HYRESNIVÅ OCH HYRESUTVECKLING</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                .value=${this.chartJsCompondedCostAreaRentObj}>
                </whcg-chart>
                <whcg-number-field-box slot="input" column name="" mode="none">
                    <whcg-number-field label="Hyreskostnad per kvm" @valueChanged=${this.initialPriceAreaRentChanged.bind(this)} value=${this.initialPriceAreaRent} suffix="kr" placeholder="...antal" kind="amount"></whcg-number-field>
                    <whcg-select label="Hyreshöjningstakt" suffix="%" @valueChanged=${this.compoundrateAreaRentChanged.bind(this)} value=${this.compoundrateAreaRent} placeholder="...antal procent"
                        jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
                </whcg-number-field-box>
                </whcg-section-textlong-chart-input>

            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="title">Värmekostnader</span>
                <span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="" mode="none">
                    <whcg-number-field label="Antal kWh/kvm/år" @valueChanged=${this.initialAmountHeatRentChanged.bind(this)} value=${this.initialAmountHeatRent} placeholder="...antal" kind="amount" suffix="kWh" valueoutput="{{kwh}}"></whcg-number-field>
                    <whcg-number-field label="Kostnad per kWh" @valueChanged=${this.initialPriceHeatRentChanged.bind(this)} value=${this.initialPriceHeatRent} placeholder="... antal" kind="price" suffix="kr" valueoutput="{{krperkwh}}"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-chart slot="chart" type="bar" width="800px" height="450px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                .value=${this.chartJsCompondedCostHeatRentObj}>
                </whcg-chart> 
            </whcg-section-textlong-input-chart>


        </div>  `
    }


    initialAmountAreaRentChanged(e) {
        this.storeHolder.store.dispatch(action.initialAmountAreaRentValue(e.detail.value));
    }

    initialAmountHeatRentChanged(e) {
        this.storeHolder.store.dispatch(action.initialAmountHeatRentValue(e.detail.value));
    }

    initialPriceHeatRentChanged(e) {
        this.storeHolder.store.dispatch(action.initialPriceHeatRentValue(e.detail.value));
    }

    initialPriceAreaRentChanged(e) {
        this.storeHolder.store.dispatch(action.initialPriceAreaRentValue(e.detail.value));
    }

    compoundrateAreaRentChanged(e) {
        this.storeHolder.store.dispatch(action.compoundrateAreaRentValue(e.detail.value));
    }



    exp1yearChanged(e) {
        this.storeHolder.store.dispatch(action.exp1yearValue(e.detail.value));
    }

    exp2yearChanged(e) {
        this.storeHolder.store.dispatch(action.exp2yearValue(e.detail.value));
    }

    exp3yearChanged(e) {
        this.storeHolder.store.dispatch(action.exp3yearValue(e.detail.value));
    }

    exp4yearChanged(e) {
        this.storeHolder.store.dispatch(action.exp4yearValue(e.detail.value));
    }

    exp1areaChanged(e) {
        this.storeHolder.store.dispatch(action.exp1areaValue(e.detail.value));
    }

    exp2areaChanged(e) {
        this.storeHolder.store.dispatch(action.exp2areaValue(e.detail.value));
    }

    exp3areaChanged(e) {
        this.storeHolder.store.dispatch(action.exp3areaValue(e.detail.value));
    }

    exp4areaChanged(e) {
        this.storeHolder.store.dispatch(action.exp4areaValue(e.detail.value));
    }


    dec1yearChanged(e) {
        this.storeHolder.store.dispatch(action.dec1yearValue(e.detail.value));
    }

    dec2yearChanged(e) {
        this.storeHolder.store.dispatch(action.dec2yearValue(e.detail.value));
    }

    dec3yearChanged(e) {
        this.storeHolder.store.dispatch(action.dec3yearValue(e.detail.value));
    }

    dec4yearChanged(e) {
        this.storeHolder.store.dispatch(action.dec4yearValue(e.detail.value));
    }

    dec1areaChanged(e) {
        this.storeHolder.store.dispatch(action.dec1areaValue(e.detail.value));
    }

    dec2areaChanged(e) {
        this.storeHolder.store.dispatch(action.dec2areaValue(e.detail.value));
    }

    dec3areaChanged(e) {
        this.storeHolder.store.dispatch(action.dec3areaValue(e.detail.value));
    }

    dec4areaChanged(e) {
        this.storeHolder.store.dispatch(action.dec4areaValue(e.detail.value));
    }












    _stateChanged(state) {
        if (this.initialAmountAreaRent !== state.initialAmountAreaRent) {
            this.initialAmountAreaRent = state.initialAmountAreaRent;
        }

        if (this.initialAmountHeatRent !== state.initialAmountHeatRent) {
            this.initialAmountHeatRent = state.initialAmountHeatRent;
        }

        if (this.initialPriceHeatRent !== state.initialPriceHeatRent) {
            this.initialPriceHeatRent = state.initialPriceHeatRent;
        }

        if (this.numberofyears !== state.numberofyears) {
            this.numberofyears = state.numberofyears;
        }

        if (this.inflationrate !== state.inflationrate) {
            this.inflationrate = state.inflationrate;
        }

        if (this.compoundrateAreaRent !== state.compoundrateAreaRent) {
            this.compoundrateAreaRent = state.compoundrateAreaRent;
        }

        if (this.initialPriceAreaRent !== state.initialPriceAreaRent) {
            this.initialPriceAreaRent = state.initialPriceAreaRent;
        }

        if (this.exp1year !== state.exp1year) {
            this.exp1year = state.exp1year;
        }

        if (this.exp2year !== state.exp2year) {
            this.exp2year = state.exp2year;
        }

        if (this.exp3year !== state.exp3year) {
            this.exp3year = state.exp3year;
        }

        if (this.exp4year !== state.exp4year) {
            this.exp4year = state.exp4year;
        }

        if (this.exp1area !== state.exp1area) {
            this.exp1area = state.exp1area;
        }

        if (this.exp2area !== state.exp2area) {
            this.exp2area = state.exp2area;
        }

        if (this.exp3area !== state.exp3area) {
            this.exp3area = state.exp3area;
        }

        if (this.exp4area !== state.exp4area) {
            this.exp4area = state.exp4area;
        }



        if (this.dec1year !== state.dec1year) {
            this.dec1year = state.dec1year;
        }

        if (this.dec2year !== state.dec2year) {
            this.dec2year = state.dec2year;
        }

        if (this.dec3year !== state.dec3year) {
            this.dec3year = state.dec3year;
        }

        if (this.dec4year !== state.dec4year) {
            this.dec4year = state.dec4year;
        }

        if (this.dec1area !== state.dec1area) {
            this.dec1area = state.dec1area;
        }

        if (this.dec2area !== state.dec2area) {
            this.dec2area = state.dec2area;
        }

        if (this.dec3area !== state.dec3area) {
            this.dec3area = state.dec3area;
        }

        if (this.dec4area !== state.dec4area) {
            this.dec4area = state.dec4area;
        }




        // this.exp1year = state.exp1year;
        // this.exp2year = state.exp2year;
        // this.exp3year = state.exp3year;
        // this.exp4year = state.exp4year;
        // this.exp1area = state.exp1area;
        // this.exp2area = state.exp2area;
        // this.exp3area = state.exp3area;
        // this.exp4area = state.exp4area;

        // this.dec1year = state.dec1year;
        // this.dec2year = state.dec2year;
        // this.dec3year = state.dec3year;
        // this.dec4year = state.dec4year;
        // this.dec1area = state.dec1area;
        // this.dec2area = state.dec2area;
        // this.dec3area = state.dec3area;
        // this.dec4area = state.dec4area;




    }
}

customElements.define('x-three', XThree);









