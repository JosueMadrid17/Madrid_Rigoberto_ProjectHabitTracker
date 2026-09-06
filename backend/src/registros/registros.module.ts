import { Module } from '@nestjs/common';
import { RegistrosController } from './registros.controller';
import { RegistrosService } from './registros.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RegistrosController],
  providers: [RegistrosService],
})
export class RegistrosModule {}
