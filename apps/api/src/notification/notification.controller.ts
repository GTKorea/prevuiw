import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthUser } from '@/common/types/auth';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.notificationService.findAllByUser(user.id);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: AuthUser) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: AuthUser) {
    return this.notificationService.markAllAsRead(user.id);
  }
}
