import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
