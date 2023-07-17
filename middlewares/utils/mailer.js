require('dotenv').config()
const nodeMailer = require('nodemailer')

var readHTMLFile = function(path, callback) {
  fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
      if (err) {
         callback(err);                 
      }
      else {
          callback(null, html);
      }
  });
};

const mailHost = 'smtp.gmail.com'
// 587 là một cổng tiêu chuẩn và phổ biến trong giao thức SMTP
const mailPort = 465
const sendMail = (to, subject, htmlContent) => {
  // Khởi tạo một thằng transporter object sử dụng chuẩn giao thức truyền tải SMTP với các thông tin cấu hình ở trên.
  const transporter = nodeMailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: true, 
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASSWORD_EMAIL
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
  })
  const options = {
    from: process.env.ADMIN_EMAIL, 
    to: to, // địa chỉ gửi đến
    subject: subject, // Tiêu đề của mail
    html: `<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="x-apple-disable-message-reformatting">
	<title></title>

	<style>
		div, h1, p {font-family: Arial, sans-serif;}
		table, td {border:2px solid #000000 !important;}
        .container {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        h2 {
            text-align: center;
            color: #6edab0;
        }
        h3 {
            text-align: center;
        }
        .content {
            background-color: #f4f1f1;
            padding: 20px;
        }

        .content p {
            text-align: center;
        }
	</style>
</head>
<body>
    <div class="container">
        <div>
            <h2>Food Blog</h2>
            <div class="content">
                <p>Hello</p>
                <p>Please use the verification code below to change your password:</p>
                <h3>${htmlContent}</h3>
                <p>If you didn't request this, you can ignore this email or let us know</p>
                <p>Thanks!</p>
                <p>HDV Team</p>
            </div>
        </div>
    </div>
</body>
</html>` 
  }
  // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
  return transporter.sendMail(options)
}
module.exports = {
  sendMail: sendMail
}