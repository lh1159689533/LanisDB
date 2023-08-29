import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Suspense } from 'react';

const initState = {
  app: {},
};
function appReducer(preState = initState, action) {
  const { type, payload } = action;
  switch (type) {
    case 'app/change':
      return {
        ...preState,
        app: { ...(preState.app ?? {}), ...payload },
      };
    default:
      return preState;
  }
}

export default function ({ children }) {
  return (
    <Suspense>
      <Provider store={createStore(appReducer, (window as any).__REDUX_DEVTOOLS_EXTENSION__?.())}>{children}</Provider>
    </Suspense>
  );
}
