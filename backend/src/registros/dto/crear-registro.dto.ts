import { IsBoolean, IsOptional } from 'class-validator';

export class CrearRegistroDto {
  @IsBoolean()
  @IsOptional()
  completado?: boolean;
}
