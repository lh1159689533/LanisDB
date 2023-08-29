import React from 'react';

const SqlQueryEditor = React.lazy(
  () =>
    import(
      /* webpackChunkName: "SqlQueryEditor" */ '@src/pages/datas/sqlQueryEditor'
    )
);

const SqlQueryResult = React.lazy(
  () =>
    import(
      /* webpackChunkName: "SqlQueryResult" */ '@src/pages/datas/sqlQueryResult'
    )
);

export const tabComponents = {
  SqlQueryEditor,
  SqlQueryResult,
};

export type ITabComponents = keyof typeof tabComponents;
