import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LoginService } from './login.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TipoRolSistema } from './entities/login.entity';
import { UpdateLoginSupervisorDto } from './dto/update-login-supervisor.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  login(@Body() loginDto: LoginDto) {
    return this.loginService.login(loginDto);
  }

  @Patch("admin/:idempleado/rol")
  cambiarRol(
    @Param("idempleado") idempleado: string,
    @Body("rol") rol: TipoRolSistema,
  ) {
    return this.loginService.cambiarRolPorEmpleado(idempleado, rol);
  }

  @Patch("admin/:idempleado/reset-password")
  resetearPassword(@Param("idempleado") idempleado: string) {
    return this.loginService.resetearPasswordPorEmpleado(idempleado);
  }


  @Post("verify-password")
  @UseGuards(JwtAuthGuard)
  verifyPassword(@Body() dto:VerifyPasswordDto, @Req() req:any){
    return this.loginService.verifyPassword(dto.password,req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Patch("update-password")
  actualizarpassword(@Req() req:Request,@Body() body:{password:string}){
    const usuario = req['user']
    return this.loginService.actualizarPassword(usuario.sub,body.password)
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req:any){
    return this.loginService.me(req.user)
  }

  @Get()
  findAll() {
    return this.loginService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loginService.findOne(+id);
  }

  @Patch(":id")
update(
  @Param("id") id: string,
  @Body() updateLoginDto: UpdateLoginSupervisorDto,
) {
  return this.loginService.update(+id, updateLoginDto);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loginService.remove(+id);
  }
}
