export function passwordResetTemplate(name: string, password: string) {
  return `
    <h1>Hola ${name},</h1>
    <p>¡Bienvenido a nuestra plataforma! Nos alegra tenerte con nosotros.</p>
    <p>${password}</>
  `;
}

export function welcomeEmailTemplate(
  fullName: string,
  email: string,
  password: string
) {
  return `
    <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="es">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Nueva plantilla de correo electrónico 2025-06-14</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
  <style type="text/css">
.rollover:hover .rollover-first {
  max-height:0px!important;
  display:none!important;
}
.rollover:hover .rollover-second {
  max-height:none!important;
  display:block!important;
}
.rollover span {
  font-size:0px;
}
u + .body img ~ div div {
  display:none;
}
#outlook a {
  padding:0;
}
span.MsoHyperlink,
span.MsoHyperlinkFollowed {
  color:inherit;
  mso-style-priority:99;
}
a.es-button {
  mso-style-priority:100!important;
  text-decoration:none!important;
}
a[x-apple-data-detectors],
#MessageViewBody a {
  color:inherit!important;
  text-decoration:none!important;
  font-size:inherit!important;
  font-family:inherit!important;
  font-weight:inherit!important;
  line-height:inherit!important;
}
.es-desk-hidden {
  display:none;
  float:left;
  overflow:hidden;
  width:0;
  max-height:0;
  line-height:0;
  mso-hide:all;
}
.es-button-border:hover {
  border-color:#3d5ca3 #3d5ca3 #3d5ca3 #3d5ca3!important;
  background:#ffffff!important;
}
.es-button-border:hover a.es-button,
.es-button-border:hover button.es-button {
  background:#ffffff!important;
}
.es-button-border:hover a.es-button {
  background:#ffffff!important;
  border-color:#ffffff!important;
}
@media only screen and (max-width:600px) {.es-m-p20b { padding-bottom:20px!important } .es-m-p0l { padding-left:0px!important } .es-p-default { } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } .es-header-body p { } .es-content-body p { } .es-footer-body p { } .es-infoblock p { } h1 { font-size:20px!important; text-align:center; line-height:120%!important } h2 { font-size:16px!important; text-align:left; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:20px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:16px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:10px!important } .es-content-body p, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important; display:block } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:14px!important; padding:10px 20px 10px 20px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } .img-5132 { width:50px!important } h2 a { text-align:left } a.es-button { border-left-width:0px!important; border-right-width:0px!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
</style>
 </head>
 <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="es" style="background-color:#FAFAFA"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#fafafa"></v:fill>
			</v:background>
		<![endif]-->
   <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
     <tr style="border-collapse:collapse">
      <td valign="top" style="padding:0;Margin:0">
       <table cellpadding="0" cellspacing="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr style="border-collapse:collapse">
          <td bgcolor="#fafafa" align="center" style="padding:0;Margin:0;background-color:#FAFAFA">
           <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px" role="none">
             <tr style="border-collapse:collapse">
              <td bgcolor="transparent" align="left" style="padding:0;Margin:0;padding-top:40px;padding-right:20px;padding-left:20px;background-color:transparent;background-position:left top">
               <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-position:left top" role="presentation">
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;font-size:0"><img src="https://evbvodb.stripocdn.email/content/guids/CABINET_dd354a98a803b60e2f0411e893c82f56/images/23891556799905703.png" alt="" width="175" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px"><h1 style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:normal;line-height:24px;color:#333333">Credenciales de ingreso al sistema</h1></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="left" style="padding:0;Margin:0;padding-right:40px;padding-left:40px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;letter-spacing:0;color:#666666;font-size:16px;text-align:center">Hola, &nbsp;${fullName}</p></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="left" style="padding:0;Margin:0;padding-left:40px;padding-right:35px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;letter-spacing:0;color:#666666;font-size:16px;text-align:center">Estas son tus credenciales para acceso al sistema:</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;letter-spacing:0;color:#666666;font-size:16px;text-align:center"><strong>Correo:</strong> ${email}</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;letter-spacing:0;color:#666666;font-size:16px;text-align:center"><strong>Contraseña:</strong>${password}</p></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-right:40px;padding-left:40px;padding-top:25px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;letter-spacing:0;color:#666666;font-size:16px">Asegúrese de guardar este correo en favoritos para tener un acceso a las credenciales de manera rápida.</p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
             <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:5px;padding-bottom:20px;background-position:left top">
               <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:21px;letter-spacing:0;color:#666666;font-size:14px">En caso de problemas y perdida de contraseña contacte al administrador para generar nuevas credenciales.</p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding="0" cellspacing="0" align="center" class="es-header" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr style="border-collapse:collapse">
          <td align="center" class="es-adaptive" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#3d5ca3" align="center" class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#3D5CA3;width:600px" role="none">
             <tr style="border-collapse:collapse">
              <td bgcolor="#0b2035" align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-bottom:20px;padding-top:20px;background-color:#0b2035">
               <table cellspacing="0" cellpadding="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                 <tr style="border-collapse:collapse">
                  <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" class="es-m-p0l es-m-txt-c" style="padding:0;Margin:0;font-size:0"><a href="https://viewstripo.email" target="_blank" style="mso-line-height-rule:exactly;text-decoration:none;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:14px;color:#1376C8"><img src="https://evbvodb.stripocdn.email/content/guids/6e985fb6-9291-40b5-9d57-097ffb7c7f28/images/logodarkcut.jpeg" alt="" width="78" class="img-5132" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="es-footer" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
  `;
}

export function activationEmailTemplate(
  fullName: string,
  email: string,
  activationLink: string
) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activa tu cuenta</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f9;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #FFFFFF; box-shadow: 0 4px 12px rgba(11, 32, 53, 0.1); border-radius: 12px; overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0B2035 0%, #164363 100%); padding: 50px 40px; text-align: center;">
                                <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">
                                    ¡Bienvenido/a a Senses!
                                </h1>
                                <p style="margin: 15px 0 0 0; color: #75B2C5; font-size: 16px;">
                                    Estamos emocionados de tenerte con nosotros
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 50px 40px;">
                                <h2 style="margin: 0 0 20px 0; color: #0B2035; font-size: 24px; font-weight: 600;">
                                    Hola, ${fullName} 👋
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    Tu cuenta ha sido creada exitosamente con el correo <strong style="color: #0B2035;">${email}</strong>.
                                </p>
                                <p style="margin: 0 0 35px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    Para comenzar a usar tu cuenta, necesitas activarla y establecer tu contraseña. Haz clic en el botón de abajo:
                                </p>
                                
                                <!-- Button -->
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="padding: 10px 0 30px 0;">
                                            <a href="${activationLink}" 
                                               style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #0B2035 0%, #164363 100%); color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(11, 32, 53, 0.3); transition: all 0.3s ease;">
                                                Activar mi cuenta
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Alternative link -->
                                <div style="margin-top: 30px; padding: 20px; background-color: #f0f7fa; border-left: 4px solid #75B2C5; border-radius: 6px;">
                                    <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px; line-height: 1.5;">
                                        <strong style="color: #0B2035;">¿No puedes ver el botón?</strong> Copia y pega el siguiente enlace en tu navegador:
                                    </p>
                                    <p style="margin: 0; word-break: break-all;">
                                        <a href="${activationLink}" style="color: #75B2C5; font-size: 14px; text-decoration: underline;">
                                            ${activationLink}
                                        </a>
                                    </p>
                                </div>
                                
                                <!-- Info notice -->
                                <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 6px; border-left: 4px solid #6BC87F;">
                                    <p style="margin: 0; color: #0B2035; font-size: 14px; line-height: 1.6;">
                                        ✨ <strong>Nota:</strong> Este enlace puede ser usado una sola vez. Una vez que establezcas tu contraseña, tu cuenta quedará completamente activada.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafb; padding: 35px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0 0 12px 0; color: #718096; font-size: 14px; line-height: 1.5;">
                                    Si no solicitaste esta cuenta, puedes ignorar este correo con seguridad.
                                </p>
                                <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                    © ${new Date().getFullYear()} Senses. Todos los derechos reservados.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}

export function passwordResetEmailTemplate(
  fullName: string,
  email: string,
  resetLink: string
) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablece tu contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f9;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #FFFFFF; box-shadow: 0 4px 12px rgba(11, 32, 53, 0.1); border-radius: 12px; overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0B2035 0%, #164363 100%); padding: 50px 40px; text-align: center;">
                                <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">
                                    Restablecer Contraseña
                                </h1>
                                <p style="margin: 15px 0 0 0; color: #75B2C5; font-size: 16px;">
                                    Recupera el acceso a tu cuenta
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 50px 40px;">
                                <h2 style="margin: 0 0 20px 0; color: #0B2035; font-size: 24px; font-weight: 600;">
                                    Hola, ${fullName} 👋
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    Recibimos una solicitud para restablecer la contraseña de tu cuenta asociada al correo <strong style="color: #0B2035;">${email}</strong>.
                                </p>
                                <p style="margin: 0 0 35px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    Para crear una nueva contraseña, haz clic en el botón de abajo:
                                </p>
                                
                                <!-- Button -->
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="padding: 10px 0 30px 0;">
                                            <a href="${resetLink}" 
                                               style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #0B2035 0%, #164363 100%); color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(11, 32, 53, 0.3); transition: all 0.3s ease;">
                                                Restablecer contraseña
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Alternative link -->
                                <div style="margin-top: 30px; padding: 20px; background-color: #f0f7fa; border-left: 4px solid #75B2C5; border-radius: 6px;">
                                    <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px; line-height: 1.5;">
                                        <strong style="color: #0B2035;">¿No puedes ver el botón?</strong> Copia y pega el siguiente enlace en tu navegador:
                                    </p>
                                    <p style="margin: 0; word-break: break-all;">
                                        <a href="${resetLink}" style="color: #75B2C5; font-size: 14px; text-decoration: underline;">
                                            ${resetLink}
                                        </a>
                                    </p>
                                </div>
                                
                                <!-- Security notice -->
                                <div style="margin-top: 30px; padding: 20px; background-color: #fef3e7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                                    <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                        ⏱️ <strong>Importante:</strong> Este enlace expirará en 30 minutos y solo puede ser usado una vez.
                                    </p>
                                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                        🔒 Si no solicitaste este cambio, tu cuenta permanece segura y puedes ignorar este correo.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafb; padding: 35px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0 0 12px 0; color: #718096; font-size: 14px; line-height: 1.5;">
                                    Si no solicitaste restablecer tu contraseña, te recomendamos cambiarla por precaución.
                                </p>
                                <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                    © ${new Date().getFullYear()} Senses. Todos los derechos reservados.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}
