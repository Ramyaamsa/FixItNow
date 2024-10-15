import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpareComponent } from './spare.component';

describe('SpareComponent', () => {
  let component: SpareComponent;
  let fixture: ComponentFixture<SpareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpareComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
