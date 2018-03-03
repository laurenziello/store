import { NgxsPlugin } from '../symbols';
import { Injectable } from '@angular/core';
import { getTypeFromInstance } from '../internals';
import { Ngxs } from '../ngxs';
import { first } from 'rxjs/operators';

/**
 * Interface for the redux-devtools-extension API.
 */
export interface DevtoolsExtension {
  init(state);
  send(action: string, state?: any);
  subscribe(fn: (message: string) => void);
}

/**
 * Adds support for the Redux Devtools extension:
 * http://extension.remotedev.io/
 */
@Injectable()
export class ReduxDevtoolsPlugin implements NgxsPlugin {
  private readonly devtoolsExtension: DevtoolsExtension | null = null;
  private readonly windowObj: any = typeof window !== 'undefined' ? window : {};

  constructor(ngxs: Ngxs) {
    const globalDevtools = this.windowObj['__REDUX_DEVTOOLS_EXTENSION__'] || this.windowObj['devToolsExtension'];
    if (globalDevtools) {
      this.devtoolsExtension = globalDevtools.connect() as DevtoolsExtension;

      if (ngxs) {
        ngxs
          .select(state => state)
          .pipe(first())
          .subscribe(state => this.devtoolsExtension && this.devtoolsExtension.init(state));
      } else {
        this.devtoolsExtension.init({});
      }
    }
  }

  handle(state: any, mutation: any, next: any) {
    if (!this.devtoolsExtension) {
      return next(state, mutation);
    }
    this.devtoolsExtension.send(getTypeFromInstance(mutation), state);
    return next(state, mutation);
  }
}
