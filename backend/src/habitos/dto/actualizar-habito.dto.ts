import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ActualizarHabitoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoria?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  frecuencia?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  prioridad?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFinalizacion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  meta?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unidad?: string;
}
