import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private sesClient: SESClient;

  constructor() {
    // AWS SES 클라이언트 초기화
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'ap-northeast-2', // 서울 리전
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * 초대 이메일 발송
   */
  async sendInvitationEmail(
    toEmail: string,
    invitationToken: string,
    pageName: string,
    inviterName: string
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteUrl = `${frontendUrl}/invite/${invitationToken}`;
    
    // 발신자 이메일 (AWS SES에서 검증된 이메일이어야 함)
    const fromEmail = process.env.SES_FROM_EMAIL || 'noreply@yourdomain.com';
    
    const emailParams = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Data: `${inviterName}님이 '${pageName}' 페이지에 당신을 초대했습니다.`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: this.createInvitationEmailTemplate(inviterName, pageName, inviteUrl),
            Charset: 'UTF-8',
          },
          Text: {
            Data: this.createInvitationEmailText(inviterName, pageName, inviteUrl),
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      const command = new SendEmailCommand(emailParams);
      const result = await this.sesClient.send(command);
      
      console.log('✅ 이메일 발송 성공:', {
        messageId: result.MessageId,
        to: toEmail,
        subject: emailParams.Message.Subject.Data
      });
      
    } catch (error) {
      console.error('❌ 이메일 발송 실패:', error);
      throw new Error(`이메일 발송에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * HTML 이메일 템플릿 생성
   */
  private createInvitationEmailTemplate(
    inviterName: string,
    pageName: string,
    inviteUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>페이지 협업 초대</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .invitation-card {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 20px 0;
          }
          .invitation-card h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .invitation-card p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .cta-button {
            display: inline-block;
            background: #28a745;
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 30px 0;
            transition: background-color 0.3s;
          }
          .cta-button:hover {
            background: #218838;
          }
          .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #6c757d;
          }
          .expiry {
            color: #dc3545;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PAGE CUBE</div>
            <p>웹페이지 협업 플랫폼</p>
          </div>

          <div class="invitation-card">
            <h2>🎉 페이지 협업 초대</h2>
            <p><strong>${inviterName}</strong>님이 당신을 초대했습니다!</p>
          </div>

          <div style="text-align: center;">
            <h3>'${pageName}' 페이지에서 함께 작업하세요</h3>
            <p>실시간으로 페이지를 편집하고 디자인할 수 있습니다.</p>
            
            <a href="${inviteUrl}" class="cta-button">
              🚀 초대 수락하기
            </a>
          </div>

          <div class="info-section">
            <h4>📋 협업 기능</h4>
            <ul>
              <li>실시간 공동 편집</li>
              <li>라이브 커서 및 선택 상태 공유</li>
              <li>컴포넌트 추가 및 수정</li>
              <li>미리보기 및 템플릿 저장</li>
            </ul>
          </div>

          <div class="footer">
            <p>
              이 초대는 <span class="expiry">7일 후 만료</span>됩니다.<br>
              초대를 수락하려면 위 버튼을 클릭하거나 다음 링크를 복사하세요:
            </p>
            <p style="word-break: break-all; font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px;">
              ${inviteUrl}
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e9ecef;">
            <p style="font-size: 12px;">
              이 이메일은 자동으로 발송되었습니다. 답장하지 마세요.<br>
              © 2024 PAGE CUBE. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 텍스트 이메일 내용 생성 (HTML을 지원하지 않는 클라이언트용)
   */
  private createInvitationEmailText(
    inviterName: string,
    pageName: string,
    inviteUrl: string
  ): string {
    return `
페이지 협업 초대

${inviterName}님이 '${pageName}' 페이지에 당신을 초대했습니다.

실시간으로 페이지를 편집하고 디자인할 수 있습니다.

초대를 수락하려면 다음 링크를 클릭하세요:
${inviteUrl}

협업 기능:
- 실시간 공동 편집
- 라이브 커서 및 선택 상태 공유
- 컴포넌트 추가 및 수정
- 미리보기 및 템플릿 저장

이 초대는 7일 후 만료됩니다.

© 2024 PAGE CUBE. All rights reserved.
    `.trim();
  }
} 