import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DataLoaderService } from './data-loader.service';

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private onChangeSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(private dataLoaderService: DataLoaderService) {}

  async load(): Promise<any> {
    const result = await this.dataLoaderService.load('data.json');
    if (result) {
      this.onChangeSubject.next(result);
    }
    return result;
  }

  onChanged(callback): Subscription {
      return this.onChangeSubject.subscribe(callback);
  }
}
