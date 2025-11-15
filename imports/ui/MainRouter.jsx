import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { App } from './App';
import { DocPage } from './DocPage';

export const MainRouter = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/doc/:id" component={DocPage} />
    </Switch>
  </BrowserRouter>
);
