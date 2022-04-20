import { TestBed } from '@angular/core/testing';

import { ErrmessagesService } from './errmessages.service';

describe('ErrmessagesService', () => {
  let service: ErrmessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrmessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
