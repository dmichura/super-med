import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { HospitalStructureController } from './hospital-structure.controller';
import { HospitalStructureService } from './hospital-structure.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HospitalStructureController],
  providers: [HospitalStructureService],
})
export class HospitalStructureModule {}
