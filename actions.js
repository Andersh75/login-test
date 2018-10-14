const THREE_VALUE = 'THREE_VALUE';
const FOUR_VALUE = 'FOUR_VALUE';
const FIVE_VALUE = 'FIVE_VALUE';
const SIX_VALUE = 'SIX_VALUE';
const DISCOUNTRATE_VALUE = 'DISCOUNTRATE_VALUE';
const INFLATIONRATE_VALUE = 'INFLATIONRATE_VALUE';
const STARTYEAR_VALUE = 'STARTYEAR_VALUE';
const NUMBEROFYEARS_VALUE = 'NUMBEROFYEARS_VALUE';
const INITIALAREAAMOUNTOWN_VALUE = 'INITIALAREAAMOUNTOWN_VALUE';
const INITIALESTABLISHCOSTPERSQMOWN_VALUE = 'INITIALESTABLISHCOSTPERSQMOWN_VALUE';
const KWHOWN_VALUE = 'KWHOWN_VALUE';
const KRPERKWHOWN_VALUE = 'KRPERKWHOWN_VALUE';
const MAIN1COSTOWN_VALUE = 'MAIN1COSTOWN_VALUE';
const MAIN2COSTOWN_VALUE = 'MAIN2COSTOWN_VALUE';
const MAIN3COSTOWN_VALUE = 'MAIN3COSTOWN_VALUE';
const MAIN4COSTOWN_VALUE = 'MAIN4COSTOWN_VALUE';
const MAIN1YEAROWN_VALUE = 'MAIN1YEAROWN_VALUE';
const MAIN2YEAROWN_VALUE = 'MAIN2YEAROWN_VALUE';
const MAIN3YEAROWN_VALUE = 'MAIN3YEAROWN_VALUE';
const MAIN4YEAROWN_VALUE = 'MAIN4YEAROWN_VALUE';
const INITIALREPAIRCOSTPERSQMOWN_VALUE = 'INITIALREPAIRCOSTPERSQMOWN_VALUE';
const COMPOUNDRATEREPAIROWN_VALUE = 'COMPOUNDRATEREPAIROWN_VALUE';
const INITIALAREAAMOUNT_VALUE = 'INITIALAREAAMOUNT_VALUE';
const EXP1YEAR_VALUE = 'EXP1YEAR_VALUE';
const EXP2YEAR_VALUE = 'EXP2YEAR_VALUE';
const EXP3YEAR_VALUE = 'EXP3YEAR_VALUE';
const EXP4YEAR_VALUE = 'EXP4YEAR_VALUE';
const EXP1AREA_VALUE = 'EXP1AREA_VALUE';
const EXP2AREA_VALUE = 'EXP2AREA_VALUE';
const EXP3AREA_VALUE = 'EXP3AREA_VALUE';
const EXP4AREA_VALUE = 'EXP4AREA_VALUE';

const DEC1YEAR_VALUE = 'DEC1YEAR_VALUE';
const DEC2YEAR_VALUE = 'DEC2YEAR_VALUE';
const DEC3YEAR_VALUE = 'DEC3YEAR_VALUE';
const DEC4YEAR_VALUE = 'DEC4YEAR_VALUE';
const DEC1AREA_VALUE = 'DEC1AREA_VALUE';
const DEC2AREA_VALUE = 'DEC2AREA_VALUE';
const DEC3AREA_VALUE = 'DEC3AREA_VALUE';
const DEC4AREA_VALUE = 'DEC4AREA_VALUE';

const RENTINCREASE_VALUE = 'RENTINCREASE_VALUE';
const INITIALRENTCOSTPERSQM_VALUE = 'INITIALRENTCOSTPERSQM_VALUE';

const KRPERKWH_VALUE = 'KRPERKWH_VALUE';
const KWH_VALUE = 'KWH_VALUE';

const TESTVALUE_VALUE = 'TESTVALUE_VALUE';

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
      initialAreaAmountOwnValue: (payload) => {
        return {
          type: INITIALAREAAMOUNTOWN_VALUE,
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
      },
      maint1costOwnValue: (payload) => {
        return {
          type: MAIN1COSTOWN_VALUE,
          payload: payload
        };
      },
      maint2costOwnValue: (payload) => {
        return {
          type: MAIN2COSTOWN_VALUE,
          payload: payload
        };
      },
      maint3costOwnValue: (payload) => {
        return {
          type: MAIN3COSTOWN_VALUE,
          payload: payload
        };
      },
      maint4costOwnValue: (payload) => {
        return {
          type: MAIN4COSTOWN_VALUE,
          payload: payload
        };
      },
      maint1yearOwnValue: (payload) => {
        return {
          type: MAIN1YEAROWN_VALUE,
          payload: payload
        };
      },
      maint2yearOwnValue: (payload) => {
        return {
          type: MAIN2YEAROWN_VALUE,
          payload: payload
        };
      },
      maint3yearOwnValue: (payload) => {
        return {
          type: MAIN3YEAROWN_VALUE,
          payload: payload
        };
      },
      maint4yearOwnValue: (payload) => {
        return {
          type: MAIN4YEAROWN_VALUE,
          payload: payload
        };
      },
      compoundrateRepairOwnValue: (payload) => {
        return {
          type: COMPOUNDRATEREPAIROWN_VALUE,
          payload: payload
        };
      },
      initialRepairCostPerSqmOwnValue: (payload) => {
        return {
          type: INITIALREPAIRCOSTPERSQMOWN_VALUE,
          payload: payload
        };
      },
      initialAreaAmountValue: (payload) => {
        return {
          type: INITIALAREAAMOUNT_VALUE,
          payload: payload
        };
      },
      exp1yearValue: (payload) => {
        return {
          type: EXP1YEAR_VALUE,
          payload: payload
        };
      },
      exp2yearValue: (payload) => {
        return {
          type: EXP2YEAR_VALUE,
          payload: payload
        };
      },
      exp3yearValue: (payload) => {
        return {
          type: EXP3YEAR_VALUE,
          payload: payload
        };
      },
      exp4yearValue: (payload) => {
        return {
          type: EXP4YEAR_VALUE,
          payload: payload
        };
      },
      exp1areaValue: (payload) => {
        return {
          type: EXP1AREA_VALUE,
          payload: payload
        };
      },
      exp2areaValue: (payload) => {
        return {
          type: EXP2AREA_VALUE,
          payload: payload
        };
      },
      exp3areaValue: (payload) => {
        return {
          type: EXP3AREA_VALUE,
          payload: payload
        };
      },
      exp4areaValue: (payload) => {
        return {
          type: EXP4AREA_VALUE,
          payload: payload
        };
      },
      dec1yearValue: (payload) => {
        return {
          type: DEC1YEAR_VALUE,
          payload: payload
        };
      },
      dec2yearValue: (payload) => {
        return {
          type: DEC2YEAR_VALUE,
          payload: payload
        };
      },
      dec3yearValue: (payload) => {
        return {
          type: DEC3YEAR_VALUE,
          payload: payload
        };
      },
      dec4yearValue: (payload) => {
        return {
          type: DEC4YEAR_VALUE,
          payload: payload
        };
      },
      dec1areaValue: (payload) => {
        return {
          type: DEC1AREA_VALUE,
          payload: payload
        };
      },
      dec2areaValue: (payload) => {
        return {
          type: DEC2AREA_VALUE,
          payload: payload
        };
      },
      dec3areaValue: (payload) => {
        return {
          type: DEC3AREA_VALUE,
          payload: payload
        };
      },
      dec4areaValue: (payload) => {
        return {
          type: DEC4AREA_VALUE,
          payload: payload
        };
      },
      rentincreaseValue: (payload) => {
        return {
          type: RENTINCREASE_VALUE,
          payload: payload
        };
      },
      initialRentCostPerSqmValue: (payload) => {
        return {
          type: INITIALRENTCOSTPERSQM_VALUE,
          payload: payload
        };
      },
      kwhValue: (payload) => {
        return {
          type: KWH_VALUE,
          payload: payload
        };
      },
      krperkwhValue: (payload) => {
        return {
          type: KRPERKWH_VALUE,
          payload: payload
        };
      },
      testvalueValue: (payload) => {
        return {
          type: TESTVALUE_VALUE,
          payload: payload
        };
      }   
}
