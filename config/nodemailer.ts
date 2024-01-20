import nodemailer from "nodemailer";

export const transporter = (email: string, password: string) =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });

export const adminMailOptions = (email: string, notificationEmail: string) => ({
  from: email,
  to: notificationEmail,
});

export const customerMailOptions = (email: string, customerEmail: string) => ({
  from: email,
  to: customerEmail,
});
