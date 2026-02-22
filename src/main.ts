import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await mongoose.connect(process.env.DATABASE_URL!);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      // forbidNonWhitelisted: true, // выдает ошибку если есть лишние поля
      transform: true, // автоматически трансформирует типы
      exceptionFactory: (errors) => {
        const errorsMessages = errors.map((error) => ({
          message:
            Object.values(error.constraints || {})[0] || 'Validation error',
          field: error.property,
        }));

        return new BadRequestException({ errorsMessages });
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
