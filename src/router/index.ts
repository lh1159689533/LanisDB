import React from 'react';

// 概览页
const Home = React.lazy(() => import(/* webpackChunkName: "Home" */ '@src/pages/home'));
const Datas = React.lazy(() => import(/* webpackChunkName: "Datas" */ '@src/pages/datas'));
const Demo = React.lazy(() => import(/* webpackChunkName: "Datas" */ '@src/pages/demo'));

// 错误页
// const ErrorPages = React.lazy(() => import(/* webpackChunkName: "Errors" */ '@src/pages/errors'));

export const routes = [
  {
    path: '/datas/:type',
    component: Datas,
  },
  {
    path: '/demo',
    component: Demo,
  },
  {
    path: '/',
    component: Home,
  },
  // {
  //   path: '*',
  //   component: ErrorPages,
  // },
];
