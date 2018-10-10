const THREE_VALUE = 'THREE_VALUE';
const FOUR_VALUE = 'FOUR_VALUE';
const FIVE_VALUE = 'FIVE_VALUE';
const SIX_VALUE = 'SIX_VALUE';

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
      }
}
