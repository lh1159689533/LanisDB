import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

export default function useAppState<T>(stateKey: string): [T, (value: T) => void] {
  const modelKey = 'app';

  const value: T = useSelector(function (state: any) {
    const modelState = state[modelKey];

    return modelState[stateKey];
  });

  const dispatch = useDispatch();

  const onChange = React.useCallback(
    function (val: T) {
      const payload = {
        [stateKey]: val
      };

      dispatch({
        type: modelKey + '/change',
        payload,
      });
    },
    [dispatch, modelKey, stateKey]
  );

  return [value, onChange];
}
