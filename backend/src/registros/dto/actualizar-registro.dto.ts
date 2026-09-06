import { IsBoolean, IsOptional } from 'class-validator';

export class ActualizarRegistroDto {
  @IsBoolean()
  @IsOptional()
  completado?: boolean;
}