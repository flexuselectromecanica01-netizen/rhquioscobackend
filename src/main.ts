import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const port = process.env.PORT || 4000

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(
    {
      origin: '*', 
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
    }
  );
  await app.listen(port,'0.0.0.0');
}
bootstrap();
