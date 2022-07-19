import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSpaceComponent } from './new-space.component';

describe('NewSpaceComponent', () => {
  let component: NewSpaceComponent;
  let fixture: ComponentFixture<NewSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewSpaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
