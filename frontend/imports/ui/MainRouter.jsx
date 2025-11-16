import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { App } from './App';
import { DocPage } from './DocPage';
import { UploadedFiles } from './UploadedFiles';

export const MainRouter = () => (
  <BrowserRouter>
    <Switch>
  <Route exact path="/" component={App} />
  <Route path="/uploaded" component={UploadedFiles} />
  <Route path="/doc/:id" component={DocPage} />
    </Switch>
  </BrowserRouter>
);
