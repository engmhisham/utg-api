import { IsEnum, IsNotEmpty } from 'class-validator';
import { LocationStatus } from 'src/common/enums/locations.enum';

export class UpdateLocationStatusDto {
  @IsEnum(LocationStatus)
  @IsNotEmpty()
  status: LocationStatus;
}
