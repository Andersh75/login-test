const INITIALAMOUNTAREAOWN_VALUE = 'INITIALAMOUNTAREAOWN_VALUE';
const INITIALAMOUNTHEATOWN_VALUE = 'INITIALAMOUNTHEATOWN_VALUE';
const INITIALPRICEHEATOWN_VALUE = 'INITIALPRICEHEATOWN_VALUE';
const INITIALPRICEAREAOWN_VALUE = 'INITIALPRICEAREAOWN_VALUE';
const COMPOUNDRATEREPAIROWN_VALUE = 'COMPOUNDRATEREPAIROWN_VALUE';
const INITIALPRICEREPAIROWN_VALUE = 'INITIALPRICEREPAIROWN_VALUE';
const INITIALAMOUNTAREARENT_VALUE = 'INITIALAMOUNTAREARENT_VALUE';
const INITIALAMOUNTHEATRENT_VALUE = 'INITIALAMOUNTHEATRENT_VALUE';
const INITIALPRICEHEATRENT_VALUE = 'INITIALPRICEHEATRENT_VALUE';
const COMPOUNDRATEAREARENT_VALUE = 'COMPOUNDRATEAREARENT_VALUE';
const INITIALPRICEAREARENT_VALUE = 'INITIALPRICEAREARENT_VALUE';

const DISCOUNTRATE_VALUE = 'DISCOUNTRATE_VALUE';
const INFLATIONRATE_VALUE = 'INFLATIONRATE_VALUE';
const STARTYEAR_VALUE = 'STARTYEAR_VALUE';
const NUMBEROFYEARS_VALUE = 'NUMBEROFYEARS_VALUE';
const MAIN1COSTOWN_VALUE = 'MAIN1COSTOWN_VALUE';
const MAIN2COSTOWN_VALUE = 'MAIN2COSTOWN_VALUE';
const MAIN3COSTOWN_VALUE = 'MAIN3COSTOWN_VALUE';
const MAIN4COSTOWN_VALUE = 'MAIN4COSTOWN_VALUE';
const MAIN1YEAROWN_VALUE = 'MAIN1YEAROWN_VALUE';
const MAIN2YEAROWN_VALUE = 'MAIN2YEAROWN_VALUE';
const MAIN3YEAROWN_VALUE = 'MAIN3YEAROWN_VALUE';
const MAIN4YEAROWN_VALUE = 'MAIN4YEAROWN_VALUE';



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





export const action = {

    initialPriceAreaRentValue: (payload) => {
      return {
        type: INITIALPRICEAREARENT_VALUE,
        payload: payload
      };
    },
    compoundrateAreaRentValue: (payload) => {
      return {
        type: COMPOUNDRATEAREARENT_VALUE,
        payload: payload
      };
    },
    initialAmountHeatRentValue: (payload) => {
      return {
        type: INITIALAMOUNTHEATRENT_VALUE,
        payload: payload
      };
    },
    initialPriceHeatRentValue: (payload) => {
      return {
        type: INITIALPRICEHEATRENT_VALUE,
        payload: payload
      };
    },
  initialAmountAreaRentValue: (payload) => {
      return {
        type: INITIALAMOUNTAREARENT_VALUE,
        payload: payload
      };
    },
    initialPriceRepairOwnValue: (payload) => {
      return {
        type: INITIALPRICEREPAIROWN_VALUE,
        payload: payload
      };
    },
    compoundrateRepairOwnValue: (payload) => {
      return {
        type: COMPOUNDRATEREPAIROWN_VALUE,
        payload: payload
      };
    },
    initialPriceAreaOwnValue: (payload) => {
      return {
        type: INITIALPRICEAREAOWN_VALUE,
        payload: payload
      };
    },
    initialAmountAreaOwnValue: (payload) => {
      return {
        type: INITIALAMOUNTAREAOWN_VALUE,
        payload: payload
      };
    },
    initialPriceHeatOwnValue: (payload) => {
      return {
        type: INITIALPRICEHEATOWN_VALUE,
        payload: payload
      };
    },
    initialAmountHeatOwnValue: (payload) => {
      return {
        type: INITIALAMOUNTHEATOWN_VALUE,
        payload: payload
      };
    },
      discountrateValue: (payload) => {
        return {
          type: DISCOUNTRATE_VALUE,
          payload: payload
        };
      },
      inflationrateValue: (payload) => {
        return {
          type: INFLATIONRATE_VALUE,
          payload: payload
        };
      },
      startyearValue: (payload) => {
        return {
          type: STARTYEAR_VALUE,
          payload: payload
        };
      },
      numberofyearsValue: (payload) => {
        return {
          type: NUMBEROFYEARS_VALUE,
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
      maintyearsOwnValue: (payload) => {
        return {
          type: MAINYEARSOWN_VALUE,
          payload: payload
        };
      },
      maintcostsOwnValue: (payload) => {
        return {
          type: MAINCOSTSOWN_VALUE,
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
      }
}
