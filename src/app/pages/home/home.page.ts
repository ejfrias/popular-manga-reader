import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MangaService } from 'src/app/services/manga.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  public subscription$: Subscription[] = [];
  public data = [];

  constructor(
    private mangaService: MangaService
  ) {}

  ngOnInit() {
    this.subscription$.push(this.mangaService.onChanged(resp => {
      this.data = resp;
      console.log(this.data);
    }));
  }

  ngOnDestroy() {
    this.subscription$.map(subscription => subscription.unsubscribe());
  }

}
