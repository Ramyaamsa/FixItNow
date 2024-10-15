import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetScrapComponent } from './asset-scrap.component';

describe('AssetScrapComponent', () => {
  let component: AssetScrapComponent;
  let fixture: ComponentFixture<AssetScrapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetScrapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetScrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
