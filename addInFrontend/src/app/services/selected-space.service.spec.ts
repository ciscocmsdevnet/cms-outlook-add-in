import { TestBed } from '@angular/core/testing';

import { SelectedSpaceService } from './selected-space.service';

describe('SelectedSpaceService', () => {
  let service: SelectedSpaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedSpaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
