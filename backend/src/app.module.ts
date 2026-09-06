import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HabitosModule } from './habitos/habitos.module';
import { RegistrosController } from './registros/registros.controller';
import { RegistrosService } from './registros/registros.service';
import { RegistrosModule } from './registros/registros.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsuariosModule,
    PrismaModule,
    AuthModule,
    HabitosModule,
    RegistrosModule,
  ],
  controllers: [AppController, RegistrosController],
  providers: [AppService, RegistrosService],
})
export class AppModule {}
