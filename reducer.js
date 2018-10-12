export function reducer(state, action) {
    switch (action.type) {
    case 'ONE_INCREMENT':
        return {...state, one: state.one + 1}
    case 'TWO_INCREMENT':
        return {...state, two: state.two + 1}
    case 'THREE_VALUE':
        return {...state, three: action.payload}
    case 'FOUR_VALUE':
        return {...state, four: action.payload}
    case 'FIVE_VALUE':
        return {...state, five: action.payload}
    case 'SIX_VALUE':
        return {...state, six: action.payload}
    case 'DISCOUNTRATE_VALUE':
        return {...state, discountrate: action.payload}
    case 'INFLATIONRATE_VALUE':
        return {...state, inflationrate: action.payload}
    case 'STARTYEAR_VALUE':
        return {...state, startyear: action.payload}
    case 'NUMBEROFYEARS_VALUE':
        return {...state, numberofyears: action.payload}
    case 'INITIALSQM_VALUE':
        return {...state, initialsqm: action.payload}
    case 'INITIALESTABLISHCOSTPERSQMOWN_VALUE':
        return {...state, initialEstablishCostPerSqmOwn: action.payload}
    case 'KWHOWN_VALUE':
        return {...state, kwhOwn: action.payload}
    case 'KRPERKWHOWN_VALUE':
        return {...state, krPerKwhOwn: action.payload}
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
    case 'COMPOUNDRATEREPAIROWN_VALUE':
        return {...state, compoundrateRepairOwn: action.payload}
    case 'INITIALREPAIRCOSTPERSQMOWN_VALUE':
        return {...state, initialRepairCostPerSqmOwn: action.payload}
    case 'INITIALAREAAMOUNT_VALUE':
        return {...state, initialAreaAmount: action.payload}
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
    default:
        return state
    }
}