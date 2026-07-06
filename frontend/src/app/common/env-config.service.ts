import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvConfigService {
  private _apiUrl: string;

  constructor() {
    const env = (window as any).__env || {};
    this._apiUrl = env.apiUrl || 'http://localhost:3001/api';
  }

  get apiUrl(): string {
    return this._apiUrl;
  }
}
