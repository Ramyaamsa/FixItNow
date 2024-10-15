import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpareMailComponent } from './spare-mail.component';

describe('SpareMailComponent', () => {
  let component: SpareMailComponent;
  let fixture: ComponentFixture<SpareMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpareMailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpareMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
