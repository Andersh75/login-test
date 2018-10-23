export function reducer(state, action) {
    switch (action.type) {
    case 'INITIALAMOUNTAREAOWN_VALUE':
        return {...state, initialAmountAreaOwn: action.payload}
    case 'INITIALPRICEHEATOWN_VALUE':
        return {...state, initialPriceHeatOwn: action.payload}
    case 'INITIALAMOUNTHEATOWN_VALUE':
        return {...state, initialAmountHeatOwn: action.payload}
    case 'INITIALPRICEAREAOWN_VALUE':
        return {...state, initialPriceAreaOwn: action.payload}
    case 'COMPOUNDRATEREPAIROWN_VALUE':
        return {...state, compoundrateRepairOwn: action.payload}
    case 'INITIALPRICEREPAIROWN_VALUE':
        return {...state, initialPriceRepairOwn: action.payload}
    case 'INITIALAMOUNTAREARENT_VALUE':
        return {...state, initialAmountAreaRent: action.payload}
    case 'INITIALAMOUNTHEATRENT_VALUE':
        return {...state, initialAmountHeatRent: action.payload}
    case 'INITIALPRICEHEATRENT_VALUE':
        return {...state, initialPriceHeatRent: action.payload}
    case 'COMPOUNDRATEAREARENT_VALUE':
        return {...state, compoundrateAreaRent: action.payload}
    case 'INITIALPRICEAREARENT_VALUE':
        return {...state, initialPriceAreaRent: action.payload}
    case 'DISCOUNTRATE_VALUE':
        return {...state, discountrate: action.payload}
    case 'INFLATIONRATE_VALUE':
        return {...state, inflationrate: action.payload}
    case 'STARTYEAR_VALUE':
        return {...state, startyear: action.payload}
    case 'NUMBEROFYEARS_VALUE':
        return {...state, numberofyears: action.payload}

    case 'MAIN1COSTOWN_VALUE':
        return {...state, maint1costOwn: action.payload}
    case 'MAIN2COSTOWN_VALUE':
        return {...state, maint2costOwn: action.payload}
    case 'MAIN3COSTOWN_VALUE':
        return {...state, maint3costOwn: action.payload}
    case 'MAIN4COSTOWN_VALUE':
        return {...state, maint4costOwn: action.payload}
    case 'MAIN1YEAROWN_VALUE':
        return {...state, maint1yearOwn: action.payload}
    case 'MAIN2YEAROWN_VALUE':
        return {...state, maint2yearOwn: action.payload}
    case 'MAIN3YEAROWN_VALUE':
        return {...state, maint3yearOwn: action.payload}
    case 'MAIN4YEAROWN_VALUE':
        return {...state, maint4yearOwn: action.payload}

    case 'MAINYEARSOWN_VALUE':
        return {...state, maintyearsOwn: [...state.maintyearsOwn.push(JSON.stringify(action.payload))]}
    case 'MAINCOSTSOWN_VALUE':
        return {...state, maintcostsOwn: [...state.maintcostsOwn.push(JSON.stringify(action.payload))]}

    case 'EXP1YEAR_VALUE':
        return {...state, exp1year: action.payload}
    case 'EXP2YEAR_VALUE':
        return {...state, exp2year: action.payload}
    case 'EXP3YEAR_VALUE':
        return {...state, exp3year: action.payload}
    case 'EXP4YEAR_VALUE':
        return {...state, exp4year: action.payload}
    case 'EXP1AREA_VALUE':
        return {...state, exp1area: action.payload}
    case 'EXP2AREA_VALUE':
        return {...state, exp2area: action.payload}
    case 'EXP3AREA_VALUE':
        return {...state, exp3area: action.payload}
    case 'EXP4AREA_VALUE':
        return {...state, exp4area: action.payload}
    case 'DEC1YEAR_VALUE':
        return {...state, dec1year: action.payload}
    case 'DEC2YEAR_VALUE':
        return {...state, dec2year: action.payload}
    case 'DEC3YEAR_VALUE':
        return {...state, dec3year: action.payload}
    case 'DEC4YEAR_VALUE':
        return {...state, dec4year: action.payload}
    case 'DEC1AREA_VALUE':
        return {...state, dec1area: action.payload}
    case 'DEC2AREA_VALUE':
        return {...state, dec2area: action.payload}
    case 'DEC3AREA_VALUE':
        return {...state, dec3area: action.payload}
    case 'DEC4AREA_VALUE':
        return {...state, dec4area: action.payload}

    case 'KRPERKWH_VALUE':
        return {...state, krperkwh: action.payload}
    default:
        return state
    }
}