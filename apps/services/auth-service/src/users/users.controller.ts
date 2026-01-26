import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import type {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  ChangePasswordDto,
} from './dto/user.dto';
import { UserResponseDto } from './dto/user.dto';
import type { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserResponseDto],
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: boolean
  ) {
    return this.usersService.findAll({ skip, take, role, isActive });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateUserRoleDto
  ) {
    return this.usersService.updateRole(id, updateRoleDto);
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change user password' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    await this.usersService.changePassword(id, changePasswordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user (deactivate)' })
  @ApiResponse({ status: 204, description: 'User soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.delete(id);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'User permanently deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.hardDelete(id);
  }
}
