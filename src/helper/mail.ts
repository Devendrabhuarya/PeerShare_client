import nodemailer from 'nodemailer';
import User from '@/models/userModel';
import brcryptjs from 'bcryptjs';

export const sendEmail = async ({ email, emailType, userId }: any) => {


    try {
        console.log('1');

        const hashedToken = await brcryptjs.hash(userId.toString(), 10);
        if (emailType === 'VERIFY') {
            await User.findByIdAndUpdate(userId,
                { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 36000000 }
            );
        } else {
            await User.findByIdAndUpdate(userId,
                {
                    forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry:
                        Date.now() + 36000000
                }
            );
        }


        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.NODEMAILER_ID,
                pass: process.env.NODEMAILER_PASS
            }
        });

        const mailOption = {
            from: 'chintubhuarya75@gmail.com',
            to: email,
            subject: emailType === 'VERIFY' ? 'Verify your email' :
                'Reset Your Password',
            html: `
            <p>Click
             <a href="${process.env.DOMAIN}/${emailType === 'VERIFY' ? 'verifyemail' : 'enternewpassword'}?token=${hashedToken}">
        here
            < /a> 
             to ${emailType === 'VERIFY' ? 'verify your email' : 'reset Your Password'}
        </p>
            `
        }
        console.log('2');
        const mailresponse = await transport.sendMail(mailOption);
        console.log('3');
        return mailresponse;
    } catch (error: any) {
        throw new Error(error.message + 'unsuccessfull to send verification mail');
    }
}