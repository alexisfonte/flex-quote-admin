import { adminMailOptions, customerMailOptions, transporter } from "@/config/nodemailer";
import prismadb from "@/lib/prismadb";
import { DeliveryMethod, Status } from "@prisma/client";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": `${process.env.STORE_URL}`,
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(request: Request) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      acceptedTerms,

      company,
      firstName,
      lastName,
      email,
      phone,

      startDate,
      endDate,
      deliveryMethod,
      notes,
      deliveryContactName,
      deliveryContactPhone,
      venueName,
      venueLine1,
      venueLine2,
      venueCity,
      venueState,
      venueZipcode,
      venueCountry,

      quoteItems,
    } = body.data;

    if (!acceptedTerms) {
      return new NextResponse("You must accent the terms and conditions", {
        status: 400,
      });
    }

    if (!company) {
      return new NextResponse("Company name is required", { status: 400 });
    }

    if (!firstName) {
      return new NextResponse("First name is required", { status: 400 });
    }

    if (!lastName) {
      return new NextResponse("Last name is required", { status: 400 });
    }

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    if (!phone) {
      return new NextResponse("Phone number is required", { status: 400 });
    }

    if (!startDate) {
      return new NextResponse("Start date is required", { status: 400 });
    }

    if (!endDate) {
      return new NextResponse("End date is required", { status: 400 });
    }

    if (!deliveryMethod) {
      return new NextResponse("Delivery method is required", { status: 400 });
    }

    const enumDeliveryMethod =
      deliveryMethod === "DELIVERY"
        ? DeliveryMethod.DELIVERY
        : deliveryMethod === "PICKUP"
        ? DeliveryMethod.PICKUP
        : DeliveryMethod.DELIVERY;

    if (!deliveryContactName) {
      return new NextResponse("Delivery contact name is required", {
        status: 400,
      });
    }

    if (!deliveryContactPhone) {
      return new NextResponse("Delivery contact phone number is required", {
        status: 400,
      });
    }

    if (enumDeliveryMethod === "DELIVERY") {
      if (!venueName) {
        return new NextResponse("Venue name is required", { status: 400 });
      }

      if (!venueLine1) {
        return new NextResponse("Venue line 1 is required", { status: 400 });
      }

      if (!venueCity) {
        return new NextResponse("Venue city is required", { status: 400 });
      }

      if (!venueState) {
        return new NextResponse("Venue state is required", { status: 400 });
      }

      if (!venueZipcode) {
        return new NextResponse("Venue zipcode is required", { status: 400 });
      }

      if (!venueCountry) {
        return new NextResponse("Venue country is required", { status: 400 });
      }
    }

    if (!quoteItems || quoteItems.length === 0) {
      return new NextResponse("Quote items are required", { status: 400 });
    }

    const quote = await prismadb.quote.create({
      data: {
        acceptedTerms,
        company,
        firstName,
        lastName,
        email,
        phone,
        startDate,
        endDate,
        deliveryMethod,
        notes,
        deliveryContactName,
        deliveryContactPhone,
        venueName,
        venueLine1,
        venueLine2,
        venueCity,
        venueState,
        venueZipcode,
        venueCountry,
        status: Status.NEW,
        quoteItems: {
            createMany: {
                data: quoteItems
            }
        }
      },
      include: {
        quoteItems: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                name: true,
                images: {
                  select: {
                    url: true,
                  },
                },
                size: {
                  select: {
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const mailer = await transporter(process.env.EMAIL!, process.env.PASS!);

    await mailer.sendMail({
      ...adminMailOptions(process.env.EMAIL!, process.env.NOTIF_EMAIL!),
      subject: `New quote request ready for review`,
      text: `A new quote request ${quote?.id} has been submitted on ${new Date(
        quote?.submittedAt!
      )
        .toISOString()
        .slice(0, 10)}. View the quote at ${process.env.ADMIN_URL}/quotes/${quote?.id}`,
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>New email template 2023-08-27</title><!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--><style type="text/css">#outlook a {	padding:0;}.es-button {	mso-style-priority:100!important;	text-decoration:none!important;}a[x-apple-data-detectors] {	color:inherit!important;	text-decoration:none!important;	font-size:inherit!important;	font-family:inherit!important;	font-weight:inherit!important;	line-height:inherit!important;}.es-desk-hidden {	display:none;	float:left;	overflow:hidden;	width:0;	max-height:0;	line-height:0;	mso-hide:all;}@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:100%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } .h-auto { height:auto!important } }</style></head>
        <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div class="es-wrapper-color" style="background-color:#F6F6F6"><!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f6f6f6"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6"><tr><td valign="top" style="padding:0;Margin:0"><table class="es-header" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr><td align="center" style="padding:0;Margin:0"><table class="es-header-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" bgcolor="#000000" style="padding:15px;Margin:0;background-color:#000000"><table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:570px"><table width="100%" cellspacing="0" cellpadding="0" bgcolor="#000000" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#000000" role="presentation"><tr><td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://corplighting.com" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#EBFF00;font-size:14px"><img class="adapt-img" src="https://sabyeo.stripocdn.email/content/guids/CABINET_0df1567c1069dabfcab7d165c5b8e73dfad7f4dacd0e771a98003ba3f6f03839/images/logo_1.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="171" height="71"></a></td>
        </tr></table></td></tr></table></td></tr></table></td>
        </tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td align="center" style="padding:0;Margin:0"><table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;border-bottom:2px solid #000000" role="presentation"><tr><td align="left" style="padding:0;Margin:0"><h1 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#000000;text-align:center"><strong>NEW INQUIRY</strong></h1>
        </td></tr></table></td></tr></table></td>
        </tr><tr><td align="left" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">A new quote request has been submitted on ${new Date(
          quote?.submittedAt!
        ).toLocaleDateString("en-us", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}.</p>
        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:17px;color:#696969;font-size:11px">id: ${
          quote?.id
        }<br></p></td>
        </tr><tr><td align="center" style="padding:0;Margin:0"><span class="es-button-border" style="border-style:solid;border-color:#2cb543;background:#000000;border-width:0px;display:inline-block;border-radius:0px;width:auto"><a href="${
          process.env.ADMIN_URL
        }/quotes/${
        quote?.id
      }" class="es-button es-button-1693195127486" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#ebff00;font-size:16px;padding:8px 20px;display:inline-block;background:#000000;border-radius:0px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-weight:normal;font-style:italic;line-height:19px;width:auto;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #31CB4B">View Quote</a></span></td></tr></table></td></tr></table></td></tr></table></td>
        </tr></table><table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr><td align="center" style="padding:0;Margin:0"><table class="es-footer-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" bgcolor="#000000" style="padding:10px;Margin:0;background-color:#000000"><!--[if mso]><table style="width:580px" cellpadding="0" cellspacing="0"><tr><td style="width:281px" valign="top"><![endif]--><table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left"><tr><td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:281px"><table width="100%" cellspacing="0" cellpadding="0" bgcolor="#000000" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#000000" role="presentation"><tr><td align="left" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://corplighting.com" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#FFFFFF;font-size:14px"><img class="adapt-img" src="https://sabyeo.stripocdn.email/content/guids/CABINET_0df1567c1069dabfcab7d165c5b8e73dfad7f4dacd0e771a98003ba3f6f03839/images/logo_1.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="96" height="40"></a></td>
        </tr></table></td></tr></table><!--[if mso]></td><td style="width:20px"></td><td style="width:279px" valign="top"><![endif]--><table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right"><tr><td align="left" style="padding:0;Margin:0;width:279px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="right" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:10px;color:#ffffff;font-size:10px">5207 River Road</p>
        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:10px;color:#ffffff;font-size:10px">Elmwood, LA 70123</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:10px;color:#ffffff;font-size:10px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:10px;color:#ffffff;font-size:10px">www.corplighting.com</p></td></tr></table></td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></td></tr></table></td></tr></table></div></body></html>
        `,
    });

    await mailer.sendMail({
      ...customerMailOptions(process.env.EMAIL!, quote?.email!),
      subject: `Corporate Lighting & Audio rental quote`,
      text: `Your quote request has been submitted on ${new Date(
        quote?.submittedAt!
      ).toLocaleDateString("en-us", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      })}. A member of our team will contact you in 1-2 business days to discuss your inquiry. id: ${
        quote?.id
      }`,
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>Copy of New email template 2023-08-27</title><!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--><style type="text/css">#outlook a {	padding:0;}.es-button {	mso-style-priority:100!important;	text-decoration:none!important;}a[x-apple-data-detectors] {	color:inherit!important;	text-decoration:none!important;	font-size:inherit!important;	font-family:inherit!important;	font-weight:inherit!important;	line-height:inherit!important;}.es-desk-hidden {	display:none;	float:left;	overflow:hidden;	width:0;	max-height:0;	line-height:0;	mso-hide:all;}@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:100%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } .h-auto { height:auto!important } }</style></head>
        <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div class="es-wrapper-color" style="background-color:#F6F6F6"><!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f6f6f6"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6"><tr><td valign="top" style="padding:0;Margin:0"><table class="es-header" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr><td align="center" style="padding:0;Margin:0"><table class="es-header-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" bgcolor="#000000" style="padding:15px;Margin:0;background-color:#000000"><table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:570px"><table width="100%" cellspacing="0" cellpadding="0" bgcolor="#000000" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#000000" role="presentation"><tr><td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://corplighting.com" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#EBFF00;font-size:14px"><img class="adapt-img" src="https://sabyeo.stripocdn.email/content/guids/CABINET_257e1213ec32d8c3f56134916882151f14e19261bf2080b22694538a7d1b3b84/images/logo_1.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="171" height="71"></a></td>
        </tr></table></td></tr></table></td></tr></table></td>
        </tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td align="center" style="padding:0;Margin:0"><table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;border-bottom:2px solid #000000" role="presentation"><tr><td align="left" style="padding:0;Margin:0"><h1 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#000000;text-align:center"><strong>QUOTE REQUEST</strong></h1>
        </td></tr></table></td></tr></table></td>
        </tr><tr><td align="left" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Your quote request has been submitted on ${new Date(
          quote?.submittedAt!
        ).toLocaleDateString("en-us", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}. A member of our team will contact you in 1-2 business days to discuss your inquiry.</p>
        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:17px;color:#696969;font-size:11px">id: ${
          quote?.id
        }</p></td></tr></table></td></tr></table></td></tr></table></td>
        </tr></table><table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr><td align="center" style="padding:0;Margin:0"><table class="es-footer-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" bgcolor="#000000" style="padding:10px;Margin:0;background-color:#000000"><!--[if mso]><table style="width:580px" cellpadding="0" cellspacing="0"><tr><td style="width:281px" valign="top"><![endif]--><table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left"><tr><td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:281px"><table width="100%" cellspacing="0" cellpadding="0" bgcolor="#000000" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#000000" role="presentation"><tr><td align="left" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://corplighting.com" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#FFFFFF;font-size:14px"><img class="adapt-img" src="https://sabyeo.stripocdn.email/content/guids/CABINET_257e1213ec32d8c3f56134916882151f14e19261bf2080b22694538a7d1b3b84/images/logo_1.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="96" height="40"></a></td>
        </tr></table></td></tr></table><!--[if mso]></td><td style="width:20px"></td><td style="width:279px" valign="top"><![endif]--><table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right"><tr><td align="left" style="padding:0;Margin:0;width:279px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="right" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:10px;color:#ffffff;font-size:10px">5207 River Road</p>
        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:10px;color:#ffffff;font-size:10px">Elmwood, LA 70123</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:10px;color:#ffffff;font-size:10px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:10px;color:#ffffff;font-size:10px">www.corplighting.com</p></td></tr></table></td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></td></tr></table></td></tr></table></div></body></html>
        `,
    });

    return NextResponse.json({ id: quote?.id }, { headers: corsHeaders });
  } catch (error) {
    console.log(`[QUOTE_SUBMIT]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
