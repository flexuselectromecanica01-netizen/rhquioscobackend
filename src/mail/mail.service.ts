import {Injectable,InternalServerErrorException} from '@nestjs/common'
import * as nodemailer from "nodemailer"

type EnviarCorreoVacacionesParams = {
    correoElectronico: string
    empleado: string
    estatus: "APROBADA" | "RECHAZADA"
    fechaInicio:string
    fechaFin: string
    diasSolicitados:number
    motivoRechazo?:string
}


@Injectable()
export class MailService{
    private transporter = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASS
        }
    })
    private formatearFechaCorreo(fecha: string): string {
  if (!fecha) return "Fecha no disponible";

  const [year, month, day] = fecha.split("-").map(Number);

  const fechaLocal = new Date(year, month - 1, day);

  return fechaLocal.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
    async enviarCorreoVacaciones({correoElectronico,empleado,estatus,fechaInicio,fechaFin,diasSolicitados,motivoRechazo}:EnviarCorreoVacacionesParams){
        const fechaInicioLegible = this.formatearFechaCorreo(fechaInicio);
const fechaFinLegible = this.formatearFechaCorreo(fechaFin);
        try {
           const colorEstatus = estatus === "APROBADA" ? "#009b63" : "#dc2626";

const asunto =
  estatus === "APROBADA"
    ? "Solicitud de vacaciones aprobada"
    : "Solicitud de vacaciones rechazada";

const html = `
  <div style="
    margin: 0;
    padding: 0;
    background-color: #f3f4f6;
    font-family: Arial, Helvetica, sans-serif;
    color: #333333;
  ">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="
            background-color: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          ">
            <tr>
              <td style="
                background-color: #24282c;
                padding: 22px 30px;
                color: #ffffff;
                text-align: center;
              ">
                <h1 style="
                  margin: 0;
                  font-size: 22px;
                  font-weight: 700;
                ">
                  RH Quiosco
                </h1>
                <p style="
                  margin: 6px 0 0;
                  font-size: 14px;
                  color: #d1d5db;
                ">
                  Notificación de solicitud de vacaciones
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 30px;">
                <h2 style="
                  margin: 0 0 16px;
                  font-size: 22px;
                  color: #111827;
                ">
                  ${asunto}
                </h2>

                <p style="
                  margin: 0 0 16px;
                  font-size: 15px;
                  line-height: 1.6;
                  color: #374151;
                ">
                  Hola, <strong>${empleado}</strong>.
                </p>

                <p style="
                  margin: 0 0 24px;
                  font-size: 15px;
                  line-height: 1.6;
                  color: #374151;
                ">
                  Tu solicitud de vacaciones fue
                  <span style="
                    display: inline-block;
                    padding: 5px 12px;
                    border-radius: 999px;
                    background-color: ${estatus === "APROBADA" ? "#dcfce7" : "#fee2e2"};
                    color: ${colorEstatus};
                    font-weight: 700;
                  ">
                    ${estatus}
                  </span>
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="
                  border-collapse: collapse;
                  margin-top: 10px;
                  border: 1px solid #e5e7eb;
                  border-radius: 10px;
                  overflow: hidden;
                ">
                  <tr>
                    <td style="padding: 12px 16px; background-color: #f9fafb; font-weight: 700; color: #374151;">
                      Fecha inicio
                    </td>
                    <td style="padding: 12px 16px; color: #374151;">
                      ${fechaInicioLegible}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 12px 16px; background-color: #f9fafb; font-weight: 700; color: #374151;">
                      Fecha fin
                    </td>
                    <td style="padding: 12px 16px; color: #374151;">
                      ${fechaFinLegible}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 12px 16px; background-color: #f9fafb; font-weight: 700; color: #374151;">
                      Días solicitados
                    </td>
                    <td style="padding: 12px 16px; color: #374151;">
                      ${diasSolicitados}
                    </td>
                  </tr>

                  ${
                    estatus === "RECHAZADA"
                      ? `
                        <tr>
                          <td style="padding: 12px 16px; background-color: #f9fafb; font-weight: 700; color: #374151;">
                            Motivo de rechazo
                          </td>
                          <td style="padding: 12px 16px; color: #374151;">
                            ${motivoRechazo}
                          </td>
                        </tr>
                      `
                      : ""
                  }
                </table>

                <div style="
                  margin-top: 26px;
                  padding: 16px;
                  border-radius: 10px;
                  background-color: #f0fdf4;
                  border-left: 5px solid #009b63;
                ">
                  <p style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #166534;
                  ">
                    Este correo fue enviado automáticamente por el sistema RH Quiosco.
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="
                padding: 18px 30px;
                background-color: #f9fafb;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
              ">
                Flexus Electro · Sistema interno de vacaciones
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

          const info = await this.transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: correoElectronico,
  subject: asunto,
  html,
});

console.log("Correo enviado correctamente");
console.log("Message ID:", info.messageId);
console.log("SMTP Response:", info.response);

        } catch (error) {
            console.error("Error al enviar correo:", error);
            throw new InternalServerErrorException("No se pudo enviar el correo");
        }
    }
}