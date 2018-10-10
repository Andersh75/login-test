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
    default:
        return state
    }
}