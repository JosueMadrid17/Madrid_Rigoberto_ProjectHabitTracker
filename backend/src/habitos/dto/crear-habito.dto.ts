import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CrearHabitoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsString()
  @IsNotEmpty()
  frecuencia: string;

  @IsString()
  @IsNotEmpty()
  prioridad: string;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsOptional()
  @IsDateString()
  fechaFinalizacion?: string;

  @IsBoolean()
  activo: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  meta?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unidad?: string;
}