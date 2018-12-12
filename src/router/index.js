/*

 * 页面路由配置中心
 */

import React, { Component } from 'react';
import { AsyncComponent } from 'util';


import Home from '../pages/home';
import Login from '../pages/login';
import Main from '../pages/main';
import Regist from '../pages/regist';

const pages = {
  home: Home,
  login: Login,
  main: Main,
  regist: Regist
};

export default [
  // 登录
  {
    path: '/login',
    exact: true,
    component: pages['login']
  }, 
  // 注册
  {
    path: '/regist',
    exact: true,
    component: pages['regist']
  },
  // 创建房间
  {
    path: '/',
    exact: true,
    component: pages['home']
  },
  // 创建房间
  {
    path: '/home',
    exact: true,
    component: pages['home']
  },
  // 主页
  {
    path: '/main',
    exact: true,
    component: pages['main']
  }
];
