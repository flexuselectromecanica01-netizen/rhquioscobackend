import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as nodemailer from "nodemailer";

type EnviarCorreoVacacionesParams = {
  correoElectronico: string;
  empleado: string;
  estatus: "APROBADA" | "RECHAZADA";
  fechaInicio: string;
  fechaFin: string;
  diasSolicitados: number;
  motivoRechazo?: string;
};

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private convertirFechaLocal(fecha: string): Date {
    const [year, month, day] = fecha.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  private formatearFechaCorreo(fecha: string): string {
    if (!fecha) return "Fecha no disponible";

    const fechaLocal = this.convertirFechaLocal(fecha);

    return fechaLocal.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  private generarCalendarioMesHtml(
    year: number,
    month: number,
    fechaInicio: string,
    fechaFin: string,
  ): string {
    const inicio = this.convertirFechaLocal(fechaInicio);
    const fin = this.convertirFechaLocal(fechaFin);

    const fechaInicioLocal = new Date(
      inicio.getFullYear(),
      inicio.getMonth(),
      inicio.getDate(),
    );

    const fechaFinLocal = new Date(
      fin.getFullYear(),
      fin.getMonth(),
      fin.getDate(),
    );

    const nombreMes = new Date(year, month, 1).toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    });

    const primerDiaMes = new Date(year, month, 1);
    const ultimoDiaMes = new Date(year, month + 1, 0);

    let primerDiaSemana = primerDiaMes.getDay();

    // JavaScript: domingo = 0.
    // Aquí lo convertimos para que lunes sea 1 y domingo sea 7.
    primerDiaSemana = primerDiaSemana === 0 ? 7 : primerDiaSemana;

    const diasEnMes = ultimoDiaMes.getDate();
    const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    let html = `
      <table width="100%" cellpadding="0" cellspacing="0" style="
        border-collapse: collapse;
        width: 100%;
        max-width: 420px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 18px;
      ">
        <tr>
          <td colspan="7" style="
            background: #24282c;
            color: #ffffff;
            text-align: center;
            padding: 12px;
            font-weight: bold;
            text-transform: capitalize;
          ">
            ${nombreMes}
          </td>
        </tr>
        <tr>
    `;

    for (const dia of diasSemana) {
      html += `
        <td style="
          padding: 8px;
          text-align: center;
          font-size: 12px;
          font-weight: bold;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        ">
          ${dia}
        </td>
      `;
    }

    html += `</tr><tr>`;

    let celdaActual = 1;

    for (let i = 1; i < primerDiaSemana; i++) {
      html += `
        <td style="
          padding: 10px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
        "></td>
      `;
      celdaActual++;
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaActual = new Date(year, month, dia);

      const estaEnRango =
        fechaActual >= fechaInicioLocal && fechaActual <= fechaFinLocal;

      const esInicio =
        fechaActual.getFullYear() === inicio.getFullYear() &&
        fechaActual.getMonth() === inicio.getMonth() &&
        fechaActual.getDate() === inicio.getDate();

      const esFin =
        fechaActual.getFullYear() === fin.getFullYear() &&
        fechaActual.getMonth() === fin.getMonth() &&
        fechaActual.getDate() === fin.getDate();

      let estilo = `
        padding: 10px;
        text-align: center;
        border: 1px solid #e5e7eb;
        font-size: 13px;
        color: #374151;
        background: #ffffff;
      `;

      if (estaEnRango) {
        estilo += `
          background: #dcfce7;
          font-weight: 600;
        `;
      }

      if (esInicio) {
        estilo += `
          background: #009b63;
          color: #ffffff;
          font-weight: bold;
        `;
      }

      if (esFin) {
        estilo += `
          background: #dc2626;
          color: #ffffff;
          font-weight: bold;
        `;
      }

      html += `<td style="${estilo}">${dia}</td>`;

      if (celdaActual % 7 === 0 && dia !== diasEnMes) {
        html += `</tr><tr>`;
      }

      celdaActual++;
    }

    while ((celdaActual - 1) % 7 !== 0) {
      html += `
        <td style="
          padding: 10px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
        "></td>
      `;
      celdaActual++;
    }

    html += `
        </tr>
      </table>
    `;

    return html;
  }

  private generarCalendariosDinamicosHtml(
    fechaInicio: string,
    fechaFin: string,
  ): string {
    const inicio = this.convertirFechaLocal(fechaInicio);
    const fin = this.convertirFechaLocal(fechaFin);

    let calendariosHtml = "";

    const mesActual = new Date(
      inicio.getFullYear(),
      inicio.getMonth(),
      1,
    );

    const mesFinal = new Date(
      fin.getFullYear(),
      fin.getMonth(),
      1,
    );

    while (mesActual <= mesFinal) {
      calendariosHtml += this.generarCalendarioMesHtml(
        mesActual.getFullYear(),
        mesActual.getMonth(),
        fechaInicio,
        fechaFin,
      );

      mesActual.setMonth(mesActual.getMonth() + 1);
    }

    return `
      <div style="margin-top: 24px;">
        <p style="
          margin: 0 0 12px;
          font-size: 15px;
          font-weight: bold;
          color: #374151;
        ">
          Vista calendario
        </p>

        ${calendariosHtml}

        <div style="
          margin-top: 10px;
          font-size: 12px;
          color: #4b5563;
        ">
          <span style="display:inline-block; margin-right: 12px;">
            <span style="
              display:inline-block;
              width:12px;
              height:12px;
              background:#009b63;
              border-radius:3px;
              margin-right:4px;
            "></span>
            Inicio
          </span>

          <span style="display:inline-block; margin-right: 12px;">
            <span style="
              display:inline-block;
              width:12px;
              height:12px;
              background:#dc2626;
              border-radius:3px;
              margin-right:4px;
            "></span>
            Fin
          </span>

          <span style="display:inline-block;">
            <span style="
              display:inline-block;
              width:12px;
              height:12px;
              background:#dcfce7;
              border-radius:3px;
              margin-right:4px;
              border:1px solid #86efac;
            "></span>
            Rango de vacaciones
          </span>
        </div>
      </div>
    `;
  }

  async enviarCorreoVacaciones({
    correoElectronico,
    empleado,
    estatus,
    fechaInicio,
    fechaFin,
    diasSolicitados,
    motivoRechazo,
  }: EnviarCorreoVacacionesParams) {
    try {
      const fechaInicioLegible = this.formatearFechaCorreo(fechaInicio);
      const fechaFinLegible = this.formatearFechaCorreo(fechaFin);

      const calendarioHtml = this.generarCalendariosDinamicosHtml(
        fechaInicio,
        fechaFin,
      );

      const colorEstatus =
        estatus === "APROBADA" ? "#009b63" : "#dc2626";

      const fondoEstatus =
        estatus === "APROBADA" ? "#dcfce7" : "#fee2e2";

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
          <table width="100%" cellpadding="0" cellspacing="0" style="
            background-color: #f3f4f6;
            padding: 30px 0;
          ">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="
                  width: 600px;
                  max-width: 100%;
                  background-color: #ffffff;
                  border-radius: 14px;
                  overflow: hidden;
                  border: 1px solid #e5e7eb;
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
                          background-color: ${fondoEstatus};
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
                          <td style="
                            padding: 12px 16px;
                            background-color: #f9fafb;
                            font-weight: 700;
                            color: #374151;
                            width: 40%;
                          ">
                            Fecha inicio
                          </td>
                          <td style="
                            padding: 12px 16px;
                            color: #374151;
                          ">
                            ${fechaInicioLegible}
                          </td>
                        </tr>

                        <tr>
                          <td style="
                            padding: 12px 16px;
                            background-color: #f9fafb;
                            font-weight: 700;
                            color: #374151;
                          ">
                            Fecha fin
                          </td>
                          <td style="
                            padding: 12px 16px;
                            color: #374151;
                          ">
                            ${fechaFinLegible}
                          </td>
                        </tr>

                        <tr>
                          <td style="
                            padding: 12px 16px;
                            background-color: #f9fafb;
                            font-weight: 700;
                            color: #374151;
                          ">
                            Días solicitados
                          </td>
                          <td style="
                            padding: 12px 16px;
                            color: #374151;
                          ">
                            ${diasSolicitados}
                          </td>
                        </tr>

                        ${
                          estatus === "RECHAZADA"
                            ? `
                              <tr>
                                <td style="
                                  padding: 12px 16px;
                                  background-color: #f9fafb;
                                  font-weight: 700;
                                  color: #374151;
                                ">
                                  Motivo de rechazo
                                </td>
                                <td style="
                                  padding: 12px 16px;
                                  color: #374151;
                                ">
                                  ${motivoRechazo ?? "Sin motivo especificado"}
                                </td>
                              </tr>
                            `
                            : ""
                        }
                      </table>

                      ${calendarioHtml}

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

      return info;
    } catch (error) {
      console.error("Error al enviar correo:", error);
      throw new InternalServerErrorException("No se pudo enviar el correo");
    }
  }
}