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
    default:
        return state
    }
}