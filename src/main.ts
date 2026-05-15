import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const port = process.env.PORT || 4020

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
  origin: [process.env.FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

  app.setGlobalPrefix('api')
  await app.listen(port,'0.0.0.0');
}
bootstrap();
//prueba