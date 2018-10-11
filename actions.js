const THREE_VALUE = 'THREE_VALUE';
const FOUR_VALUE = 'FOUR_VALUE';
const FIVE_VALUE = 'FIVE_VALUE';
const SIX_VALUE = 'SIX_VALUE';
const DISCOUNTRATE_VALUE = 'DISCOUNTRATE_VALUE';
const INFLATIONRATE_VALUE = 'INFLATIONRATE_VALUE';
const STARTYEAR_VALUE = 'STARTYEAR_VALUE';
const NUMBEROFYEARS_VALUE = 'NUMBEROFYEARS_VALUE';
const INITIALSQM_VALUE = 'INITIALSQM_VALUE';
const INITIALESTABLISHCOSTPERSQMOWN_VALUE = 'INITIALESTABLISHCOSTPERSQMOWN_VALUE';
const KWHOWN_VALUE = 'KWHOWN_VALUE';
const KRPERKWHOWN_VALUE = 'KRPERKWHOWN_VALUE';

export const action = {
    threevalue: (payload) => {
        return {
          type: THREE_VALUE,
          payload: payload
        };
      },
      fourvalue: (payload) => {
        return {
          type: FOUR_VALUE,
          payload: payload
        };
      },
      fivevalue: (payload) => {
        return {
          type: FIVE_VALUE,
          payload: payload
        };
      },
      sixvalue: (payload) => {
        return {
          type: SIX_VALUE,
          payload: payload
        };
      },
      discountratevalue: (payload) => {
        return {
          type: DISCOUNTRATE_VALUE,
          payload: payload
        };
      },
      inflationratevalue: (payload) => {
        return {
          type: INFLATIONRATE_VALUE,
          payload: payload
        };
      },
      startyearvalue: (payload) => {
        return {
          type: STARTYEAR_VALUE,
          payload: payload
        };
      },
      numberofyearsvalue: (payload) => {
        return {
          type: NUMBEROFYEARS_VALUE,
          payload: payload
        };
      },
      initialsqmvalue: (payload) => {
        return {
          type: INITIALSQM_VALUE,
          payload: payload
        };
      },
      initialEstablishCostPerSqmOwnValue: (payload) => {
        return {
          type: INITIALESTABLISHCOSTPERSQMOWN_VALUE,
          payload: payload
        };
      },
      kwhOwnValue: (payload) => {
        return {
          type: KWHOWN_VALUE,
          payload: payload
        };
      },
      krPerKwhOwnValue: (payload) => {
        return {
          type: KRPERKWHOWN_VALUE,
          payload: payload
        };
      }
}
