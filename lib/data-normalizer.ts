import { realData } from '../app/data/real_data';

export const SYDNEY_SUBURB = 'Sydney';
export const SYDNEY_STATE = 'NSW';

export function getSydneyData() {
  return realData.map((p) => ({
    ...p,
    Suburb: SYDNEY_SUBURB,
    State: SYDNEY_STATE,
  }));
}
