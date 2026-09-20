import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class CrearRegistroDto {
  @IsOptional()
  @IsBoolean()
  completado?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;
}
