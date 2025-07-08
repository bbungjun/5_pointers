import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeneratorService } from './generator/generator.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockGeneratorService = {
      getPageBySubdomain: jest.fn(),
      generateStaticHTML: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: GeneratorService,
          useValue: mockGeneratorService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
