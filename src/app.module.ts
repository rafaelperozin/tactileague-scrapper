import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from 'src/auth.middleware';
import { BullModule } from '@nestjs/bull';
import { ScrapeProcessor } from 'src/app.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scrapeQueue',
      redis: {
        host: 'redis.railway.internal',
        port: 6379,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ScrapeProcessor],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
