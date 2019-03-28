module.exports = `<!DOCTYPE html>
<html lang="en" class="h-full" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="height: 100%;">
<head>
  <meta charset="utf8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title> Hustle</title>

  <!--[if !mso]>
<!-->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">

  <!--<![endif]-->

  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <style>
    table {border-collapse: collapse;}
    td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
  </style>
<![endif]-->
  <style>
    #outlook a {
      padding: 0;
    }
    a[x-apple-data-detectors] {
      color: inherit;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      u~div .wrapper {
        min-width: 100vw;
      }
    }
  </style>
  <style>
    @media screen {
      img {
        max-width: 100%;
      }
      td,
      th {
        box-sizing: border-box;
        font-family: -apple-system, Segoe UI, sans-serif;
      }
      .all-font-roboto {
        font-family: Roboto, -apple-system, Segoe UI, sans-serif !important;
      }
    }
    @media (max-width: 600px) {
      .sm-dui17-b-t {
        border: solid #3490dc;
        border-width: 4px 0 0;
      }
      .sm-inline-block {
        display: inline-block !important;
      }
      .sm-hidden {
        display: none !important;
      }
      .sm-leading-32 {
        line-height: 32px !important;
      }
      .sm-p-20 {
        padding: 20px !important;
      }
      .sm-py-12 {
        padding-top: 12px !important;
        padding-bottom: 12px !important;
      }
      .sm-text-center {
        text-align: center !important;
      }
      .sm-text-xs {
        font-size: 13px !important;
      }
      .sm-text-lg {
        font-size: 18px !important;
      }
      .sm-w-1-4 {
        width: 25% !important;
      }
      .sm-w-3-4 {
        width: 75% !important;
      }
      .sm-w-full {
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="box-sizing: border-box; margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #ffb01f; height: 100%;">
  <table class="wrapper" cellpadding="0" cellspacing="0" role="presentation" width="100%" height="100%">
    <tr>
      <td align="center" style="padding: 24px;" width="100%">
        <table class="sm-w-full" cellpadding="0" cellspacing="0" role="presentation" width="600">
          <tr>
            <td colspan="2" class="sm-inline-block" style="display: none;">
              <img src="https://s3.us-east-2.amazonaws.com/assets-gohustleapp/assets/sz.png" alt="Double Room" style="border: 0; line-height: 100%; vertical-align: middle; border-top-left-radius: 4px; border-top-right-radius: 4px; box-shadow: 0 15px 30px 0 rgba(0, 0, 0, .11), 0 5px 15px 0 rgba(0, 0, 0, .08);" >
            </td>
          </tr>
          <tr>
            <td class="sm-hidden" style="padding-top: 40px; padding-bottom: 40px;vertical-align: top" width="160">
              <img src="https://s3.us-east-2.amazonaws.com/assets-gohustleapp/assets/sz1.png" alt="Double room" style="border: 0; line-height: 100%; vertical-align: middle; border-top-left-radius: 4px; border-bottom-left-radius: 4px; box-shadow: 0 15px 30px 0 rgba(0, 0, 0, .11), 0 5px 15px 0 rgba(0, 0, 0, .08);" width="160" >
            </td>
            <td align="left" class="sm-p-20 sm-dui17-b-t" style="border-radius: 2px; padding: 40px; position: relative; box-shadow: 0 15px 30px 0 rgba(0, 0, 0, .11), 0 5px 15px 0 rgba(0, 0, 0, .08); vertical-align: top; z-index: 50;" bgcolor="#ffffff" valign="top">
              <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td width="80%">
                    <h1 class="sm-text-lg all-font-roboto" style="font-weight: 700; line-height: 100%; margin: 0; margin-bottom: 4px; font-size: 24px;">Hi <%= user.name %></h1>
                    <p>We hope you enjoyed your ride.</p>
                    <p class="sm-text-xs" style="margin: 0; color: #b8c2cc; font-size: 14px;"> <%=  createdAt %> </p>
                    <p class="sm-text-xs" style="margin: 0; color: #b8c2cc; font-size: 14px;"> Booking Id: <%= bookingId %> </p>
                  </td>

                </tr>
              </table>
              <div style="line-height: 32px;">&zwnj;</div>
              <table class="sm-leading-32" cellpadding="0" cellspacing="0" role="presentation" style="line-height: 28px; font-size: 14px;" width="100%">
                 <tr>
                  <td class="sm-inline-block" style="color: #8795a1;" width="50%"><h1>Total</h1></td>
                  <td class="sm-inline-block" style="font-weight: 600; text-align: right;" width="50%" align="right"><h1>SAR <%= totalFare %></h1></td>
                </tr>
                 <tr>
                  <td class="sm-inline-block" style="color: #8795a1;" width="50%">Trip Time</td>
                  <td class="sm-inline-block" style="font-weight: 600; text-align: right;" width="50%" align="right"><%= timeTaken %></td>
                </tr>
                <tr>
                  <td class="sm-inline-block" style="color: #8795a1;" width="50%">Distance</td>
                  <td class="sm-inline-block" style="font-weight: 600; text-align: right;" width="50%" align="right"><%= ditanceCovered %> KM</td>
                </tr>
                <!-- <tr>
                  <td class="sm-inline-block" style="color: #8795a1;" width="50%">Subtotal</td>
                  <td class="sm-inline-block" style="font-weight: 600; text-align: right;" width="50%" align="right">₹106.70</td>
                </tr>
                <tr>
                  <td class="sm-w-1-4 sm-inline-block" style="color: #8795a1;" width="50%">Tolls, Surcharges, and Fees</td>
                  <td class="sm-w-3-4 sm-inline-block" style="font-weight: 600; text-align: right;" width="50%" align="right">₹20</td>
                </tr>
                 <tr>
                  <td class="sm-w-1-4 sm-inline-block" style="color: #8795a1;" width="50%">Wait Time </td>
                  <td class="sm-w-3-4 sm-inline-block" style="font-weight: 600; text-align: right;" width="50%" align="right">₹0.15</td>
                </tr> -->
              </table>

                <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 24px;">
                    <div style="background-color: #f1f5f8; line-height: 2px;">&zwnj;</div>
                  </td>
                </tr>
              </table>
              <!-- <table class="sm-leading-32" cellpadding="0" cellspacing="0" role="presentation" style="line-height: 28px; font-size: 14px;" width="100%">
                 <tr>
                  <td><img src="image.png" style="width: 100%"></td>
                </tr>
              </table> -->



              <table cellpadding="0" cellspacing="0" role="presentation" style="font-size: 14px;" width="100%">
                <tr>
                  <td class="sm-w-full sm-inline-block sm-text-center" width="40%">
                    <p class="all-font-roboto" style="margin: 0; margin-bottom: 4px; color: #b8c2cc; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Boarding Point</p>
                    <p style=" margin: 0;color: #999" class="all-font-roboto" ><%= start_address %></p>
                  </td>
                  <td class="sm-w-full sm-inline-block sm-py-12" style="font-family: Menlo, Consolas, monospace; font-weight: 600; text-align: center; color: #fdaf1f; font-size: 18px; letter-spacing: -1px;" width="20%" align="center">to</td>
                  <td class="sm-w-full sm-inline-block sm-text-center" style="text-align: right;" width="40%" align="right">
                    <p class="all-font-roboto" style="margin: 0; margin-bottom: 4px; color: #b8c2cc; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Dropping Point</p>
                    <p style=" margin: 0;color: #999" class="all-font-roboto" ><%= end_address %></p>
                  </td>
                </tr>
              </table>
              <!--  <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 24px;">
                    <div style="background-color: #f1f5f8; line-height: 2px;">&zwnj;</div>
                  </td>
                </tr>
               <table cellpadding="0" cellspacing="0" role="presentation" style="font-size: 14px;" width="100%">
                <tr>
                  <td class="sm-w-full sm-inline-block sm-text-center" width="40%">
                    <p class="all-font-roboto" style="margin: 0; margin-bottom: 4px; color: #b8c2cc; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Check-in</p>
                    <p class="all-font-roboto" style="font-weight: 600; margin: 0; color: #22292f;">29 NOV 2018</p><p style=" margin: 0;color: #999" class="all-font-roboto" >09:16 AM IST</p>
                  </td>
                  <td class="sm-w-full sm-inline-block sm-py-12" style="font-family: Menlo, Consolas, monospace; font-weight: 600; text-align: center; color: #dae1e7; font-size: 18px; letter-spacing: -1px;" width="20%" align="center">&gt;&gt;&gt;</td>
                  <td class="sm-w-full sm-inline-block sm-text-center" style="text-align: right;" width="40%" align="right">
                    <p class="all-font-roboto" style="margin: 0; margin-bottom: 4px; color: #b8c2cc; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Check-out</p>
                    <p class="all-font-roboto" style="font-weight: 600; margin: 0; color: #22292f;">29 NOV 2018</p><p style=" margin: 0;color: #999" class="all-font-roboto" >01:27 AM IST</p>
                  </td>
                </tr>
              </table> -->

              <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 24px;">
                    <div style="background-color: #f1f5f8; line-height: 2px;">&zwnj;</div>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" role="presentation" style="line-height: 28px; font-size: 14px;" width="100%">
                <tr>
                  <td style="color: #8795a1;line-height: 17px;" width="70%">
                     <p class="all-font-roboto" style="margin: 0; margin-bottom: 4px; color: #b8c2cc; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">You rode with</p>
                      <p class="all-font-roboto" style="font-weight: 600; margin: 0; color: #22292f;"><%= driverName %></p><p style=" margin: 0;color: #999" class="all-font-roboto" ><%= driverRating %>  &#9733;  Rating</p>
                      <div style="padding: 2px;"></div>
                  </td>
                  <td style="font-weight: 600; text-align: right;" width="30%" align="right">
                    <img style="border-radius:50%;webkit-border-radius:50%;moz-border-radius:50%;o-border-radius:50%;ms-border-radius:50%;mshtml-border-radius:50%;khtml-border-radius:50%;" src="<%=driverAvatar %>" style="width: 100%">
                  </td>
                </tr>

              </table>

               <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 24px;">
                    <div style="background-color: #f1f5f8; line-height: 2px;">&zwnj;</div>
                  </td>
                </tr>
              </table>

               <table cellpadding="0" cellspacing="0" role="presentation" style="line-height: 28px; font-size: 14px;" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <img src="https://gohustleapp.com/images/hustle_logo.png" style="width: 160px"><br/>
                    <p style="font-size: 11px;line-height: 13px;">Our vision is to make everyday commuting simpler and more reliable. The platforms of private drivers, competitors are becoming more and more popular in Saudi.</p>
                    © 2018 Hustle. All Rights Reserved
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
