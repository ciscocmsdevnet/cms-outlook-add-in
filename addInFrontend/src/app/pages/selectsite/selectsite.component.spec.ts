import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectsiteComponent } from './selectsite.component';

describe('SelectsiteComponent', () => {
  let component: SelectsiteComponent;
  let fixture: ComponentFixture<SelectsiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectsiteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
