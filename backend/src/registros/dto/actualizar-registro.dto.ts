import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class ActualizarRegistroDto {
  @IsOptional()
  @IsBoolean()
  completado?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;
}
