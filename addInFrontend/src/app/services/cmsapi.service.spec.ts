import { TestBed } from '@angular/core/testing';

import { CmsapiService } from './cmsapi.service';

describe('CmsapiService', () => {
  let service: CmsapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CmsapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
